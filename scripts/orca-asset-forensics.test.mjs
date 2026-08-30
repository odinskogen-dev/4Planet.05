import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import test from 'node:test';

const assets = [
  'public/assets/species/orca/hero.jpg',
  'public/assets/species/orca/hero-mobile.jpg',
  'public/assets/species/orca/detail-pod.jpg',
  'public/assets/species/orca/detail-fjord.jpg',
  'public/assets/species/orca/detail-spyhop.jpg',
  'public/assets/species/orca/detail-ice.jpg',
];

const keyword = /unsplash|pexels|wikimedia|commons|artist|creator|copyright|author|source|https?:|license|licence|adobe|photoshop|lightroom|nikon|canon|sony|fujifilm|leica|xmp|iptc|exif/i;
const printable = /[\x20-\x7e]{4,}/g;

const inspect = (path) => {
  const buffer = readFileSync(path);
  const hash = createHash('sha256').update(buffer).digest('hex');
  const strings = (buffer.toString('latin1').match(printable) || [])
    .map((value) => value.trim())
    .filter((value) => keyword.test(value));
  const unique = [...new Set(strings)].slice(0, 160);
  return { path, bytes: buffer.length, sha256: hash, strings: unique };
};

test('Orca candidate photographs emit immutable forensic hashes and embedded provenance clues', () => {
  const report = assets.map(inspect);
  for (const item of report) {
    assert.ok(item.bytes > 1000, `${item.path} should be a non-empty image`);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
  }
  mkdirSync('artifacts', { recursive: true });
  const text = report.map((item) => [
    `FILE ${item.path}`,
    `BYTES ${item.bytes}`,
    `SHA256 ${item.sha256}`,
    'EMBEDDED CLUES',
    ...(item.strings.length ? item.strings.map((value) => `  ${value}`) : ['  NONE FOUND']),
    '',
  ].join('\n')).join('\n');
  writeFileSync('artifacts/orca-asset-forensics.txt', text);
  console.log(text);
});
