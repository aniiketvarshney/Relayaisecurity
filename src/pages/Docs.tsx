import { Link } from "react-router-dom";
import { API_BASE } from "../lib/api";

const executeUrl = `${API_BASE}/execute`;

const javascriptExample = `fetch("${executeUrl}", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    tool: "github_delete_repo",
    arguments: {}
  })
})`;

const curlExample = `curl -X POST ${executeUrl} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"tool":"github_delete_repo","arguments":{}}'`;

const powershellExample = `$body = @{
  tool = "github_delete_repo"
  arguments = @{}
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://relay-security-lemon.vercel.app/api/execute" `
  + `-Method Post `
  + `-ContentType "application/json" `
  + `-Headers @{ Authorization = "Bearer YOUR_API_KEY" } `
  + `-Body $body`;

const pythonExample = `import requests

def relay_execute(tool, arguments, api_key):
    response = requests.post(
        "${executeUrl}",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={"tool": tool, "arguments": arguments}
    )
    return response.json()

# Instead of directly calling github.delete_repo():
# result = relay_execute("github_delete_repo", {"repo_name": "myrepo"}, api_key)
# if result["status"] == "blocked":
#     # handle blocked`;

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-code)] bg-[var(--bg-primary)]">
      <div className="border-b border-[var(--border)] px-4 py-2.5">
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

export default function Docs() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] pt-14">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <p className="text-label mb-4">Quick start</p>

        <h1 className="text-3xl font-bold tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl">
          Protect your AI agent in 5 minutes
        </h1>

        <ol className="mt-10 space-y-8 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          <li className="flex gap-4">
            <span className="text-label mt-0.5 shrink-0">01</span>
            <div>
              <p className="text-[var(--text-primary)]">
                Sign up → get your API key from{" "}
                <Link
                  to="/settings/api-keys"
                  className="text-white underline underline-offset-2 hover:opacity-90"
                >
                  Settings
                </Link>
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="text-label mt-0.5 shrink-0">02</span>
            <div>
              <p className="text-[var(--text-primary)]">
                Create a policy (e.g., block{" "}
                <code className="rounded-[var(--radius-sm)] bg-[var(--bg-secondary)] px-1.5 py-0.5 font-mono text-[13px] text-[var(--code-text)]">
                  github_delete_repo
                </code>
                )
              </p>
              <p className="mt-1">
                Add rules in{" "}
                <Link
                  to="/policies"
                  className="text-white underline underline-offset-2 hover:opacity-90"
                >
                  Policies
                </Link>
                .
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="text-label mt-0.5 shrink-0">03</span>
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-[var(--text-primary)]">
                Replace your agent&apos;s direct tool call with:
              </p>
              <div className="space-y-4">
                <CodeBlock label="JavaScript" code={javascriptExample} />
                <CodeBlock label="curl" code={curlExample} />
                <CodeBlock label="PowerShell" code={powershellExample} />
                <CodeBlock label="Python" code={pythonExample} />
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Browser code can use <code>/api/execute</code>. PowerShell and
                other terminal tools need a full URL, because they do not share
                your browser session.
              </p>
            </div>
          </li>

          <li className="flex gap-4">
            <span className="text-label mt-0.5 shrink-0">04</span>
            <div>
              <p className="text-[var(--text-primary)]">
                That&apos;s it. Every blocked call is logged in your{" "}
                <Link
                  to="/dashboard"
                  className="text-white underline underline-offset-2 hover:opacity-90"
                >
                  dashboard
                </Link>
                .
              </p>
            </div>
          </li>
        </ol>
      </div>
    </main>
  );
}
