import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../../components/Badge";
import { supabase } from "../../lib/supabase";
import type { AuditLog } from "../../types/database";

const installCommand = "npx @relaysecurity-dev/relay-ai init";

export default function DashboardPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "allowed" | "blocked">(
    "all",
  );
  const [toolSearch, setToolSearch] = useState("");

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
      .order("created_at", { ascending: false })
      .limit(1000);

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
  const filteredLogs = logs.filter((log) => {
    const matchesStatus =
      statusFilter === "all" || log.status === statusFilter;
    const matchesSearch = log.tool_name
      .toLowerCase()
      .includes(toolSearch.trim().toLowerCase());

    return matchesStatus && matchesSearch;
  });

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

        <section className="mb-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-label mb-2">Protect your first agent</p>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Install Relay once, then manage rules from this dashboard.
              </h2>
              <div className="mt-4 grid gap-3 text-sm text-[var(--text-secondary)] md:grid-cols-3">
                <p>1. Create an API key.</p>
                <p>2. Run the install command.</p>
                <p>3. Test a blocked tool call.</p>
              </div>
            </div>
            <div className="min-w-0 lg:w-[440px]">
              <code className="block overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-[13px] text-[var(--code-text)]">
                {installCommand}
              </code>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  to="/settings/api-keys"
                  className="inline-flex h-9 items-center rounded-[var(--radius-md)] bg-white px-3 text-xs font-medium text-black transition-opacity hover:opacity-90"
                >
                  Create API Key
                </Link>
                <Link
                  to="/docs"
                  className="inline-flex h-9 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-3 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)]"
                >
                  Open Quickstart
                </Link>
              </div>
            </div>
          </div>
        </section>

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
                : `${filteredLogs.length} shown / ${logs.length} total`}
            </span>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as "all" | "allowed" | "blocked",
                )
              }
              className="h-10 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)]"
            >
              <option value="all">All statuses</option>
              <option value="blocked">Blocked only</option>
              <option value="allowed">Allowed only</option>
            </select>
            <input
              type="search"
              value={toolSearch}
              onChange={(event) => setToolSearch(event.target.value)}
              placeholder="Search tool name..."
              className="h-10 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)]"
            />
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
                ) : filteredLogs.length === 0 ? (
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
                          No matching audit events
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
                          Events appear here once matching tool calls pass
                          through Relay.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
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
