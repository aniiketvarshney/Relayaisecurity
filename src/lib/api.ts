export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function callApi(tool: string, args?: Record<string, unknown>) {
  const apiKey = import.meta.env.VITE_API_KEY;
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }

  const response = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ tool, arguments: args }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error ${response.status}`);
  }

  return response.json();
}
