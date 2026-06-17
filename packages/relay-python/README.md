# Relay Python SDK

Protect risky AI agent tool calls with Relay from Python, LangGraph, and custom
agent stacks.

```python
from relaysecurity_dev import Relay

relay = Relay()

relay.assert_allowed("github_delete_repo", {"repo_name": "myrepo"})
```

Set your API key before running:

```bash
RELAY_API_KEY=relay_sk_your_key_here
```
