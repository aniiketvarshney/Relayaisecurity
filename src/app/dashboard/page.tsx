import { useCallback, useEffect, useState } from "react";
import Badge from "../../components/Badge";
import { supabase } from "../../lib/supabase";
import type { AuditLog } from "../../types/database";

export default function DashboardPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to view audit logs.");
      setLogs([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLogs([]);
    } else {
      setLogs(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const blockedCount = logs.filter((log) => log.status === "blocked").length;
  const allowedCount = logs.filter((log) => log.status === "allowed").length;

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label mb-2">Audit dashboard</p>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              Agent activity
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={blockedCount > 0 ? "blocked" : "permitted"}>
              {blockedCount > 0 ? "Risk detected" : "No risk"}
            </Badge>
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <p className="text-label mb-1">Total events</p>
            <p className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              {logs.length}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <p className="text-label mb-1">Allowed</p>
            <p className="text-3xl font-bold tracking-[-0.02em] text-[var(--success)]">
              {allowedCount}
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <p className="text-label mb-1">Blocked</p>
            <p className="text-3xl font-bold tracking-[-0.02em] text-[var(--danger)]">
              {blockedCount}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-label">Audit log</p>
            <span className="text-xs text-[var(--text-muted)]">
              {loading
                ? "Loading..."
                : `${logs.length} event${logs.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-tertiary)]">
                  <th className="py-2.5 pr-4 text-xs font-medium uppercase tracking-wider">
                    Tool
                  </th>
                  <th className="py-2.5 pr-4 text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-2.5 pr-4 text-xs font-medium uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="py-2.5 pl-4 text-right text-xs font-medium uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-b border-[var(--border)]">
                    <td
                      colSpan={4}
                      className="py-8 text-center text-[var(--text-muted)]"
                    >
                      Loading audit events…
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)]">
                          <svg
                            className="h-4 w-4 text-[var(--text-tertiary)]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          Waiting for agent activity
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
                          Events appear here once agents make tool calls through
                          Relay.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-[var(--border)] transition-colors duration-[150ms] hover:bg-[var(--bg-secondary)]"
                    >
                      <td className="py-3 pr-4 font-mono text-[13px] text-[var(--code-text)]">
                        {log.tool_name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            log.status === "blocked" ? "blocked" : "permitted"
                          }
                        >
                          {log.status === "blocked" ? "Blocked" : "Permitted"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-[var(--text-secondary)]">
                        {log.reason ?? "—"}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-[13px] text-[var(--text-muted)]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}