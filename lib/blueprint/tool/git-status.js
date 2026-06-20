'use strict';

/**
 * conductor://tools/git-status
 * Outputs a compact git status summary for the current or specified directory.
 * Usage: node git-status.js [directory]
 * Exit: 0 on success, 1 if not a git repo.
 * Stdout: JSON { branch, modified: [], untracked: [], staged: [], clean: bool }
 */

const { execSync } = require('child_process');
const path = require('path');

const dir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const opts = { cwd: dir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] };

function run(cmd) {
  try { return execSync(cmd, opts).trim(); } catch { return null; }
}

const branch = run('git rev-parse --abbrev-ref HEAD');
if (branch === null) {
  console.error(`git-status: not a git repository: ${dir}`);
  process.exit(1);
}

const statusLines = (run('git status --porcelain') || '').split('\n').filter(Boolean);
const modified = [], untracked = [], staged = [];

for (const line of statusLines) {
  const x = line[0], y = line[1], file = line.slice(3).trim();
  if (x !== ' ' && x !== '?') staged.push(file);
  if (y === 'M') modified.push(file);
  if (x === '?') untracked.push(file);
}

console.log(JSON.stringify({
  branch,
  staged,
  modified,
  untracked,
  clean: statusLines.length === 0
}, null, 2));
process.exit(0);
