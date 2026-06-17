const DEFAULT_ENDPOINT = "https://relay-security-lemon.vercel.app/api/execute";

export class RelayPolicyError extends Error {
  constructor(message, result) {
    super(message);
    this.name = "RelayPolicyError";
    this.result = result;
  }
}

export function createRelay(options = {}) {
  const endpoint = options.endpoint || process.env.RELAY_ENDPOINT || DEFAULT_ENDPOINT;
  const apiKey = options.apiKey || process.env.RELAY_API_KEY;
  const fetchImpl = options.fetch || globalThis.fetch;

  if (!fetchImpl) {
    throw new Error("Relay requires fetch. Use Node 18+ or pass a fetch implementation.");
  }

  async function check(tool, args = {}) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ tool, arguments: args }),
    });

    let result;
    try {
      result = await response.json();
    } catch {
      result = { status: "error", reason: `Relay returned HTTP ${response.status}` };
    }

    if (!response.ok) {
      const reason = result?.error || result?.reason || `Relay returned HTTP ${response.status}`;
      throw new Error(reason);
    }

    return result;
  }

  async function assertAllowed(tool, args = {}) {
    const result = await check(tool, args);

    if (result?.status === "blocked") {
      throw new RelayPolicyError(result.reason || "Blocked by Relay policy", result);
    }

    return result;
  }

  function guardTool(tool, handler) {
    return async function guardedRelayTool(args = {}) {
      await assertAllowed(tool, args);
      return handler(args);
    };
  }

  return {
    check,
    assertAllowed,
    guardTool,
  };
}

export function guardedTool(tool, handler, options = {}) {
  return createRelay(options).guardTool(tool, handler);
}
