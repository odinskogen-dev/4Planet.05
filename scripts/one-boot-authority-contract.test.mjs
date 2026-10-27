#!/usr/bin/env node
// Exact repository-local static guard. No network, no Drive reads, no permissions granted.
// Complements, NEVER replaces independent blind-cold-agent Gold and source/runtime readback.
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
const names = ["AGENTS.md", ".github/copilot-instructions.md"];
const BOOT = "15XcZ7FQqAZnoxVe74YNlfh4MccYRcPPTYYFQ1XNbQVo";
const MASTER = "1ZN_fKY6Ew1p8eu6ywC5ZL9TVYpOstj3xSe1ebPCkPP4";
const GOALS = "18TGuqbFGqcHMLatBz_WqJUYujQKmBhXAeSNN0cXQreU";
const ATOMIC = "1r75rDNlwZk7ABJDk8zq-r9lMIWT7SAeYOmn0mmhDrr0";
const CONST = "1EjeTm7HeVLRVH0lObxTD5tbkExFHb5T4ACS1doZj5CI";
const SOTP = "1Cg4uZ4rBpIOEHfHEzG7W0lt94Bbet4FmulD7U-wgtM8";
const IMPACT = "1dE3YbtUV0wmCBzfAqcHR97eRehjkack2aZf-esNU5Lw";
const GIGA2800 = "1UbJVJC18rtIyjUPZkEOACMrv0g8B4KgNw_ph8TYCwXE";
const ECON = "1jMzn2zN_0zBtMGbV3SgOXwTLIlx77JkEQGMX98e07o0";
const checks = [BOOT,MASTER,GOALS,ATOMIC,CONST,SOTP,IMPACT,GIGA2800,ECON];
function legacyMandatoryLines(text) {
 return text.split(/\r?\n/).map((line,i)=>({line:line.replace(/\s+/g," ").trim(),number:i+1})).filter(({line})=>{
  const l=line.toLowerCase();
  if(/\b(?:never|do not|don't|historical|superseded|on-demand|on demand|not routine|not mandatory)\b/.test(l)) return false;
  const mandate=/(?:\bmandatory\b|\brequired\b|\bmust\b|\bstart\b|\bstartup\b|\bcold start\b|\bbefore material\b|\bevery agent\b|\bread first\b|\bminimum current-state path\b|\bon boot\b|\bon startup\b|\bbootstrap\b|\bload\b|\bopen\b)/.test(l);
  const chain=/(?:\b00\b|read first|agent start here).{0,180}(?:\b01\b|project lead current|playbook).{0,180}(?:\b02\b|active tasks|project lead current)/.test(l);
  const handoff=/(?:require|mandatory|must|needs|obtain).*?(?:axe\/brain|axe|brain)\s*(?:context\s*)?handoff/.test(l);
  return (mandate&&chain)||handoff;
 }).map(x=>x.number+": "+x.line);
}
const negative=[
 "MANDATORY: On startup read 00, then 01 Project Lead Current, then 02 Active Tasks.",
 "Every agent MUST read 00 READ FIRST → 01 PROJECT LEAD CURRENT → 02 ACTIVE TASKS before any task.",
 "Before material work, open AGENT START HERE → Playbook → Project Lead Current.",
 "Startup requires a fresh AXE/BRAIN context handoff."
];
const positive=[
 "Never routinely read old 00 READ FIRST → 01 Project Lead → 02 Tasks.",
 "Legacy 00→01→02 is historical and on-demand only.",
 "Read only 00 ONLY BOOT, then retrieve relevant Project Home/Atomic."
];
for(const fixture of negative) assert(legacyMandatoryLines(fixture).length>0,"NEGATIVE FALSE ACCEPT "+fixture);
for(const fixture of positive) assert.equal(legacyMandatoryLines(fixture).length,0,"HISTORIC FALSE POSITIVE "+fixture);

let passed=negative.length+positive.length;
for(const name of names) {
 const s=readFileSync(name,"utf8");
 for(const token of checks) {
   assert(s.includes(token),name+": missing authority pointer "+token);
   passed++;
 }
 assert.equal((s.match(/^## ONE BOOT \+ GOALS \+ GIGA \+ PROJECT ROUTING/gm)||[]).length,1,name+": duplicate boot sections");passed++;
 assert(/FOUNDER-APPROVED LIVING CURRENT MASTERPLAN|Founder-approved living (?:current )?(?:cross-project )?Masterplan/i.test(s),name+": 5.1 not approved");passed++;
 assert(/ODIN PRIVATE|ODIN BRAIN/.test(s),name+": missing personal data isolation");passed++;
 assert.deepEqual(legacyMandatoryLines(s),[],name+": conflicting mandatory multi-boot");passed++;
 assert(!/require a fresh AXE\/BRAIN context handoff/i.test(s),name+": conflicting generic second handoff");passed++;
 assert(/Maker.*Judge|MAKER.*JUDGE|Maker.*Gold/i.test(s),name+": independence missing");passed++;
}
console.log("ONE BOOT AUTHORITY STATIC CONTRACT PASS "+passed+" assertions / 2 active repo instruction entrypoints; runtime Gold and live machine-read remain separate gates.");
