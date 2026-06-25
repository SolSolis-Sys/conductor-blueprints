'use strict';

// CRITICAL: patterns that indicate direct prompt injection or jailbreak attempts
const CRITICAL_PATTERNS = [
  { re: /<\/system>/gi,           label: '</system>' },
  { re: /<\|im_start\|>/gi,       label: '<|im_start|>' },
  { re: /<\|im_end\|>/gi,         label: '<|im_end|>' },
  { re: /OVERRIDE\s+ALL\s+PREVIOUS/gi, label: 'OVERRIDE ALL PREVIOUS' },
];

// HIGH: path traversal, command injection
const HIGH_PATTERNS = [
  { re: /\.\.[/\\]\.\.[/\\]/g,    label: 'path traversal ../../' },
  { re: /\$\([^)]+\)/g,           label: 'command substitution $()' },
  { re: /`[^`]+`/g,               label: 'backtick command substitution' },
  { re: /;\s*rm\s+-rf/gi,         label: '; rm -rf' },
  { re: /\|\s*sh\b/gi,            label: '| sh' },
  { re: /SYSTEM:\s*OVERRIDE/gi,   label: 'SYSTEM: OVERRIDE' },
];

// MEDIUM: weaker signals, context-dependent
const MEDIUM_PATTERNS = [
  { re: /<system>/gi,             label: '<system>' },
  { re: /<INSTRUCTIONS>/gi,       label: '<INSTRUCTIONS>' },
  { re: /IGNORE\s+PREVIOUS/gi,    label: 'IGNORE PREVIOUS' },
  { re: /You\s+are\s+now\s+\w+/gi, label: 'You are now <ROLE>' },
];

/**
 * scanPrompt(text, field?, gate_id?) → { passed, findings }
 */
function scanPrompt(text, field = 'unknown', gate_id = undefined) {
  if (typeof text !== 'string') return { passed: true, findings: [] };
  const findings = [];

  for (const { re, label } of CRITICAL_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      findings.push(makeFinding('CRITICAL', field, label, m[0], gate_id));
    }
  }
  for (const { re, label } of HIGH_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      findings.push(makeFinding('HIGH', field, label, m[0], gate_id));
    }
  }
  for (const { re, label } of MEDIUM_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      findings.push(makeFinding('MEDIUM', field, label, m[0], gate_id));
    }
  }

  return { passed: findings.length === 0, findings };
}

function makeFinding(level, field, pattern, raw, gate_id) {
  const snippet = raw.length > 80 ? raw.slice(0, 77) + '...' : raw;
  const f = { level, field, pattern, snippet };
  if (gate_id !== undefined) f.gate_id = gate_id;
  return f;
}

/**
 * Walk any value recursively, collect string fields.
 * Returns array of { value, field, gate_id }
 */
function collectStrings(obj, fieldPath, gate_id, acc) {
  if (typeof obj === 'string') {
    acc.push({ value: obj, field: fieldPath, gate_id });
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      // If item is an agent/gate object, extract gate_id from its id/role field
      const childGateId = (item && typeof item === 'object')
        ? (item.id || item.role || gate_id)
        : gate_id;
      collectStrings(item, `${fieldPath}[${i}]`, childGateId, acc);
    });
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      // Skip non-content metadata keys unlikely to carry injections
      const childGateId = (key === 'id' || key === 'role')
        ? (typeof obj[key] === 'string' ? obj[key] : gate_id)
        : gate_id;
      collectStrings(obj[key], fieldPath ? `${fieldPath}.${key}` : key, childGateId, acc);
    }
  }
}

/**
 * scanBlueprint(blueprint) → { passed, findings }
 */
function scanBlueprint(blueprint) {
  const acc = [];
  collectStrings(blueprint, '', undefined, acc);

  const all = [];
  for (const { value, field, gate_id } of acc) {
    const { findings } = scanPrompt(value, field, gate_id);
    all.push(...findings);
  }

  return { passed: all.length === 0, findings: all };
}

module.exports = { scanBlueprint, scanPrompt };
