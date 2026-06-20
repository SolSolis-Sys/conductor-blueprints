#!/usr/bin/env node
'use strict';
const { execFileSync } = require('child_process');

let raw;
try {
  raw = execFileSync('gh', [
    'issue', 'list',
    '--repo', 'SolSolis-Sys/conductor-blueprints',
    '--label', 'submission',
    '--state', 'open',
    '--json', 'number,title,body,url',
    '--limit', '20'
  ], { encoding: 'utf8' });
} catch (e) {
  console.log(JSON.stringify({ submissions: [], error: e.message }));
  process.exit(0);
}

let issues;
try {
  issues = JSON.parse(raw);
} catch (e) {
  console.log(JSON.stringify({ submissions: [], error: 'Invalid JSON from gh CLI' }));
  process.exit(0);
}

const submissions = issues.map(issue => {
  let blueprint = null;
  const match = issue.body && issue.body.match(/```json\s*([\s\S]*?)```/);
  if (match) {
    try { blueprint = JSON.parse(match[1]); } catch {}
  }
  return { issue_number: issue.number, title: issue.title, url: issue.url, blueprint };
}).filter(s => s.blueprint !== null);

console.log(JSON.stringify({ submissions }));
process.exit(0);
