const API_KEY_PREFIX = "relay_sk_";
const API_KEY_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateApiKey(): string {
  const randomValues = new Uint8Array(32);
  crypto.getRandomValues(randomValues);

  const suffix = Array.from(randomValues, (value) =>
    API_KEY_CHARS.charAt(value % API_KEY_CHARS.length),
  ).join("");

  return `${API_KEY_PREFIX}${suffix}`;
}

export async function hashApiKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", encoded);

  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function maskApiKey(key: string): string {
  if (key.length <= API_KEY_PREFIX.length + 4) {
    return `${API_KEY_PREFIX}****`;
  }

  return `${API_KEY_PREFIX}****${key.slice(-4)}`;
}

export function isApiKey(value: string): boolean {
  return value.startsWith(API_KEY_PREFIX);
}
