'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../source/4sapien-live-hardening.js'),'utf8');
const match=source.match(/async function noteRows\(\)\{([\s\S]*?)\}\nasync function renderNotes/);
assert.ok(match,'noteRows contract must remain inspectable');
const body=match[1];
const query=body.match(/api\('([^']+)'\)/)?.[1]||'';

assert.match(query,/deleted_at=is\.null/,'deleted notes remain excluded server-side');
assert.match(query,/state=eq\.active/,'inactive notes remain excluded server-side');
assert.match(query,/value->>surface=eq\.notes/,'notes surface must be filtered server-side');
assert.match(query,/order=updated_at\.desc/,'notes remain newest-first');
assert.match(query,/limit=120/,'bounded note window remains enforced');
assert.ok(query.indexOf('value->>surface=eq.notes')<query.indexOf('limit=120'),'note filtering must precede pagination');
assert.doesNotMatch(body,/\.filter\s*\(/,'unrelated memory rows must not consume the note window client-side');

const memories=Array.from({length:120},(_,i)=>({id:'other-'+i,value:{surface:'other'}}));
memories.push({id:'older-note',value:{surface:'notes'}});
const oldVisible=memories.slice(0,120).filter(row=>row.value.surface==='notes');
const correctedVisible=memories.filter(row=>row.value.surface==='notes').slice(0,120);
assert.equal(oldVisible.length,0,'fail-before: global limit hides the older note');
assert.deepEqual(correctedVisible.map(row=>row.id),['older-note'],'server filtering keeps the older note visible');

console.log('4SAPIEN notes pagination contract PASS');
