import { Link } from "react-router-dom";

const features = [
  "Unlimited API calls (within fair use)",
  "Unlimited policies",
  "Audit logs for 30 days",
  "API keys",
  "Email support (response within 48 hours)",
];

export default function Pricing() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <p className="text-label mb-4">Pricing</p>

        <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
          Free for early users
        </h1>

        <p className="mt-4 max-w-2xl text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          Relay is completely free during our preview period. No credit card
          required. We&apos;ll notify you before any future pricing changes.
        </p>

        <div className="mt-10 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-8">
          <ul className="space-y-4">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-[15px] text-[var(--text-primary)]"
              >
                <span className="mt-0.5 text-[var(--success)]">✅</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          For teams needing enterprise features (SSO, SOC2, dedicated support),
          contact us.
        </p>

        <div className="mt-8">
          <Link
            to="/signin"
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-white px-5 text-sm font-medium text-black transition-opacity duration-[150ms] hover:opacity-90"
          >
            Get started →
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--text-muted)]">
          No hidden fees. Cancel anytime.
        </p>
      </div>
    </main>
  );
}