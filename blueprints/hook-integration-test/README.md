# Hook Integration Test — Implement & Test New Claude Code Hook

Generic workflow to implement, register, test, and document a new Claude Code hook in any plugin. Covers exploration of existing hooks, design, implementation, registration, unit testing, and documentation.

**Best for:** Adding a new hook to an existing Claude Code plugin, from design through testing and documentation.

## Agents (sequential pipeline)

1. **Hook Explorer** — Explore plugin structure, understand existing hooks, identify registration method
2. **Hook Designer** — Define hook specification (event, output format, inputs, error handling)
3. **Hook Implementer** — Write the hook script with error handling and validation
4. **Hook Registrar** — Register hook in hooks.json or plugin configuration
5. **Hook Tester** — Design unit tests and manual verification steps
6. **Hook Documenter** — Update or create README with hook documentation

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `plugin_name` | ✅ | — | Plugin name in kebab-case (e.g., `conductor-memory`) |
| `plugin_path` | ✅ | — | Absolute path to plugin root (e.g., `D:/HYPERION/conductor-memory`) |
| `hook_event` | ✅ | — | Hook event type (e.g., `session.open`, `file.save`, `command.execute`) |
| `output_type` | ✅ | — | Hook output: `systemMessage` (display to user) or `silent` (write data only) |
| `data_path` | ❌ | — | Path to write data if `output_type` is `silent` (e.g., `~/.claude/hooks/plugin-name/data.json`) |
| `description` | ❌ | — | Brief hook description for documentation |

## Workflow

1. **User runs blueprint** with plugin name, path, and hook specification
2. **Hook Explorer** reads plugin.json, checks for existing hooks.json, catalogs hook patterns
3. **Hook Designer** defines hook name, event trigger, output format, error handling
4. **Hook Implementer** writes Node.js/TypeScript hook script with error handling
5. **Hook Registrar** adds hook entry to hooks.json or plugin configuration
6. **Hook Tester** creates unit tests and manual verification steps
7. **Hook Documenter** updates README with hook documentation and settings.json example

Output:
- Hook implementation script (ready to integrate)
- Hook registration entry (JSON or code snippet)
- Unit test suite with done-when criteria
- Updated/new README with hook documentation
- Example settings.json configuration for end users

## Example Scenarios

### Scenario 1: Calendar Plugin Hook

Track when a new session opens to log calendar events.

```
plugin_name: conductor-memory
plugin_path: D:/HYPERION/conductor-memory
hook_event: session.open
output_type: systemMessage
description: Log session open event and display summary
```

**Expected Output:**
1. Hook Explorer identifies hooks.json exists, catalogs 2 existing hooks
2. Hook Designer specifies hook name as `on-session-open`, defines output message format
3. Hook Implementer writes `src/hooks/on-session-open.js` with session metadata extraction
4. Hook Registrar adds entry to hooks.json with event type and output format
5. Hook Tester creates `tests/hooks/on-session-open.test.ts` with 5 test cases
6. Hook Documenter updates README with hook configuration and example

### Scenario 2: Silent Data Collection

Collect metrics without displaying output to user.

```
plugin_name: token-watch
plugin_path: D:/HYPERION/token-watch
hook_event: command.execute
output_type: silent
data_path: ~/.claude/hooks/token-watch/command-metrics.json
description: Collect command execution metrics silently
```

**Expected Output:**
1. Hook Explorer identifies command execution patterns in existing hooks
2. Hook Designer defines silent JSON output schema for metrics
3. Hook Implementer writes script to append metrics to data_path JSON file
4. Hook Registrar registers in hooks.json with silent output type
5. Hook Tester creates tests for JSON schema validation and file I/O
6. Hook Documenter includes data schema and query examples in README

## Output Formats

### From Hook Explorer

```json
{
  "plugin_metadata": {
    "name": "conductor-memory",
    "version": "0.1.0",
    "description": "Persistent state storage for conductor"
  },
  "existing_hooks": [
    {
      "name": "onMemoryWrite",
      "event": "session.memory.write",
      "output_type": "silent",
      "file": "src/hooks/on-memory-write.js"
    }
  ],
  "has_hooks_json": true,
  "hook_registration_method": "hooks.json",
  "hook_dependencies": ["fs", "path"]
}
```

### From Hook Designer

```json
{
  "hook_name": "on-session-open",
  "event_trigger": "session.open",
  "output_format": {
    "type": "systemMessage",
    "schema": {
      "message": "string",
      "session_id": "string",
      "timestamp": "ISO8601"
    }
  },
  "required_inputs": ["sessionId", "workspace"],
  "error_handling": "silent",
  "throttle_ms": 0,
  "security_notes": ["Validate session ID format"]
}
```

### From Hook Implementer

```json
{
  "file_path": "src/hooks/on-session-open.js",
  "script_content": "const fs = require('fs');...",
  "dependencies_needed": [],
  "notes": ["No external dependencies required"]
}
```

### From Hook Registrar

```json
{
  "registration_entry": {
    "name": "on-session-open",
    "event": "session.open",
    "handler": "src/hooks/on-session-open.js",
    "output_type": "systemMessage"
  },
  "target_file": "hooks.json",
  "validation_status": "valid",
  "changes_needed": [
    {
      "file": "hooks.json",
      "action": "update",
      "content": "[...existing hooks..., {hook registration entry}]"
    }
  ]
}
```

### From Hook Tester

```json
{
  "test_file_path": "tests/hooks/on-session-open.test.ts",
  "test_code": "describe('on-session-open hook', () => {...})",
  "manual_verification_steps": [
    {
      "step": 1,
      "description": "Add hook to settings.json",
      "expected_result": "Claude Code recognizes hook in config"
    },
    {
      "step": 2,
      "description": "Open a new session",
      "expected_result": "System message appears with session info"
    }
  ],
  "run_command": "npm test -- on-session-open",
  "done_when_criteria": [
    "All unit tests pass",
    "Manual verification succeeds",
    "No console errors in Claude Code logs"
  ]
}
```

### From Hook Documenter

```json
{
  "readme_exists": true,
  "hook_docs_section": "## Hooks\n\n### on-session-open\n...",
  "example_settings_json": {
    "hooks": {
      "session.open": {
        "enabled": true,
        "handler": "src/hooks/on-session-open.js"
      }
    }
  },
  "files_to_create_or_update": [
    {
      "file": "README.md",
      "action": "update",
      "content": "..."
    }
  ]
}
```

## Cost

~$0.06/run · low tier · ~18k tokens

## Key Features

- **Generic** — Works with any Claude Code plugin (conductor, token-watch, etc.)
- **Registration-aware** — Detects and uses existing hook registration method (hooks.json or programmatic)
- **Complete workflow** — From exploration through testing and documentation
- **Test-first** — Includes unit tests and manual verification procedures
- **Error handling** — Focuses on robust error handling and input validation
- **Documentation** — Auto-generates README sections and settings.json examples

## Notes

- **Node.js only** — Hook implementations use Node.js stdlib (no external dependencies)
- **Security** — Each hook design includes security review (input validation, file access)
- **Registration flexibility** — Supports both hooks.json and programmatic registration patterns
- **Testability** — All hooks are designed with unit testability in mind
- **Staging** — Output from each agent feeds into the next (sequential pipeline)
- **Cold-start** — Each agent output is self-contained; agents can be re-run independently if needed

## Integration with Claude Code

After the blueprint completes:

1. Copy hook implementation script to plugin source
2. Update hooks.json with registration entry
3. Run `npm test` to verify unit tests pass
4. Add hook to personal settings.json to enable for local testing
5. Restart Claude Code to load the new hook
6. Run manual verification steps
7. Commit hook implementation and documentation

## Example: Calendar Plugin (Real-world)

The **Calendar plugin** (referenced in project specs) uses this blueprint to integrate session hooks:

```
plugin_name: plugin-calendar
plugin_path: D:/HYPERION/plugin-calendar
hook_event: session.open
output_type: systemMessage
description: Log session open and display calendar summary
```

**Typical output:**
- `src/hooks/on-session-open.js` — Fetches calendar summary, formats message
- `hooks.json` entry — Registers with `session.open` trigger
- `tests/hooks/on-session-open.test.ts` — 6 test cases (success, no calendar, API error, etc.)
- Updated `README.md` — Documents hook, shows settings.json config
- Manual steps — Add hook to settings.json, open session, verify message appears
