import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { generateApiKey, hashApiKey, maskApiKey } from "../lib/api-keys";
import { supabase } from "../lib/supabase";
import type { ApiKey } from "../types/database";

const installCommand = "npx @relaysecurity-dev/relay-ai init";
const maxApiKeys = 20;

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedInstall, setCopiedInstall] = useState(false);

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

    if (keys.length >= maxApiKeys) {
      setError(`You can create up to ${maxApiKeys} API keys.`);
      setGenerating(false);
      return;
    }

    const key = generateApiKey();
    const keyHash = await hashApiKey(key);
    const keyPreview = maskApiKey(key);

    let { error: insertError } = await supabase.from("api_keys").insert({
      user_id: user.id,
      key: null,
      key_hash: keyHash,
      key_preview: keyPreview,
    });

    if (
      insertError?.message.includes("key_hash") ||
      insertError?.message.includes("key_preview")
    ) {
      const fallback = await supabase.from("api_keys").insert({
        user_id: user.id,
        key,
      });
      insertError = fallback.error;
    }

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

  async function handleCopyInstallCommand() {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopiedInstall(true);
      window.setTimeout(() => setCopiedInstall(false), 1600);
    } catch {
      setError("Failed to copy install command.");
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

        <section className="mb-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-label mb-2">Install Relay in your agent</p>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Run the setup command once, then add your API key to the agent
                environment.
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                The CLI creates config and examples for Node, LangGraph, and
                Claude Code style wrappers.
              </p>
            </div>
            <div className="min-w-0 lg:w-[440px]">
              <code className="block overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-primary)] px-3 py-2 font-mono text-[13px] text-[var(--code-text)]">
                {installCommand}
              </code>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={handleCopyInstallCommand}
              >
                {copiedInstall ? "Copied" : "Copy Install Command"}
              </Button>
            </div>
          </div>
        </section>

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
                        {apiKey.key_preview ??
                          (apiKey.key ? maskApiKey(apiKey.key) : "relay_sk_****")}
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
