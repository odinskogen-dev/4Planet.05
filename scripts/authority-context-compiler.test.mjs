import test from 'node:test';
import assert from 'node:assert/strict';
import { compileAuthorityContext, selectAuthorityCandidates } from './authority-context-compiler.mjs';

const T0 = '2026-09-04T21:40:00Z';
const T1 = '2026-09-04T21:41:00Z';

function currentCandidates(now = T0, heirSha = 'heir-current') {
  return [
    { id: 'backup-pl', role: 'PROJECT_LEAD_CURRENT', title: '4PLANET BACKUP — GPT_PROJECT_LEAD_CURRENT', current: false, authority: false, revision: '999', semanticScore: 1, contentRef: 'drive:backup' },
    { id: 'legacy-pl', role: 'PROJECT_LEAD_CURRENT', title: 'GPT_PROJECT_LEAD_CURRENT.md', current: false, authority: false, revision: '998', semanticScore: 0.99, contentRef: 'drive:legacy' },
    { id: 'current-pl', role: 'PROJECT_LEAD_CURRENT', title: '01_ PROJECT LEAD CURRENT', current: true, authority: true, revision: 'CSR-CURRENT', semanticScore: 0.2, freshVerifiedAt: now, contentRef: 'drive:01', writebackPath: '01→02→Atomic→Program Log' },
    { id: 'tasks', role: 'ACTIVE_TASKS', title: '02_ ACTIVE TASKS', current: true, authority: true, revision: 'CSR-CURRENT', freshVerifiedAt: now, contentRef: 'drive:02' },
    { id: 'atomic', role: 'ATOMIC_CURRENT_STATE', title: 'Atomic Current State', current: true, authority: true, revision: 'CSR-CURRENT', freshVerifiedAt: now, contentRef: 'drive:atomic' },
    { id: 'rules', role: 'MANDATORY_OPERATING_RULES', title: 'SYSTEM — MANDATORY OPERATING RULES', current: true, authority: true, revision: 'R1', contentRef: 'drive:rules' },
    { id: 'founder', role: 'FOUNDER_DECISION', title: 'CURRENT FOUNDER DECISION', current: true, authority: true, revision: 'FD-CURRENT', contentRef: 'drive:fd' },
    { id: 'candidate', role: 'PRODUCT_AUTHORITY', title: 'PROJECT_CANDIDATE_AUTHORITY.json', current: true, authority: true, revision: heirSha, sha: heirSha, freshVerifiedAt: now, source: 'github', legalWriteTarget: 'king/test or exact registered sandbox', acceptanceGate: 'exact-head QA' },
    { id: 'live', role: 'LIVE_MANIFEST', title: 'LIVE_PROMOTION_MANIFEST.json', current: true, authority: true, revision: heirSha, sha: heirSha, freshVerifiedAt: now, source: 'github' },
    { id: 'heir', role: 'GITHUB_HEIR', title: 'king/test', current: true, authority: true, sha: heirSha, freshVerifiedAt: now, source: 'github' },
    { id: 'old-snapshot', role: 'SUPPORTING_EVIDENCE', title: 'DR SNAPSHOT 2026-08-23', current: false, authority: false, semanticScore: 0.95, contentRef: 'drive:snapshot' },
  ];
}

test('BB-01/02 know-to-ask + retrieval: high semantic stale results cannot outrank current authority', () => {
  const selected = selectAuthorityCandidates(currentCandidates()).selected;
  assert.equal(selected.find((item) => item.role === 'PROJECT_LEAD_CURRENT')?.id, 'current-pl');
});

test('BB-03 authority correctness: backup/snapshot/newer-looking revision is explicitly demoted', () => {
  const result = selectAuthorityCandidates(currentCandidates());
  assert.ok(result.demoted.some((item) => item.id === 'backup-pl'));
  assert.ok(result.demoted.some((item) => item.id === 'legacy-pl'));
  assert.ok(result.demoted.some((item) => item.id === 'old-snapshot'));
});

test('BB-04 current-vs-stale: mutable current-state facts without exact live readback fail closed', () => {
  const candidates = currentCandidates().map((item) => item.id === 'candidate' ? { ...item, freshVerifiedAt: 'older' } : item);
  const pack = compileAuthorityContext({ requestId: 'stale', candidates, compiledAt: T0 });
  assert.equal(pack.status, 'FAIL_CLOSED');
  assert.ok(pack.unknowns.some((item) => item.code === 'MUTABLE_STATE_REVALIDATION_REQUIRED' && item.role === 'PRODUCT_AUTHORITY'));
});

test('BB-05 critical omission: missing Founder Decision blocks verified pack', () => {
  const pack = compileAuthorityContext({ requestId: 'omission', candidates: currentCandidates().filter((item) => item.role !== 'FOUNDER_DECISION'), compiledAt: T0 });
  assert.equal(pack.status, 'FAIL_CLOSED');
  assert.ok(pack.unknowns.some((item) => item.role === 'FOUNDER_DECISION'));
});

test('BB-06 entity resolution: exactly one current authority is selected for each role', () => {
  const pack = compileAuthorityContext({ requestId: 'entity', candidates: currentCandidates(), compiledAt: T0 });
  assert.equal(new Set(pack.authority.map((item) => item.role)).size, pack.authority.length);
});

test('BB-07 contradiction/UNKNOWN: conflicting current authorities are surfaced rather than harmonised', () => {
  const candidates = [...currentCandidates(), { id: 'current-pl-2', role: 'PROJECT_LEAD_CURRENT', title: '01_ PROJECT LEAD CURRENT', current: true, authority: true, revision: 'CSR-CONFLICT', freshVerifiedAt: T0 }];
  const pack = compileAuthorityContext({ requestId: 'contradiction', candidates, compiledAt: T0 });
  assert.equal(pack.status, 'FAIL_CLOSED');
  assert.ok(pack.contradictions.some((item) => item.role === 'PROJECT_LEAD_CURRENT'));
});

test('BB-08 provenance/writeback: pack carries source refs plus legal write, gate and writeback route', () => {
  const pack = compileAuthorityContext({ requestId: 'provenance', candidates: currentCandidates(), compiledAt: T0 });
  assert.equal(pack.status, 'VERIFIED_CONTEXT_PACK');
  assert.equal(pack.legalWriteTarget, 'king/test or exact registered sandbox');
  assert.equal(pack.acceptanceGate, 'exact-head QA');
  assert.equal(pack.writebackPath, '01→02→Atomic→Program Log');
  assert.ok(pack.authority.every((item) => item.id && item.role));
});

test('BB-09 continuity: identical authorised inputs reconstruct identical authority state across fresh calls', () => {
  const a = compileAuthorityContext({ requestId: 'session-a', candidates: currentCandidates(), compiledAt: T0 });
  const b = compileAuthorityContext({ requestId: 'session-b', candidates: currentCandidates(), compiledAt: T0 });
  assert.deepEqual(a.authority, b.authority);
  assert.deepEqual(a.unknowns, b.unknowns);
});

test('BB-10 source isolation: compiler includes only supplied candidates and invents no authority ids', () => {
  const candidates = currentCandidates();
  const inputIds = new Set(candidates.map((item) => item.id));
  const pack = compileAuthorityContext({ requestId: 'isolation', candidates, compiledAt: T0 });
  assert.ok(pack.authority.every((item) => inputIds.has(item.id)));
  assert.ok(pack.demoted.every((item) => inputIds.has(item.id)));
});

test('BB-11 context cost + DELTA: pack reduces controlled load and stable unchanged authority drops from delta', () => {
  const baseline = compileAuthorityContext({ requestId: 'baseline', candidates: currentCandidates(), compiledAt: T0 });
  assert.equal(baseline.status, 'VERIFIED_CONTEXT_PACK');
  assert.ok(baseline.metrics.packChars < baseline.metrics.fullLoadChars, `pack=${baseline.metrics.packChars} full=${baseline.metrics.fullLoadChars}`);

  const next = compileAuthorityContext({ requestId: 'delta', candidates: currentCandidates(T1, 'heir-next'), compiledAt: T1, previousPack: baseline });
  assert.equal(next.status, 'VERIFIED_CONTEXT_PACK');
  assert.equal(next.delta.status, 'DELTA_AVAILABLE');
  assert.ok(next.delta.authority.some((item) => item.role === 'GITHUB_HEIR' && item.sha === 'heir-next'));
  assert.ok(next.delta.authority.some((item) => item.role === 'PRODUCT_AUTHORITY'));
  assert.ok(!next.delta.authority.some((item) => item.role === 'MANDATORY_OPERATING_RULES'), 'unchanged stable rules should not reload in delta');
});

test('BB-12 recovery/replay + TOCTOU: a new HEIR cannot reuse the prior pack without live recompilation', () => {
  const oldPack = compileAuthorityContext({ requestId: 'before-move', candidates: currentCandidates(T0, 'heir-old'), compiledAt: T0 });
  const staleReplay = currentCandidates(T0, 'heir-old').map((item) => ['GITHUB_HEIR', 'PRODUCT_AUTHORITY', 'LIVE_MANIFEST'].includes(item.role) ? { ...item, freshVerifiedAt: T0 } : item);
  const replayAtNewBoundary = compileAuthorityContext({ requestId: 'after-move', candidates: staleReplay, compiledAt: T1, previousPack: oldPack });
  assert.equal(replayAtNewBoundary.status, 'FAIL_CLOSED');
  assert.ok(replayAtNewBoundary.unknowns.some((item) => item.code === 'MUTABLE_STATE_REVALIDATION_REQUIRED'));
});
