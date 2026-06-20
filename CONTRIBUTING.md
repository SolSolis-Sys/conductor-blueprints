# Contributing to conductor-blueprints

Thank you for sharing your agent orchestration patterns!

## How to submit a blueprint

### 1. Fork this repository

```bash
git clone https://github.com/SolSolis-Sys/conductor-blueprints
cd conductor-blueprints
```

### 2. Create your blueprint folder

```
blueprints/
└── your-name/
    ├── blueprint.json   # required
    └── README.md        # required (see docs/CREATE-BLUEPRINT.md §Step 6)
```

Use the naming format: `what-it-does` (lowercase, hyphens, no spaces).

> **New to blueprints?** Follow the complete step-by-step tutorial in [docs/CREATE-BLUEPRINT.md](docs/CREATE-BLUEPRINT.md) — it walks you through an annotated real example from scratch.

### 3. Write your blueprint.json

Use this template:

```json
{
  "$schema": "https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/schemas/blueprint.v1.json",
  "id": "your-github-handle/your-blueprint-name",
  "name": "your-blueprint-name",
  "version": "1.0.0",
  "title": "Human-readable title",
  "description": "One sentence: what does this blueprint do?",
  "author": "your-github-handle",
  "license": "MIT",
  "tags": ["relevant", "tags"],
  "inputs": [
    {
      "name": "target",
      "type": "string",
      "description": "What the user provides",
      "required": true
    }
  ],
  "cost_profile": {
    "tier": "low",
    "avg_tokens_per_run": 5000,
    "estimated_cost_usd": 0.02
  },
  "permissions": {
    "network": false,
    "filesystem": "read-only",
    "allowed_commands": []
  },
  "agents": [
    {
      "role": "agent-role",
      "prompt": "Clear instruction for this agent step. Use {{variable}} for inputs."
    }
  ],
  "loop": {
    "exit_condition": "describe when the loop stops",
    "max_rounds": 5
  }
}
```

### 4. Add your blueprint to catalog.json

```json
{
  "id": "your-github-handle/your-blueprint-name",
  "name": "your-blueprint-name",
  "description": "One sentence description",
  "author": "your-github-handle",
  "tags": ["tag1", "tag2"],
  "cost_tier": "low"
}
```

### 5. Security checklist

Before submitting a PR, verify:

- [ ] No `allowed_commands` with destructive operations (`rm`, `del`, `format`, etc.)
- [ ] No hardcoded URLs that exfiltrate data (no `curl | bash`, no external POST requests)
- [ ] `network: true` only if strictly necessary and documented
- [ ] Variables (`{{var}}`) are clearly named and documented in `inputs`
- [ ] `max_rounds` is set to prevent infinite loops
- [ ] `estimated_cost_usd` is a realistic estimate (test before submitting)

### 6. Open a Pull Request

Title format: `feat: add <name> blueprint — <one-line description>`

We review all submissions for security and quality before merging.

## Blueprint ideas we would love to see

- Framework migration loops (JS to TS, REST to GraphQL)
- Documentation generator from code
- Dependency audit and upgrade loop
- Accessibility audit (WCAG)
- Performance profiling loop
- Database schema migration validator

## Questions?

Open an issue or start a discussion in the [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor) repository.

---

*This project is built with [Claude](https://claude.ai) (Anthropic).*
