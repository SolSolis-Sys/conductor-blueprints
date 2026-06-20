# conductor-blueprints

> Community library of reusable agent orchestration blueprints for [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor).

![Blueprints](https://img.shields.io/badge/blueprints-3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🌐 **Hub live** → https://solsolis-sys.github.io/conductor-blueprints/

> ⚠️ **Alpha — work in progress. Use at your own risk.** Expect rough edges. Found a bug or have a suggestion? Please [open an issue]

> **Not affiliated with Anthropic.** This is an independent, unofficial tool — not a product of or endorsed by Anthropic.

---

## Available Blueprints

| Name | Description | Cost tier | Tags |
|------|-------------|-----------|------|
| `tdd-bug-hunter` | Adversarial TDD loop: write failing test → fix → verify | medium | tdd, bugs |
| `adversarial-review` | 3-refuter review: finding confirmed only if 2/3 fail to disprove | high | review, quality |
| `ci-polling` | Poll CI status every 30s, summarize failures when done | low | ci, automation |
| `brainstorming-premortem` | Multi-angle idea generation + adversarial pre-mortem | high | brainstorming, planning, pre-mortem |
| `deploy-verify` | Post-deploy health polling loop with smoke tests and optional auto-rollback | medium | deploy, verification, devops |

## Install a blueprint

```bash
conductor hub install tdd-bug-hunter
```

The blueprint is saved to `~/.claude/conductor/blueprints/tdd-bug-hunter/`.

## Browse and search

```bash
conductor hub list
conductor hub search tdd
conductor hub info adversarial-review
```

## Blueprint schema

Each blueprint is a `blueprint.json` file with this structure:

```json
{
  "$schema": "https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/schemas/blueprint.v1.json",
  "id": "author/name",
  "name": "name",
  "version": "1.0.0",
  "title": "Human-readable title",
  "description": "What this blueprint does",
  "author": "your-github-handle",
  "license": "MIT",
  "tags": ["tag1", "tag2"],
  "inputs": [
    { "name": "target", "type": "string", "description": "...", "required": true }
  ],
  "cost_profile": { "tier": "low|medium|high", "avg_tokens_per_run": 10000, "estimated_cost_usd": 0.03 },
  "permissions": { "network": false, "filesystem": "read-only", "allowed_commands": [] },
  "agents": [
    { "role": "finder", "prompt": "Your agent prompt here with {{variables}}" }
  ],
  "loop": { "exit_condition": "...", "max_rounds": 5 }
}
```

## Related

- **[claude-conductor](https://github.com/SolSolis-Sys/claude-conductor)** — the plugin that runs these blueprints
- **[claude-token-watch](https://github.com/SolSolis-Sys/claude-token-watch)** — cost monitoring referenced by `cost_profile`

## Prompt for your AI agent

```
Please help me install a blueprint from the conductor-blueprints community library.
1. Make sure claude-conductor is installed: https://github.com/SolSolis-Sys/claude-conductor
2. Run: conductor hub install tdd-bug-hunter
3. The blueprint will be available at ~/.claude/conductor/blueprints/tdd-bug-hunter/
You can also browse available blueprints with: conductor hub list
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to submit your own loops and workflows.

---

*Built with [Claude](https://claude.ai) (Anthropic) — AI pair programming.*

## License

MIT © [SolSolis-Sys](https://github.com/SolSolis-Sys)
