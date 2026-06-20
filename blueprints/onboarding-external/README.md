# External Contributor Onboarding Flow

## What It Does

This blueprint simulates the complete journey of an external user discovering conductor for the first time, installing a blueprint, and submitting their own. It validates that the onboarding experience is smooth, documentation is clear, and common blockers are identified early.

Useful for:
- Testing UX of conductor discovery
- Validating installation clarity
- Identifying gaps in contributor docs
- Assessing submission workflow friction
- Scoring new-contributor friendliness

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `blueprint_name` | string | Yes | Name of the blueprint being tested (e.g., `my-awesome-blueprint`) |
| `contributor_handle` | string | Yes | GitHub handle of the external contributor (e.g., `octocat`) |

## Example Run

```bash
conductor install solfoundy/onboarding-external

conductor run onboarding-external \
  --blueprint_name "custom-lint-workflow" \
  --contributor_handle "alice-dev"
```

## Tool Steps

### Step 1: env-checker (tool)
**Command**: `conductor://tools/git-status`

Captures git repo state (branch, staged files, clean status). Used to understand the environment context.

### Step 5: schema-validator (tool)
**Command**: `conductor://tools/validate-schema`

Validates the onboarding blueprint itself against the conductor schema, ensuring all required fields (name, version, agents) are present and properly formatted.

## Agents Flow

1. **env-checker** → captures git status as context
2. **discover-guide** → explains blueprints, steps, benefits, and uncovers pain points in discovery
3. **install-validator** → designs ideal install flow, identifies blockers, rates complexity
4. **submit-drilldown** → outlines submission requirements and pre-checks
5. **schema-validator** → validates this blueprint's schema
6. **onboarding-verdict** → synthesizes all findings into a final UX score and recommendation

## Cost Profile

- **Tier**: low
- **Avg tokens/run**: ~12k
- **Est. cost**: $0.04 per run
- **Agents**: 5 (4 LLM + 1 tool)

## Exit Condition

Loop terminates when `onboarding-verdict` produces a final recommendation (SMOOTH or NEEDS_IMPROVEMENT).

## Tags

`onboarding` `external` `ux` `validation` `tool` `conductor`
