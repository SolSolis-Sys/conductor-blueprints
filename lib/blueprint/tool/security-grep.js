#!/usr/bin/env node
'use strict';
/**
 * security-grep — First-pass filter for blueprint submissions.
 *
 * NOTE: This is NOT a security sandbox. Regex patterns can be bypassed
 * via base64 encoding, Unicode variants, extra whitespace, or obfuscation.
 * Use this as an early warning signal only. For runtime enforcement,
 * rely on Claude Code's `permissions.allowed_commands` allowlist.
 */
const fs = require('fs');
const path = require('path');

const blueprintPath = process.argv[2];
if (!blueprintPath) {
  console.error('Usage: security-grep.js <path/to/blueprint.json>');
  process.exit(2);
}

const DANGEROUS_PATTERNS = [
  { pattern: /`[^`]+`/, label: 'backtick-execution' },
  { pattern: /\$\([^)]+\)/, label: 'subshell-expansion' },
  { pattern: /rm\s+-rf/, label: 'rm-rf' },
  { pattern: /curl[^|]*\|[^|]*sh/, label: 'curl-pipe-sh' },
  { pattern: /wget[^|]*\|[^|]*sh/, label: 'wget-pipe-sh' },
  { pattern: /eval\s*\(/, label: 'eval-call' },
];
const DESTRUCTIVE_CMDS = ['rm', 'del', 'format', 'truncate', 'mkfs', 'fdisk', 'shred'];

let bp;
try {
  bp = JSON.parse(fs.readFileSync(path.resolve(blueprintPath), 'utf8'));
} catch (e) {
  console.log(JSON.stringify({ safe: false, findings: [{ field: 'parse', pattern: 'invalid-json', severity: 'critical' }] }));
  process.exit(1);
}

const findings = [];

// Scan agent prompts
(bp.agents || []).forEach((agent, i) => {
  if (agent.prompt) {
    DANGEROUS_PATTERNS.forEach(({ pattern, label }) => {
      if (pattern.test(agent.prompt)) {
        findings.push({ field: `agents[${i}].prompt`, pattern: label, severity: 'high' });
      }
    });
  }
});

// Scan allowed_commands
(bp.permissions?.allowed_commands || []).forEach((cmd, i) => {
  if (DESTRUCTIVE_CMDS.some(d => cmd.toLowerCase().startsWith(d))) {
    findings.push({ field: `permissions.allowed_commands[${i}]`, pattern: 'destructive-command', severity: 'critical' });
  }
});

const safe = findings.filter(f => f.severity === 'critical' || f.severity === 'high').length === 0;
console.log(JSON.stringify({ safe, findings }));
process.exit(safe ? 0 : 1);
