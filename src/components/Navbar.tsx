import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const baseNavItems = [
    { label: "Overview", path: "/" },
    { label: "Docs", path: "/docs" },
  ];

  const authenticatedNavItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Policies", path: "/policies" },
    { label: "Playground", path: "/playground" },
    { label: "Pricing", path: "/pricing" },
    { label: "Account", path: "/account" },
  ];

  const navItems = session
    ? [...baseNavItems, ...authenticatedNavItems]
    : [...baseNavItems, { label: "Pricing", path: "/pricing" }];

  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--bg-primary)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-[var(--radius-sm)] bg-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-3 w-3 text-black"
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
            Relay
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-[var(--radius-sm)] px-3 py-1.5 text-sm font-medium transition-colors duration-[150ms] ${
                  active
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/dashboard"
                className="flex h-8 items-center rounded-[var(--radius-md)] bg-white px-3 text-xs font-medium text-black"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link
              to="/signin"
              className="flex h-8 items-center rounded-[var(--radius-md)] bg-white px-3 text-xs font-medium text-black transition-opacity duration-[150ms] hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}