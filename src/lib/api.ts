import { supabase } from "./supabase";

export const API_BASE = "/api";

export async function callApi(tool: string, args?: Record<string, unknown>) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
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
