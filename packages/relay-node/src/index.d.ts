export type RelayStatus = "allowed" | "blocked" | "error";

export interface RelayResult {
  status: RelayStatus;
  reason?: string;
  [key: string]: unknown;
}

export interface RelayOptions {
  endpoint?: string;
  apiKey?: string;
  fetch?: typeof fetch;
}

export class RelayPolicyError extends Error {
  result: RelayResult;
  constructor(message: string, result: RelayResult);
}

export interface RelayClient {
  check(tool: string, args?: Record<string, unknown>): Promise<RelayResult>;
  assertAllowed(tool: string, args?: Record<string, unknown>): Promise<RelayResult>;
  guardTool<TArgs extends Record<string, unknown>, TResult>(
    tool: string,
    handler: (args: TArgs) => Promise<TResult> | TResult
  ): (args?: TArgs) => Promise<TResult>;
}

export function createRelay(options?: RelayOptions): RelayClient;

export function guardedTool<TArgs extends Record<string, unknown>, TResult>(
  tool: string,
  handler: (args: TArgs) => Promise<TResult> | TResult,
  options?: RelayOptions
): (args?: TArgs) => Promise<TResult>;
