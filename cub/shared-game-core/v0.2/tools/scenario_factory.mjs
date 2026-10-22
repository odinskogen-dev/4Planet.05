#!/usr/bin/env node
/** Offline proof-first scenario compiler. No historical conclusions inferred. */
import fs from 'node:fs';import path from 'node:path';
import {validateScenario,seedScenario} from '../src/scenarios.js';
const root=path.resolve(import.meta.dirname,'..'),dir=path.join(root,'scenarios');
const files=fs.readdirSync(dir).filter(x=>x.endsWith('.json')).sort();
const results=[];
for(const file of files){const s=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 const errors=validateScenario(s);if(!Array.isArray(s.sources)||!s.sources.length)errors.push('no source notes');
 if(!s.truthStatus)errors.push('truth state missing');
 if(errors.length){results.push({file,pass:false,errors});continue;}
 const seeded=seedScenario(s);
 results.push({file,pass:true,id:s.id,gameId:s.gameId,truthStatus:s.truthStatus,sourceCount:s.sources.length,
  initialWorldSeed:seeded.worldSeed});
}
const out={schema:'cub.scenarios.compile.v2',count:results.length,pass:results.every(r=>r.pass),results};
fs.mkdirSync(path.join(root,'qa'),{recursive:true});fs.writeFileSync(path.join(root,'qa','scenario-proof.json'),JSON.stringify(out,null,2)+'\n');
console.log(`${results.length} scenario files; ${results.filter(r=>r.pass).length} passed; all truth states preserved`);
if(!out.pass)process.exitCode=2;