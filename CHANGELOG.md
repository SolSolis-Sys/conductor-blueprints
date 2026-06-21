# Changelog — Conductor Blueprints

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] — 2026-06-21

### Added
- Blueprint `fetch-web` : RAG-first golden flux (6 agents : rag-checker, rag-content-scanner, rag-evaluator, fetcher, synthesizer, rag-writer). Fetch conditionnel uniquement si confiance RAG ≤ 0.8.
- 5 READMEs manquants créés : adversarial-review, brainstorming-premortem, ci-polling, deploy-verify, tdd-bug-hunter
- `LICENSE` (MIT) et `.gitignore` ajoutés à la racine
- RAG cold storage : `rag/multi-agent-orchestration-2026-06-21.md` (sources vérifiées : cc-fleet, Hermes, worktree bug v2.1.121+)

### Fixed
- `tdd-bug-hunter/blueprint.json` : `allowed_commands` était vide → bug silencieux (verifier ne pouvait pas lancer les tests). Corrigé avec liste complète npm test/pytest/cargo test/etc.
- README.md : badge blueprints-8 corrigé → blueprints-12

### Changed
- catalog.json v1.9.0 : 13 blueprints

## [0.6.0] — 2026-06-21

### Changed
- Downgrade versioning to v0.x.y scheme

## [1.5.0] — 2026-06-20

### Added
- **Deterministic tool steps** — new `type: "tool"` for blueprint `agents[]` items
  - Executes a Node.js script without invoking an LLM (zero tokens, deterministic output)
  - New fields: `command`, `timeout_ms`, `on_failure` (abort|continue), `output_var`
  - Tool scripts in `lib/blueprint/tool/`: `read-file.js`, `validate-schema.js`, `git-status.js`
- `self-skill-improvement` blueprint v1.0.0
  - First blueprint to use tool steps: `file-reader` reads SKILL.md deterministically
  - 4-agent pipeline: quality-analyzer → skill-improver → adversarial-reviewer → synthesizer
  - Verdict: `ACCEPT_IMPROVED` or `KEEP_ORIGINAL`
- `conductor-loop-improvement` blueprint v1.0.0
  - Audits and improves the loop config of any conductor blueprint
  - Surfaces infinite loop risks, unclear exit conditions, missing max_rounds
  - 3 agents: loop-auditor → loop-improver → synthesizer

### Changed
- `schemas/blueprint.v1.json` — extended `agents[]` items to support `type: "tool"` (backward-compatible)
- `catalog.json` bumped to v1.5.0 (8 blueprints)

## [1.4.0] — 2026-06-20

### Added
- `pre-push-cohesion-check` blueprint v1.0.0
  - Validates consistency across OSS repos before pushing: README, CHANGELOG, schemas, naming, scrub anti-leak

## [1.3.0] — 2026-06-20

### Added
- **Hub community site** live at https://solsolis-sys.github.io/conductor-blueprints/
  - Blueprint registry UI with FR/EN language toggle
  - Full-text search, tag filtering, and voting (localStorage-backed)
  - One-click install button: copies raw blueprint URL to clipboard
- `brainstorming-premortem` blueprint v1.0.0
  - Multi-angle ideation from N independent agents
  - Adversarial pre-mortem: surfaces risks before committing to a plan
  - Configurable agent count and risk scoring
- `deploy-verify` blueprint v1.0.0
  - Post-deploy health polling loop with configurable interval
  - Smoke test suite execution
  - Optional auto-rollback on threshold breach
- `schemas/blueprint.v1.json` — JSON Schema Draft-07 for blueprint validation
- `docs/CREATE-BLUEPRINT.md` — step-by-step contributor guide

### Fixed
- `$schema` URL in README.md example: now points to raw.githubusercontent.com (was dead domain)
- Blueprints table in README.md: now lists all 5 blueprints (was incomplete, showing 3/5)
- Badge count in README.md header: updated from 3 → 5 blueprints

### Changed
- Hub UI now displays blueprint cost tier and full tag list per entry
- Install workflow simplified: single click to copy URL

## [1.2.0] — 2026-06-20

### Added
- `brainstorming-premortem` blueprint added to catalog
- `schemas/blueprint.v1.json` JSON Schema introduced
- `CONTRIBUTING.md` guide for blueprint authors

### Changed
- Blueprint registry structure refined for catalog.json

## [1.1.0] — 2026-06-19

### Added
- `deploy-verify` blueprint added to catalog
- GitHub Pages static site generation for hub.solsolis-sys.github.io

## [1.0.0] — 2026-06-18

### Added
- Initial public release
- 3 core blueprints:
  - `tdd-bug-hunter` v1.0.0
  - `adversarial-review` v1.1.0
  - `ci-polling` v1.1.0
- `catalog.json` for blueprint registry
- `blueprint.v1.json` JSON Schema
- `README.md` with installation guide
- MIT License
