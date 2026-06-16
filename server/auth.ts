import { createClient, type User } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getProjectRef(url: string): string {
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return "";
  }
}

const SUPABASE_PROJECT_REF = getProjectRef(SUPABASE_URL);
const API_KEY_PREFIX = "relay_sk_";

export interface AuthContext {
  userId: string;
  accessToken?: string;
  authMethod: "jwt" | "api_key";
}

function createAuthClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function isApiKey(token: string): boolean {
  return token.startsWith(API_KEY_PREFIX);
}

function extractTokenFromCookies(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookieName = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
  const cookies = cookieHeader.split(";").map((part) => part.trim());

  for (const cookie of cookies) {
    if (!cookie.startsWith(`${cookieName}=`)) {
      continue;
    }

    const rawValue = decodeURIComponent(cookie.slice(cookieName.length + 1));

    try {
      const parsed = JSON.parse(rawValue) as {
        access_token?: string;
      };

      if (parsed.access_token) {
        return parsed.access_token;
      }
    } catch {
      if (rawValue.startsWith("base64-")) {
        try {
          const decoded = JSON.parse(
            Buffer.from(rawValue.slice(7), "base64").toString("utf8"),
          ) as { access_token?: string };

          if (decoded.access_token) {
            return decoded.access_token;
          }
        } catch {
          console.error("[auth] Failed to parse base64 auth cookie");
        }
      }
    }
  }

  return null;
}

async function resolveUserFromJwt(accessToken: string): Promise<User | null> {
  const authClient = createAuthClient();

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error) {
    console.error("[auth] JWT validation failed:", error.message);
    return null;
  }

  return user;
}

async function resolveUserFromApiKey(apiKey: string): Promise<string | null> {
  const supabase = createAuthClient();

  const { data, error } = await supabase.rpc("get_user_id_by_api_key", {
    api_key: apiKey,
  });

  if (error) {
    console.error("[auth] API key lookup failed:", error.message);
    return null;
  }

  if (typeof data !== "string" || data.length === 0) {
    console.error("[auth] API key not found");
    return null;
  }

  return data;
}

export async function resolveAuth(
  bearerToken: string | null,
  cookieHeader?: string | undefined,
): Promise<AuthContext | null> {
  if (bearerToken && isApiKey(bearerToken)) {
    const userId = await resolveUserFromApiKey(bearerToken);

    if (userId) {
      console.log("[auth] Authenticated via API key");
      return { userId, authMethod: "api_key" };
    }

    return null;
  }

  const jwtToken = bearerToken ?? extractTokenFromCookies(cookieHeader);

  if (!jwtToken) {
    console.error("[auth] No bearer token or session cookie found");
    return null;
  }

  const user = await resolveUserFromJwt(jwtToken);

  if (!user) {
    return null;
  }

  console.log("[auth] Authenticated via JWT session");
  return {
    userId: user.id,
    accessToken: jwtToken,
    authMethod: "jwt",
  };
}