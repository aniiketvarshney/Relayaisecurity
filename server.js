import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const API_KEY_PREFIX = "relay_sk_";

const app = express();
app.use(cors({ origin: "http://localhost:3001", credentials: true }));
app.use(express.json());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function getProjectRef(url) {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return "";
  }
}

const supabaseProjectRef = getProjectRef(supabaseUrl);

function extractAccessTokenFromCookies(cookieHeader) {
  const cookieName = `sb-${supabaseProjectRef}-auth-token`;
  const cookies = cookieHeader.split(";").map((part) => part.trim());

  for (const cookie of cookies) {
    if (!cookie.startsWith(`${cookieName}=`)) {
      continue;
    }

    const rawValue = decodeURIComponent(cookie.slice(cookieName.length + 1));

    try {
      const parsed = JSON.parse(rawValue);
      if (parsed.access_token) {
        return parsed.access_token;
      }
    } catch {
      if (rawValue.startsWith("base64-")) {
        try {
          const decoded = JSON.parse(
            Buffer.from(rawValue.slice(7), "base64").toString("utf8"),
          );
          if (decoded.access_token) {
            return decoded.access_token;
          }
        } catch {
          console.error("[execute] Failed to parse auth cookie");
        }
      }
    }
  }

  return null;
}

function createUserClient(accessToken) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => accessToken,
  });
}

async function resolveUserId(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookieToken = extractAccessTokenFromCookies(cookieHeader);

  if (cookieToken) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(cookieToken);

    if (userError) {
      console.error("[execute] Cookie session error:", userError.message);
    }

    if (user?.id) {
      return { userId: user.id, accessToken: cookieToken, authMethod: "session" };
    }
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();

    if (token.startsWith(API_KEY_PREFIX)) {
      const { data: keyUserId, error: keyError } = await supabase.rpc(
        "get_user_id_by_api_key",
        { api_key: token },
      );

      if (keyError) {
        console.error("[execute] API key lookup error:", keyError.message);
      }

      if (keyUserId) {
        return { userId: keyUserId, authMethod: "api_key" };
      }
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(token);

      if (userError) {
        console.error("[execute] Bearer session error:", userError.message);
      }

      if (user?.id) {
        return { userId: user.id, accessToken: token, authMethod: "session" };
      }
    }
  }

  return null;
}

app.post("/api/execute", async (req, res) => {
  try {
    const tool = req.body.tool ?? req.body.tool_name;

    if (!tool || typeof tool !== "string") {
      return res.status(400).json({ error: "Missing tool name" });
    }

    const auth = await resolveUserId(req);

    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    const { userId, accessToken, authMethod } = auth;
    let status = "allowed";
    let reason = null;

    if (authMethod === "api_key") {
      const { data: blocked, error: policyError } = await supabase.rpc(
        "is_tool_blocked_for_user",
        { p_user_id: userId, p_tool_name: tool },
      );

      if (policyError) {
        console.error("[execute] Policy check error:", policyError.message);
        return res.status(500).json({ error: policyError.message });
      }

      if (blocked) {
        status = "blocked";
        reason = "Policy violation";
      }

      const { error: logError } = await supabase.rpc(
        "insert_audit_log_for_user",
        {
          p_user_id: userId,
          p_tool_name: tool,
          p_status: status,
          p_reason: reason,
        },
      );

      if (logError) {
        console.error("[execute] Audit log error:", logError.message);
      }
    } else {
      const userClient = createUserClient(accessToken);

      const { data: policy, error: policyError } = await userClient
        .from("policies")
        .select("action")
        .eq("user_id", userId)
        .eq("tool_name", tool)
        .eq("action", "block")
        .maybeSingle();

      if (policyError) {
        console.error("[execute] Policy check error:", policyError.message);
        return res.status(500).json({ error: policyError.message });
      }

      if (policy) {
        status = "blocked";
        reason = "Policy violation";
      }

      const { error: logError } = await userClient.from("audit_logs").insert({
        user_id: userId,
        tool_name: tool,
        status,
        reason,
      });

      if (logError) {
        console.error("[execute] Audit log error:", logError.message);
      }
    }

    res.json({ status, reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});