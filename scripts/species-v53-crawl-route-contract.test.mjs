import test from 'node:test';
import assert from 'node:assert/strict';

// Run with node --test scripts/species-v53-crawl-route-contract.test.mjs
// Read-only Worker control route checks; never deploy or submit URLs.
const { default: worker } = await import('../ops/discovery/4species-router.js');
const base = 'https://4species.com';
const local = (path, method='GET') => worker.fetch(new Request(base+path, {method}));

test('robots advertises a canonical 4SPECIES sitemap', async () => {
  const response = await local('/robots.txt');
  assert.equal(response.status, 200);
  const body = await response.text();
  assert.match(body, /User-agent: \*/);
  assert.match(body, /Sitemap: https:\/\/4species\.com\/sitemap\.xml/);
  assert.ok(body.includes('\n'), 'robots uses actual line breaks');
  assert.ok(!body.includes(String.raw`\n`), 'robots must not expose escaped newline literals');
});
test('sitemap only contains approved general v53 routes', async () => {
  const response = await local('/sitemap.xml');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type')||'', /application\/xml/);
  const body = await response.text();
  for (const slug of ['','explore','quiz','about']) {
    assert.ok(body.includes(`<loc>https://4species.com/${slug}</loc>`));
  }
  for (const unreviewed of ['lion','tiger','orca','african-savanna-elephant']) {
    assert.ok(!body.includes(`<loc>https://4species.com/${unreviewed}</loc>`));
  }
  assert.ok(!body.includes(String.raw`\n`));
});
test('IndexNow key is accessible before the catch-all proxy', async () => {
  const key='8f4c2d91a7b64e3fa1c9d0b6e5274a83';
  const response=await local('/'+key+'.txt');
  assert.equal(response.status,200);
  assert.equal(await response.text(),key);
});