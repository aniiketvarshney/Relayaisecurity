import { useCallback, useEffect, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import type { Policy, PolicyAction } from "../types/database";

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [action, setAction] = useState<PolicyAction>("block");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to view policies.");
      setPolicies([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("policies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setPolicies([]);
    } else {
      setPolicies(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPolicies();
  }, [loadPolicies]);

  async function handleAddPolicy(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const trimmedToolName = toolName.trim();
    if (!trimmedToolName) {
      setError("Tool name is required.");
      setSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to add policies.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("policies").insert({
      user_id: user.id,
      tool_name: trimmedToolName,
      action,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setToolName("");
    setAction("block");
    await loadPolicies();
  }

  async function handleDeletePolicy(id: string) {
    setDeletingId(id);
    setError(null);

    const { error: deleteError } = await supabase
      .from("policies")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadPolicies();
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="text-label mb-2">Policy management</p>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Policies
          </h1>
        </div>

        <div className="mb-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
          <p className="text-label mb-4">Add policy</p>
          <form
            onSubmit={handleAddPolicy}
            className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto]"
          >
            <div>
              <label htmlFor="tool-name" className="text-label mb-2 block">
                Tool Name
              </label>
              <input
                id="tool-name"
                type="text"
                value={toolName}
                onChange={(event) => setToolName(event.target.value)}
                placeholder="github_delete_repo"
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)]"
              />
            </div>

            <div>
              <label htmlFor="action" className="text-label mb-2 block">
                Action
              </label>
              <select
                id="action"
                value={action}
                onChange={(event) =>
                  setAction(event.target.value as PolicyAction)
                }
                className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-white)] md:min-w-[140px]"
              >
                <option value="allow">allow</option>
                <option value="block">block</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="w-full md:w-auto"
              >
                {submitting ? "Adding..." : "Add Policy"}
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-label">Your policies</p>
            <span className="text-xs text-[var(--text-muted)]">
              {loading
                ? "Loading..."
                : `${policies.length} polic${policies.length === 1 ? "y" : "ies"}`}
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
                    Action
                  </th>
                  <th className="py-2.5 pl-4 text-right text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="border-b border-[var(--border)]">
                    <td
                      colSpan={3}
                      className="py-8 text-center text-[var(--text-muted)]"
                    >
                      Loading policies…
                    </td>
                  </tr>
                ) : policies.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          No policies yet
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
                          Add a policy above to control which tools are allowed
                          or blocked.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  policies.map((policy) => (
                    <tr
                      key={policy.id}
                      className="border-b border-[var(--border)] transition-colors duration-[150ms] hover:bg-[var(--bg-secondary)]"
                    >
                      <td className="py-3 pr-4 font-mono text-[13px] text-[var(--code-text)]">
                        {policy.tool_name}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={
                            policy.action === "block" ? "blocked" : "permitted"
                          }
                        >
                          {policy.action}
                        </Badge>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={deletingId === policy.id}
                          onClick={() => handleDeletePolicy(policy.id)}
                        >
                          {deletingId === policy.id ? "Deleting..." : "Delete"}
                        </Button>
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