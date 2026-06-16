import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { generateApiKey, maskApiKey } from "../lib/api-keys";
import { supabase } from "../lib/supabase";
import type { ApiKey } from "../types/database";

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to manage API keys.");
      setKeys([]);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setKeys([]);
    } else {
      setKeys(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function handleGenerateKey() {
    setGenerating(true);
    setError(null);
    setNewKey(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be signed in to generate API keys.");
      setGenerating(false);
      return;
    }

    const key = generateApiKey();

    const { error: insertError } = await supabase.from("api_keys").insert({
      user_id: user.id,
      key,
    });

    setGenerating(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setNewKey(key);
    await loadKeys();
  }

  async function handleDeleteKey(id: string) {
    setDeletingId(id);
    setError(null);

    const { error: deleteError } = await supabase
      .from("api_keys")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadKeys();
  }

  async function handleCopyKey() {
    if (!newKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(newKey);
    } catch {
      setError("Failed to copy key to clipboard.");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-label mb-2">Settings</p>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              API Keys
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Generate keys to authenticate tool executions from external
              agents.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={generating}
            onClick={handleGenerateKey}
          >
            {generating ? "Generating..." : "Generate New Key"}
          </Button>
        </div>

        {newKey && (
          <div className="mb-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
            <p className="text-label mb-2">New API key</p>
            <p className="mb-3 text-sm text-[var(--text-secondary)]">
              Copy this key now. You will not be able to see it again.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-[13px] text-[var(--code-text)]">
                {newKey}
              </code>
              <Button variant="secondary" size="sm" onClick={handleCopyKey}>
                Copy
              </Button>
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-label">Your keys</p>
            <span className="text-xs text-[var(--text-muted)]">
              {loading
                ? "Loading..."
                : `${keys.length} key${keys.length === 1 ? "" : "s"}`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-tertiary)]">
                  <th className="py-2.5 pr-4 text-xs font-medium uppercase tracking-wider">
                    Key
                  </th>
                  <th className="py-2.5 pr-4 text-xs font-medium uppercase tracking-wider">
                    Created
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
                      Loading API keys…
                    </td>
                  </tr>
                ) : keys.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16">
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          No API keys yet
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--text-muted)]">
                          Generate a key to authenticate requests with{" "}
                          <code className="font-mono">Authorization: Bearer</code>
                          .
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  keys.map((apiKey) => (
                    <tr
                      key={apiKey.id}
                      className="border-b border-[var(--border)] transition-colors duration-[150ms] hover:bg-[var(--bg-secondary)]"
                    >
                      <td className="py-3 pr-4 font-mono text-[13px] text-[var(--code-text)]">
                        {maskApiKey(apiKey.key)}
                      </td>
                      <td className="py-3 pr-4 font-mono text-[13px] text-[var(--text-muted)]">
                        {new Date(apiKey.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={deletingId === apiKey.id}
                          onClick={() => handleDeleteKey(apiKey.id)}
                        >
                          {deletingId === apiKey.id ? "Deleting..." : "Delete"}
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