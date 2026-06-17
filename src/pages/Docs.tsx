import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const browserExample = String.raw`const response = await fetch("/api/execute", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  credentials: "include",
  body: JSON.stringify({
    tool: "github_delete_repo",
    arguments: {}
  })
});

const result = await response.json();

if (result.status === "blocked") {
  throw new Error(result.reason || "Blocked by policy");
}`;

const curlExample = String.raw`curl -X POST https://relay-security-lemon.vercel.app/api/execute \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tool":"github_delete_repo","arguments":{}}'`;

const langChainExample = String.raw`import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export const relayGuard = new DynamicStructuredTool({
  name: "relay_guard",
  description: "Send a tool call through Relay before the agent executes it.",
  schema: z.object({
    tool: z.string(),
    arguments: z.record(z.any()).default({})
  }),
  func: async ({ tool, arguments: args }) => {
    const response = await fetch("https://relay-security-lemon.vercel.app/api/execute", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RELAY_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tool, arguments: args })
    });

    const result = await response.json();
    return JSON.stringify(result);
  }
});`;

const dashboardExample = String.raw`{
  "status": "blocked",
  "reason": "Policy violation"
}`;

function CodeBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
          {label}
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[var(--code-text)]">
        {code}
      </pre>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-label">{number}</span>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <div className="text-sm leading-7 text-[var(--text-secondary)]">
        {body}
      </div>
    </div>
  );
}

export default function Docs() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <p className="text-label mb-4">Quickstart</p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-[-0.03em] text-[var(--text-primary)] sm:text-5xl">
              Integrate Relay in 5 minutes and stop bad tool calls before they
              run.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)]">
              Relay sits in front of your tools, checks policy, and returns
              either <code>allowed</code> or <code>blocked</code> with a reason.
              Use the browser session path for the Playground, or use an API key
              when you call Relay from your own app, agent, or backend.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/playground"
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                Open Playground
              </Link>
              <Link
                to="/settings/api-keys"
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                Get API Key
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
              >
                View Audit Logs
              </Link>
            </div>

            <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Playground vs API key
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                The Playground uses your signed-in browser session and the same
                domain proxy, so it should work without an API key. If you are
                integrating Relay into a separate app, use the API key example
                below.
              </p>
            </div>
          </div>

          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6 shadow-[0_16px_48px_rgba(0,0,0,0.18)]">
            <p className="text-label mb-4">5-minute flow</p>
            <div className="space-y-3">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  1. Create an API key
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Open{" "}
                  <Link
                    to="/settings/api-keys"
                    className="text-white underline underline-offset-2 hover:opacity-90"
                  >
                    Settings
                  </Link>{" "}
                  and copy your Relay key.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  2. Add one rule
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Start with something obvious, like blocking{" "}
                  <code className="rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--code-text)]">
                    github_delete_repo
                  </code>
                  .
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  3. Replace the direct tool call
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Send the tool name and arguments to Relay before the action
                  executes.
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  4. Read the result
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                  Stop the agent on <code>blocked</code> and continue on{" "}
                  <code>allowed</code>.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <Step
            number="01"
            title="Use Relay from the browser or your frontend"
            body={
              <>
                <p>
                  If your app is behind the same host or a rewrite, call{" "}
                  <code>/api/execute</code> directly. Include{" "}
                  <code>credentials: "include"</code> so local development
                  keeps working with cookies.
                </p>
                <p className="mt-3">
                  This is the path the Playground uses.
                </p>
              </>
            }
          />
          <CodeBlock label="JavaScript" code={browserExample} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <CodeBlock label="curl" code={curlExample} />
          <Step
            number="02"
            title="Use Relay from a backend or CLI"
            body={
              <>
                <p>
                  For server-side integrations, send your API key in the
                  <code>Authorization</code> header and post the tool payload to
                  your deployed Relay endpoint.
                </p>
                <p className="mt-3">
                  The example below works from any backend that can make HTTPS
                  requests.
                </p>
              </>
            }
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <Step
            number="03"
            title="Drop Relay into LangChain"
            body={
              <>
                <p>
                  Wrap Relay as a tool so your agent asks for approval before it
                  performs a dangerous action.
                </p>
                <p className="mt-3">
                  You can use the same pattern with other agent frameworks too.
                </p>
              </>
            }
          />
          <CodeBlock label="LangChain" code={langChainExample} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <CodeBlock label="Typical response" code={dashboardExample} />
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <p className="text-label mb-3">What to do next</p>
            <ul className="space-y-3 text-sm leading-7 text-[var(--text-secondary)]">
              <li>1. Create one or two policies.</li>
              <li>2. Test a safe tool and a blocked tool.</li>
              <li>3. Open the Dashboard to confirm the audit trail.</li>
              <li>4. Ship the Relay wrapper into your agent code.</li>
            </ul>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-primary)] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Want to test it now?
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                Open the Playground, try <code>github_delete_repo</code>, and
                confirm Relay returns <code>blocked</code> with a reason.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-label mb-3">FAQ</p>
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
              Can Relay protect my agent stack?
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Can this protect my GitHub agent?
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Yes. Put Relay in front of the GitHub action and send the tool
                name plus arguments first. If Relay returns{" "}
                <code>blocked</code>, stop the repo-changing action before it
                runs.
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Can I connect Claude Code?
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Yes. Claude Code can call Relay through a small wrapper script
                or helper service. Relay decides whether the command should be
                allowed before the tool executes.
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Can I use this with LangGraph?
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                Yes. Add Relay as a guard node or tool wrapper in your graph.
                When the graph reaches a risky step, Relay returns{" "}
                <code>allowed</code> or <code>blocked</code>, and the graph can
                branch safely from there.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
