# Spec → Production-Ready Feature Scaffold

Transforms a structured feature specification (T-*.md format) into a complete implementation scaffold with file structure, risk assessment, decomposed tasks, and ready-to-execute tickets.

**Best for:** Taking a validated spec and generating an actionable implementation plan with file structure, dependency order, and atomic tickets for parallel execution.

## Agents (sequential pipeline)

1. **Spec Reader** — Parses the spec file; extracts feature title, architecture modules, schemas, hooks, APIs, dependencies, and open questions
2. **Risk Assessor** — Evaluates P0/P1/P2/P3 risks; identifies dependency conflicts; maps hook coverage; phases implementation; scores complexity
3. **Scaffold Planner** — Designs production-ready file structure; orders files by dependency; defines core modules; sketches package.json and test structure
4. **Task Decomposer** — Breaks spec into 8-15 atomic tickets with DONE-WHEN criteria, dependencies, and estimated LLM tokens

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `spec_path` | ✅ | — | Absolute path to spec file (e.g., `D:/project/T-CONDUCTOR-MEMORY-0.md`) |
| `plugin_name` | ✅ | — | Plugin/feature name in kebab-case (e.g., `conductor-memory`) |
| `target_dir` | ✅ | — | Absolute path to target directory for scaffold (e.g., `D:/HYPERION/conductor-memory`) |
| `node_min_version` | ❌ | `18` | Minimum Node.js version (e.g., `18`, `20`) |
| `tech_stack` | ❌ | `Node.js + TypeScript` | Technology stack (e.g., `Node.js + TypeScript + SQLite`) |

## Output Format

### From Spec Reader

```json
{
  "feature_title": "Conductor Memory — Persistent Plugin State Storage",
  "feature_description": "...",
  "done_when": [
    "SQLite persistence layer functional",
    "Hook integration tests pass"
  ],
  "architecture_modules": ["schema", "hooks", "migrations", "cli"],
  "schemas": [
    {"name": "memory_entries", "fields": ["id", "plugin_id", "key", "value", "created_at"]}
  ],
  "hooks": [
    {"name": "onMemoryWrite", "trigger": "session.memory.write", "description": "..."}
  ],
  "cli_commands": [
    {"name": "memory-list", "args": "--plugin-id [id]", "description": "List memory entries"}
  ],
  "dependencies": ["sqlite3", "typescript"],
  "plugin_type": "node-plugin"
}
```

### From Risk Assessor

```json
{
  "risk_matrix": [
    {"item": "memory_entries schema", "type": "schema", "priority": "P0", "rationale": "Core data model"},
    {"item": "onMemoryWrite hook", "type": "hook", "priority": "P1", "rationale": "Integration with conductor runtime"}
  ],
  "phases": [
    {"name": "Phase 1: MVP", "items": ["schema", "migrations"], "duration_days": 3}
  ],
  "complexity_score": 6,
  "blocking_decisions": ["Choose SQLite vs PostgreSQL?"]
}
```

### From Scaffold Planner

```
conductor-memory/
├── src/
│   ├── index.ts          (entry point)
│   ├── schema.ts         (SQLite schema definitions)
│   ├── migrations/       (schema migrations)
│   ├── hooks.ts          (hook implementations)
│   └── cli.ts            (CLI commands)
├── tests/
│   ├── unit/             (schema, hook, CLI unit tests)
│   └── integration/      (end-to-end tests)
├── package.json
├── tsconfig.json
└── README.md
```

### From Task Decomposer

```json
[
  {
    "id": "T-CONDUCTOR-MEMORY-001",
    "title": "Core schema and migrations",
    "done_when": [
      "SQLite schema defined in src/schema.ts",
      "5+ unit tests for schema validation pass",
      "Migration test harness functional"
    ],
    "depends_on": [],
    "modified_files": ["src/schema.ts", "tests/unit/schema.test.ts"],
    "estimated_tokens": 2000,
    "phase": 1,
    "risk_level": "P0"
  },
  {
    "id": "T-CONDUCTOR-MEMORY-002",
    "title": "Hook implementations and handlers",
    "done_when": [
      "onMemoryWrite hook handler works end-to-end",
      "Integration test passes with conductor runtime"
    ],
    "depends_on": ["T-CONDUCTOR-MEMORY-001"],
    "modified_files": ["src/hooks.ts", "tests/integration/hooks.test.ts"],
    "estimated_tokens": 3000,
    "phase": 1,
    "risk_level": "P1"
  }
]
```

## Cost

~$0.14/run · medium tier · ~45k tokens

## Workflow

1. **User runs blueprint** with spec_path, plugin_name, target_dir
2. **Spec Reader** parses the spec file and extracts modules, schemas, hooks, APIs
3. **Risk Assessor** evaluates each item (P0/P1/P2/P3), identifies blockers, and phases work
4. **Scaffold Planner** designs the file structure and orders files by dependency
5. **Task Decomposer** breaks the spec into 8-15 atomic tickets with DONE-WHEN criteria

The output is:
- A detailed implementation plan (4 JSON objects)
- A recommended file structure (tree format)
- 8-15 atomic tickets ready for parallel execution
- An estimated complexity score (1-10) with per-module breakdown
- Risk matrix with priority flags (P0 = blocking)

## Example

```
spec_path: D:/HYPERION/specs/T-CONDUCTOR-MEMORY-0.md
plugin_name: conductor-memory
target_dir: D:/HYPERION/conductor-memory
node_min_version: 18
tech_stack: "Node.js + TypeScript + SQLite"
```

**Expected output:**
- 4 agents process the spec sequentially
- Risk matrix identifies 2 P0 items (schema, hook integration)
- Scaffold planner outputs a 5-level directory tree with 12 core files
- Task decomposer returns 11 tickets spanning 3 phases (MVP, core, polish)
- Estimated tokens per ticket: 1k–3k
- Total implementation estimate: 5–7 days of focused work

## Notes

- **Spec format** — Expects markdown files with CONTEXT, ARCHITECTURE, DEPENDENCIES, DONE-WHEN sections (T-*.md convention)
- **Tech-agnostic** — Works for Node.js, Python, Go, or any tech stack; adjust `tech_stack` input accordingly
- **Parallelization** — Task decomposer respects dependencies; agents can execute tickets in parallel where safe
- **Cold-start ready** — Each ticket includes full context; fresh agents can execute any ticket without prior context
