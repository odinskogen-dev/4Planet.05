import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../assetbank/models/prototype-rigged/',import.meta.url);
function load(name){const b=readFileSync(new URL(name,root));assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
 const len=b.readUInt32LE(12);const g=JSON.parse(b.subarray(20,20+len).toString());return g;}
for(const name of ['soldier_rigged_animated_demo.glb','horse_rigged_animated_demo.glb']){
 test(`${name} is a real skinned mesh with valid joint targets and walk cycle`,()=>{
  const glb=load(name);assert.equal(glb.skins.length,1);assert.equal(glb.animations.length,1);
  const skin=glb.skins[0];assert.ok(skin.joints.length>=6);
  assert.equal(glb.accessors[skin.inverseBindMatrices].type,'MAT4');
  assert.equal(glb.accessors[skin.inverseBindMatrices].count,skin.joints.length);
  const primitive=glb.meshes[0].primitives[0];assert.ok(primitive.attributes.JOINTS_0>=0);
  assert.ok(primitive.attributes.WEIGHTS_0>=0);
  assert.ok(glb.accessors[primitive.indices].count>=36);
  for(const channel of glb.animations[0].channels){assert.ok(skin.joints.includes(channel.target.node));assert.equal(channel.target.path,'rotation');}
  for(const node of glb.nodes) if(node.children)for(const c of node.children)assert.ok(c<glb.nodes.length);
  assert.equal(glb.animations[0].samplers.length,glb.animations[0].channels.length);
 });
}