#!/usr/bin/env node
'use strict';

/**
 * build-catalog.js — generate catalog.json from blueprints/<name>/blueprint.json
 * Usage: node scripts/build-catalog.js [--dry-run]
 * Zero external dependencies.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const BLUEPRINTS_DIR = path.join(REPO_ROOT, 'blueprints');
const CATALOG_PATH = path.join(REPO_ROOT, 'catalog.json');
const DRY_RUN = process.argv.includes('--dry-run');

let errorCount = 0;
function logError(msg) { console.error(`ERROR: ${msg}`); errorCount++; }
function logInfo(msg)  { console.log(`INFO:  ${msg}`); }

function main() {
  // Read existing catalog to preserve artefacts section
  let existingCatalog = { version: '2.0.0', artefacts: { agents: [], tools: [] } };
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      existingCatalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
    } catch (e) {
      logError(`Cannot parse existing catalog.json: ${e.message}`);
    }
  }

  // Scan blueprints/
  let entries;
  try {
    entries = fs.readdirSync(BLUEPRINTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();
  } catch (e) {
    logError(`Cannot read blueprints directory: ${e.message}`);
    process.exit(1);
  }

  const blueprints = [];
  for (const name of entries) {
    const bpPath = path.join(BLUEPRINTS_DIR, name, 'blueprint.json');
    if (!fs.existsSync(bpPath)) {
      logError(`Missing blueprint.json in blueprints/${name}/`);
      continue;
    }
    let bp;
    try {
      bp = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
    } catch (e) {
      logError(`Invalid JSON in blueprints/${name}/blueprint.json: ${e.message}`);
      continue;
    }
    if (!bp.name || !bp.version) {
      logError(`blueprints/${name}/blueprint.json missing name or version`);
      continue;
    }

    blueprints.push({
      id:          bp.id || `community/${bp.name}`,
      name:        bp.name,
      version:     bp.version,
      description: bp.description || '',
      author:      bp.author || '',
      tags:        Array.isArray(bp.tags) ? bp.tags : [],
      cost_tier:   bp.cost_profile?.tier || bp.cost_tier || '',
    });
  }

  if (errorCount > 0) {
    console.error(`\n${errorCount} error(s) found — catalog NOT updated.`);
    process.exit(1);
  }

  const catalog = {
    version:    existingCatalog.version || '2.0.0',
    artefacts:  existingCatalog.artefacts || { agents: [], tools: [] },
    blueprints,
  };

  const output = JSON.stringify(catalog, null, 2) + '\n';

  if (DRY_RUN) {
    console.log('\n--- DRY RUN OUTPUT ---\n');
    console.log(output);
    logInfo(`Dry run — ${blueprints.length} blueprint(s) found, catalog NOT written.`);
  } else {
    fs.writeFileSync(CATALOG_PATH, output, 'utf8');
    logInfo(`catalog.json updated — ${blueprints.length} blueprint(s)`);
  }
}

main();
