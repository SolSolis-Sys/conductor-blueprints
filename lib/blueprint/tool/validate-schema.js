'use strict';

/**
 * conductor://tools/validate-schema
 * Validates a blueprint.json against the required fields (name, version, agents).
 * Usage: node validate-schema.js <blueprint.json>
 * Exit: 0 if valid, 1 if invalid (prints errors to stderr).
 * Stdout: JSON { valid: true|false, errors: [...] }
 */

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('validate-schema: missing argument <blueprint.json>');
  process.exit(1);
}

let bp;
try {
  const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
  bp = JSON.parse(raw);
} catch (err) {
  if (err instanceof SyntaxError) {
    console.log(JSON.stringify({ valid: false, errors: [`JSON parse error: ${err.message}`] }));
  } else {
    console.log(JSON.stringify({ valid: false, errors: [`Cannot read file: ${err.message}`] }));
  }
  process.exit(1);
}

const errors = [];

const REQUIRED = ['name', 'version', 'agents'];
for (const field of REQUIRED) {
  if (!(field in bp)) errors.push(`Missing required field: "${field}"`);
}

if (bp.name && !/^[a-z0-9-]+$/.test(bp.name)) {
  errors.push(`"name" must be kebab-case (lowercase letters, digits, hyphens). Got: "${bp.name}"`);
}

if (bp.version && !/^\d+\.\d+\.\d+$/.test(bp.version)) {
  errors.push(`"version" must be semver (x.y.z). Got: "${bp.version}"`);
}

if (Array.isArray(bp.agents)) {
  if (bp.agents.length === 0) {
    errors.push('"agents" array must not be empty.');
  }
  bp.agents.forEach((step, i) => {
    const type = step.type || 'agent';
    if (!['agent', 'tool'].includes(type)) {
      errors.push(`agents[${i}].type must be "agent" or "tool". Got: "${type}"`);
    }
    if (type === 'agent' && !step.prompt) {
      errors.push(`agents[${i}] (role: "${step.role}"): "prompt" is required for agent steps.`);
    }
    if (type === 'tool' && !step.command) {
      errors.push(`agents[${i}] (role: "${step.role}"): "command" is required for tool steps.`);
    }
    if (step.on_failure && !['abort', 'continue', 'retry'].includes(step.on_failure)) {
      errors.push(`agents[${i}].on_failure must be "abort", "continue", or "retry".`);
    }
  });
}

if (bp.loop) {
  if (!bp.loop.exit_condition) errors.push('"loop.exit_condition" is required when "loop" is set.');
  if (bp.loop.max_rounds === undefined) errors.push('"loop.max_rounds" is required to prevent infinite loops.');
}

const result = { valid: errors.length === 0, errors };
console.log(JSON.stringify(result, null, 2));
process.exit(errors.length === 0 ? 0 : 1);
