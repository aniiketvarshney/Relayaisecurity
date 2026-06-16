import { supabase } from "./supabase";
import type { ToolRequest, ToolResponse } from "../types/database";

export async function executeTool(
  request: ToolRequest,
): Promise<ToolResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be signed in to execute tools.");
  }

  const response = await fetch("/api/execute", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      tool: request.tool,
      tool_name: request.tool,
      arguments: request.arguments,
    }),
  });

  const data = (await response.json()) as ToolResponse & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to execute tool.");
  }

  return data;
}