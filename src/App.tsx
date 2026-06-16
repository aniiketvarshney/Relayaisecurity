import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import RootLayout from "./app/layout";
import HomePage from "./app/page";
import DashboardPage from "./app/dashboard/page";
import SignIn from "./pages/SignIn";
import Account from "./pages/Account";
import Policies from "./pages/Policies";
import Playground from "./pages/Playground";
import ApiKeys from "./pages/ApiKeys";
import Docs from "./pages/Docs";
import Pricing from "./pages/Pricing";
import { supabase } from "./lib/supabase";

function ProtectedRoute({
  session,
  loading,
}: {
  session: Session | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] pt-14">
        <p className="text-sm text-[var(--text-muted)]">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="docs" element={<Docs />} />
          <Route path="pricing" element={<Pricing />} />
          <Route element={<ProtectedRoute session={session} loading={loading} />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="policies" element={<Policies />} />
            <Route path="playground" element={<Playground />} />
            <Route path="account" element={<Account />} />
            <Route path="settings/api-keys" element={<ApiKeys />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}