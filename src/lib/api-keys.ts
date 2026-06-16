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

export function maskApiKey(key: string): string {
  if (key.length <= API_KEY_PREFIX.length + 4) {
    return `${API_KEY_PREFIX}****`;
  }

  return `${API_KEY_PREFIX}****${key.slice(-4)}`;
}

export function isApiKey(value: string): boolean {
  return value.startsWith(API_KEY_PREFIX);
}