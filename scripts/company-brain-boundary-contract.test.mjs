import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const recoverySource = await readFile(new URL("../src/product/companyBrainRecovery.ts", import.meta.url), "utf8");
const recoveryModule = ts.transpileModule(recoverySource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const recovery = await import(`data:text/javascript;base64,${Buffer.from(recoveryModule).toString("base64")}`);

const controls = await readFile(new URL("../src/pages/partners/CompanyBrainControls.tsx", import.meta.url), "utf8");
const fourBrands = await readFile(new URL("../src/pages/partners/FourBrand.tsx", import.meta.url), "utf8");

test("local company recovery is isolated by signed-in person and company identity", () => {
  const userA = recovery.companyBrainRecoveryKey("twin", recovery.companyBrainPersonScope("user-a"), "org:123");
  const userB = recovery.companyBrainRecoveryKey("twin", recovery.companyBrainPersonScope("user-b"), "org:123");
  const otherCompany = recovery.companyBrainRecoveryKey("twin", recovery.companyBrainPersonScope("user-a"), "org:456");
  const anonymous = recovery.companyBrainRecoveryKey("twin", recovery.ANONYMOUS_COMPANY_BRAIN_SCOPE, "org:123");
  assert.notEqual(userA, userB);
  assert.notEqual(userA, otherCompany);
  assert.notEqual(userA, anonymous);
});

test("Company Brain refreshes auth scope and invalidates stale workspace responses", () => {
  assert.match(controls, /onAuthStateChange/);
  assert.match(controls, /version!==requestVersion\.current/);
  assert.match(controls, /const version=requestVersion\.current;[\s\S]*?await loadCompanyBrain/);
  assert.match(controls, /subscription\.data\.subscription\.unsubscribe/);
  assert.match(controls, /onActorScopeChange\(session\?companyBrainPersonScope\(session\.user\.id\)/);
});

test("4BRANDS recovery prefers exact organisation identity and includes actor scope", () => {
  assert.match(fourBrands, /analysis\?\.company\.organizationNumber \|\| analysis\?\.company\.legalName/);
  assert.match(fourBrands, /companyBrainRecoveryKey\("twin", recoveryActorScope, companyKey\)/);
  assert.match(fourBrands, /onActorScopeChange=\{setRecoveryActorScope\}/);
});
