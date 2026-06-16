import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

export default function Account() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      setLoading(false);
    }

    void loadUser();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mx-auto max-w-md rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
          <p className="text-label mb-2">Account</p>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
            Your profile
          </h1>

          <div className="mt-8">
            <p className="text-label mb-2">Email</p>
            {loading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading...</p>
            ) : (
              <p className="text-sm text-[var(--text-primary)]">
                {email ?? "—"}
              </p>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <Link
              to="/settings/api-keys"
              className="flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-strong)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors duration-[150ms] hover:bg-[var(--bg-tertiary)]"
            >
              Manage API Keys
            </Link>
            <Button variant="secondary" size="md" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}