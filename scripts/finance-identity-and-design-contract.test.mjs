import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const model=readFileSync("src/pages/finance/financeIntelligence.ts","utf8");
const css=readFileSync("src/pages/finance/finance.css","utf8");
const ui=readFileSync("src/pages/finance/FinanceHub.tsx","utf8");
const team=readFileSync("src/pages/finance/FinanceTeamDesk.tsx","utf8");
const db=readFileSync("supabase/migrations/20261008_finance_teams_rls.sql","utf8");
test("one typography family, semantic line icons, no emoji",()=>{
 assert.match(css,/font-family:"DM Sans",sans-serif/);
 assert.doesNotMatch(css,/Instrument Sans|Fragment Mono|"Inter"|Arial/);
 assert.match(ui,/viewBox="0 0 24 24"/);
 for(const text of [ui,css,team])assert.doesNotMatch(text,/\p{Extended_Pictographic}/u);
});
test("shared 4PLANET ID rather than a new authentication authority",()=>{
 assert.match(team,/FourPlanetSession/);
 assert.match(team,/getTeamSpaces/);
 assert.match(db,/references auth.users\(id\)/i);
 assert.match(db,/row level security/i);
 assert.match(db,/finance_team_role/);
 assert.match(db,/revoke all.*anon/i);
});
test("public source is not the private funding truth and annual cycles cannot be inferred",()=>{
 for(const field of ["owningMaster","cycleId","verifiedAt","licence","canPublish","REF_ERROR","deadlineEvidence","timezone"])assert.match(model,new RegExp(field));
 assert.match(model,/INTERNAL_ONLY/);
 assert.match(model,/PROVIDER_DECISION/);
 assert.match(model,/BANK_RECEIPT/);
 assert.match(model,/SOURCE_CHECK/);
 assert.match(model,/FOUNDER_ACTION/);
 assert.match(model,/HOLD_FOR_RECONCILIATION/);
});
