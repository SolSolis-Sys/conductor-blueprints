#!/usr/bin/env node

/**
 * Blueprint Validator — validates catalog.json and all blueprint.json files
 * Usage: node scripts/validate.js
 * Exit: 0 if all valid, 1 if errors found
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const CATALOG_PATH = path.join(REPO_ROOT, 'catalog.json');
const BLUEPRINTS_DIR = path.join(REPO_ROOT, 'blueprints');

let errorCount = 0;

function logError(message) {
  console.error(`ERROR: ${message}`);
  errorCount++;
}

function logInfo(message) {
  console.log(`INFO: ${message}`);
}

function validateJSON(filePath, content) {
  try {
    JSON.parse(content);
    return true;
  } catch (e) {
    logError(`Invalid JSON in ${filePath}: ${e.message}`);
    return false;
  }
}

function validateBlueprint(filePath, blueprint) {
  // Required fields per schema
  const required = ['name', 'version', 'agents'];

  for (const field of required) {
    if (!blueprint[field]) {
      logError(`Blueprint ${filePath} missing required field: '${field}'`);
      return false;
    }
  }

  // Validate name format (kebab-case)
  if (!/^[a-z0-9-]+$/.test(blueprint.name)) {
    logError(`Blueprint ${filePath} name '${blueprint.name}' must be kebab-case (lowercase, hyphens only)`);
    return false;
  }

  // Validate version format (semver)
  if (!/^\d+\.\d+\.\d+$/.test(blueprint.version)) {
    logError(`Blueprint ${filePath} version '${blueprint.version}' must be semver (e.g., 1.0.0)`);
    return false;
  }

  // Validate agents
  if (!Array.isArray(blueprint.agents) || blueprint.agents.length === 0) {
    logError(`Blueprint ${filePath} agents must be a non-empty array`);
    return false;
  }

  for (let i = 0; i < blueprint.agents.length; i++) {
    const agent = blueprint.agents[i];
    if (!agent.role || typeof agent.role !== 'string') {
      logError(`Blueprint ${filePath} agent[${i}] missing or invalid 'role' field`);
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(agent.role)) {
      logError(`Blueprint ${filePath} agent[${i}] role '${agent.role}' must be kebab-case`);
      return false;
    }
  }

  return true;
}

function main() {
  logInfo('Starting blueprint validation...');

  // 1. Check catalog.json exists
  if (!fs.existsSync(CATALOG_PATH)) {
    logError(`Catalog not found: ${CATALOG_PATH}`);
    process.exit(1);
  }

  const catalogContent = fs.readFileSync(CATALOG_PATH, 'utf-8');
  if (!validateJSON(CATALOG_PATH, catalogContent)) {
    process.exit(1);
  }

  const catalog = JSON.parse(catalogContent);

  if (!Array.isArray(catalog.blueprints)) {
    logError('catalog.json must have a "blueprints" array');
    process.exit(1);
  }

  logInfo(`Found ${catalog.blueprints.length} blueprints in catalog.`);

  // 2. Validate each catalog entry and corresponding blueprint file
  for (const entry of catalog.blueprints) {
    const { id, name, version } = entry;

    if (!id || !name || !version) {
      logError(`Catalog entry missing id, name, or version: ${JSON.stringify(entry)}`);
      continue;
    }

    // Infer blueprint file path: blueprints/{name}/blueprint.json
    const blueprintPath = path.join(BLUEPRINTS_DIR, name, 'blueprint.json');

    if (!fs.existsSync(blueprintPath)) {
      logError(`Blueprint file not found for catalog entry '${id}': ${blueprintPath}`);
      continue;
    }

    const blueprintContent = fs.readFileSync(blueprintPath, 'utf-8');
    if (!validateJSON(blueprintPath, blueprintContent)) {
      continue;
    }

    const blueprint = JSON.parse(blueprintContent);

    // Verify name and version match
    if (blueprint.name !== name) {
      logError(`Blueprint ${blueprintPath} name '${blueprint.name}' does not match catalog entry name '${name}'`);
    }
    if (blueprint.version !== version) {
      logError(`Blueprint ${blueprintPath} version '${blueprint.version}' does not match catalog entry version '${version}'`);
    }

    // Validate blueprint structure
    if (!validateBlueprint(blueprintPath, blueprint)) {
      continue;
    }

    logInfo(`✓ ${id} (${version})`);
  }

  // 3. Check for orphaned blueprint directories (not in catalog)
  if (fs.existsSync(BLUEPRINTS_DIR)) {
    const dirs = fs.readdirSync(BLUEPRINTS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const catalogNames = catalog.blueprints.map(b => b.name);
    const orphaned = dirs.filter(d => !catalogNames.includes(d) && !d.startsWith('.'));

    if (orphaned.length > 0) {
      logError(`Found orphaned blueprint directories (not in catalog): ${orphaned.join(', ')}`);
    }
  }

  // Exit with status
  if (errorCount === 0) {
    logInfo(`All blueprints valid. Exit 0.`);
    process.exit(0);
  } else {
    logInfo(`${errorCount} error(s) found. Exit 1.`);
    process.exit(1);
  }
}

main();
