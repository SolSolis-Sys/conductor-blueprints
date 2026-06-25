# Conductor Blueprints

[![CI](https://github.com/SolSolis-Sys/conductor-blueprints/actions/workflows/ci.yml/badge.svg)](https://github.com/SolSolis-Sys/conductor-blueprints/actions/workflows/ci.yml)

**Stop reinventing your agent workflows. Browse, install, and share battle-tested orchestration patterns.**

You've already solved a complex multi-agent problem — a TDD loop, a pre-push review, a deploy verifier. So has someone else. This is the place where those patterns live, ready to use in 30 seconds.

## What is a blueprint?

A blueprint is a reusable agent workflow template — similar to Claude Code's built-in `/loop`, `ultracode` dynamic workflows, or multi-agent orchestration patterns, but **packaged, versioned, and shareable**.

If you've used Claude Code's loops or ultracode workflows to automate tasks, blueprints let you extract those patterns into installable templates that work across projects and teams.

**Install a blueprint in one command:**
```bash
conductor hub install <blueprint-name>
```

## Repository Structure

- **`blueprints/<name>/`** — Full blueprint definitions (blueprint.json, README.md, tests)
- **`agents/<role>/`** — Reusable agent prompts extracted across blueprints (46 modules)
- **`tools/`** — Declarative tool manifests: `write_file`, `read_file`, `validate_schema`
- **`skills/`** — Ready for Release 3 (Skills gates integration)
- **`cookbooks/`** — Ready for Release 3 (Common workflows and patterns)
- **`schemas/blueprint.v1.1.json`** — JSON Schema for v1.1 blueprints with typed gates, if/then/else, and output_schema
- **`test/fixtures/v1.1/`** — 13 golden files validating agent→gate coercion
- **`scripts/validate-golden.js`** — CI validation: blueprint schema, golden files, deterministic tool steps
- **`catalog.json`** — Registry of all available blueprints with metadata

![Blueprints](https://img.shields.io/badge/blueprints-12-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🌐 Hub live → https://solsolis-sys.github.io/conductor-blueprints/

> ⚠️ **Alpha — work in progress. Use at your own risk.** Expect rough edges. Found a bug or have a suggestion? Please [open an issue](https://github.com/SolSolis-Sys/conductor-blueprints/issues/new)

> **Not affiliated with Anthropic.** This is an independent, unofficial tool — not a product of or endorsed by Anthropic.

---

## Browse Blueprints

**Hub live:** https://solsolis-sys.github.io/conductor-blueprints/

Categories available: `tdd` · `review` · `planning` · `ci` · `deploy` · `security` · `meta`

```bash
conductor hub list
conductor hub search tdd
conductor hub info adversarial-review
```

---

## Quick Start

Pick a blueprint, install it, run it — that's the whole flow.

```bash
conductor hub install tdd-bug-hunter
```

The blueprint lands in `~/.claude/conductor/blueprints/tdd-bug-hunter/` and is immediately available to [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor).

---

## Featured Blueprints

### `tdd-bug-hunter` — Catch bugs before they ship
Adversarial TDD loop: one agent writes the failing test, another fixes the code, a third verifies. Keeps looping until the suite goes dry. Cost: medium.

### `adversarial-review` — Code review that actually argues back
Three independent reviewers refute each other's findings. Only what survives 2-of-3 rejection gets reported. No more false positives cluttering your PR. Cost: high.

### `idea-to-spec` — Raw idea in, structured spec out
Research, integration analysis, and validation in one run. Turns a vague feature request into something your team can actually act on. Cost: medium.

### `brainstorming-premortem` — Kill bad ideas before you build them
Multi-angle ideation followed by an adversarial pre-mortem. Surfaces the fatal flaws while it's still cheap to pivot. Cost: high.

### `deploy-verify` — Know your deploy worked before you close the tab
Post-deploy health polling loop with smoke tests and optional auto-rollback. Beats checking logs manually for the fifth time. Cost: medium.

---

## Submit a Blueprint

If you built a workflow worth sharing, it belongs here.

```bash
conductor hub submit ./my-blueprint/
```

This validates your `blueprint.json` locally and opens a GitHub Issue. Maintainers review and merge accepted submissions — usually within a few days.

Prefer PRs? Drop your `blueprints/<name>/` folder directly: [open a pull request](https://github.com/SolSolis-Sys/conductor-blueprints/pulls).

**What makes a good blueprint:** a workflow you've run more than once, a clear exit condition, a realistic cost estimate. That's it.

---

## Contributing

Step-by-step guide, schema reference, and security checklist: [CONTRIBUTING.md](./CONTRIBUTING.md)

**Blueprint ideas the community would love to see:**
- Framework migration loops (JS to TS, REST to GraphQL)
- Documentation generator from code
- Dependency audit and upgrade loop
- Accessibility audit (WCAG)

---

## Related

- **[claude-conductor](https://github.com/SolSolis-Sys/claude-conductor)** — the plugin that runs these blueprints
- **[claude-token-watch](https://github.com/SolSolis-Sys/claude-token-watch)** — cost monitoring referenced by `cost_profile`

---

## Blueprint Catalog

| Name | What it does | Cost | Tags |
|------|-------------|------|------|
| `idea-to-spec` | Raw idea → structured feature spec with research and validation | medium | planning, spec |
| `tdd-bug-hunter` | Adversarial TDD loop: write failing test → fix → verify | medium | tdd, bugs |
| `adversarial-review` | 3-refuter review: finding confirmed only if 2/3 fail to disprove | high | review, quality |
| `ci-polling` | Poll CI, extract failures, auto-fix, loop until green | low | ci, automation |
| `brainstorming-premortem` | Multi-angle ideation + adversarial pre-mortem | high | brainstorming, planning |
| `deploy-verify` | Post-deploy health polling with smoke tests and optional auto-rollback | medium | deploy, devops |
| `pre-push-cohesion-check` | Cross-repo consistency check before pushing: README, CHANGELOG, schemas, anti-leak scrub | low | pre-push, security |
| `self-skill-improvement` | Reads a SKILL.md, analyzes quality, proposes improvements, adversarial review decides ACCEPT or KEEP | medium | skill, meta |

---

MIT © [SolSolis-Sys](https://github.com/SolSolis-Sys)
