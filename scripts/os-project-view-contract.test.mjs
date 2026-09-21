import test from "node:test";
import assert from "node:assert/strict";
import {handlePrivateOS} from "../ops/labs-domain-adapter/src/founder-os.js";
const req=path=>[new Request("https://labs.4planet.org"+path),new URL("https://labs.4planet.org"+path)];
test("private OS projects view is present but carries no private source content in anonymous HTML",async()=>{
 const response=await handlePrivateOS(...req("/os"));
 assert.equal(response.status,200);
 const body=await response.text();
 for(const part of ["project-index","project-gaps","normalizedProjectCard",
    "NÅSTATUS IKKE AVSTEMT","KILDEBIBLIOTEK"])assert.ok(body.includes(part),part);
 assert.equal(body.includes("Project Home source verified 20–21 September 2026"),false);
 assert.equal(body.includes("SUPABASE_SERVICE_ROLE_KEY"),false);
 assert.match(response.headers.get("content-security-policy")||"",/script-src 'nonce-/);
});
test("anonymous BRAIN API is denied and source-backed project details cannot leak",async()=>{
 const response=await handlePrivateOS(...req("/os/api/brain"));
 assert.equal(response.status,401);
 assert.equal((await response.text()).includes("projects"),false);
});
