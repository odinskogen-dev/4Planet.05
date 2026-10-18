import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const decisionCase = readFileSync(new URL('../src/planet/nationDecisionCase.ts', import.meta.url), 'utf8');
const publicDecisions = readFileSync(new URL('../src/planet/nationPublicDecisions.ts', import.meta.url), 'utf8');
const nationPage = readFileSync(new URL('../src/pages/nation/NationPage.tsx', import.meta.url), 'utf8');
const placeExplorer = readFileSync(new URL('../src/pages/nation/NationPlaceExplorer.tsx', import.meta.url), 'utf8');

const loadDeadlinePhase = () => {
  const source = decisionCase.match(/export const consultationDeadlinePhase = [\s\S]*?\n};/);
  assert.ok(source, 'deadline phase classifier must remain exported');
  const executable = source[0]
    .replace('export const', 'const')
    .replace(/: string/g, '')
    .replace(/ as const/g, '');
  return Function(`${executable}; return consultationDeadlinePhase;`)();
};

test('deadline phase is deterministic before, on and after the restricted date', () => {
  const deadlinePhase = loadDeadlinePhase();
  assert.equal(deadlinePhase('2026-10-15', '2026-10-14'), 'UPCOMING');
  assert.equal(deadlinePhase('2026-10-15', '2026-10-15'), 'ENDS_TODAY');
  assert.equal(deadlinePhase('2026-10-15', '2026-10-16'), 'PASSED');
  assert.equal(deadlinePhase('15-10-2026', '2026-10-16'), 'UNKNOWN');
});

test('Oslofjord consultation copy keeps ordinary and restricted deadlines distinct', () => {
  for (const source of [decisionCase, publicDecisions]) {
    assert.match(source, /ordinary consultation closed 15 September 2026/i);
    assert.match(source, /recipients explicitly granted an extension/i);
  }
  assert.match(publicDecisions, /restricted deadline passed 15 October 2026/i);
  assert.match(nationPage, /Next official step · not established/);
  assert.match(nationPage, /Restricted deadline passed 15 October 2026/);
  assert.doesNotMatch(nationPage, /15 October · restricted extension only/);
  assert.doesNotMatch(nationPage, /UPCOMING AS OF SNAPSHOT/);
});

test('the related 2021 plan is a separate source-bound policy, not part of the 2026 case journey', () => {
  assert.match(publicDecisions, /relatedPolicies\?: RelatedPublicPolicy\[\]/);
  assert.match(publicDecisions, /id: 'GOV-NOR-OSLOFJORD-ACTION-PLAN-2021'/);
  assert.match(publicDecisions, /relationship: 'Historical policy context; not a stage in the 2026 case'/);
  assert.doesNotMatch(publicDecisions, /journey: \[\s*\{ date: '30 Mar 2021'/);
  assert.match(placeExplorer, /selected\.relatedPolicies/);
  assert.match(placeExplorer, /Separate historical context/);
});

test('the dated snapshot and official sources remain explicit', () => {
  assert.match(decisionCase, /nationCaseAsOf = '18 October 2026'/);
  assert.match(publicDecisions, /sourceAsOf: '18 October 2026'/);
  assert.match(decisionCase, /id3166019/);
  assert.match(decisionCase, /id3167967/);
});

test('place and case selection is validated, shareable and restored by browser navigation', () => {
  assert.match(placeExplorer, /new URLSearchParams\(search\)/);
  assert.match(placeExplorer, /params\.get\('place'\)/);
  assert.match(placeExplorer, /params\.get\('decision'\)/);
  assert.match(placeExplorer, /requestedDecision\.placeSlug === requestedPlace\.slug/);
  assert.match(placeExplorer, /window\.history\.pushState/);
  assert.match(placeExplorer, /window\.history\.replaceState/);
  assert.match(placeExplorer, /addEventListener\('popstate'/);
  assert.match(placeExplorer, /params\.set\('place', nextPlaceSlug\)/);
  assert.match(placeExplorer, /params\.set\('decision', nextDecisionId\)/);
});

test('blank municipality lookup is rejected instead of selecting Bergen', () => {
  assert.match(placeExplorer, /if\(!q\)\{setLookupState\('empty'\);return;\}/);
  assert.match(placeExplorer, /lookupState==='empty'/);
});

test('downstream lenses state their fixed Oslofjord scope', () => {
  assert.match(nationPage, /OSLOFJORD ONLY \/ FEATURED CASE/);
  assert.match(nationPage, /Place and case selection above does not change these lenses yet/);
});
