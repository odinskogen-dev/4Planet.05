import { DatabaseBackedDecisionIntelligenceService, decisionRuntimeV2TruthBoundary } from "../.decision-v2-ci/brain/decision/runtimeV2.js";

const reader = {
  async availabilityForRefs(refs) {
    return refs.map((canonicalRef) => ({
      canonicalRef,
      state: canonicalRef.startsWith("4P-SOL-") ? "AVAILABLE" : "PROVENANCE_PENDING",
      sourceRecordIds: [],
      disclosure: "Test reader: missing provenance remains explicit.",
    }));
  },
};

const service = new DatabaseBackedDecisionIntelligenceService(reader);
const best = await service.resolveQuestion("What is the single best solution for pollinator decline?", "MUNICIPALITY");
if (best.status !== "INSUFFICIENT_EVIDENCE") throw new Error("universal-best refusal failed");

const pack = await service.getDatabaseBackedDecisionPack("DP-POLL-MUNICIPALITY-V1");
if (!pack?.databaseBacked || pack.fallbackInvented !== false) throw new Error("database-backed fail-closed contract failed");
if (!pack.availability.some((x) => x.state === "PROVENANCE_PENDING")) throw new Error("missing provenance was not surfaced");

for (const [key, value] of Object.entries(decisionRuntimeV2TruthBoundary)) {
  if (value !== false) throw new Error(`truth boundary ${key} must remain false`);
}

console.log(JSON.stringify({
  release: "DECISION_RUNTIME_V2_GATE",
  pass: true,
  universalBestRefused: true,
  databaseBacked: true,
  fallbackInvented: false,
  explicitMissingState: true,
  truthBoundary: decisionRuntimeV2TruthBoundary,
}, null, 2));
