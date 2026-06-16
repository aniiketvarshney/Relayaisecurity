import { useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { API_BASE } from "../lib/api";
import type { ToolResponse } from "../types/database";

export default function Playground() {
  const [toolName, setToolName] = useState("");
  const [argumentsJson, setArgumentsJson] = useState("{}");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolResponse | null>(null);

  async function handleExecute(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const trimmedToolName = toolName.trim();
    if (!trimmedToolName) {
      setError("Tool name is required.");
      setLoading(false);
      return;
    }

    let parsedArguments: Record<string, unknown> | undefined;

    if (argumentsJson.trim()) {
      try {
        const parsed = JSON.parse(argumentsJson) as unknown;
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          throw new Error("Arguments must be a JSON object.");
        }
        parsedArguments = parsed as Record<string, unknown>;
      } catch (parseError) {
        setError(
          parseError instanceof Error
            ? parseError.message
            : "Invalid JSON arguments.",
        );
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/execute`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tool: trimmedToolName,
            arguments: parsedArguments,
          }),
        },
      );

      const data = (await response.json()) as ToolResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to execute tool.");
      }

      setResult(data);
    } catch (executeError) {
      setError(
        executeError instanceof Error
          ? executeError.message
          : "Failed to execute tool.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-label mb-2">Tool execution</p>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Playground
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Execute a tool call against your policies. Every execution is logged
            to your audit logs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <form onSubmit={handleExecute} className="space-y-4">
              <div>
                <label htmlFor="playground-tool" className="text-label mb-2 block">
                  Tool Name
                </label>
                <input
                  id="playground-tool"
                  type="text"
                  value={toolName}
                  onChange={(event) => setToolName(event.target.value)}
                  placeholder="github_delete_repo"
                  className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)]"
                />
              </div>

              <div>
                <label
                  htmlFor="playground-args"
                  className="text-label mb-2 block"
                >
                  Arguments (optional JSON)
                </label>
                <textarea
                  id="playground-args"
                  value={argumentsJson}
                  onChange={(event) => setArgumentsJson(event.target.value)}
                  rows={6}
                  placeholder='{"repo": "example"}'
                  className="w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-sm text-[var(--code-text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)]"
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--danger)]">{error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
              >
                {loading ? "Executing..." : "Execute"}
              </Button>
            </form>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)] p-6">
            <p className="text-label mb-4">Result</p>

            {loading ? (
              <p className="text-sm text-[var(--text-muted)]">Executing...</p>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Status
                  </span>
                  <Badge
                    variant={
                      result.status === "blocked" ? "blocked" : "permitted"
                    }
                  >
                    {result.status}
                  </Badge>
                </div>

                {result.reason && (
                  <div>
                    <p className="text-label mb-2">Reason</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {result.reason}
                    </p>
                  </div>
                )}

                <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-4 font-mono text-[13px] text-[var(--code-text)]">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">
                Run a tool execution to see the result here.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}