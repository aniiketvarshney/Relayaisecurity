import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
import type { ToolResponse } from "../src/types/database.ts";
import { type AuthContext, resolveAuth } from "./auth.ts";

interface ExecuteRequestBody {
  tool?: string;
  tool_name?: string;
  arguments?: Record<string, unknown>;
}

function extractToolName(body: unknown): string | null {
  if (typeof body !== "object" || body === null) {
    return null;
  }

  const candidate = body as ExecuteRequestBody;
  const rawTool = candidate.tool ?? candidate.tool_name;

  if (typeof rawTool !== "string") {
    return null;
  }

  const trimmed = rawTool.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createUserDataClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => accessToken,
  });
}

function createAnonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function isToolBlockedWithJwt(
  supabase: SupabaseClient,
  userId: string,
  toolName: string,
): Promise<{ blocked: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("policies")
    .select("id, action")
    .eq("user_id", userId)
    .eq("tool_name", toolName)
    .eq("action", "block")
    .limit(1);

  if (error) {
    console.error("[execute] Policy lookup failed:", {
      message: error.message,
      userId,
      toolName,
    });
    return { blocked: false, error: error.message };
  }

  return { blocked: (data?.length ?? 0) > 0 };
}

async function isToolBlockedWithApiKey(
  userId: string,
  toolName: string,
): Promise<{ blocked: boolean; error?: string }> {
  const supabase = createAnonClient();

  const { data, error } = await supabase.rpc("is_tool_blocked_for_user", {
    p_user_id: userId,
    p_tool_name: toolName,
  });

  if (error) {
    console.error("[execute] API key policy lookup failed:", {
      message: error.message,
      userId,
      toolName,
    });
    return { blocked: false, error: error.message };
  }

  return { blocked: Boolean(data) };
}

async function insertAuditLogWithJwt(
  supabase: SupabaseClient,
  userId: string,
  toolName: string,
  result: ToolResponse,
): Promise<void> {
  const { error } = await supabase.from("audit_logs").insert({
    user_id: userId,
    tool_name: toolName,
    status: result.status,
    reason: result.reason ?? null,
  });

  if (error) {
    console.error("[execute] Failed to insert audit log:", {
      message: error.message,
      userId,
      toolName,
      status: result.status,
    });
  }
}

async function insertAuditLogWithApiKey(
  userId: string,
  toolName: string,
  result: ToolResponse,
): Promise<void> {
  const supabase = createAnonClient();

  const { error } = await supabase.rpc("insert_audit_log_for_user", {
    p_user_id: userId,
    p_tool_name: toolName,
    p_status: result.status,
    p_reason: result.reason ?? null,
  });

  if (error) {
    console.error("[execute] Failed to insert audit log via API key:", {
      message: error.message,
      userId,
      toolName,
      status: result.status,
    });
  }
}

async function runExecution(
  auth: AuthContext,
  toolName: string,
): Promise<{ status: number; body: ToolResponse | { error: string } }> {
  let policyResult: { blocked: boolean; error?: string };

  if (auth.authMethod === "jwt" && auth.accessToken) {
    const supabase = createUserDataClient(auth.accessToken);
    policyResult = await isToolBlockedWithJwt(
      supabase,
      auth.userId,
      toolName,
    );
  } else {
    policyResult = await isToolBlockedWithApiKey(auth.userId, toolName);
  }

  if (policyResult.error) {
    return { status: 500, body: { error: policyResult.error } };
  }

  const result: ToolResponse = policyResult.blocked
    ? { status: "blocked", reason: "Policy violation" }
    : { status: "allowed" };

  if (auth.authMethod === "jwt" && auth.accessToken) {
    const supabase = createUserDataClient(auth.accessToken);
    await insertAuditLogWithJwt(supabase, auth.userId, toolName, result);
  } else {
    await insertAuditLogWithApiKey(auth.userId, toolName, result);
  }

  console.log("[execute] Execution result:", {
    userId: auth.userId,
    authMethod: auth.authMethod,
    toolName,
    result,
  });

  return { status: 200, body: result };
}

export async function handleExecute(
  bearerToken: string | null,
  body: unknown,
  cookieHeader?: string | undefined,
): Promise<{ status: number; body: ToolResponse | { error: string } }> {
  const auth = await resolveAuth(bearerToken, cookieHeader);

  if (!auth) {
    return { status: 401, body: { error: "Unauthorized" } };
  }

  const toolName = extractToolName(body);

  if (!toolName) {
    console.error("[execute] Invalid request body:", body);
    return {
      status: 400,
      body: {
        error:
          "Invalid request body. Expected: { tool: string } or { tool_name: string }",
      },
    };
  }

  return runExecution(auth, toolName);
}