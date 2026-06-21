# Documentation Sync Pipeline

**Cost tier:** low (~$0.08/run)  
**Best for:** Automated documentation updates after releases.

## What it does

Automates the tedious task of updating documentation after a release:

1. **Changelog Extractor** — Reads git log since last release, extracts conventional commits (feat/fix/refactor/etc), structures them by category
2. **README Syncer** — Updates version badges, "What's New" section, and adds changelog links
3. **Roadmap Updater** — Marks delivered features as complete (✓), proposes next steps from open GitHub issues

All three steps run sequentially in a single pass. Perfect for CI/CD pipelines or manual release workflows.

## Inputs

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `repo_url` | ✅ | — | GitHub repo URL (e.g., `https://github.com/owner/repo`) |
| `current_version` | ✅ | — | New version being released (e.g., `1.2.0`) |
| `previous_tag` | — | `auto` | Previous release tag (e.g., `v1.1.0`). Auto-detect if omitted. |

## Example

```bash
conductor run docs-sync \
  --repo_url "https://github.com/SolSolis-Sys/token-watch" \
  --current_version "0.3.6"
```

Or with explicit previous tag:

```bash
conductor run docs-sync \
  --repo_url "https://github.com/SolSolis-Sys/conductor" \
  --current_version "1.1.0" \
  --previous_tag "v1.0.7"
```

## Agent flow

```
changelog-extractor (tool) → git log parsing
         ↓
changelog-analyzer → categorize features/fixes/refactors
         ↓
readme-updater → update version, "What's New", links
         ↓
roadmap-syncer → mark complete, propose next steps
```

## Output

Each agent returns JSON with:
- **changelog-analyzer**: `{ features[], fixes[], refactors[], summary }`
- **readme-updater**: `{ sections_updated[], changes_summary, file_content }`
- **roadmap-syncer**: `{ completed_items[], next_items[], roadmap_content, has_roadmap_file }`

Output can be reviewed before committing to the repo.

## Common issues

- **Git log returns nothing**: ensure `previous_tag` is valid and points to an actual release. Use `git tag -l` to list available tags.
- **README structure not preserved**: the updater respects existing sections and only modifies version-related areas.
- **Roadmap sync fails**: the blueprint gracefully handles repos without a roadmap file and updates the README roadmap section instead.
- **High token usage**: simplify git log filtering or reduce commit verbosity. Default ~25k tokens per run.

## Permissions

- **network: true** — fetches GitHub issues for roadmap suggestions (optional, can be disabled)
- **filesystem: read-write** — reads existing docs and prepares updates (does NOT auto-commit)
- **allowed_commands**: `git`, `curl`, `grep` — safe, read-only operations

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
on:
  release:
    types: [published]

jobs:
  sync-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Sync docs
        run: |
          conductor run docs-sync \
            --repo_url "${{ github.server_url }}/${{ github.repository }}" \
            --current_version "${{ github.event.release.tag_name }}"
```

After the blueprint completes, review the outputs and commit the changes:

```bash
git add CHANGELOG.md README.md roadmap.md
git commit -m "docs: sync for v1.2.0"
git push
```

## Pre-flight checklist

- [ ] Repository has conventional commit history (feat:/fix:/etc)
- [ ] At least one release tag exists (e.g., `v1.0.0`)
- [ ] README.md and CHANGELOG.md exist (or will be created)
- [ ] GitHub issues are labeled for roadmap categorization (optional)
