# self-skill-improvement

Reads a Claude Code `SKILL.md` file via a **deterministic tool step**, analyzes quality across 5 dimensions, proposes improvements, then an adversarial reviewer decides `ACCEPT_IMPROVED` or `KEEP_ORIGINAL`.

## What it does

1. **[tool] file-reader** — reads the SKILL.md file from disk (no LLM, deterministic)
2. **quality-analyzer** — scores the skill 1–5 on triggering, completeness, conciseness, actionability, examples
3. **skill-improver** — proposes an improved version (only runs if score < `quality_threshold`)
4. **adversarial-reviewer** — tries to refute the proposed improvements
5. **synthesizer** — final verdict: `ACCEPT_IMPROVED` or `KEEP_ORIGINAL`

## Inputs

| Name | Type | Required | Default | Description |
|---|---|---|---|---|
| `skill_path` | string | yes | — | Absolute path to the SKILL.md to improve |
| `quality_threshold` | number | no | 4 | Improvement only attempted when score < threshold |

## Example

```
conductor hub install self-skill-improvement
```

Then use in a dispatch:
```
skill_path: ~/.claude/skills/my-skill/SKILL.md
quality_threshold: 4
```

## Cost

~$0.18/run · medium tier · ~60k tokens

## Tags

`skill` · `self-improvement` · `quality` · `claude-code` · `meta`

## First blueprint to use tool steps

This blueprint demonstrates the new `type: "tool"` deterministic step. The `file-reader` step reads a file from disk without invoking an LLM — zero tokens, deterministic output. See `schemas/blueprint.v1.json` for the full specification.
