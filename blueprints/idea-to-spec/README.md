# Idea → Structured Feature Spec

Transform a raw idea into a structured feature specification with research, integration analysis, and validation.

**Best for:** Converting raw ideas into actionable specs ready for backlog grooming, sprint planning, or team review.

## Agents (sequential pipeline)

1. **Idea Extractor** — Clarifies the idea, extracts constraints, lists adjacent modules
2. **Spec Researcher** — Identifies related features and blockers, suggests a spec ID
3. **Cross Analyzer** — Maps integration points, flags architectural risks, estimates complexity
4. **Spec Drafter** — Produces a complete spec (DONE-WHEN, CONTEXT, ARCHITECTURE, DEPENDENCIES, OPEN QUESTIONS)
5. **Spec Validator** — Scores quality 1-10, recommends ACCEPT or ITERATE (loops up to 2 rounds)

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `idea` | ✅ | — | Raw idea or proposal |
| `project` | ✅ | — | Project or product name (e.g., `MyApp`, `AuthService`) |
| `module` | ✅ | — | Target module or area (e.g., `auth`, `notifications`) |
| `priority` | ❌ | `3` | Priority level (1=critical, 5=nice-to-have) |
| `context` | ❌ | `none specified` | Additional background or constraints |

## Output Format

```
id: SPEC-PROJECT-MODULE-NN
title: [clear title]
status: draft
priority: [1-5]
complexity: low|medium|high

DONE-WHEN:
- [measurable acceptance criterion]

CONTEXT:
[Why this matters, user value]

ARCHITECTURE:
[Key design decisions, API contracts]

DEPENDENCIES:
[Blocking items, prerequisite features]

OPEN QUESTIONS:
[Decisions to resolve before implementation]

IMPLEMENTATION NOTES:
[Suggested approach, edge cases]
```

## Cost

~$0.11/run · medium tier · ~38k tokens

## Example

```
idea: "Add email verification on signup"
project: MyApp
module: auth
priority: 2
context: "We use SendGrid for transactional email already"
```
