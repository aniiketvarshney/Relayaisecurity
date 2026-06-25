# Relay

> Stop AI agents before they run dangerous tool calls.

[![License](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)
[![CLI](https://img.shields.io/badge/CLI-@relaysecurity--dev%2Frelay--ai-black)](https://www.npmjs.com/package/@relaysecurity-dev/relay-ai)
[![Node SDK](https://img.shields.io/badge/Node-@relaysecurity--dev%2Fnode-black)](https://www.npmjs.com/package/@relaysecurity-dev/node)
[![Python SDK](https://img.shields.io/badge/Python-relaysecurity--dev-black)](https://pypi.org/project/relaysecurity-dev/)
[![Live Demo](https://img.shields.io/badge/Demo-Relay%20Dashboard-0f172a)](https://relay-security-lemon.vercel.app/)

![Relay blocks a malicious shell command](assets/relay-terminal-blocked.png)

## At a glance

- Protects dangerous AI agent tool calls
- CLI + Node SDK + Python SDK
- Hosted dashboard and audit logs
- Built for indie developers and small AI teams

## Contents

- [The Problem](#the-problem)
- [Quickstart](#quickstart)
- [How It Works](#how-it-works)
- [Framework Integrations](#framework-integrations)
- [Published Packages](#published-packages)
- [Project Status](#project-status)
- [Feedback](#feedback)

## The Problem

AI agents are moving from generating text to executing commands. They now have shell access, call APIs, and modify databases.

Current defenses are not enough:

- Prompt injection can trick the agent into unsafe actions.
- Permissions are too coarse if the agent already has tool access.
- Output filtering happens after the model has already decided.

Relay adds a security layer between the agent's decision and the actual execution.

## Quickstart

Install the CLI in your agent project:

```bash
npx @relaysecurity-dev/relay-ai init --yes
```

Set your API key:

```bash
export RELAY_API_KEY=relay_sk_your_key_here
```

Wrap a dangerous tool:

```js
import { createRelay } from "@relaysecurity-dev/node";

const relay = createRelay();

export const deleteRepo = relay.guardTool(
  "github_delete_repo",
  async ({ repoName }) => {
    return github.repos.delete({ repo: repoName });
  }
);
```

## How It Works

Relay acts as a security proxy between your agent and your tools.

```text
AI agent decides action -> Relay inspects request -> Tool executes if allowed
                              |
                              -> returns allowed / blocked
                                 based on your policies
```

When the agent calls a wrapped tool, Relay checks the tool name and arguments against your policies in real time. You manage the rules from the Relay dashboard, so the agent code does not need to change every time.

## Framework Integrations

The CLI generates starter files for common stacks:

- `relay-examples/node/` for Node.js and custom agents
- `relay-examples/python/` for Python agents
- `relay-examples/langgraph/` for LangGraph guard nodes
- `relay-examples/claude-code/` for Claude Code command checks

## Published Packages

- `@relaysecurity-dev/relay-ai`
- `@relaysecurity-dev/node`
- `relaysecurity-dev`

## Project Status

Relay is in early beta.

What works today:

- CLI setup
- Node SDK
- Python SDK
- Hosted dashboard and policy engine
- Audit logs
- Claude Code and LangGraph examples

What is not ready yet:

- Enterprise SSO and RBAC
- Large-scale paid infrastructure
- Compliance certifications

Relay is currently best for indie developers and small AI teams testing agent safety.

## Feedback

If you are building autonomous agents and worrying about prompt injection, I want your feedback.

- Live demo: https://relay-security-lemon.vercel.app/
- GitHub: https://github.com/aniiketvarshney/Relay-Security
- Twitter/X: https://x.com/AniketVarshne
- Email: aniiketvarshney@gmail.com

Built by developers for developers who do not want their AI agents nuking production.
