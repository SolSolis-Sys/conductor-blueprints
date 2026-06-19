# conductor-blueprints

Community library of reusable agent orchestration blueprints for [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor).

## Install a blueprint

```bash
conductor hub install tdd-bug-hunter
```

## Browse available blueprints

```bash
conductor hub list
```

## Available blueprints

| Name | Description | Tags |
|------|-------------|------|
| tdd-bug-hunter | Adversarial TDD loop for bug hunting | tdd, bugs |
| adversarial-review | Multi-refuter code review | review, quality |
| ci-polling | CI status polling and failure analysis | ci, automation |

## Contributing

Submit a PR with your `blueprints/<name>/blueprint.json` and add an entry to `catalog.json`.

Copyright © 2026 SolSolis-Sys — MIT License
