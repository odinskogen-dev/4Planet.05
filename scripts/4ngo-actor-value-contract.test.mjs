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

function isExactCollection(typeText, elementType) {
  if (!typeText) return false;
  const compact = typeText.replace(/\s+/g, "");
  return compact === `${elementType}[]` || compact === `Array<${elementType}>`;
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
  const evidenceRefs = propertyType(sourceFile, "ActorClaimBoundary", "evidenceRefs");
  const distances = unionLiterals(sourceFile, "ActorClaimBoundary", "distance");
  const states = unionLiterals(sourceFile, "ActorClaimBoundary", "state");
  const authorities = unionLiterals(sourceFile, "ActorClaimBoundary", "sourceAuthority");
  const reviewStates = unionLiterals(sourceFile, "ActorClaimBoundary", "reviewState");
  const publishGate = sourceFile.statements.some(
    (node) => ts.isFunctionDeclaration(node) && node.name?.text === "actorClaimCanPublish",
  );
  const failures = [];
  if (!isExactCollection(allowed, "ActorClaimBoundary")) {
    failures.push("claimsAllowed must be an ActorClaimBoundary collection");
  }
  if (!isExactCollection(prohibited, "ActorClaimBoundary")) {
    failures.push("claimsProhibited must be an ActorClaimBoundary collection");
  }
  if (!sourceRefs || sourceRefs.replace(/\s+/g, "") !== "string[]") {
    failures.push("ActorClaimBoundary.sourceRefs must be string[]");
  }
  if (!evidenceRefs || evidenceRefs.replace(/\s+/g, "") !== "string[]") {
    failures.push("ActorClaimBoundary.evidenceRefs must be string[]");
  }
  for (const distance of ["DELIVERY", "OUTCOME", "IMPACT"]) {
    if (!distances.includes(distance)) failures.push(`missing claim distance ${distance}`);
  }
  for (const state of ["SUPPORTED", "SOURCE_REQUIRED", "PROHIBITED"]) {
    if (!states.includes(state)) failures.push(`missing claim state ${state}`);
  }
  for (const authority of ["FIRST_PARTY", "INDEPENDENT", "SELF_ATTESTED"]) {
    if (!authorities.includes(authority)) failures.push(`missing source authority ${authority}`);
  }
  for (const reviewState of ["REVIEWED", "UNREVIEWED"]) {
    if (!reviewStates.includes(reviewState)) failures.push(`missing review state ${reviewState}`);
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
  const sourceRecords = [
    { id: "source:independent:1", authority: "INDEPENDENT", reviewedAt: "2026-10-13T00:00:00Z" },
    { id: "provider:delivery:1", authority: "FIRST_PARTY", reviewedAt: "2026-10-13T00:00:00Z" },
    { id: "provider:self-claim", authority: "SELF_ATTESTED", reviewedAt: null },
  ];
  const evidenceRecords = [
    { id: "evidence:impact:1", sourceRef: "source:independent:1", reviewedAt: "2026-10-13T00:00:00Z" },
    { id: "provider:self-evidence", sourceRef: "provider:self-claim", reviewedAt: null },
  ];
  const baseImpact = {
    claim: "Verified impact",
    distance: "IMPACT",
    state: "SUPPORTED",
    sourceRefs: ["source:independent:1"],
    evidenceRefs: ["evidence:impact:1"],
    sourceAuthority: "INDEPENDENT",
    reviewState: "REVIEWED",
  };
  const cases = [
    ["unsupported outcome claim passed", { ...baseImpact, distance: "OUTCOME", state: "SOURCE_REQUIRED" }, false],
    ["prohibited impact claim passed", { ...baseImpact, state: "PROHIBITED" }, false],
    ["self-attested impact claim passed", { ...baseImpact, sourceAuthority: "SELF_ATTESTED", sourceRefs: ["provider:self-claim"] }, false],
    ["blank-source impact claim passed", { ...baseImpact, sourceRefs: ["   "] }, false],
    ["unreviewed impact claim passed", { ...baseImpact, reviewState: "UNREVIEWED" }, false],
    ["impact claim without evidence passed", { ...baseImpact, evidenceRefs: [] }, false],
    [
      "forged independent/reviewed tuple passed without authoritative records",
      {
        ...baseImpact,
        sourceRefs: ["provider:self-claim"],
        evidenceRefs: ["provider:self-evidence"],
      },
      false,
    ],
    [
      "unknown source and evidence records passed",
      {
        ...baseImpact,
        sourceRefs: ["source:missing"],
        evidenceRefs: ["evidence:missing"],
      },
      false,
    ],
    ["reviewed independent impact claim did not pass", baseImpact, true],
    [
      "supported sourced delivery claim did not pass",
      {
        ...baseImpact,
        claim: "Bounded work delivered",
        distance: "DELIVERY",
        sourceRefs: ["provider:delivery:1"],
        evidenceRefs: [],
        sourceAuthority: "FIRST_PARTY",
      },
      true,
    ],
  ];
  return cases.flatMap(([message, claim, expected]) =>
    gate(claim, sourceRecords, evidenceRecords) === expected ? [] : [message],
  );
}

const conformingFixture = `
import type { ActionContract } from "../impact/actionContract";
interface ActorNeed { id: string }
interface ActorCapability { id: string }
interface ActorRequirement { id: string }
interface ActorDeliveryEvidence { sourceRef: string }
interface ActorOutcomeEvidence { sourceRef: string }
interface ActorSourceRecord {
  id: string;
  authority: "FIRST_PARTY" | "INDEPENDENT" | "SELF_ATTESTED";
  reviewedAt: string | null;
}
interface ActorEvidenceRecord {
  id: string;
  sourceRef: string;
  reviewedAt: string | null;
}
interface ActorClaimBoundary {
  claim: string;
  distance: "DELIVERY" | "OUTCOME" | "IMPACT";
  state: "SUPPORTED" | "SOURCE_REQUIRED" | "PROHIBITED";
  sourceRefs: string[];
  evidenceRefs: string[];
  sourceAuthority: "FIRST_PARTY" | "INDEPENDENT" | "SELF_ATTESTED";
  reviewState: "REVIEWED" | "UNREVIEWED";
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
export function actorClaimCanPublish(
  claim: ActorClaimBoundary,
  sourceRecords: ActorSourceRecord[],
  evidenceRecords: ActorEvidenceRecord[],
) {
  const nonBlank = (values: string[]) =>
    Array.isArray(values) && values.length > 0 && values.every((value) => value.trim().length > 0);
  if (claim.state !== "SUPPORTED" || claim.reviewState !== "REVIEWED") return false;
  if (!claim.claim.trim() || !nonBlank(claim.sourceRefs)) return false;
  const sources = claim.sourceRefs.map((id) => sourceRecords.find((record) => record.id === id));
  if (sources.some((record) => !record || !record.reviewedAt)) return false;
  if (claim.distance === "DELIVERY") {
    return sources.every((record) => record?.authority !== "SELF_ATTESTED");
  }
  if (!nonBlank(claim.evidenceRefs)) return false;
  const evidence = claim.evidenceRefs.map((id) => evidenceRecords.find((record) => record.id === id));
  if (evidence.some((record) =>
    !record || !record.reviewedAt || !claim.sourceRefs.includes(record.sourceRef)
  )) return false;
  if (claim.distance === "IMPACT") {
    return sources.some((record) => record?.authority === "INDEPENDENT");
  }
  return sources.every((record) => record?.authority !== "SELF_ATTESTED");
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

test("4NGO outcome and impact claims fail closed until reviewed evidence supports them", async () => {
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

test("claim boundary fields must be collections rather than scalar aliases", () => {
  const scalarClaims = conformingFixture
    .replace("claimsAllowed: ActorClaimBoundary[];", "claimsAllowed: ActorClaimBoundary;")
    .replace("claimsProhibited: ActorClaimBoundary[];", "claimsProhibited: ActorClaimBoundary;");
  assert.ok(claimStructureFailures(scalarClaims).includes("claimsAllowed must be an ActorClaimBoundary collection"));
  assert.ok(claimStructureFailures(scalarClaims).includes("claimsProhibited must be an ActorClaimBoundary collection"));
});

test("missing, stringly typed and dangling action links cannot satisfy the IMPACT reuse gate", () => {
  assert.ok(actionLinkFailures(conformingFixture.replace(/\s*actionContractIds:[^;]+;/, "")).length > 0);
  assert.ok(actionLinkFailures(conformingFixture.replace('ActionContract["id"][]', "string[]")).length > 0);
  assert.ok(actionLinkFailures(conformingFixture.replaceAll("ActionContract", "MissingActionContract")).length > 0);
});

test("self-attested, blank-source, unreviewed and evidence-free impact claims fail closed", async () => {
  const unsafe = conformingFixture.replace(
    'if (claim.state !== "SUPPORTED" || claim.reviewState !== "REVIEWED") return false;',
    "return true;",
  );
  assert.deepEqual(claimStructureFailures(unsafe), []);
  const failures = await claimRuntimeFailures(unsafe);
  assert.ok(failures.includes("self-attested impact claim passed"));
  assert.ok(failures.includes("blank-source impact claim passed"));
  assert.ok(failures.includes("unreviewed impact claim passed"));
  assert.ok(failures.includes("impact claim without evidence passed"));
});

test("asserted independent review cannot replace authoritative source and evidence records", async () => {
  assert.deepEqual(claimStructureFailures(conformingFixture), []);
  const { actorClaimCanPublish } = await loadFixture(conformingFixture);
  const sources = [
    { id: "source:independent:1", authority: "INDEPENDENT", reviewedAt: "2026-10-13T00:00:00Z" },
    { id: "provider:self-claim", authority: "SELF_ATTESTED", reviewedAt: null },
  ];
  const evidence = [
    { id: "evidence:impact:1", sourceRef: "source:independent:1", reviewedAt: "2026-10-13T00:00:00Z" },
    { id: "provider:self-evidence", sourceRef: "provider:self-claim", reviewedAt: null },
  ];
  const reviewedImpact = {
    claim: "Verified impact",
    distance: "IMPACT",
    state: "SUPPORTED",
    sourceRefs: ["source:independent:1"],
    evidenceRefs: ["evidence:impact:1"],
    sourceAuthority: "INDEPENDENT",
    reviewState: "REVIEWED",
  };
  const forgedImpact = {
    ...reviewedImpact,
    sourceRefs: ["provider:self-claim"],
    evidenceRefs: ["provider:self-evidence"],
  };

  assert.equal(actorClaimCanPublish(reviewedImpact, sources, evidence), true);
  assert.equal(actorClaimCanPublish(forgedImpact, sources, evidence), false);
  assert.equal(actorClaimCanPublish(
    { ...reviewedImpact, sourceRefs: ["source:missing"], evidenceRefs: ["evidence:missing"] },
    sources,
    evidence,
  ), false);
});
