import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const data=readFileSync('src/pages/finance/financeData.ts','utf8');
const ui=readFileSync('src/pages/finance/FinanceHub.tsx','utf8');
const app=readFileSync('src/App.tsx','utf8');
const auth=readFileSync('src/identity/identityClient.ts','utf8');
const css=readFileSync('src/pages/finance/finance.css','utf8');
test('standalone finance host and existing identity host allowlist',()=>{
 assert.match(app,/finance\.4planet\.org/);
 assert.match(app,/<FinanceHub/);
 assert.match(auth,/"finance\.4planet\.org"/);
 assert.match(ui,/getIdentityClient/);
 assert.match(ui,/signInWithPassword/);
 assert.match(ui,/FinanceSignIn/);
});
test('public and private demo routes without fake production auth',()=>{
 for(const p of ['/discover','/funders','/opportunities/','/my/calendar','/my/pipeline','/my/projects','/my/graph','/my/applications'])assert.ok(ui.includes(p),p);
 assert.match(ui,/DEMONSTRATION/);
 assert.match(ui,/funding actors, dates and amounts are fictional/i);
 assert.match(ui,/readFinanceWorkspace/);
 assert.match(ui,/remoteStatus==="error"/);
 assert.doesNotMatch(ui,/createClient\(/);
 assert.doesNotMatch(ui,/service_role/);
 const remote=readFileSync('src/pages/finance/financeRemote.ts','utf8');
 assert.match(remote,/finance_user_state/);
 assert.match(remote,/session\.access_token/);
 assert.match(remote,/revision/);
 assert.doesNotMatch(remote,/localStorage/);
});
test('funder, programme, separate call cycle IDs and deduplicated pipeline',()=>{
 for(const entity of ['FUNDERS','PROGRAMMES','CALLS','programmeId','funderId','deadline','confidence','STORAGE_KEY','projectId','validTransition'])assert.ok(data.includes(entity),entity);
 assert.match(ui,/some\(i=>i\.callId===id\)/);
 assert.match(data,/return \["Saved","Qualified","Preparing","Quality review","Ready for release"\]\.includes\(next\)/);
});
test('premium responsive design and accessible navigation',()=>{
 assert.match(css,/#2e2eff/i);
 assert.match(css,/@media\(max-width:760px\)/);
 assert.match(ui,/aria-label="Toggle navigation"/);
 assert.match(ui,/aria-label="Select year"/);
});
