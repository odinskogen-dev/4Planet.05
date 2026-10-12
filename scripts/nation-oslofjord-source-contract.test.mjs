import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const decisionCase = readFileSync(new URL('../src/planet/nationDecisionCase.ts', import.meta.url), 'utf8');
const publicDecisions = readFileSync(new URL('../src/planet/nationPublicDecisions.ts', import.meta.url), 'utf8');
const nationPage = readFileSync(new URL('../src/pages/nation/NationPage.tsx', import.meta.url), 'utf8');
const placeExplorer = readFileSync(new URL('../src/pages/nation/NationPlaceExplorer.tsx', import.meta.url), 'utf8');

test('Oslofjord consultation copy keeps ordinary and restricted deadlines distinct', () => {
  for (const source of [decisionCase, publicDecisions]) {
    assert.match(source, /ordinary consultation closed 15 September 2026/i);
    assert.match(source, /recipients explicitly granted an extension/i);
  }
  assert.match(publicDecisions, /restricted extension only; ordinary consultation closed/i);
  assert.match(nationPage, /15 October · restricted extension only/);
  assert.doesNotMatch(nationPage, /15 October · local and regional deadline/);
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
  assert.match(decisionCase, /nationCaseAsOf = '11 October 2026'/);
  assert.match(publicDecisions, /sourceAsOf: '11 October 2026'/);
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
