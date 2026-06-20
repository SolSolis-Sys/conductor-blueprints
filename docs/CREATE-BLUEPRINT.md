# Create Your First Blueprint — A-Z Guide

A blueprint is a reusable multi-agent workflow for [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor). This guide takes you from zero to a working blueprint in under 15 minutes.

---

## Prerequisites

- [claude-conductor](https://github.com/SolSolis-Sys/claude-conductor) installed (`claude plugin install claude-conductor`)
- A text editor with JSON Schema support (VS Code recommended)

### VS Code Setup (2 min)

Add to your `.vscode/settings.json` for inline validation and autocomplete:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/blueprints/**/blueprint.json"],
      "url": "https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/schemas/blueprint.v1.json"
    }
  ]
}
```

---

## Step 1 — Define your loop (5 min)

Before writing JSON, answer these 4 questions:

| Question | Example answer |
|----------|---------------|
| What is the agent accomplishing? | Brainstorm ideas, then stress-test them |
| How does it verify success? | A synthesizer agent produces a READY/STOP verdict |
| What does each step need from the previous one? | Ideators → pre-mortem analysts → synthesizer |
| When does it stop? | After synthesizer outputs a verdict (max 1 round) |

---

## Step 2 — Create the folder structure

```bash
blueprints/
└── brainstorming-premortem/   ← your-blueprint-name (kebab-case)
    ├── blueprint.json          ← required
    └── README.md               ← required (see Step 6)
```

---

## Step 3 — Write blueprint.json

Here is a complete, annotated example using `brainstorming-premortem`:

```json
{
  "$schema": "https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/schemas/blueprint.v1.json",

  "id": "solsolis/brainstorming-premortem",   // github-handle/name
  "name": "brainstorming-premortem",           // kebab-case, unique
  "version": "1.0.0",                          // semver
  "title": "Brainstorming + Pre-mortem Analysis",
  "description": "Multi-angle ideation then adversarial pre-mortem before committing to a plan.",
  "author": "SolSolis-Sys",
  "license": "MIT",
  "tags": ["brainstorming", "planning", "pre-mortem", "risk-analysis"],

  // --- INPUTS: what the user provides ---
  "inputs": [
    {
      "name": "topic",
      "type": "string",
      "description": "The plan, idea, or decision to analyze",
      "required": true
    },
    {
      "name": "constraints",
      "type": "string",
      "description": "Known constraints (time, budget, team)",
      "default": "none specified"   // default = not required
    },
    {
      "name": "premortem_analyst_count",
      "type": "number",
      "description": "Parallel pre-mortem analysts (one per failure category)",
      "default": 5
    }
  ],

  // --- COST PROFILE: honest estimate ---
  // Formula: agents_count × avg_tokens_per_agent × $0.003/1k
  "cost_profile": {
    "tier": "medium",
    "avg_tokens_per_run": 55000,
    "estimated_cost_usd": 0.17
  },

  // --- PERMISSIONS: minimum required ---
  "permissions": {
    "network": false,
    "filesystem": "none",       // use "read-only" or "read-write" only if needed
    "allowed_commands": []      // never add destructive commands
  },

  // --- AGENTS: the workflow steps ---
  // Variables: {{input_name}} for inputs, {{agent-role.field}} for previous agent outputs
  "agents": [
    {
      "role": "ideator-nominal",   // role names: kebab-case
      "prompt": "Brainstorm for: {{topic}}\nConstraints: {{constraints}}\nAngle: NOMINAL — the obvious, natural approach. Generate 3-5 ideas.\nReturn JSON: { \"angle\": \"nominal\", \"ideas\": [{\"title\": \"\", \"description\": \"\", \"key_assumption\": \"\"}] }"
    },
    {
      "role": "ideator-alternative",
      "prompt": "Brainstorm for: {{topic}}\nConstraints: {{constraints}}\nAngle: ALTERNATIVE — the opposite approach. What if you did the reverse?\nReturn JSON: { \"angle\": \"alternative\", \"ideas\": [{\"title\": \"\", \"description\": \"\", \"key_assumption\": \"\"}] }"
    },
    {
      "role": "premortem-analyst",
      "count": "{{premortem_analyst_count}}",   // parallel instances
      // NOTE: each instance receives its index (0-N). Use it to assign categories.
      "prompt": "Pre-mortem for: {{topic}}\nYour failure category (by index 0-4): technical | user | platform | dependencies | scope\nAssume it is 6 months from now and the plan failed. What went wrong from your category's perspective?\nReturn JSON: { \"category\": \"\", \"risks\": [{\"description\": \"\", \"probability\": \"high|medium|low\", \"impact\": \"critical|moderate|minor\", \"mitigation\": \"\"}] }"
    },
    {
      "role": "synthesizer",
      // Reference previous agent outputs: {{agent-role.field}}
      "prompt": "Synthesize for: {{topic}}\nIdeas: {{ideator-nominal.ideas}}, {{ideator-alternative.ideas}}\nRisks: {{premortem-analyst.risks}}\nProduce: top_ideas (2-3), critical_risks (top 3 + mitigations), unknowns, success_criterion (1 measurable), mvp_if_halved, verdict: READY_TO_PLAN | NEEDS_INVESTIGATION | STOP, verdict_reason (1 sentence)"
    }
  ],

  // --- LOOP: when to stop ---
  "loop": {
    "exit_condition": "synthesizer produced verdict",
    "max_rounds": 1   // always set this — prevents infinite loops
  }
}
```

### Variables reference

| Syntax | When to use | Example |
|--------|-------------|---------|
| `{{input_name}}` | User-provided inputs | `{{topic}}`, `{{max_rounds}}` |
| `{{agent-role.field}}` | Output from a previous agent | `{{finder.issues}}`, `{{premortem-analyst.risks}}` |

> **Important**: `{{agent-role.field}}` requires conductor v1.0.5+. Add `"requires_conductor": ">=1.0.5"` as a comment if your blueprint uses inter-agent variables.

---

## Step 4 — Validate locally

```bash
# Install ajv-cli if needed
npm install -g ajv-cli

# Validate your blueprint
ajv validate \
  -s schemas/blueprint.v1.json \
  -d blueprints/brainstorming-premortem/blueprint.json
```

Expected output: `blueprints/brainstorming-premortem/blueprint.json valid`

> **Note**: `hub.js` only enforces `name`, `version`, and `agents` at install time. The schema provides IDE support and contributor guidance — run `ajv validate` before submitting a PR.

---

## Step 5 — Add to catalog.json

Open `catalog.json` and add your entry to the `blueprints` array:

```json
{
  "id": "solsolis/brainstorming-premortem",
  "name": "brainstorming-premortem",
  "version": "1.0.0",
  "description": "Multi-angle ideation then adversarial pre-mortem before committing to a plan.",
  "author": "SolSolis-Sys",
  "tags": ["brainstorming", "planning", "pre-mortem", "risk-analysis"],
  "cost_tier": "medium"
}
```

Also bump the catalog `version` (patch increment: `1.1.0 → 1.2.0`).

---

## Step 6 — Write README.md (required)

Every blueprint must have a `README.md`. Minimum template:

```markdown
# Brainstorming + Pre-mortem Analysis

**Cost tier:** medium (~$0.17/run)
**Best for:** Planning sessions before committing to a project or feature.

## What it does

Runs 4 parallel ideators (nominal, alternative, constrained, future-regret angles),
then N parallel pre-mortem analysts, then a synthesizer that outputs a verdict.

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `topic` | ✅ | — | Plan or idea to analyze |
| `constraints` | — | none | Time, budget, team constraints |
| `premortem_analyst_count` | — | 5 | Parallel analysts |

## Example

```
conductor run brainstorming-premortem \
  --topic "Rewrite our auth service in Rust" \
  --constraints "2 weeks, 1 engineer"
```

## Common issues

- **Synthesizer gets no ideator output**: ensure conductor v1.0.5+ is installed
- **High cost**: reduce `premortem_analyst_count` to 3
```

---

## Step 7 — Security checklist before PR

- [ ] No `allowed_commands` with destructive operations (`rm`, `del`, `format`)
- [ ] No hardcoded URLs that POST data to external services
- [ ] `network: true` only if documented and strictly necessary
- [ ] All `{{variables}}` declared in `inputs` or from a named agent role
- [ ] `max_rounds` is set (not unbounded)
- [ ] `estimated_cost_usd` is realistic (run once and measure)
- [ ] README.md exists and has a working example

---

## Step 8 — Open a Pull Request

Title format: `feat: add <name> blueprint — <one-line description>`

Example: `feat: add brainstorming-premortem blueprint — multi-angle ideation + adversarial pre-mortem`

---

## Common patterns

| Pattern | Roles | Use when |
|---------|-------|----------|
| Finder → Verifier loop | finder + fixer + verifier | Bug hunting, CI repair |
| Parallel analysts | analyst ×N + synthesizer | Review, risk analysis |
| Single-pass pipeline | step-1 → step-2 → step-3 | Code generation, docs |
| Tournament | proposer ×N + judge | Design decisions |

See existing blueprints in `blueprints/` for working examples.
