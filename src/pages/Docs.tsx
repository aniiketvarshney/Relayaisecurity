import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

const installCommand = "npx @relaysecurity-dev/relay-ai init --yes";

const envExample = String.raw`RELAY_API_KEY=relay_sk_your_key_here
RELAY_ENDPOINT=https://relay-security-lemon.vercel.app/api/execute`;

const nodeExample = String.raw`import { createRelay } from "@relaysecurity-dev/node";

const relay = createRelay();

export const deleteRepo = relay.guardTool(
  "github_delete_repo",
  async ({ repoName }) => {
    return github.repos.delete({ repo: repoName });
  }
);`;

const pythonExample = String.raw`from relaysecurity_dev import Relay

relay = Relay()

def delete_repo(arguments):
    relay.assert_allowed("github_delete_repo", arguments)
    return github.delete_repo(arguments["repo_name"])`;

const cliOutputExample = String.raw`relay.config.json
.env.relay.example
RELAY_SETUP.md
relay-examples/node/github-tool-wrapper.ts
relay-examples/python/github_tool_wrapper.py
relay-examples/langgraph/relay_guard.py
relay-examples/claude-code/relay-guard.js`;

const allowedResponse = String.raw`{
  "status": "allowed"
}`;

const blockedResponse = String.raw`{
  "status": "blocked",
  "reason": "Policy violation"
}`;

const curlExample = String.raw`curl -X POST https://relay-security-lemon.vercel.app/api/execute \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"tool":"github_delete_repo","arguments":{}}'`;

function CodeBlock({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-tertiary)]">
          {label}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-[var(--code-text)]">
        {code}
      </pre>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-[var(--border)] py-10">
      <p className="text-label mb-3">{eyebrow}</p>
      <h2 className="max-w-3xl text-2xl font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-5 text-sm leading-7 text-[var(--text-secondary)]">
        {children}
      </div>
    </section>
  );
}

function SimpleCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
        {children}
      </div>
    </div>
  );
}

export default function Docs() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <p className="text-label mb-4">Relay quickstart</p>
        <h1 className="max-w-4xl text-4xl font-bold text-[var(--text-primary)] sm:text-5xl">
          Protect your AI agent in one setup.
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
          Relay is a checkpoint for risky agent actions. Your agent asks Relay
          before it runs a tool. Relay answers <code>allowed</code> or{" "}
          <code>blocked</code>. You change the rules later from the dashboard.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/settings/api-keys"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Get API Key
          </Link>
          <Link
            to="/policies"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
          >
            Add Policy
          </Link>
          <Link
            to="/playground"
            className="inline-flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--border)] px-4 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)]"
          >
            Test Playground
          </Link>
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <SimpleCard title="1. Install once">
            Run the CLI in your agent project. It creates config and example
            wrappers.
          </SimpleCard>
          <SimpleCard title="2. Wrap risky tools once">
            Put Relay around dangerous actions like repo deletion, shell
            deletes, deploys, and database changes.
          </SimpleCard>
          <SimpleCard title="3. Manage rules in Relay">
            Block or allow tools from the dashboard. Your agent code does not
            need to change again.
          </SimpleCard>
        </section>

        <Section eyebrow="Step 1" title="Run one command in your agent project.">
          <p className="mb-4">
            This is the fastest setup. It generates the files developers need
            instead of making them write everything by hand.
          </p>
          <CodeBlock label="Terminal" code={installCommand} />
          <p className="mt-4">The command creates:</p>
          <div className="mt-4">
            <CodeBlock label="Generated files" code={cliOutputExample} />
          </div>
        </Section>

        <Section eyebrow="Step 2" title="Add your API key once.">
          <p className="mb-4">
            Create an API key in Relay, then put it in your agent environment.
            Do not commit this key to GitHub.
          </p>
          <CodeBlock label=".env" code={envExample} />
        </Section>

        <Section eyebrow="Step 3" title="Wrap the dangerous tool once.">
          <p className="mb-4">
            Your agent should call the wrapped function, not the raw dangerous
            function. After that, Relay checks every future call automatically.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <CodeBlock label="Node" code={nodeExample} />
            <CodeBlock label="Python" code={pythonExample} />
          </div>
        </Section>

        <Section eyebrow="Step 4" title="Understand the response.">
          <p className="mb-4">
            Relay gives a small answer. Your agent continues on{" "}
            <code>allowed</code>. Your agent stops on <code>blocked</code>.
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <CodeBlock label="Allowed" code={allowedResponse} />
            <CodeBlock label="Blocked" code={blockedResponse} />
          </div>
        </Section>

        <Section eyebrow="Step 5" title="Change policy without changing code.">
          <div className="grid gap-4 md:grid-cols-2">
            <SimpleCard title="Example">
              If you block <code>github_delete_repo</code> in Relay, the
              wrapped delete function starts blocking immediately.
            </SimpleCard>
            <SimpleCard title="Audit trail">
              Every allowed or blocked decision appears in the dashboard, so
              teams can see what the agent tried to do.
            </SimpleCard>
          </div>
        </Section>

        <Section eyebrow="Direct API" title="Use this when you are not using an SDK.">
          <p className="mb-4">
            Any stack that can make an HTTP request can use Relay. Send the tool
            name and arguments, then follow the response.
          </p>
          <CodeBlock label="curl" code={curlExample} />
        </Section>

        <Section eyebrow="Frameworks" title="Where each integration file goes.">
          <div className="grid gap-4 md:grid-cols-2">
            <SimpleCard title="GitHub agent">
              Use <code>relay-examples/node/github-tool-wrapper.ts</code> or
              <code>relay-examples/python/github_tool_wrapper.py</code>.
            </SimpleCard>
            <SimpleCard title="LangGraph">
              Use <code>relay-examples/langgraph/relay_guard.py</code> as a
              guard node before risky graph steps.
            </SimpleCard>
            <SimpleCard title="Claude Code">
              Use <code>relay-examples/claude-code/relay-guard.js</code> as the
              helper that checks Relay before a command runs.
            </SimpleCard>
            <SimpleCard title="Custom agents">
              Use the direct API example or wrap the tool with the Node/Python
              SDK.
            </SimpleCard>
          </div>
        </Section>

        <Section eyebrow="Safety" title="Production basics.">
          <div className="grid gap-4 md:grid-cols-3">
            <SimpleCard title="Keep keys private">
              Store <code>RELAY_API_KEY</code> in environment variables. Never
              paste it into public code.
            </SimpleCard>
            <SimpleCard title="Start with presets">
              Use policy presets for GitHub, shell commands, deploys, and data
              actions.
            </SimpleCard>
            <SimpleCard title="Rotate if exposed">
              Delete an exposed key from Settings and create a new one.
            </SimpleCard>
          </div>
        </Section>
      </div>
    </main>
  );
}
