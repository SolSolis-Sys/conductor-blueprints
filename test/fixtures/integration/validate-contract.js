#!/usr/bin/env node
/**
 * validate-contract.js
 * Contract test for spec-with-contracts.json
 * Exit 0 if all checks pass, exit 1 with explicit message otherwise.
 */

const path = require('path');
const fs = require('fs');

const FIXTURE_PATH = path.join(__dirname, 'spec-with-contracts.json');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

// Load fixture
let blueprint;
try {
  const raw = fs.readFileSync(FIXTURE_PATH, 'utf8');
  blueprint = JSON.parse(raw);
} catch (err) {
  fail(`Cannot load spec-with-contracts.json: ${err.message}`);
}

// Check 1 — schema_version
if (blueprint.schema_version !== '1.1.0') {
  fail(`schema_version expected "1.1.0", got "${blueprint.schema_version}"`);
}
pass('schema_version = "1.1.0"');

// Check 2 — gates[0].output_schema is a valid JSON Schema object
const gate0 = blueprint.gates && blueprint.gates[0];
if (!gate0) {
  fail('gates[0] is missing');
}
if (typeof gate0.output_schema !== 'object' || gate0.output_schema === null || Array.isArray(gate0.output_schema)) {
  fail('gates[0].output_schema is not a JSON Schema object');
}
if (gate0.output_schema.type !== 'object') {
  fail(`gates[0].output_schema.type expected "object", got "${gate0.output_schema.type}"`);
}
if (!gate0.output_schema.properties || typeof gate0.output_schema.properties !== 'object') {
  fail('gates[0].output_schema.properties is missing or not an object');
}
if (!Array.isArray(gate0.output_schema.required) || gate0.output_schema.required.length === 0) {
  fail('gates[0].output_schema.required is missing or empty');
}
pass('gates[0].output_schema is a valid JSON Schema object');

// Check 3 — gates[2].output_schema is a valid JSON Schema object
const gate2 = blueprint.gates && blueprint.gates[2];
if (!gate2) {
  fail('gates[2] is missing');
}
if (typeof gate2.output_schema !== 'object' || gate2.output_schema === null || Array.isArray(gate2.output_schema)) {
  fail('gates[2].output_schema is not a JSON Schema object');
}
if (gate2.output_schema.type !== 'object') {
  fail(`gates[2].output_schema.type expected "object", got "${gate2.output_schema.type}"`);
}
if (!gate2.output_schema.properties || typeof gate2.output_schema.properties !== 'object') {
  fail('gates[2].output_schema.properties is missing or not an object');
}
if (!Array.isArray(gate2.output_schema.required) || gate2.output_schema.required.length === 0) {
  fail('gates[2].output_schema.required is missing or empty');
}
pass('gates[2].output_schema is a valid JSON Schema object');

// Check 4 — loop.on_max_rounds in allowed values
const ALLOWED_ON_MAX_ROUNDS = ['stop', 'fail', 'warn'];
const onMaxRounds = blueprint.loop && blueprint.loop.on_max_rounds;
if (!ALLOWED_ON_MAX_ROUNDS.includes(onMaxRounds)) {
  fail(`loop.on_max_rounds expected one of ${JSON.stringify(ALLOWED_ON_MAX_ROUNDS)}, got "${onMaxRounds}"`);
}
pass(`loop.on_max_rounds = "${onMaxRounds}" (allowed)`);

console.log('\nAll contract checks passed.');
process.exit(0);
