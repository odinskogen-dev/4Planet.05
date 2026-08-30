import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Jaguar Journey preserves distinct chapter landscapes beneath the v19 depth room', () => {
  const index = read('public/journey/jaguar/index.html');
  const v20 = read('public/xr/jaguar/jaguar-landscapes-v20.css');
  const cinematic = read('public/xr/engine/nature-cinematic-journey-v11.js');
  const scene = JSON.parse(read('public/xr/scenes/jaguar.json'));

  const v19Pos = index.indexOf('/xr/jaguar/jaguar-gold-v19.css');
  const v20Pos = index.indexOf('/xr/jaguar/jaguar-landscapes-v20.css');
  assert.ok(v19Pos >= 0, 'Gold v19 stylesheet must remain loaded');
  assert.ok(v20Pos > v19Pos, 'Landscape restoration must load after Gold v19');

  const expectedStates = ['identity', 'dependency', 'habitat', 'pressure', 'response'];
  const nodes = scene.nodes.slice(0, 5);
  assert.deepEqual(nodes.map((node) => node.scene?.state), expectedStates);

  const backgrounds = nodes.map((node) => node.scene?.media?.backgroundSrc);
  assert.ok(backgrounds.every(Boolean), 'Every Jaguar chapter needs authored cinematic background media');
  assert.equal(new Set(backgrounds).size, backgrounds.length, 'Jaguar chapters must not collapse onto one repeated background');

  for (const state of expectedStates.slice(1)) {
    assert.ok(v20.includes(`data-cinematic-scene="${state}"`), `${state} must have a depth-room release rule`);
  }
  assert.match(v20, /opacity:0!important;/, 'Static v19 photographic depth layers must become transparent outside Encounter');
  assert.match(v20, /\.nature-cinematic__scene\.is-active[\s\S]*opacity:1!important;/, 'Active cinematic scene must be explicitly visible');

  assert.match(cinematic, /scene\.media\s*\|\|\s*\{\}/, 'Cinematic engine must read scene-authored media');
  assert.match(cinematic, /layer\.style\.backgroundImage\s*=\s*`url/, 'Cinematic engine must apply the chapter image to the active layer');
  assert.match(cinematic, /activeLayer\s*=\s*incomingIndex/, 'Cinematic engine must commit the incoming chapter layer');
});
