import { supabase } from "./supabase";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function getAuthToken() {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (apiKey) {
    return apiKey;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function callApi(tool: string, args?: Record<string, unknown>) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const authToken = await getAuthToken();
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
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
