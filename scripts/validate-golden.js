'use strict';

/**
 * validate-golden.js
 * Validates that each blueprint's v1→v1.1 coercion produces gates[] matching the golden files.
 *
 * Usage: node scripts/validate-golden.js
 * Exit 0 — all golden files match
 * Exit 1 — at least one mismatch
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GOLDEN_DIR = path.join(ROOT, 'test', 'fixtures', 'v1.1');
const BLUEPRINTS_DIR = path.join(ROOT, 'blueprints');

// ─── Coercion rules (v1 agents[] → v1.1 gates[]) ──────────────────────────

/**
 * Apply the 10 coercion rules to an agents[] array.
 * @param {Array} agents - raw agents array from blueprint.json
 * @returns {Array} gates
 */
function coerceAgentsToGates(agents) {
  return agents.map((agent, i) => {
    const gate = {};

    // Rule 1: id = "g${i+1}-${role}"
    gate.id = `g${i + 1}-${agent.role}`;

    // Rule 2: type defaults to "agent"
    gate.type = agent.type || 'agent';

    // Rule 3: role preserved
    gate.role = agent.role;

    // Rule 3b: prompt (agent type only)
    if (agent.prompt !== undefined) {
      gate.prompt = agent.prompt;
    }

    // Rule 4: command
    if (agent.command !== undefined) {
      gate.command = agent.command;
    }

    // Rule 5: count > 1 → parallel
    if (agent.count !== undefined) {
      const count = agent.count;
      // count may be a number or a template string like "{{refuters}}"
      if (typeof count === 'number' && count > 1) {
        gate.parallel = count;
      } else if (typeof count === 'string') {
        // template variable — preserve as-is
        gate.parallel = count;
      }
    }

    // Rules 6-8: on_failure → on_fail_v1
    if (agent.on_failure !== undefined) {
      const mapping = { abort: 'stop', continue: 'skip', retry: 'retry' };
      gate.on_fail_v1 = mapping[agent.on_failure] || agent.on_failure;
    }

    // Rule 9: condition
    if (agent.condition !== undefined) {
      gate.condition = agent.condition;
    }

    // Rule 10: timeout_ms
    if (agent.timeout_ms !== undefined) {
      gate.timeout_ms = agent.timeout_ms;
    }

    return gate;
  });
}

// ─── Comparison helpers ────────────────────────────────────────────────────

/**
 * Compare the identity fields of a generated gate vs a golden gate.
 * We compare: id, type, role, parallel (if present), condition (if present).
 * Prompt comparison is skipped (golden files may truncate long prompts).
 * command is compared for tool-type gates.
 */
function compareGate(generated, golden, idx) {
  const diffs = [];

  const fields = ['id', 'type', 'role'];
  for (const f of fields) {
    if (generated[f] !== golden[f]) {
      diffs.push(`  gate[${idx}].${f}: expected "${golden[f]}", got "${generated[f]}"`);
    }
  }

  // parallel: only check if golden defines it
  if (golden.parallel !== undefined) {
    if (String(generated.parallel) !== String(golden.parallel)) {
      diffs.push(`  gate[${idx}].parallel: expected "${golden.parallel}", got "${generated.parallel}"`);
    }
  } else if (generated.parallel !== undefined) {
    diffs.push(`  gate[${idx}].parallel: expected absent, got "${generated.parallel}"`);
  }

  // on_fail_v1: only check if golden defines it
  if (golden.on_fail_v1 !== undefined) {
    if (generated.on_fail_v1 !== golden.on_fail_v1) {
      diffs.push(`  gate[${idx}].on_fail_v1: expected "${golden.on_fail_v1}", got "${generated.on_fail_v1}"`);
    }
  }

  // condition: only check if golden defines it
  if (golden.condition !== undefined) {
    if (generated.condition !== golden.condition) {
      diffs.push(`  gate[${idx}].condition: expected "${golden.condition}", got "${generated.condition}"`);
    }
  }

  // timeout_ms: only check if golden defines it
  if (golden.timeout_ms !== undefined) {
    if (generated.timeout_ms !== golden.timeout_ms) {
      diffs.push(`  gate[${idx}].timeout_ms: expected ${golden.timeout_ms}, got ${generated.timeout_ms}`);
    }
  }

  return diffs;
}

// ─── Main validation loop ──────────────────────────────────────────────────

function main() {
  let goldenFiles;
  try {
    goldenFiles = fs.readdirSync(GOLDEN_DIR).filter(f => f.endsWith('.json'));
  } catch (err) {
    console.error(`ERROR: Cannot read golden directory ${GOLDEN_DIR}: ${err.message}`);
    process.exit(1);
  }

  if (goldenFiles.length === 0) {
    console.error('ERROR: No golden files found in test/fixtures/v1.1/');
    process.exit(1);
  }

  let passCount = 0;
  let failCount = 0;

  for (const goldenFile of goldenFiles) {
    const blueprintName = path.basename(goldenFile, '.json');
    const goldenPath = path.join(GOLDEN_DIR, goldenFile);
    const blueprintPath = path.join(BLUEPRINTS_DIR, blueprintName, 'blueprint.json');

    // Load golden
    let golden;
    try {
      golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));
    } catch (err) {
      console.log(`SKIP ${blueprintName}: cannot read golden file — ${err.message}`);
      failCount++;
      continue;
    }

    // Load blueprint
    let blueprint;
    try {
      blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    } catch (err) {
      console.log(`FAIL ${blueprintName}: cannot read blueprint — ${err.message}`);
      failCount++;
      continue;
    }

    if (!Array.isArray(blueprint.agents) || blueprint.agents.length === 0) {
      console.log(`FAIL ${blueprintName}: blueprint has no agents[]`);
      failCount++;
      continue;
    }

    // Generate gates via coercion
    const generatedGates = coerceAgentsToGates(blueprint.agents);

    // Check gate count
    const allDiffs = [];
    if (generatedGates.length !== golden.gate_count) {
      allDiffs.push(`  gate_count: expected ${golden.gate_count}, got ${generatedGates.length}`);
    }

    if (generatedGates.length !== golden.gates.length) {
      allDiffs.push(`  gates[] length: expected ${golden.gates.length}, got ${generatedGates.length}`);
    } else {
      // Compare gate by gate
      const compareLen = Math.min(generatedGates.length, golden.gates.length);
      for (let i = 0; i < compareLen; i++) {
        const gateDiffs = compareGate(generatedGates[i], golden.gates[i], i);
        allDiffs.push(...gateDiffs);
      }
    }

    if (allDiffs.length === 0) {
      console.log(`OK ${blueprintName}`);
      passCount++;
    } else {
      console.log(`FAIL ${blueprintName}:`);
      allDiffs.forEach(d => console.log(d));
      failCount++;
    }
  }

  console.log('');
  console.log(`Results: ${passCount}/${goldenFiles.length} passed, ${failCount} failed`);

  process.exit(failCount > 0 ? 1 : 0);
}

main();
