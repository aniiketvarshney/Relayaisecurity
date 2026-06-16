export type PolicyAction = "allow" | "block";
export type ExecutionStatus = "allowed" | "blocked";

export interface Policy {
  id: string;
  user_id: string;
  tool_name: string;
  action: PolicyAction;
  created_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  key: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  tool_name: string;
  status: ExecutionStatus;
  reason: string | null;
  created_at: string;
}

export interface ToolRequest {
  tool: string;
  arguments?: Record<string, unknown>;
}

export interface ToolResponse {
  status: ExecutionStatus;
  reason?: string;
}