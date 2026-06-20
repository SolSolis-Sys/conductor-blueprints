# Multi-Repo Cohesion Check Before Push

**Cost tier:** low (~$0.05/run)
**Best for:** Any OSS push touching one or more repos — run this before `git push` to catch leaks, missing files, and version desyncs.

---

## What it does

Runs a 4-agent pipeline that checks your repos for push-readiness:

1. **Structure audit** — verifies required OSS files exist (README, CHANGELOG, LICENSE, .gitignore)
2. **Schema validation** — compares blueprint versions against catalog entries (sync check)
3. **Scrub check** — greps for private content: hardcoded IPs, internal agent IDs, session numbers
4. **Gate decision** — aggregates findings into a single verdict: PASS_PUSH / WARN_ONLY / BLOCK_PUSH

---

## When to use

- Before any `git push` to a public OSS repository
- After adding or updating blueprints (catches catalog desyncs)
- After a refactor that touched config files (catches accidental private references)
- As a pre-PR checklist step in conductor workflows

---

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `repos` | Yes | — | Comma-separated repo names to check (e.g. `claude-relay,conductor-blueprints`) |
| `scrub_patterns` | No | `SolSolis-Sys private terms` | Extra private strings to grep for, comma-separated |

---

## Agent flow

```
repos (input)
      |
      v
+------------------+
| structure-auditor|  --> missing_files[], status
+------------------+
      |
      v
+------------------+
| schema-validator |  --> mismatches[], status
+------------------+
      |
      v
+------------------+
|  scrub-checker   |  --> leaks[], status
+------------------+
      |
      v
+------------------+
|  gate-decision   |  --> verdict: PASS_PUSH | WARN_ONLY | BLOCK_PUSH
+------------------+         reasons[], recommended_actions[]
```

Agents run in declared order. `gate-decision` reads outputs from all three upstream agents via `{{agent-role.field}}` references.

---

## Verdict rules

| Condition | Verdict |
|-----------|---------|
| Any private data leak detected | BLOCK_PUSH |
| LICENSE or README.md missing | BLOCK_PUSH |
| Catalog/blueprint version mismatch | WARN_ONLY |
| CHANGELOG.md or .gitignore missing | WARN_ONLY |
| All checks clean | PASS_PUSH |

---

## Cost estimate

4 agents x ~3,750 tokens average = ~15,000 tokens per run.
At $0.003/1k tokens: **~$0.05/run**.

---

## Example usage

```
conductor hub run pre-push-cohesion-check --repos "claude-relay,conductor-blueprints,claude-conductor"
```

With extra scrub patterns:

```
conductor hub run pre-push-cohesion-check \
  --repos "claude-relay,conductor-blueprints,claude-conductor" \
  --scrub_patterns "mycompany.internal,10.0.0.1,INTERNAL_KEY"
```

---

## Common issues

- **scrub-checker false positives on example IPs in docs**: add a comment annotation or exclude the specific file via `scrub_patterns` override
- **schema-validator shows mismatch after catalog bump**: update the blueprint `version` field to match, then re-run
- **structure-auditor flags CHANGELOG.md on new repos**: create a minimal `CHANGELOG.md` with `## Unreleased` before pushing
