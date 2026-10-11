import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const decisionCase = readFileSync(new URL('../src/planet/nationDecisionCase.ts', import.meta.url), 'utf8');
const publicDecisions = readFileSync(new URL('../src/planet/nationPublicDecisions.ts', import.meta.url), 'utf8');
const nationPage = readFileSync(new URL('../src/pages/nation/NationPage.tsx', import.meta.url), 'utf8');

test('Oslofjord consultation copy keeps ordinary and restricted deadlines distinct', () => {
  for (const source of [decisionCase, publicDecisions]) {
    assert.match(source, /ordinary consultation closed 15 September 2026/i);
    assert.match(source, /recipients explicitly granted an extension/i);
  }
  assert.match(publicDecisions, /restricted extension only; ordinary consultation closed/i);
  assert.match(nationPage, /15 October · restricted extension only/);
  assert.doesNotMatch(nationPage, /15 October · local and regional deadline/);
});

test('the related 2021 plan is not a decided stage in the 2026 case journey', () => {
  assert.match(publicDecisions, /Related 2021 Oslofjord action plan published \(separate policy record\)/);
  assert.doesNotMatch(publicDecisions, /date: '30 Mar 2021', stage: 'DECIDED'/);
});

test('the dated snapshot and official sources remain explicit', () => {
  assert.match(decisionCase, /nationCaseAsOf = '11 October 2026'/);
  assert.match(publicDecisions, /sourceAsOf: '11 October 2026'/);
  assert.match(decisionCase, /id3166019/);
  assert.match(decisionCase, /id3167967/);
});
