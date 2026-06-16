import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import TerminalDemo from "../components/TerminalDemo";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 flex-col bg-[var(--bg-primary)] pt-14">
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="max-w-[720px]">
            <p className="text-label mb-6">Runtime security for AI agents</p>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl lg:text-[56px]">
              Deterministic policy enforcement{" "}
              <span className="font-serif-italic">for AI agents</span>
            </h1>

            <p className="mt-6 max-w-[55ch] text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Relay sits between your agents and their tools. Every call is
              evaluated against static policies, logged, and returned with a
              clear allow or block decision. No model inference. No hidden
              logic.
            </p>

            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Open Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Verification demo */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <p className="text-label mb-10">Offline verification</p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_3fr] lg:gap-6">
            <TerminalDemo />

            <div className="relative pl-0 lg:pl-6">
              <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-[var(--border)] lg:block" />

              <div className="relative mb-10 lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">01 — Sign locally</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  Every tool call is signed with your offline key. Relay never
                  sees the private material.
                </p>
              </div>

              <div className="relative mb-10 lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">02 — Hash and link</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  Each receipt commits to the previous hash. Tamper with one
                  entry and the chain breaks.
                </p>
              </div>

              <div className="relative lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">03 — Verify anywhere</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  The verifier runs without network access. Developers can
                  audit the log themselves.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs italic text-[var(--text-muted)]">
            every edit breaks the chain • that is the point
          </p>
        </div>
      </section>

      {/* Runtime Flow */}
      <section className="flex-1 border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <p className="text-label mb-10">Runtime flow</p>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[5fr_3fr] lg:gap-6">
            {/* Left: code/demo */}
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)] p-5">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  POST /api/execute
                </span>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                  application/json
                </span>
              </div>

              <div className="font-mono text-[13px] leading-relaxed text-[var(--code-text)]">
                <div className="flex">
                  <span className="w-8 select-none text-right text-[var(--text-tertiary)]">
                    01
                  </span>
                  <pre className="ml-4 overflow-x-auto">
{`{
  "tool": "github_delete_repo",
  "arguments": {}
}`}
                  </pre>
                </div>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Policy engine
                  </span>
                  <span className="h-px flex-1 bg-[var(--border)]" />
                </div>

                <div className="flex">
                  <span className="w-8 select-none text-right text-[var(--text-tertiary)]">
                    02
                  </span>
                  <pre className="ml-4 overflow-x-auto">
{`DENY_LIST.includes(tool)
// → true`}
                  </pre>
                </div>

                <div className="my-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-[var(--border)]" />
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
                    Decision
                  </span>
                  <span className="h-px flex-1 bg-[var(--border)]" />
                </div>

                <div className="flex">
                  <span className="w-8 select-none text-right text-[var(--text-tertiary)]">
                    03
                  </span>
                  <pre className="ml-4 overflow-x-auto">
{`{
  "status": "blocked",
  "reason": "Policy violation"
}`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right: explanation */}
            <div className="relative pl-0 lg:pl-6">
              <div className="absolute left-0 top-2 bottom-2 hidden w-px bg-[var(--border)] lg:block" />

              <div className="relative mb-10 lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">01 — Agent request</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  The agent submits a tool call with a name and optional
                  arguments. Relay accepts JSON only.
                </p>
              </div>

              <div className="relative mb-10 lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">02 — Policy check</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  The tool name is checked against the configured deny list. The
                  match is deterministic and instantaneous.
                </p>
              </div>

              <div className="relative lg:pl-6">
                <div className="absolute -left-1.5 top-1.5 hidden h-3 w-3 rounded-full border border-[var(--border-strong)] bg-[var(--bg-secondary)] lg:block" />
                <p className="text-label mb-2">03 — Decision</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text-secondary)]">
                  If blocked, Relay returns a reason and records the event to
                  the audit log. If allowed, execution proceeds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 text-xs text-[var(--text-tertiary)]">
          <span className="font-medium">Relay</span>
          <span>Runtime security for AI agents</span>
        </div>
      </footer>
    </main>
  );
}