import fs from "node:fs";

const dir = process.argv[2] ?? "phase06-contexts";
const read = (name) => JSON.parse(fs.readFileSync(`${dir}/${name}`, "utf8"));
const mf = read("microfibre.json");
const cooling = read("cooling.json");
const coral = read("coral.json");

const claims = (pack) => pack.claims ?? [];
const laneClaims = (pack, lane) =>
  claims(pack).filter((c) => (c.evidence ?? []).some((e) => e.direction === lane));
const outcomes = (pack) => pack.outcomes ?? [];
const gaps = (pack) => pack.gaps ?? [];
const economics = (pack) => pack.economics ?? [];
const transfer = (pack) => pack.transferability ?? [];
const refs = (items, field) => items.map((x) => x[field]).filter(Boolean);
const unique = (xs) => [...new Set(xs)];
const evidenceSources = (pack) => unique((pack.sources ?? []).map((s) => s.source_id));
const findClaim = (pack, ref) => claims(pack).find((c) => c.claim_ref === ref);

const reviewCards = [
  {
    question_id: "HB-05",
    pack_id: "DP-01",
    question: "Does evidence that a washing-machine filter captures fibres prove an ecosystem benefit?",
    system_answer:
      "No. The retrieved microfibre pack supports device-level capture and a measured change in final WWTP effluent in one community pilot, but it contains no demonstrated longer-term ecosystem-state outcome. Capture, discharge reduction and ecosystem benefit remain different causal levels.",
    retrieval_basis: {
      claim_refs: refs(laneClaims(mf, "SUPPORTS"), "claim_ref"),
      outcome_refs: refs(outcomes(mf), "outcome_ref"),
      gap_refs: refs(gaps(mf), "gap_ref"),
    },
    most_important_sources: evidenceSources(mf).slice(0, 4),
    material_uncertainty:
      "Long-term maintenance, sludge/disposal pathways, whole-life burden and downstream ecological response are not established by the bounded cohort.",
  },
  {
    question_id: "HB-12",
    pack_id: "DP-02",
    question: "What is the biggest evidence gap preventing a global ranking of sustainable-cooling interventions?",
    system_answer:
      "The bounded staging pack does not contain a directly linked real implementation for the cooling vertical. Its strongest quantitative economics is a modelled global pathway, not an observed intervention-level business case. A defensible ranking therefore needs comparable observed performance, lifecycle economics and attribution by climate/building context.",
    retrieval_basis: {
      implementation_count: (cooling.implementations ?? []).length,
      economics: economics(cooling),
      gap_refs: refs(gaps(cooling), "gap_ref"),
    },
    most_important_sources: evidenceSources(cooling).slice(0, 4),
    material_uncertainty:
      "Local climate, building archetype, grid conditions, refrigerant policy, maintenance and rebound effects can change relative performance.",
  },
  {
    question_id: "HB-18",
    pack_id: "DP-03",
    question: "What failure evidence matters most when considering coral restoration under warming?",
    system_answer:
      "The pack preserves both positive synthesis evidence and severe heat-event failure evidence. A systematic review reports substantial average survival across reported projects, but monitoring is often short and small-scale; NOAA's Florida programme reported very low survival of major branching-coral outplants after the 2023 heat event. Restoration therefore cannot be treated as climate-proof or as a substitute for reducing heat stress.",
    retrieval_basis: {
      support_claim_refs: refs(laneClaims(coral, "SUPPORTS"), "claim_ref"),
      qualify_claim_refs: refs(laneClaims(coral, "QUALIFIES"), "claim_ref"),
      challenge_claim_refs: refs(laneClaims(coral, "CHALLENGES"), "claim_ref"),
      outcome_refs: refs(outcomes(coral), "outcome_ref"),
    },
    most_important_sources: evidenceSources(coral).slice(0, 4),
    material_uncertainty:
      "The Florida heat event is highly material but does not universally invalidate every restoration method, species, genotype or site.",
  },
  {
    question_id: "HB-23",
    pack_id: "DP-04",
    question: "Which Norway-specific gaps currently block a 4PLANET mission recommendation on washing-related textile microfibres?",
    system_answer:
      "The evidence supports treating source control as a plausible research direction, not yet as a 4PLANET mission. The transferability assessment remains a PLAUSIBLE_HYPOTHESIS and explicitly leaves regulation, device compatibility/maintenance and sludge pathways unresolved. Norway-specific implementation evidence and lifecycle economics are also incomplete.",
    retrieval_basis: {
      transferability: transfer(mf),
      gap_refs: refs(gaps(mf), "gap_ref"),
      norway_claim_refs: ["P5-CLM-006", "P5-CLM-007", "P5-CLM-008"].filter((id) => findClaim(mf, id)),
    },
    most_important_sources: evidenceSources(mf).filter((id) => ["P5SRC-003", "P5SRC-004", "P5SRC-001", "P5SRC-002"].includes(id)),
    material_uncertainty:
      "Current Norwegian regulatory status, wastewater/sludge fate, compatible devices, maintenance behaviour, measurement protocol and full cost remain material unknowns.",
  },
].map((card) => ({
  ...card,
  founder_review: {
    relevance: null,
    grounding: null,
    uncertainty: null,
    missing_important_evidence: null,
    overall: null,
    reviewer: null,
    reviewed_at: null,
  },
}));

const machineChecks = [
  {
    id: "M-01",
    name: "microfibre causal abstention",
    pass:
      outcomes(mf).some((o) => o.stage === "OUTPUT" || o.stage === "OUTCOME") &&
      !outcomes(mf).some((o) => o.stage === "LONGER_TERM_IMPACT"),
    note: "Capture/discharge evidence exists without silently claiming ecosystem impact.",
  },
  {
    id: "M-02",
    name: "cooling unknown preservation",
    pass: (cooling.implementations ?? []).length === 0 && gaps(cooling).length > 0,
    note: "Missing implementation evidence remains visible instead of being filled by modelled scenario evidence.",
  },
  {
    id: "M-03",
    name: "coral contradiction preservation",
    pass:
      laneClaims(coral, "SUPPORTS").length > 0 &&
      laneClaims(coral, "QUALIFIES").length > 0 &&
      laneClaims(coral, "CHALLENGES").length > 0,
    note: "Positive, limiting and challenging evidence coexist in one bounded context.",
  },
  {
    id: "M-04",
    name: "Norway transferability uncertainty",
    pass:
      transfer(mf).some((t) => t.conclusion_class === "PLAUSIBLE_HYPOTHESIS") &&
      transfer(mf).some((t) => (t.material_unknowns ?? []).length > 0),
    note: "Transferability is not silently upgraded to proven applicability.",
  },
  {
    id: "M-05",
    name: "public/staging truth boundary",
    pass:
      [mf, cooling, coral].every((p) => p.truth_boundary?.staging_is_production === false) &&
      [mf, cooling, coral].every((p) => p.truth_boundary?.unreviewed_material_in_normal_context === false),
    note: "Staging is not production and unreviewed material is excluded from normal Context Packs.",
  },
];

const scorecard = {
  status: machineChecks.every((x) => x.pass) ? "MACHINE_PRECHECK_PASS" : "MACHINE_PRECHECK_FAIL",
  human_validation_status: "NOT_STARTED",
  human_review_completed: 0,
  checks: machineChecks,
  context_sizes: {
    microfibre: { objects: mf.objects?.length ?? 0, claims: mf.claims?.length ?? 0, sources: mf.sources?.length ?? 0 },
    cooling: { objects: cooling.objects?.length ?? 0, claims: cooling.claims?.length ?? 0, sources: cooling.sources?.length ?? 0 },
    coral: { objects: coral.objects?.length ?? 0, claims: coral.claims?.length ?? 0, sources: coral.sources?.length ?? 0 },
  },
};

fs.writeFileSync("phase06-founder-review-cards.json", JSON.stringify(reviewCards, null, 2));
fs.writeFileSync("phase06-machine-scorecard.json", JSON.stringify(scorecard, null, 2));

if (!machineChecks.every((x) => x.pass)) {
  console.error(JSON.stringify(scorecard, null, 2));
  process.exit(1);
}
console.log("PHASE06_MACHINE_REVIEW_PRECHECK_PASS");
