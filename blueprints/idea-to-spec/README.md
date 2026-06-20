# Idea → Formal NOÛS Spec (N12 Ticket)

**Cost tier:** medium (~$0.13/run)  
**Best for:** Converting raw ideas or proposals into formal NOÛS specifications (N12 ticket format) with research, cross-module analysis, and validation.

## What it does

Orchestrates a multi-stage idea-to-spec workflow:

1. **Idea Extractor** — Clarifies the raw idea, extracts key constraints, identifies adjacent modules, and proposes KeyKey candidates
2. **Spec Researcher** — Searches related NOÛS tickets, flags blockers/in-progress work, and suggests a unique ticket ID
3. **Cross Analyzer** — Identifies convergence points with core NOÛS modules (Looper, Gates, Runner, Memory, NOS) and integrations
4. **Spec Drafter** — Produces a complete N12 ticket specification in formal NOÛS format
5. **Spec Validator** — Validates the spec against NOÛS architecture principles (coherence score, risks, ACCEPT/ITERATE recommendation)

The blueprint loops up to 2 rounds if revisions are needed, until **ACCEPT** is reached.

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `idea` | ✅ | — | Raw idea or proposal (problem statement, vision, feature concept) |
| `project` | ✅ | — | NOÛS project code (e.g., 'NOWS', 'RELAY', 'CONDUCTOR') |
| `module` | ✅ | — | Target module (e.g., 'MEMORY', 'LOOPER', 'GATES') |
| `priority` | — | 3 | Priority level (1-5, 1=critical) |
| `context` | — | none | Additional context (constraints, dependencies, background) |

## N12 Output Format

The blueprint produces a formal NOÛS specification with:

```
id: T-PROJECT-MODULE-NN        (unique ticket ID)
titre: "..."                    (clear title)
statut: draft                   (status)
priorite: 1-5                   (priority level)
projet: [PROJECT]               (project code)
assignee: ""                    (initially unassigned)
tags: [relevant tags]           (for discoverability)
keykey: [KEYKEY]                (Looper indexing key)
lien_lb: "N.NN"                (Livre Blanc chapter reference)
parent: [[T-...]]              (parent ticket if applicable)
lien_croise: [[T-...], ...]    (cross-references)

DONE-WHEN:
[2-3 measurable acceptance criteria]

CONTEXTE:
[Why this matters, business value]

ARCHITECTURE:
[Key design decisions, module interactions, data structures]

DÉPENDANCES:
[Blocking tickets, required integrations]

DÉCISIONS:
[Open questions to resolve before implementation]
```

## Example

```bash
conductor run idea-to-spec \
  --idea "Plugin conductor-memory — persistent cross-session memory with SQLite + hooks" \
  --project "NOWS" \
  --module "MEMORY" \
  --priority 2 \
  --context "Resolves inter-session amnesia, integrates with Looper triangulation, zero LLM on deterministic ops"
```

Expected output: A complete N12 ticket with ACCEPT recommendation, ready to be filed in the NOÛS registry.

## Integration with NOÛS Core Modules

This blueprint automatically analyzes convergence with:

- **Looper** (T-LOOPER-0) — Graph-based triangulation, wikilinks, KeyKey indexing
- **Gates** (T-GATES-0) — Permission model, P-GATES protocol enforcement
- **Runner** (T-RUNNER-0) — Agent dispatch, subagent threading
- **Memory** (T-MEMORY-0) — Session state, vault archiving
- **NOS** (T-NOS-0) — Spec registry, tool exposure

The output includes a `looper_profile` (KeyKey + Strate + Gravité threshold) for seamless Looper indexing.

## Common Issues

- **Researcher gets no related tickets**: NOÛS registry is still building; mock database or increase `related_tickets` array manually
- **Validator score is low (<6)**: Revisions will be suggested; loop runs again (max 2 rounds)
- **High cost**: Typical run is ~$0.13; adjust word count in prompts if needed
- **KeyKey not recognized**: Ensure proposed KeyKey follows format (e.g., `CMEM`, `LOOPER-SYNC`). Add to Looper registry if new.

## NOÛS Context

- **N12 Tickets** are the formal specification layer in NOÛS, linking to Livre Blanc chapters and cross-referenced via KeyKey
- **Looper** (Graph-1 MD/PDF + Graph-2 code) provides intelligent navigation and indexing
- **Strate 0** = infrastructure; agents can create Strate 0 tickets (blueprints, plugins, core modules)
- **KeyKey + Gravité** enables automatic discovery of related work across sessions

## See Also

- [Looper Integration Guide](../looper-integration.md) (if exists)
- [NOÛS N12 Ticket Template](../N12-TEMPLATE.md) (if exists)
- [Conductor Plugin Registry](https://github.com/SolSolis-Sys/conductor-blueprints)
