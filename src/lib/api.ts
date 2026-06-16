export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function callApi(tool: string, args?: Record<string, unknown>) {
  const response = await fetch(`${API_BASE}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ tool, arguments: args }),
  });
  return response.json();
}