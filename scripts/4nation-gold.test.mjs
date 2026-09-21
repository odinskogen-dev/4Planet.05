import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../'+path,import.meta.url),'utf8');
const source = read('src/planet/nationDecisionCase.ts');
const page = read('src/pages/nation/NationPage.tsx');
const app = read('src/App.tsx');
const router = read('src/routes/router.tsx');

test('4NATION source projection is explicit, dated and linked to existing PLACE', () => {
  assert.match(source,/nationCaseAsOf = '21 September 2026'/);
  assert.match(source,/PLACES\.find\(\(place\) => place\.id === placeId\('oslofjord'\)\)/);
  assert.match(source,/GOV-NOR-OSLOFJORD-PLAN-2026-HEARING/);
  assert.match(source,/id3166019/);
  assert.match(source,/id3167967/);
  assert.match(source,/MDE-2026-GRANTS/);
});
test('political state and deadline are not promoted to enacted law', () => {
  assert.match(source,/status: 'UNDER CONSIDERATION'/);
  assert.match(source,/Ordinary consultation closed 15 September 2026/);
  assert.match(source,/15 October 2026/);
  assert.doesNotMatch(source,/status: 'ADOPTED'|status: 'ENACTED'/);
  assert.match(page,/Proposal, not an adopted plan/);
});
test('two user journeys share exactly one case with six integrated lenses', () => {
  assert.match(page,/type Audience = 'people' \| 'institutions'/);
  assert.match(page,/nationDecision\.timeline\.map/);
  for(const label of ['decisions','atlas','brain','solutions','economy','outcomes']) assert.match(page,new RegExp("key: '"+label+"'"));
  assert.match(page,/setAudience\('people'\)/);
  assert.match(page,/setAudience\('institutions'\)/);
});
test('source drawer and factual safety states are represented', () => {
  assert.match(page,/nationSources\.map/);
  assert.match(page,/NOT A NATIONAL FEED/);
  assert.match(page,/does not claim live conversational PLANETBRAIN/);
  assert.match(page,/Not established/);
  assert.match(page,/not an official government service/);
});
test('4nation host is isolated, and other public products retain routes', () => {
  assert.match(app,/host === "4nation\.org" \|\| host === "www\.4nation\.org"/);
  assert.match(app,/if \(isNationHost\(\)\)/);
  assert.match(app,/if \(isFourBrandsHost\(\)/);
  assert.match(app,/if \(isPartnersHost\(\)/);
  assert.match(router,/path="\/4nation\/\*"/);
});
