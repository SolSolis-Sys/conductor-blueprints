# Changelog — Conductor Blueprints

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
