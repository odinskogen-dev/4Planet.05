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
let passed=0;
for(const name of names) {
 const s=readFileSync(name,"utf8");
 for(const token of checks) {
   assert(s.includes(token),name+": missing authority pointer "+token);
   passed++;
 }
 assert.equal((s.match(/^## ONE BOOT \+ GOALS \+ GIGA \+ PROJECT ROUTING/gm)||[]).length,1,name+": duplicate boot sections");passed++;
 assert(/FOUNDER-APPROVED LIVING CURRENT MASTERPLAN|Founder-approved living (?:current )?(?:cross-project )?Masterplan/i.test(s),name+": 5.1 not approved");passed++;
 assert(/ODIN PRIVATE|ODIN BRAIN/.test(s),name+": missing personal data isolation");passed++;
 assert(!/Minimum current-state path:\s*`00_ READ FIRST/.test(s),name+": old mandatory 00->01->02");passed++;
 assert(!/require a fresh AXE\/BRAIN context handoff/i.test(s),name+": conflicting generic second handoff");passed++;
 assert(/Maker.*Judge|MAKER.*JUDGE|Maker.*Gold/i.test(s),name+": independence missing");passed++;
}
console.log("ONE BOOT AUTHORITY STATIC CONTRACT PASS "+passed+" assertions / 2 active repo instruction entrypoints; runtime Gold and live machine-read remain separate gates.");
