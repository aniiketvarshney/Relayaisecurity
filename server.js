import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const API_KEY_PREFIX = "relay_sk_";
const DEFAULT_PORT = 3002;
const BODY_LIMIT = process.env.REQUEST_BODY_LIMIT ?? "10kb";
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 60);
const DAILY_EXECUTION_LIMIT = Number(process.env.DAILY_EXECUTION_LIMIT ?? 500);

const rateLimitBuckets = new Map();

const TOOL_ALIASES = {
  github_delete_repo: [
    "github_delete_repo",
    "github.deleteRepo",
    "github.repos.delete",
    "github_delete_repository",
    "delete_repository",
    "delete_repo",
  ],
  shell_rm_rf: [
    "shell_rm_rf",
    "shell.rm_rf",
    "shell.rm",
    "terminal_rm_rf",
    "delete_files_recursive",
  ],
  deploy_production: [
    "deploy_production",
    "deploy.production",
    "vercel_promote_production",
    "production_deploy",
  ],
  database_drop_table: [
    "database_drop_table",
    "db_drop_table",
    "sql_drop_table",
    "database.dropTable",
  ],
};

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: ["http://localhost:3001", "https://relay-security-lemon.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json({ limit: BODY_LIMIT }));

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

const PORT = Number(process.env.PORT ?? DEFAULT_PORT);

console.info("[startup] Relay API ready", {
  port: PORT,
  supabaseProjectRef,
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasSupabaseKey: Boolean(supabaseKey),
});

function getRateLimitKey(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith(API_KEY_PREFIX)) {
      return `key:${token.slice(0, 16)}:${token.slice(-8)}`;
    }
  }

  return `ip:${req.ip}`;
}

function checkRateLimit(req) {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false };
  }

  bucket.count += 1;

  if (bucket.count > RATE_LIMIT_MAX) {
    return {
      limited: true,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  return { limited: false };
}

function expandToolAliases(tool) {
  const normalized = tool.trim();
  const aliases = new Set([normalized]);

  for (const values of Object.values(TOOL_ALIASES)) {
    if (values.includes(normalized)) {
      values.forEach((value) => aliases.add(value));
    }
  }

  return Array.from(aliases);
}

async function countDailyExecutions(userId) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase.rpc("count_audit_logs_for_user_since", {
    p_user_id: userId,
    p_since: since,
  });

  if (error) {
    console.error("[execute] Daily quota lookup error:", error.message);
    return null;
  }

  return Number(data ?? 0);
}

async function isAnyToolBlockedForUser(userId, toolNames) {
  const { data, error } = await supabase.rpc("is_any_tool_blocked_for_user", {
    p_user_id: userId,
    p_tool_names: toolNames,
  });

  if (!error) {
    return { blocked: Boolean(data), error: null };
  }

  console.error("[execute] Alias policy check error:", error.message);

  const { data: fallbackData, error: fallbackError } = await supabase.rpc(
    "is_tool_blocked_for_user",
    { p_user_id: userId, p_tool_name: toolNames[0] },
  );

  return {
    blocked: Boolean(fallbackData),
    error: fallbackError,
  };
}

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

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "relay-api",
    port: PORT,
  });
});

app.post("/api/execute", async (req, res) => {
  try {
    const rateLimit = checkRateLimit(req);
    if (rateLimit.limited) {
      console.warn("[execute] Rate limited request", {
        ip: req.ip,
        retryAfter: rateLimit.retryAfter,
      });
      return res
        .status(429)
        .set("Retry-After", String(rateLimit.retryAfter))
        .json({ error: "Too many requests. Please slow down." });
    }

    const tool = req.body.tool ?? req.body.tool_name;

    if (!tool || typeof tool !== "string") {
      return res.status(400).json({ error: "Missing tool name" });
    }

    const auth = await resolveUserId(req);

    if (!auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized. Please sign in.",
        hint:
          "No valid Supabase session cookie or API key was found by the backend.",
      });
    }

    const { userId, accessToken, authMethod } = auth;
    const dailyCount = await countDailyExecutions(userId);

    if (dailyCount !== null && dailyCount >= DAILY_EXECUTION_LIMIT) {
      console.warn("[execute] Daily quota reached", {
        userId,
        dailyCount,
        limit: DAILY_EXECUTION_LIMIT,
      });
      return res.status(429).json({
        error: "Daily execution limit reached.",
        limit: DAILY_EXECUTION_LIMIT,
      });
    }

    const toolAliases = expandToolAliases(tool);
    let status = "allowed";
    let reason = null;

    if (authMethod === "api_key") {
      const { blocked, error: policyError } = await isAnyToolBlockedForUser(
        userId,
        toolAliases,
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
        .in("tool_name", toolAliases)
        .eq("action", "block")
        .limit(1);

      if (policyError) {
        console.error("[execute] Policy check error:", policyError.message);
        return res.status(500).json({ error: policyError.message });
      }

      if ((policy?.length ?? 0) > 0) {
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

app.use((err, _req, res, next) => {
  if (err?.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large." });
  }

  return next(err);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
