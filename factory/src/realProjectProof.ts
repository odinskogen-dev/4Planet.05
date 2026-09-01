import type { ProjectProjection, WorkPackage, ZeroLossEvidence } from "./contracts";
import type { AutonomousWorkPackage } from "./autonomousExecution";

export const REAL_FACTORY_PROOF_VERSION = "REAL_4PLANET_PROOF_01" as const;

export interface RealProofCase {
  project: ProjectProjection;
  pkg: AutonomousWorkPackage;
  family: "SPECIES_PROFILE" | "ECOSYSTEM_PLACE" | "ACTOR_PROFILE";
}

function zeroLossForBoundedProof(
  currentTestSha: string,
  recoveryAuthority: string,
  sourcePath: string,
  checkedAt: string,
): ZeroLossEvidence {
  const currentRef = `current-test:${currentTestSha}:${sourcePath}`;
  const recoveryRef = `recovery-authority:${recoveryAuthority}`;
  return {
    required: true,
    donorUniverseRefs: [currentRef, recoveryRef],
    dispositions: [
      {
        donorRef: currentRef,
        feature: "exact current TEST implementation being changed by the bounded Factory proof",
        disposition: "ADOPT",
        evidence: [`Exact current TEST KING SHA ${currentTestSha}`, `Target ${sourcePath}`],
      },
      {
        donorRef: recoveryRef,
        feature: "historical/recovery value outside this bounded non-canonical proof change",
        disposition: "DEFER_WITH_REASON",
        reason: "This activation proof is not authorised to close or supersede the wider product Zero-Loss recovery. Historical value remains under the existing recovery authority.",
        evidence: [recoveryAuthority, "No Human Gold, Canon or product-wide Zero-Loss closure is inferred from this Factory candidate."],
      },
    ],
    orphanCount: 0,
    winnerParityEvidence: [
      "Bounded proof changes only the exact declared current TEST file.",
      "The wider recovery lane remains authoritative for historical product-value reconciliation.",
      "Candidate remains a draft TEST PR and cannot self-promote Human Gold or Canon.",
    ],
    checkedAt,
  };
}

function project(
  id: string,
  name: string,
  goal: string,
  current: string,
  gold: string,
  gap: string,
  authorityRef: string,
): ProjectProjection {
  return {
    id,
    name,
    northStar: "Produce a materially useful, truthful, premium 4PLANET TEST improvement through the autonomous Factory loop.",
    user: "A normal public 4PLANET visitor",
    goal,
    current,
    gold,
    gap,
    priority: "P0",
    authorityRefs: [authorityRef],
  };
}

function packageBase(
  id: string,
  projectId: string,
  title: string,
  targetPath: string,
  gapClosed: string,
  definitionOfDone: string[],
  requiredEvidence: string[],
  zeroLoss: ZeroLossEvidence,
  nowIso: string,
): WorkPackage {
  return {
    id,
    projectId,
    title,
    section: "PRODUCT_DESIGN",
    priority: "P0",
    goalLink: "FOUNDER-DIRECTED FACTORY FINAL AUTONOMOUS ACTIVATION SPRINT",
    gapClosed,
    deliverables: [`One bounded material improvement in ${targetPath}`, "Draft TEST candidate", "CI evidence", "390 mobile Browser QA evidence"],
    dependencies: [],
    writeScopes: [targetPath],
    definitionOfDone,
    requiredEvidence,
    zeroLoss,
    learningQuestion: "Can one shared Factory production contract improve materially different 4PLANET surfaces without flattening their product-specific character or truth boundaries?",
    createdAt: nowIso,
    estimatedValue: 8,
    criticalPath: 10,
    dependencyUnlock: 10,
    proofValue: 10,
    cashValue: 2,
    learningValue: 10,
    risk: 3,
    founderBurden: 1,
    concurrencyCost: 2,
    status: "READY",
  };
}

export function createRealProjectProofCases(currentTestSha: string, nowIso = new Date().toISOString()): RealProofCase[] {
  if (!/^[0-9a-f]{40}$/i.test(currentTestSha)) throw new Error("Real Factory proof requires exact current TEST KING SHA");
  const authorityRef = "FOUNDER_ORDER:4PLANET_FACTORY_FINAL_AUTONOMOUS_ACTIVATION_SPRINT";

  const speciesPath = "src/components/species/SpeciesEvidenceSeam.tsx";
  const speciesProject = project(
    "factory-proof-species-profile",
    "SPECIES Profile — human evidence seam",
    "Make scientific evidence easier for a normal human to understand and intentionally open without weakening provenance or uncertainty.",
    "The current shared evidence seam is truthful and deep, but disclosure rows rely on raw state labels and a visually suppressed native details marker.",
    "A small premium human-first improvement makes source rows unmistakably interactive while preserving every evidence/truth boundary.",
    "Improve disclosure affordance without adding dashboard density or claiming the overall SPECIES template is Human Gold.",
    authorityRef,
  );
  const speciesPkg = packageBase(
    "factory-real-species-evidence-affordance-01",
    speciesProject.id,
    "SPECIES — make source evidence disclosure clearer for humans",
    speciesPath,
    "Clarify the expandable evidence-row affordance while preserving the existing source/provenance/uncertainty model.",
    [
      "Existing SpeciesEvidenceSeam behaviour and truth copy remain intact.",
      "Each source summary gains an explicit human-readable disclosure cue such as OPEN EVIDENCE or SOURCE DETAILS.",
      "No unsupported scientific or conservation claim is added.",
      "No overall SPECIES Human Gold claim is added.",
      "Mobile layout remains compact and accessible.",
    ],
    ["typecheck/build/contract CI", "draft TEST PR", "390 mobile rendered preview", "truth boundary preserved"],
    zeroLossForBoundedProof(currentTestSha, "#145 TEST KING SPECIES TOTAL RECOVERY", speciesPath, nowIso),
    nowIso,
  ) as AutonomousWorkPackage;
  speciesPkg.autonomous = {
    kind: "GITHUB_TEST_WRITE",
    repository: "odinskogen-dev/4Planet.05",
    baseBranch: "king/test",
    expectedBaseSha: currentTestSha,
    targetPath: speciesPath,
    brief: "Make the existing Species evidence source rows obviously expandable to a normal person. Preserve all current provenance, refresh, uncertainty, rights, update and forbidden-inference content. The native details marker is suppressed with listStyle:none, so add a small explicit disclosure cue within each summary. Keep the visual language premium and quiet. Do not redesign the whole component and do not call the Species profile Gold.",
    sourceRefs: [speciesPath, "#145"],
    maxCorrectionAttempts: 2,
  };

  const bayPath = "public/ecosystem/bay-of-biscay/index.html";
  const bayProject = project(
    "factory-proof-bay-ecosystem",
    "Bay of Biscay — accessible place experience",
    "Improve a real ecosystem Gold candidate for keyboard/mobile use while preserving corridor truth semantics.",
    "The current Bay page has a strong place-first monitoring story but no explicit skip-to-main-content keyboard affordance.",
    "The page keeps its current visual/narrative identity while gaining a proper skip link and focusable main destination.",
    "Add one accessibility improvement without turning the corridor into a migration path or changing ecological claims.",
    authorityRef,
  );
  const bayPkg = packageBase(
    "factory-real-bay-accessibility-01",
    bayProject.id,
    "Bay of Biscay — add premium keyboard skip-to-content affordance",
    bayPath,
    "Close a real keyboard-accessibility gap on the existing Bay of Biscay TEST experience.",
    [
      "A keyboard-accessible skip link targets the main content.",
      "The skip link is visually unobtrusive until focused and fits the existing dark premium visual language.",
      "PILOT CORRIDOR ≠ MIGRATION TRACK meaning remains explicit.",
      "UNKNOWN survey-day/cost states remain unknown.",
      "No new ecological, survey or ORCA relationship claim is introduced.",
    ],
    ["build/contract CI", "draft TEST PR", "390 mobile rendered preview", "truth boundary preserved"],
    zeroLossForBoundedProof(currentTestSha, "#117 Ecosystems Gold + #147 ORCA/Bay recovery", bayPath, nowIso),
    nowIso,
  ) as AutonomousWorkPackage;
  bayPkg.autonomous = {
    kind: "GITHUB_TEST_WRITE",
    repository: "odinskogen-dev/4Planet.05",
    baseBranch: "king/test",
    expectedBaseSha: currentTestSha,
    targetPath: bayPath,
    brief: "Add a real keyboard skip-to-content affordance to this existing self-contained Bay of Biscay HTML page. Give main a stable id, add a skip link at the start of body, and CSS that keeps it visually hidden/off-canvas until keyboard focus then presents it clearly in the existing premium dark/cyan visual system. Preserve ALL current text and especially PILOT CORRIDOR ≠ MIGRATION TRACK, schematic/not-to-scale wording, effort/observation separation and UNKNOWN cost/day states. Make no other redesign.",
    sourceRefs: [bayPath, "#117", "#147"],
    maxCorrectionAttempts: 2,
  };

  const actorPath = "src/pages/v5/ActorGold.tsx";
  const actorProject = project(
    "factory-proof-actor-profile",
    "Actor Gold — relationship-state accessibility",
    "Make Actor relationship truth equally clear to assistive-technology users without changing relationship evidence states.",
    "Relationship state is visually shown as DIRECT DIALOGUE / VERIFIED PARTNER / PUBLIC RECORD but the badge has no explicit semantic label for screen readers.",
    "Relationship truth is communicated as a labelled status while keeping the existing visual badge and underlying actor state untouched.",
    "Strengthen accessibility and truth clarity without implying a new partnership, endorsement or outcome.",
    authorityRef,
  );
  const actorPkg = packageBase(
    "factory-real-actor-relationship-a11y-01",
    actorProject.id,
    "Actor Gold — label relationship status explicitly for assistive technology",
    actorPath,
    "Make the existing evidence-bearing relationship badge semantically explicit without changing its visual/state logic.",
    [
      "RelationshipMark keeps the existing DIRECT DIALOGUE / VERIFIED PARTNER / PUBLIC RECORD mapping.",
      "The rendered relationship status has an explicit accessible label such as Relationship status: PUBLIC RECORD.",
      "No actor relationship state is upgraded or inferred.",
      "No partnership, endorsement or outcome claim is introduced.",
      "Existing Actor profile structure and visual identity remain unchanged.",
    ],
    ["typecheck/build/contract CI", "draft TEST PR", "390 mobile rendered preview", "relationship truth preserved"],
    zeroLossForBoundedProof(currentTestSha, "#221 Actor Gold torture test + #152 Actor recovery", actorPath, nowIso),
    nowIso,
  ) as AutonomousWorkPackage;
  actorPkg.autonomous = {
    kind: "GITHUB_TEST_WRITE",
    repository: "odinskogen-dev/4Planet.05",
    baseBranch: "king/test",
    expectedBaseSha: currentTestSha,
    targetPath: actorPath,
    brief: "Make one surgical accessibility/truth improvement only: keep RelationshipMark's existing state-to-label mapping exactly, but give the visible badge an explicit accessible semantic label (for example aria-label=`Relationship status: ${label}`). Do not alter actor data, publication state, copy, visual hierarchy, routes, relationship evidence or any partnership/endorsement claims.",
    sourceRefs: [actorPath, "#221", "#152"],
    maxCorrectionAttempts: 2,
  };

  return [
    { project: speciesProject, pkg: speciesPkg, family: "SPECIES_PROFILE" },
    { project: bayProject, pkg: bayPkg, family: "ECOSYSTEM_PLACE" },
    { project: actorProject, pkg: actorPkg, family: "ACTOR_PROFILE" },
  ];
}
