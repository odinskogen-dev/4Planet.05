#!/usr/bin/env node
import fs from 'node:fs';

const path='.github/workflows/four-state-control-plane.yml';
let s=fs.readFileSync(path,'utf8');

const a="for(const s of Object.values(r.sandboxes||{})) map.set(s.render_origin,s.origin);";
const b="for(const s of Object.values(r.sandboxes||{})) if(!map.has(s.render_origin)) map.set(s.render_origin,s.origin);";
if(!s.includes(a) && !s.includes(b)) throw new Error('artifact precedence anchor missing');
s=s.replace(a,b);

const old=`              curl -fsS --connect-timeout 10 --max-time 45 -o /dev/null \"$url\" || { echo \"Underlying surface failed: $product $state $url\"; exit 8; }`;
const next=`              ok=0\n              for attempt in $(seq 1 10); do\n                if curl -fsS --connect-timeout 10 --max-time 45 -o /dev/null \"$url\"; then ok=1; break; fi\n                sleep 3\n              done\n              [ \"$ok\" -eq 1 ] || { echo \"Underlying surface failed after retries: $product $state $url\"; exit 8; }`;
if(!s.includes(old) && !s.includes('Underlying surface failed after retries:')) throw new Error('underlying retry anchor missing');
s=s.replace(old,next);

fs.writeFileSync(path,s);
console.log('Patched exact HEIR artifact precedence + bounded surface retry');
