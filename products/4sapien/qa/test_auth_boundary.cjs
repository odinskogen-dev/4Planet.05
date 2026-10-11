const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "source", "4sapien-live-hardening.js"), "utf8");

assert.match(source, /let authEpoch=0;/, "auth changes must invalidate in-flight root hydration");
assert.match(source, /authEpoch\+=1;cachedUser=session\?\.user\|\|null;/, "auth change must replace the cached identity");
assert.match(source, /document\.getElementById\('fs-notes'\)\?\.remove\(\)/, "private notes must clear synchronously");
assert.match(source, /account\.textContent='4PLANET ID'/, "stale account identity must clear");
assert.match(source, /for\(const key of \['Penger','Mat'\]\)/, "Finance and Food root summaries must clear");
assert.match(source, /if\(!authCurrent\(epoch\)\)return;const c=cardByKey\('Penger'\)/, "stale Finance response must not paint");
assert.match(source, /if\(!authCurrent\(epoch\)\)return;const meals=/, "stale Food response must not paint");
assert.match(source, /if\(!authCurrent\(epoch\)\)return false;grid\.innerHTML=''/, "stale notes response must not paint");
assert.match(source, /onAuthStateChange\(\(_event,session\)=>\{handleAuthChange\(session\)/, "root must subscribe to auth changes");
assert.match(source, /if\(nextId===authUserId\)return;/, "duplicate same-user auth events must not rehydrate");
assert.match(source, /if\(nextId\)\{const epoch=authEpoch;await identity\(epoch\);if\(authCurrent\(epoch\)\)await hydrateRoot\(epoch\);\}/, "only the new authenticated identity may rehydrate");


assert.match(source, /catch\(e\)\{if\(!authCurrent\(epoch\)\)return;const c=cardByKey\('Penger'\)/, "stale Finance rejection must not paint error state");
assert.match(source, /catch\(e\)\{if\(!authCurrent\(epoch\)\)return;const c=cardByKey\('Mat'\)/, "stale Food rejection must not paint error state");
assert.match(source, /catch\(e\)\{if\(!authCurrent\(epoch\)\)return false;state\.textContent='Notater kunne ikke lastes akkurat nå\.'/ , "stale Notes rejection must not paint error state");

console.log("PASS 4SAPIEN root auth boundary: cache + private DOM reset and stale-response guards");
