'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../source/4sapien-live-hardening.js'),'utf8');
const helperSource=source.match(/function activeNoteReceipt\(rows,expected\)\{[^\n]+\}/)?.[0];
assert.ok(helperSource,'authoritative note receipt helper must remain inspectable');
const activeNoteReceipt=vm.runInNewContext('('+helperSource+')');

const exact=[{id:'note-a',content:'Remember the fjord meeting',state:'active'}];
assert.equal(activeNoteReceipt(exact,{id:'note-a',content:'Remember the fjord meeting'}).id,'note-a');
for(const rows of [
  [],
  [{id:'note-a',content:'stale',state:'active'}],
  [{id:'other',content:'Remember the fjord meeting',state:'active'}],
  [{id:'note-a',content:'Remember the fjord meeting',state:'deleted'}],
  exact.concat({id:'note-b',content:'Remember the fjord meeting',state:'active'}),
]){
  assert.equal(activeNoteReceipt(rows,{id:'note-a',content:'Remember the fjord meeting'}),null);
}

const updateBody=source.match(/async function updateNote\(id,value\)\{([\s\S]*?)\}\nasync function addNote/)?.[1]||'';
const addBody=source.match(/async function addNote\(\)\{([\s\S]*?)\}\nasync function removeNote/)?.[1]||'';
for(const [name,body] of [['update',updateBody],['create',addBody]]){
  assert.match(body,/Prefer:'return=representation'/,name+' must request authoritative row representation');
  assert.match(body,/activeNoteReceipt\(/,name+' must validate the returned row');
  assert.match(body,/const attempt=await authAttempt\(\)/,name+' must capture the initiating identity and auth epoch');
  assert.match(body,/if\(!eventAttemptCurrent\(attempt\)\)return;/,name+' must reject a stale post-write continuation');
  assert.match(body,/renderNotes\(attempt\.epoch\)/,name+' must render only inside the initiating auth epoch');
}
assert.match(updateBody,/user_id=eq\.'\+encodeURIComponent\(attempt\.userId\)/);
assert.match(updateBody,/state=eq\.active&deleted_at=is\.null/);
assert.match(updateBody,/select=id,user_id,content,state,deleted_at/);
assert.match(updateBody,/activeNoteReceipt\(rows,\{id,content,userId:attempt\.userId\}\)/);
assert.match(updateBody,/NOTE_UPDATE_NOT_CONFIRMED/);
assert.ok(updateBody.indexOf('activeNoteReceipt')<updateBody.indexOf("emitEvent('note_updated'"),'update event must follow receipt confirmation');
assert.match(updateBody,/emitEvent\('note_updated','brain',\{surface:'home_notes',note_id:saved\.id\},attempt\)/);
assert.match(addBody,/select=id,content,state/);
assert.match(addBody,/NOTE_CREATE_NOT_CONFIRMED/);
assert.ok(addBody.indexOf('activeNoteReceipt')<addBody.indexOf("emitEvent('note_created'"),'create event must follow receipt confirmation');
assert.match(addBody,/user_id:attempt\.userId/);
assert.match(addBody,/emitEvent\('note_created','brain',\{surface:'home_notes',note_id:saved\.id\},attempt\)/);

console.log('4SAPIEN note write receipt contract PASS');
