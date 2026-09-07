export const DECISION_PROOF_VERSION = "s4piens-decision-proof-0.1.0";
export const DECISION_EVIDENCE_STATES = Object.freeze(["OBSERVED", "MODELLED", "CACHED", "UNKNOWN", "UNAVAILABLE"]);
export const DECISION_AXIS_IDS = Object.freeze(["YOU", "WALLET", "PLANET"]);

const evidenceStates = new Set(DECISION_EVIDENCE_STATES);
const axisIds = new Set(DECISION_AXIS_IDS);
const text = (value) => typeof value === "string" ? value.trim() : "";

function canonicalAxis(axis) {
  const id = text(axis?.id).toUpperCase();
  if (!axisIds.has(id)) throw new TypeError(`Decision Proof axis must be YOU, WALLET or PLANET: ${id || "missing"}`);
  const evidenceState = text(axis?.evidenceState).toUpperCase();
  if (!evidenceStates.has(evidenceState)) throw new TypeError(`Invalid Decision Proof evidence state: ${evidenceState || "missing"}`);
  return Object.freeze({
    id,
    evidenceState,
    confidence: text(axis?.confidence).toUpperCase() || "UNKNOWN",
    summary: text(axis?.summary),
    limitation: text(axis?.limitation),
  });
}

function canonicalSource(source) {
  return Object.freeze({
    id: text(source?.id) || "unknown",
    sourceClass: text(source?.sourceClass) || "UNKNOWN",
    independenceKey: text(source?.independenceKey) || text(source?.id) || "unknown",
    publicSafe: source?.publicSafe !== false,
    paidRankingInfluence: source?.paidRankingInfluence === true,
  });
}

function canonicalOption(option) {
  return Object.freeze({
    id: text(option?.id),
    label: text(option?.label),
  });
}

export function buildDecisionProof(input = {}) {
  const axes = Array.isArray(input.axes) ? input.axes.map(canonicalAxis) : [];
  const seenAxes = new Set(axes.map((axis) => axis.id));
  const missingAxes = DECISION_AXIS_IDS.filter((id) => !seenAxes.has(id));
  const sources = Array.isArray(input.sources) ? input.sources.map(canonicalSource) : [];
  const sponsorIndependent = sources.every((source) => !source.paidRankingInfluence);
  const quorumStatus = input.quorum?.status === "QUORUM" ? "QUORUM" : "NO_QUORUM";
  const options = Array.isArray(input.options) ? input.options.map(canonicalOption).filter((option) => option.id && option.label) : [];
  const eligible = sponsorIndependent && quorumStatus === "QUORUM" && options.length >= 2 && missingAxes.length === 0;

  let gate = "EVIDENCE_QUORUM";
  if (!sponsorIndependent) gate = "WITHHELD_SPONSOR_CONFLICT";
  else if (missingAxes.length > 0) gate = "WITHHELD_AXIS_GAP";
  else if (options.length < 2) gate = "WITHHELD_OPTION_GAP";
  else if (quorumStatus !== "QUORUM") gate = "WITHHELD_NO_QUORUM";

  const proof = {
    version: DECISION_PROOF_VERSION,
    proofId: text(input.proofId) || `decision:${text(input.domain).toLowerCase() || "general"}:${text(input.subjectId) || "unbound"}`,
    createdAt: text(input.createdAt) || new Date().toISOString(),
    domain: text(input.domain).toUpperCase() || "GENERAL",
    subjectId: text(input.subjectId) || null,
    question: text(input.question),
    decisionContext: text(input.decisionContext),
    options,
    criteria: Array.isArray(input.criteria) ? input.criteria.map((criterion) => text(criterion)).filter(Boolean) : [],
    axes,
    missingAxes,
    evidence: {
      quorumStatus,
      independentEvidenceFamilies: Number.isFinite(input.quorum?.independentEvidenceFamilies)
        ? Math.max(0, Math.floor(input.quorum.independentEvidenceFamilies))
        : null,
      sources,
      sponsorIndependent,
    },
    recommendation: {
      status: eligible ? "ELIGIBLE" : "WITHHELD",
      gate,
      value: eligible ? (input.recommendation ?? null) : null,
    },
    unknowns: Array.isArray(input.unknowns) ? input.unknowns.map((item) => text(item)).filter(Boolean) : [],
    hardStops: Array.isArray(input.hardStops) ? input.hardStops.map((item) => text(item)).filter(Boolean) : [],
    truthBoundary: "YOU, WALLET and PLANET remain separate. Missing evidence cannot improve an option. Paid ranking influence blocks recommendation eligibility. No universal or moral score is generated.",
  };

  return Object.freeze(proof);
}

export function decisionProofForFoodProduct({ product, axes = [], wallet, planet, question = "Should I choose this product?", createdAt } = {}) {
  const mappedAxes = [
    {
      id: "YOU",
      evidenceState: axes.find((axis) => axis?.id === "health")?.evidenceState || (axes.find((axis) => axis?.id === "health")?.evidence?.length ? "MODELLED" : "UNKNOWN"),
      confidence: axes.find((axis) => axis?.id === "health")?.confidence || "UNKNOWN",
      summary: axes.find((axis) => axis?.id === "health")?.summary || "No controlled personal-health interpretation.",
      limitation: axes.find((axis) => axis?.id === "health")?.limitation || "Health evidence is contextual and not personalised medical advice.",
    },
    {
      id: "WALLET",
      evidenceState: wallet?.evidenceState || "UNKNOWN",
      confidence: wallet?.confidence || "UNKNOWN",
      summary: wallet?.summary || "No price observation.",
      limitation: wallet?.limitation || "No current shelf price established.",
    },
    {
      id: "PLANET",
      evidenceState: planet?.evidenceState || "UNKNOWN",
      confidence: planet?.confidence || "UNKNOWN",
      summary: planet?.summary || "No controlled planetary evidence.",
      limitation: planet?.limitation || "No exact SKU footprint established.",
    },
  ];

  const sources = [
    ...(product?.sourceRef ? [{ id: product.sourceRef.sourceId, sourceClass: "PRODUCT RECORD", independenceKey: product.sourceRef.sourceId, publicSafe: true }] : []),
    ...(wallet?.source ? [{ id: wallet.source.id, sourceClass: wallet.source.sourceClass, independenceKey: wallet.source.id, publicSafe: true }] : []),
    ...((planet?.evidence ?? []).map((source) => ({ id: source.id, sourceClass: source.sourceClass, independenceKey: source.id, publicSafe: true }))),
  ];

  return buildDecisionProof({
    domain: "FOOD",
    subjectId: product?.gtin ? `gtin:${product.gtin}` : null,
    question,
    createdAt,
    options: product ? [{ id: `gtin:${product.gtin}`, label: product.name || product.gtin }] : [],
    axes: mappedAxes,
    sources,
    quorum: { status: "NO_QUORUM" },
    unknowns: [
      ...(wallet?.evidenceState === "UNKNOWN" || wallet?.evidenceState === "UNAVAILABLE" ? ["Current comparable wallet evidence"] : []),
      ...(planet?.exactSkuFootprint ? [] : ["Exact SKU planetary footprint"]),
    ],
  });
}
