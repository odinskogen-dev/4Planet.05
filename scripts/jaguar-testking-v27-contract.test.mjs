import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const url=(p)=>new URL(`../${p}`,import.meta.url);
const read=(p)=>readFileSync(url(p),'utf8');

test('TEST KING Jaguar 27 uses controlled local Ear runtime and keeps the creature on mobile',()=>{
  const html=read('public/journey/jaguar/index.html');
  const js=read('public/journey/jaguar/jaguar-testking-v27.js');
  const css=read('public/journey/jaguar/jaguar-testking-v27.css');
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));
  assert.equal(cfg.assetId,'4P-JAG-3D-EARROD-01');
  assert.equal(cfg.actor.preferred.runtimeState,'CONTROLLED_LOCAL');
  assert.match(cfg.actor.preferred.runtimePath,/jaguar-ear-rodriguez-runtime\.glb\.gz$/);
  assert.match(js,/DecompressionStream/);
  assert.match(js,/GLTFLoader/);
  assert.doesNotMatch(html,/<iframe/i);
  assert.match(html,/three-stage/);
  assert.match(js,/makeSoilTexture/);
  assert.match(js,/makeShadowTexture/);
  assert.match(js,/action==='look'/);
  assert.match(js,/action==='move'/);
  assert.match(js,/action==='lume'/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.doesNotMatch(css,/@media\(max-width:760px\)[\s\S]{0,1800}\.three-stage\s*\{[^}]*display:none/i);
});

test('TEST KING Jaguar local GLB is structurally complete before browser parse',()=>{
  const cfg=JSON.parse(read('public/journey/jaguar/creature-v27.json'));
  const runtimePath=cfg.actor.preferred.runtimePath.replace(/^\//,'');
  const compressed=readFileSync(url(runtimePath));
  const glb=gunzipSync(compressed);

  assert.ok(glb.byteLength>=20,'GLB must contain header and at least one chunk');
  assert.equal(glb.subarray(0,4).toString('ascii'),'glTF','GLB magic must be glTF');
  assert.equal(glb.readUInt32LE(4),2,'GLB version must be 2');

  const declaredTotal=glb.readUInt32LE(8);
  assert.equal(
    declaredTotal,
    glb.byteLength,
    `GLB declared totalLength ${declaredTotal} must equal actual byteLength ${glb.byteLength}; reject truncated binary before runtime adoption`,
  );

  let offset=12;
  let chunkCount=0;
  while(offset<glb.byteLength){
    assert.ok(offset+8<=glb.byteLength,`GLB chunk ${chunkCount} header exceeds file boundary`);
    const chunkLength=glb.readUInt32LE(offset);
    const chunkEnd=offset+8+chunkLength;
    assert.ok(
      chunkEnd<=glb.byteLength,
      `GLB chunk ${chunkCount} declares ${chunkLength} bytes ending at ${chunkEnd}, beyond actual byteLength ${glb.byteLength}`,
    );
    offset=chunkEnd;
    chunkCount+=1;
  }
  assert.ok(chunkCount>=1,'GLB must contain at least one chunk');
  assert.equal(offset,glb.byteLength,'GLB chunks must consume the declared file exactly');
});
