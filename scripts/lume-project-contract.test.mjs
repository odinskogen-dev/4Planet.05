import fs from 'node:fs';
import assert from 'node:assert/strict';

const base = new URL('../public/lume/project/', import.meta.url);
const html = fs.readFileSync(new URL('index.html', base), 'utf8');
const css = fs.readFileSync(new URL('lume-project-v01.css', base), 'utf8');
const js = fs.readFileSync(new URL('lume-project-v01.js', base), 'utf8');

assert.match(html, /LUME \/ PROJECT/);
assert.match(html, /data-action="mode"/);
assert.match(html, /data-action="calibrate"/);
assert.match(html, /data-action="fullscreen"/);
assert.match(css, /data-mode="wall"/);
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(js, /id: 'identity'/);
assert.match(js, /id: 'dependency'/);
assert.match(js, /id: 'place'/);
assert.match(js, /id: 'atlas'/);
assert.match(js, /id: 'pressure'/);
assert.match(js, /id: 'response'/);
assert.match(js, /PILOT CORRIDOR ≠ ORCA MIGRATION TRACK/);
assert.match(js, /SOURCE RECORDS ≠ POPULATION · RECORDS ≠ LIVE POSITIONS/);
assert.match(js, /PROTO 01 DOES NOT CLAIM PARTNER DELIVERY OR ECOLOGICAL OUTCOME/);
assert.match(js, /URLSearchParams/);
assert.match(js, /requestFullscreen/);
assert.match(js, /pointerdown/);

console.log('LUME PROJECT PROTO 01 contract: PASS');
