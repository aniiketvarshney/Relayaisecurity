import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import TerminalDemo from "../components/TerminalDemo";

const riskRows = [
  "github_delete_repo",
  "shell_rm_rf",
  "database_drop_table",
  "deploy_production",
];

const useCases = [
  {
    title: "GitHub agents",
    body: "Block repo deletion, force pushes, branch deletion, and secret changes before they reach GitHub.",
  },
  {
    title: "Coding agents",
    body: "Let agents read and edit safely while stopping destructive shell and filesystem commands.",
  },
  {
    title: "Database agents",
    body: "Put policy checks in front of drop, delete, truncate, and migration tools.",
  },
  {
    title: "Deploy agents",
    body: "Require safety rules before production deploys, service restarts, and environment changes.",
  },
];

const problemPoints = [
  "Prompt injection can steer an agent into dangerous actions.",
  "One exposed tool can touch GitHub, shell, database, or prod.",
  "Human review is too slow for always-on agent workflows.",
  "Safety rules drift when every team writes its own checks.",
];

const solutionPoints = [
  "Relay checks the tool call before execution.",
  "Blocked calls return a clear reason, not guesswork.",
  "Policies stay in one place and apply across agents.",
  "Audit logs show what was blocked, allowed, and why.",
];

const faqs = [
  {
    question: "Why use Relay instead of writing a few if-statements?",
    answer:
      "A few if-statements work for one script. Relay gives teams a shared policy layer, API keys, audit logs, presets, and one place to update safety rules without hunting through every agent codebase.",
  },
  {
    question: "How fast can we set this up?",
    answer:
      "For a basic pilot, run the CLI, add your API key, and wrap the risky tools once. Most teams can test their first blocked call in minutes.",
  },
  {
    question: "Does Relay replace my agent framework?",
    answer:
      "No. Relay sits in front of dangerous tools. Keep your current agent, model, prompts, and framework. Relay only checks whether a tool call should be allowed or blocked.",
  },
  {
    question: "What agents and models does Relay work with?",
    answer:
      "Relay is model-agnostic. It can work with OpenAI, Claude, local models, LangGraph, Claude Code, custom Node agents, Python agents, and any system that can make an HTTP request.",
  },
  {
    question: "What kinds of calls should we protect first?",
    answer:
      "Start with tools that can cause real damage: deleting GitHub repos, running shell delete commands, changing production deploys, dropping database tables, editing secrets, or modifying customer data.",
  },
  {
    question: "Does Relay execute the tool for us?",
    answer:
      "No. Relay returns a decision. Your agent still owns the actual tool execution. If Relay says blocked, your wrapper should stop the call. If Relay says allowed, your code can continue.",
  },
  {
    question: "What do we get back from Relay?",
    answer:
      "You get a simple JSON result such as status: allowed or status: blocked, plus a reason. The decision is also recorded so your team can review what happened later.",
  },
  {
    question: "Can small AI teams use this today?",
    answer:
      "Yes, for beta pilots and early production experiments. Relay is built for small teams that want a practical safety gate now, before they build a full internal security platform.",
  },
  {
    question: "Is this enterprise-ready?",
    answer:
      "Not yet. Relay is ready for indie builders and small AI teams testing tool-call safety. Enterprise needs more work: SSO, team roles, stronger monitoring, exports, SLAs, and compliance workflows.",
  },
  {
    question: "Can you help us integrate it?",
    answer:
      "Yes. We can help you integrate Relay for free on a live call, add it to one real agent workflow, configure policies, and verify blocked calls in the dashboard.",
  },
  {
    question: "How does Relay protect Claude Code from prompt injection?",
    answer:
      "Relay does not try to guess whether a prompt is bad. It checks the tool call after Claude Code decides to act, so even if an attacker influences the agent, dangerous actions like delete, deploy, or shell commands can still be blocked before execution.",
  },
  {
    question: "Why would an attacker target my agent?",
    answer:
      "Attackers go after agents because agents often have access to useful tools, secrets, and production systems. One bad instruction can make the agent touch GitHub, databases, deploys, or files that should stay protected.",
  },
  {
    question: "How does Relay stop bad tool calls?",
    answer:
      "Relay sits in front of the tool. If a call matches a blocked policy, Relay returns blocked with a reason, and your wrapper stops the action before it runs.",
  },
];

function ToolCallFirewall() {
  return (
    <div className="relay-firewall relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.13),transparent_35%),var(--bg-primary)] p-5">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-black/40 p-4">
          <p className="text-label mb-3">AI Agent</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            wants tool access
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.08)] p-4 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
          <p className="text-label mb-3 text-[var(--success)]">Relay</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            policy check
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-black/40 p-4">
          <p className="text-label mb-3">Tools</p>
          <p className="font-mono text-xs text-[var(--text-secondary)]">
            GitHub / shell / DB
          </p>
        </div>
      </div>

      <div className="relative mt-8 h-44 rounded-[var(--radius-md)] border border-[var(--border)] bg-black/40">
        <div className="absolute left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)]" />
        <div className="relay-call relay-call-danger">
          <span className="font-mono">github_delete_repo</span>
        </div>
        <div className="relay-call relay-call-safe">
          <span className="font-mono">github_read_repo</span>
        </div>
        <div className="relay-shield absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(34,197,94,0.45)] bg-[rgba(34,197,94,0.08)]">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--success)]">
            check
          </span>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.08)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--danger)]">
            Blocked
          </p>
          <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`{
  "status": "blocked",
  "reason": "Policy violation"
}`}</pre>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--success)]">
            Logged
          </p>
          <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`audit_logs.insert({
  tool: "github_delete_repo"
})`}</pre>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-1 flex-col bg-[var(--bg-primary)] pt-14">
      {/* Hero */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1fr_470px] lg:items-center lg:py-28">
          <div className="max-w-[760px]">
            <p className="text-label mb-6">Runtime security for AI agents</p>

            <h1 className="text-4xl font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-primary)] sm:text-5xl lg:text-[56px]">
              Stop AI agents before they run{" "}
              <span className="font-serif-italic">dangerous tools</span>
            </h1>

            <p className="mt-6 max-w-[55ch] text-[15px] leading-[1.6] text-[var(--text-secondary)]">
              Relay sits between your agents and their tools. Dangerous calls
              are checked against your policies before they reach GitHub,
              shell, databases, or production systems.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/dashboard")}
              >
                Start protecting agents
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/docs")}
              >
                View quickstart
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {["One command setup", "Model agnostic", "Every call logged"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3"
                  >
                    <p className="text-xs font-medium text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-secondary)] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-3">
              <span className="text-label">Live decision</span>
              <span className="rounded-full border border-[rgba(34,197,94,0.3)] px-2 py-1 font-mono text-[10px] text-[var(--success)]">
                ONLINE
              </span>
            </div>
            <div className="space-y-2">
              {riskRows.map((tool, index) => (
                <div
                  key={tool}
                  className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-black/35 px-3 py-3"
                >
                  <span className="font-mono text-xs text-[var(--code-text)]">
                    {tool}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 font-mono text-[10px] ${
                      index === 0 || index === 2
                        ? "bg-[rgba(239,68,68,0.12)] text-[var(--danger)]"
                        : "bg-[rgba(34,197,94,0.12)] text-[var(--success)]"
                    }`}
                  >
                    {index === 0 || index === 2 ? "BLOCKED" : "WATCHED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-label mb-4">The problem</p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
              AI agents are useful, but tool access is where they become risky.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
              The model is not the only thing you need to trust. You also need
              to control what the agent can do once it decides to act.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(239,68,68,0.22)] bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_40%),var(--bg-secondary)] p-6">
              <div className="absolute right-6 top-6 rounded-full border border-[rgba(239,68,68,0.35)] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--danger)]">
                Risk
              </div>
              <p className="text-label mb-5 text-[var(--danger)]">
                Without a guardrail
              </p>
              <div className="space-y-4">
                {problemPoints.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.18)] bg-black/35 p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`agent decides
  -> tool call
  -> no gate
  -> damage`}</pre>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(34,197,94,0.26)] bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_40%),var(--bg-secondary)] p-6">
              <div className="absolute right-6 top-6 rounded-full border border-[rgba(34,197,94,0.35)] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--success)]">
                Relay
              </div>
              <p className="text-label mb-5 text-[var(--success)]">
                With Relay in front
              </p>
              <div className="space-y-4">
                {solutionPoints.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[var(--radius-md)] border border-[rgba(34,197,94,0.18)] bg-black/35 p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`agent decides
  -> Relay checks
  -> blocked or allowed
  -> action continues safely`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-label mb-4">The problem</p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
              AI agents are useful, but tool access is where they become risky.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
              The model is not the only thing you need to trust. You also need
              to control what the agent can do once it decides to act.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(239,68,68,0.22)] bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.12),transparent_40%),var(--bg-secondary)] p-6">
              <div className="absolute right-6 top-6 rounded-full border border-[rgba(239,68,68,0.35)] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--danger)]">
                Risk
              </div>
              <p className="text-label mb-5 text-[var(--danger)]">
                Without a guardrail
              </p>
              <div className="space-y-4">
                {problemPoints.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.18)] bg-black/35 p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`agent decides
  -> tool call
  -> no gate
  -> damage`}</pre>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[rgba(34,197,94,0.26)] bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_40%),var(--bg-secondary)] p-6">
              <div className="absolute right-6 top-6 rounded-full border border-[rgba(34,197,94,0.35)] px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--success)]">
                Relay
              </div>
              <p className="text-label mb-5 text-[var(--success)]">
                With Relay in front
              </p>
              <div className="space-y-4">
                {solutionPoints.map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[var(--radius-md)] border border-[rgba(34,197,94,0.18)] bg-black/35 p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`agent decides
  -> Relay checks
  -> blocked or allowed
  -> action continues safely`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product story */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-label mb-4">Why Relay</p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
              Without Relay, your agent calls tools directly. With Relay, every
              risky action must pass a policy gate first.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.04)] p-6">
              <p className="text-label mb-5 text-[var(--danger)]">
                Without Relay
              </p>
              <div className="space-y-4">
                {[
                  "Agent can delete repos if a tool is exposed.",
                  "Shell commands can run without a safety checkpoint.",
                  "Production deploys can happen from one bad tool call.",
                  "You only discover the problem after damage is done.",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--danger)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.05)] p-6">
              <p className="text-label mb-5 text-[var(--success)]">
                With Relay
              </p>
              <div className="space-y-4">
                {[
                  "Dangerous tool calls are blocked before execution.",
                  "Each team controls its own policy list.",
                  "Allowed and blocked calls appear in the audit log.",
                  "Works with Node, Python, LangGraph, Claude Code, and custom agents.",
                ].map((item) => (
                  <div key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated firewall */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[3fr_5fr] lg:items-center">
            <div>
              <p className="text-label mb-4">Tool-call firewall</p>
              <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
                The agent asks. Relay checks. Bad calls stop here.
              </h2>
              <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
                Relay is not another model. It is a simple runtime checkpoint:
                send the tool name and arguments, get back allowed or blocked,
                then let your agent continue safely.
              </p>
              <div className="mt-8 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`npx @relaysecurity-dev/relay-ai init

// then protect dangerous tools once`}</pre>
              </div>
            </div>

            <ToolCallFirewall />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-label mb-4">Built for real agent risk</p>
              <h2 className="max-w-2xl text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
                Protect the tools that can actually break things.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Relay is model-agnostic. Use it with OpenAI, Claude, local
              models, LangGraph, Claude Code, or any custom tool-calling agent.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map((item) => (
              <div
                key={item.title}
                className="group rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="mb-8 h-9 w-9 rounded-full border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.08)] transition-transform group-hover:scale-105" />
                <h3 className="mb-3 text-lg font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quickstart CTA */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[linear-gradient(135deg,rgba(34,197,94,0.12),transparent_45%),var(--bg-secondary)] p-6 lg:p-10">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
              <div>
                <p className="text-label mb-4">Five minute setup</p>
                <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
                  Add Relay once, then every risky tool call goes through the
                  same safety gate.
                </h2>
                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--text-secondary)]">
                  Generate starter files, create an API key, wrap dangerous
                  tools, and manage policies from the dashboard.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => navigate("/signin")}
                  >
                    Get magic link
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => navigate("/docs")}
                  >
                    Read docs
                  </Button>
                </div>
              </div>

              <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-black/45 p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-6 text-[var(--code-text)]">{`# 1. install in your agent repo
npx @relaysecurity-dev/relay-ai init

# 2. set your key
RELAY_API_KEY=relay_sk_...

# 3. block dangerous tools
github_delete_repo -> blocked`}</pre>
              </div>
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

      {/* FAQ */}
      <section className="border-b border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
          <div className="mb-10 max-w-3xl">
            <p className="text-label mb-4">FAQ</p>
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
              Questions devs and small AI teams ask before using Relay.
            </h2>
            <p className="mt-5 text-[15px] leading-7 text-[var(--text-secondary)]">
              The short version: Relay is a policy gate for risky agent tool
              calls. It is not a model, not an agent framework, and not a
              replacement for your code.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-secondary)] p-5"
              >
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {faq.question}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[var(--radius-lg)] border border-[rgba(34,197,94,0.28)] bg-[rgba(34,197,94,0.06)] p-6">
            <p className="text-label mb-3 text-[var(--success)]">
              Need help setting it up?
            </p>
            <h3 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)]">
              Contact us for free live-call integration help.
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Email{" "}
              <a
                href="mailto:aniiketvarshney@gmail.com"
                className="font-medium text-[var(--text-primary)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--text-primary)]"
              >
                aniiketvarshney@gmail.com
              </a>{" "}
              and share what agent stack you are using.
            </p>
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
