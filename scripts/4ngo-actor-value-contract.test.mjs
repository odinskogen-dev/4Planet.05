import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import ts from "typescript";

const actor = fs.readFileSync("src/content/actorGold.ts", "utf8");

const parse = (source) =>
  ts.createSourceFile("actorGold.ts", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

function interfaceNode(sourceFile, name) {
  return sourceFile.statements.find(
    (node) => ts.isInterfaceDeclaration(node) && node.name.text === name,
  );
}

function propertyType(sourceFile, interfaceName, propertyName) {
  const declaration = interfaceNode(sourceFile, interfaceName);
  if (!declaration) return null;
  const property = declaration.members.find(
    (member) =>
      ts.isPropertySignature(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === propertyName,
  );
  return property?.type?.getText(sourceFile) ?? null;
}

function isStructuredActorCollection(typeText) {
  if (!typeText) return false;
  const compact = typeText.replace(/\s+/g, "");
  return (
    /^Actor[A-Z][A-Za-z0-9_]*\[\]$/.test(compact) ||
    /^Array<Actor[A-Z][A-Za-z0-9_]*>$/.test(compact)
  );
}

function pathFailures(source) {
  const sourceFile = parse(source);
  return [
    "identifiedNeeds",
    "operationalCapabilities",
    "partnerRequirements",
    "capitalRequirements",
  ].flatMap((field) =>
    isStructuredActorCollection(propertyType(sourceFile, "ActorGoldProfile", field))
      ? []
      : [`ActorGoldProfile.${field} must be a structured Actor* collection`],
  );
}

function evidenceFailures(source) {
  const sourceFile = parse(source);
  const delivery = propertyType(sourceFile, "ActorGoldProfile", "deliveryEvidence");
  const outcome = propertyType(sourceFile, "ActorGoldProfile", "outcomeEvidence");
  const failures = [];
  if (!delivery || !/ActorDeliveryEvidence/.test(delivery)) {
    failures.push("deliveryEvidence must use ActorDeliveryEvidence");
  }
  if (!outcome || !/ActorOutcomeEvidence/.test(outcome)) {
    failures.push("outcomeEvidence must use ActorOutcomeEvidence");
  }
  if (delivery && outcome && delivery.replace(/\s+/g, "") === outcome.replace(/\s+/g, "")) {
    failures.push("deliveryEvidence and outcomeEvidence must use distinct types");
  }
  return failures;
}

function actionLinkFailures(source) {
  const sourceFile = parse(source);
  const importedActionContract = sourceFile.statements.some(
    (node) =>
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier.text === "../impact/actionContract" &&
      node.importClause?.namedBindings?.elements.some(
        (element) => element.name.text === "ActionContract",
      ),
  );
  const link = propertyType(sourceFile, "ActorGoldProfile", "actionContractIds");
  const compact = link?.replace(/\s+/g, "") ?? "";
  const canonicalLink =
    compact === 'ActionContract["id"][]' ||
    compact === "ActionContract['id'][]" ||
    compact === 'Array<ActionContract["id"]>' ||
    compact === "Array<ActionContract['id']>";
  const parallelModel = sourceFile.statements.some(
    (node) =>
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      /ngoAction(?:Contract|Lifecycle|Proof)/i.test(node.name.text),
  );
  return [
    ...(importedActionContract ? [] : ["ActionContract must be imported from ../impact/actionContract"]),
    ...(canonicalLink ? [] : ['actionContractIds must reference ActionContract["id"]']),
    ...(parallelModel ? ["parallel NGO action/proof type is prohibited"] : []),
  ];
}

function unionLiterals(sourceFile, interfaceName, propertyName) {
  const declaration = interfaceNode(sourceFile, interfaceName);
  const property = declaration?.members.find(
    (member) =>
      ts.isPropertySignature(member) &&
      ts.isIdentifier(member.name) &&
      member.name.text === propertyName,
  );
  if (!property?.type || !ts.isUnionTypeNode(property.type)) return [];
  return property.type.types
    .filter(ts.isLiteralTypeNode)
    .map((node) => (ts.isStringLiteral(node.literal) ? node.literal.text : null))
    .filter(Boolean);
}

function claimStructureFailures(source) {
  const sourceFile = parse(source);
  const allowed = propertyType(sourceFile, "ActorGoldProfile", "claimsAllowed");
  const prohibited = propertyType(sourceFile, "ActorGoldProfile", "claimsProhibited");
  const sourceRefs = propertyType(sourceFile, "ActorClaimBoundary", "sourceRefs");
  const distances = unionLiterals(sourceFile, "ActorClaimBoundary", "distance");
  const states = unionLiterals(sourceFile, "ActorClaimBoundary", "state");
  const publishGate = sourceFile.statements.some(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "actorClaimCanPublish",
  );
  const failures = [];
  if (!allowed || !/ActorClaimBoundary/.test(allowed)) {
    failures.push("claimsAllowed must use ActorClaimBoundary");
  }
  if (!prohibited || !/ActorClaimBoundary/.test(prohibited)) {
    failures.push("claimsProhibited must use ActorClaimBoundary");
  }
  if (!sourceRefs || sourceRefs.replace(/\s+/g, "") !== "string[]") {
    failures.push("ActorClaimBoundary.sourceRefs must be string[]");
  }
  for (const distance of ["DELIVERY", "OUTCOME", "IMPACT"]) {
    if (!distances.includes(distance)) failures.push(`missing claim distance ${distance}`);
  }
  for (const state of ["SUPPORTED", "SOURCE_REQUIRED", "PROHIBITED"]) {
    if (!states.includes(state)) failures.push(`missing claim state ${state}`);
  }
  if (!publishGate) failures.push("actorClaimCanPublish gate is missing");
  return failures;
}

async function loadFixture(source) {
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

async function claimRuntimeFailures(source) {
  const structural = claimStructureFailures(source);
  if (structural.length) return structural;
  const module = await loadFixture(source);
  const gate = module.actorClaimCanPublish;
  if (typeof gate !== "function") return ["actorClaimCanPublish is not executable"];
  const unsupportedOutcome = gate({
    claim: "Outcome happened",
    distance: "OUTCOME",
    state: "SOURCE_REQUIRED",
    sourceRefs: [],
  });
  const prohibitedImpact = gate({
    claim: "Verified impact",
    distance: "IMPACT",
    state: "PROHIBITED",
    sourceRefs: ["provider:self-claim"],
  });
  const supportedDelivery = gate({
    claim: "Bounded work delivered",
    distance: "DELIVERY",
    state: "SUPPORTED",
    sourceRefs: ["evidence:delivery:1"],
  });
  return [
    ...(unsupportedOutcome === false ? [] : ["unsupported outcome claim passed"]),
    ...(prohibitedImpact === false ? [] : ["prohibited impact claim passed"]),
    ...(supportedDelivery === true ? [] : ["supported sourced delivery claim did not pass"]),
  ];
}

const conformingFixture = `
import type { ActionContract } from "../impact/actionContract";
interface ActorNeed { id: string }
interface ActorCapability { id: string }
interface ActorRequirement { id: string }
interface ActorDeliveryEvidence { sourceRef: string }
interface ActorOutcomeEvidence { sourceRef: string }
interface ActorClaimBoundary {
  claim: string;
  distance: "DELIVERY" | "OUTCOME" | "IMPACT";
  state: "SUPPORTED" | "SOURCE_REQUIRED" | "PROHIBITED";
  sourceRefs: string[];
}
export interface ActorGoldProfile {
  identifiedNeeds: ActorNeed[];
  operationalCapabilities: ActorCapability[];
  partnerRequirements: ActorRequirement[];
  capitalRequirements: ActorRequirement[];
  deliveryEvidence: ActorDeliveryEvidence[];
  outcomeEvidence: ActorOutcomeEvidence[];
  actionContractIds: ActionContract["id"][];
  claimsAllowed: ActorClaimBoundary[];
  claimsProhibited: ActorClaimBoundary[];
}
export function actorClaimCanPublish(claim: ActorClaimBoundary) {
  return claim.state === "SUPPORTED" && claim.sourceRefs.length > 0;
}
`;

test("shared Actor Gold grammar can represent a typed 4NGO need-to-capability value path", () => {
  assert.deepEqual(pathFailures(actor), []);
});

test("4NGO value proof keeps typed delivery evidence separate from outcome evidence", () => {
  assert.deepEqual(evidenceFailures(actor), []);
});

test("4NGO links to the canonical Universal IMPACT ActionContract id", () => {
  assert.deepEqual(actionLinkFailures(actor), []);
});

test("4NGO outcome and impact claims fail closed until structured evidence supports them", async () => {
  assert.deepEqual(await claimRuntimeFailures(actor), []);
});

test("comment-only keywords cannot satisfy any 4NGO contract seam", async () => {
  const commentOnly = "// identifiedNeeds operationalCapabilities partnerRequirements capitalRequirements deliveryEvidence outcomeEvidence actionContractIds claimsAllowed claimsProhibited\n";
  assert.ok(pathFailures(commentOnly).length > 0);
  assert.ok(evidenceFailures(commentOnly).length > 0);
  assert.ok(actionLinkFailures(commentOnly).length > 0);
  assert.ok((await claimRuntimeFailures(commentOnly)).length > 0);
});

test("a genuinely conforming typed fixture satisfies structure and fail-closed behaviour", async () => {
  assert.deepEqual(pathFailures(conformingFixture), []);
  assert.deepEqual(evidenceFailures(conformingFixture), []);
  assert.deepEqual(actionLinkFailures(conformingFixture), []);
  assert.deepEqual(await claimRuntimeFailures(conformingFixture), []);
});

test("missing, stringly typed and dangling action links cannot satisfy the IMPACT reuse gate", () => {
  assert.ok(actionLinkFailures(conformingFixture.replace(/\s*actionContractIds:[^;]+;/, "")).length > 0);
  assert.ok(actionLinkFailures(conformingFixture.replace('ActionContract["id"][]', "string[]")).length > 0);
  assert.ok(actionLinkFailures(conformingFixture.replaceAll("ActionContract", "MissingActionContract")).length > 0);
});

test("unsupported outcome and prohibited impact claims cannot satisfy the claim gate", async () => {
  const unsafe = conformingFixture.replace(
    'return claim.state === "SUPPORTED" && claim.sourceRefs.length > 0;',
    "return true;",
  );
  assert.deepEqual(claimStructureFailures(unsafe), []);
  assert.ok((await claimRuntimeFailures(unsafe)).includes("unsupported outcome claim passed"));
  assert.ok((await claimRuntimeFailures(unsafe)).includes("prohibited impact claim passed"));
});
