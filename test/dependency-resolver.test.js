'use strict';
const { resolveDependencies } = require('../lib/dependency-resolver');

let passed = 0, failed = 0;
function test(name, fn) { try { fn(); console.log(`✓ ${name}`); passed++; } catch(e) { console.log(`✗ ${name}: ${e.message}`); failed++; } }

const catalog = {
  agents: { 'agent-a': { id: 'agent-a', requires: ['agent-b'] }, 'agent-b': { id: 'agent-b', requires: ['agent-c'] }, 'agent-c': { id: 'agent-c' } },
  tools: { 'tool-x': { id: 'tool-x' } },
  skills: {}
};

test('Pas de requires → vide', () => {
  const r = resolveDependencies({}, catalog);
  assert(r.resolved.length === 0 && r.missing.length === 0 && r.circular.length === 0);
});

test('1 dep simple', () => {
  const r = resolveDependencies({ requires: ['tool-x'] }, catalog);
  assert(r.resolved.includes('tool-x') && r.missing.length === 0);
});

test('Chaîne A→B→C ordre topologique', () => {
  const r = resolveDependencies({ requires: ['agent-a'] }, catalog);
  const idxA = r.resolved.indexOf('agent-a');
  const idxB = r.resolved.indexOf('agent-b');
  const idxC = r.resolved.indexOf('agent-c');
  assert(idxC < idxB && idxB < idxA, 'ordre: C avant B avant A');
});

test('Cycle détecté', () => {
  const cyc = { agents: { 'x': { id:'x', requires:['y'] }, 'y': { id:'y', requires:['x'] } }, tools:{}, skills:{} };
  const r = resolveDependencies({ requires: ['x'] }, cyc);
  assert(r.circular.length > 0, 'cycle détecté');
});

test('Dep manquante → missing', () => {
  const r = resolveDependencies({ requires: ['inconnu'] }, catalog);
  assert(r.missing.includes('inconnu'));
});

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }
console.log(`\n${passed}/${passed+failed} tests passed`);
