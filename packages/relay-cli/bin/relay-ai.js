#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { cwd, env, exit } from "node:process";

const DEFAULT_ENDPOINT = "https://relay-security-lemon.vercel.app/api/execute";

const args = process.argv.slice(2);
const command = args[0];

function readFlag(name, fallback) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return args[index + 1] || fallback;
}

function hasFlag(name) {
  return args.includes(`--${name}`);
}

function detectStack(root) {
  const stacks = [];

  if (existsSync(join(root, "package.json"))) stacks.push("node");
  if (existsSync(join(root, "requirements.txt")) || existsSync(join(root, "pyproject.toml"))) {
    stacks.push("python");
  }
  if (existsSync(join(root, "pom.xml")) || existsSync(join(root, "build.gradle"))) {
    stacks.push("java");
  }

  return stacks.length ? stacks : ["custom"];
}

function writeFileIfSafe(path, content, force, dryRun) {
  if (existsSync(path) && !force) {
    return { path, status: "skipped" };
  }

  if (!dryRun) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }

  return { path, status: dryRun ? "would write" : "written" };
}

function getProjectName(root) {
  const packagePath = join(root, "package.json");
  if (!existsSync(packagePath)) return "my-agent";

  try {
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    return packageJson.name || "my-agent";
  } catch {
    return "my-agent";
  }
}

function init() {
  const root = cwd();
  const dryRun = hasFlag("dry-run");
  const force = hasFlag("force");
  const stack = readFlag("stack", detectStack(root).join(","));
  const endpoint = readFlag("endpoint", env.RELAY_ENDPOINT || DEFAULT_ENDPOINT);
  const apiKeyEnv = readFlag("api-key-env", "RELAY_API_KEY");
  const projectName = getProjectName(root);

  const config = `${JSON.stringify(
    {
      project: projectName,
      endpoint,
      apiKeyEnv,
      stacks: stack.split(",").map((item) => item.trim()).filter(Boolean),
      defaultDecision: "allow",
      protectedTools: [
        "github_delete_repo",
        "shell_rm_rf",
        "deploy_production",
        "database_drop_table",
      ],
    },
    null,
    2
  )}\n`;

  const nodeWrapper = `import { createRelay } from "@relaysecurity-dev/node";

const relay = createRelay();

export const protectedGithubDeleteRepo = relay.guardTool(
  "github_delete_repo",
  async ({ repoName }) => {
    // Call your real GitHub delete function here after Relay allows it.
    return { deleted: repoName };
  }
);
`;

  const langGraphWrapper = `import os
import requests

RELAY_ENDPOINT = os.getenv("RELAY_ENDPOINT", "${endpoint}")
RELAY_API_KEY = os.getenv("${apiKeyEnv}")

def relay_check(tool, arguments):
    response = requests.post(
        RELAY_ENDPOINT,
        headers={
            "Authorization": f"Bearer {RELAY_API_KEY}",
            "Content-Type": "application/json",
        },
        json={"tool": tool, "arguments": arguments},
        timeout=15,
    )
    response.raise_for_status()
    result = response.json()
    if result.get("status") == "blocked":
        raise RuntimeError(result.get("reason", "Blocked by Relay policy"))
    return result

def relay_guard_node(state):
    relay_check(state["tool"], state.get("arguments", {}))
    return state
`;

  const claudeCodeWrapper = `#!/usr/bin/env node
const endpoint = process.env.RELAY_ENDPOINT || "${endpoint}";
const apiKey = process.env.${apiKeyEnv};

export async function relayCheck(tool, args = {}) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${apiKey}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tool, arguments: args }),
  });

  const result = await response.json();
  if (result.status === "blocked") {
    throw new Error(result.reason || "Blocked by Relay policy");
  }
  return result;
}
`;

  const envExample = `RELAY_ENDPOINT=${endpoint}
${apiKeyEnv}=relay_sk_your_key_here
`;

  const writes = [
    writeFileIfSafe(join(root, "relay.config.json"), config, force, dryRun),
    writeFileIfSafe(join(root, "relay-examples", "node", "github-tool-wrapper.ts"), nodeWrapper, force, dryRun),
    writeFileIfSafe(join(root, "relay-examples", "langgraph", "relay_guard.py"), langGraphWrapper, force, dryRun),
    writeFileIfSafe(join(root, "relay-examples", "claude-code", "relay-guard.js"), claudeCodeWrapper, force, dryRun),
    writeFileIfSafe(join(root, ".env.relay.example"), envExample, force, dryRun),
  ];

  console.log("Relay init complete");
  console.log(`Project: ${projectName}`);
  console.log(`Stack: ${stack}`);
  console.log(`Endpoint: ${endpoint}`);
  for (const item of writes) {
    console.log(`- ${item.status}: ${item.path}`);
  }
  console.log("");
  console.log("Next steps:");
  console.log(`1. Set ${apiKeyEnv}=your Relay API key`);
  console.log("2. Wrap dangerous tools with the generated Relay examples");
  console.log("3. Manage policies from the Relay dashboard");
}

if (command === "init") {
  init();
} else {
  console.log("Relay AI CLI");
  console.log("");
  console.log("Usage:");
  console.log("  relay-ai init");
  console.log("  relay-ai init --stack node,langgraph");
  console.log("  relay-ai init --endpoint https://your-app.vercel.app/api/execute");
  exit(command ? 1 : 0);
}
