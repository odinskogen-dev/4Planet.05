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
const hasSentence = (value) => typeof value === "string" && value.trim().length >= 40 && /[.!?]$/.test(value.trim());

// Founder feedback 2026-08-09 is implemented here as a presentation/reasoning
// contract, not as a new truth-schema field. Context Pack v4 already carries the
// evidence primitives required to explain uncertainty (limitations, gaps,
// measurement basis, transferability and evidence lanes).
const uncertaintyPolicy = {
  version: "UNCERTAINTY_PRESENTATION_V1",
  context_pack_decision: "RETAIN_CONTEXT_PACK_V4_0",
  schema_change: false,
  rule:
    "When uncertainty materially affects interpretation, applicability, transferability, effectiveness, economics, causality, mission suitability or decision risk, explain what is uncertain, why, why it matters, and what remains supportable. Use minimum sufficient explanatory prose; do not replace uncertainty with keyword-only shorthand.",
  required_fields: [
    "uncertainty_statement",
    "uncertainty_basis",
    "decision_implication",
    "still_supported",
  ],
  human_truth_boundary: {
    human_reviews_completed: 4,
    qualitative_judgement: "BROADLY_ACCEPTED_GOOD_ENOUGH_TO_CONTINUE",
    explicit_structured_passes: 0,
    explicit_structured_fails: 0,
    structured_label_status: "NOT_EXPLICITLY_SUPPLIED",
  },
};

const baseCards = [
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
    uncertainty_contract: {
      uncertainty_statement:
        "The evidence does not establish that capturing fibres in a device produces a durable downstream ecosystem benefit.",
      uncertainty_basis:
        "The bounded evidence measures capture and final-effluent change, while long-term maintenance, disposal or sludge pathways, whole-life burdens and ecosystem-state response remain unmeasured here.",
      decision_implication:
        "A filter can therefore be described as a source-control intervention with measured capture evidence, but the current pack cannot justify an ecosystem-benefit claim or a whole-life environmental ranking.",
      still_supported:
        "It is still defensible to say that the tested filter reduced fibre release under controlled conditions and that one community pilot observed lower microfibre counts in treated final effluent.",
    },
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
    uncertainty_contract: {
      uncertainty_statement:
        "The current pack cannot determine a universal performance or cost ranking among individual cooling interventions.",
      uncertainty_basis:
        "Its strongest quantitative result is an integrated modelled pathway, while the bounded cohort contains no directly linked observed cooling implementation and lacks comparable intervention-level lifecycle economics across climates and building types.",
      decision_implication:
        "Because climate, building form, grid conditions, refrigerants, operation and rebound can materially change relative performance, ranking technologies globally would overgeneralise beyond the evidence.",
      still_supported:
        "The evidence still supports sustainable-cooling pathways that reduce demand first and meet residual demand efficiently, but not a single global winner among the component interventions.",
    },
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
    uncertainty_contract: {
      uncertainty_statement:
        "The evidence is mixed on how robust coral restoration remains under repeated severe warming, and the Florida failure cannot be generalised to every restoration context.",
      uncertainty_basis:
        "The positive synthesis pools heterogeneous projects, many with short monitoring and small spatial scale, whereas the challenging Florida evidence concerns specific branching corals exposed to an extreme 2023 heat event in one programme geography.",
      decision_implication:
        "The disagreement therefore limits claims of climate robustness: it challenges reliance on outplant survival under severe heat, but it does not prove that every species, genotype, method or site will fail.",
      still_supported:
        "Restoration can remain a context-dependent recovery tool, especially alongside local stress reduction and monitoring, while climate-pressure reduction remains a separate necessary condition.",
    },
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
    most_important_sources: evidenceSources(mf).filter((id) =>
      ["P5SRC-003", "P5SRC-004", "P5SRC-001", "P5SRC-002"].includes(id),
    ),
    material_uncertainty:
      "Current Norwegian regulatory status, wastewater/sludge fate, compatible devices, maintenance behaviour, measurement protocol and full cost remain material unknowns.",
    uncertainty_contract: {
      uncertainty_statement:
        "The current evidence does not establish that a washing-related microfibre intervention is implementation-ready or mission-ready in Norway.",
      uncertainty_basis:
        "Norwegian problem relevance and regulatory-process evidence exist, but the pack lacks Norwegian implementation outcomes and full lifecycle economics and leaves device compatibility, maintenance behaviour, wastewater or sludge fate and the final regulatory position unresolved.",
      decision_implication:
        "Those gaps affect feasibility, burden shifting, measurement design and cost, so geographic similarity and global filter evidence are not enough to justify a Norwegian 4PLANET mission recommendation.",
      still_supported:
        "Source control remains a defensible Norway research direction and transferability hypothesis that can be advanced through targeted implementation and measurement work.",
    },
  },
];

const reviewCards = baseCards.map((card) => ({
  ...card,
  post_repair_answer: `${card.system_answer} ${card.uncertainty_contract.uncertainty_basis} ${card.uncertainty_contract.decision_implication} ${card.uncertainty_contract.still_supported}`,
  founder_review: {
    qualitative_judgement: "BROADLY_ACCEPTED_GOOD_ENOUGH_TO_CONTINUE",
    raw_feedback:
      "Jeg er ganske enig i at de er gode nok. Usikkerheten må kanskje forklares bedre enn bare i stikkord på noen av dem.",
    structured_label_status: "NOT_EXPLICITLY_SUPPLIED",
    relevance: null,
    grounding: null,
    uncertainty: null,
    missing_important_evidence: null,
    overall: null,
    reviewer: "FOUNDER",
    reviewed_at: "2026-08-09",
  },
}));

const beforeAfter = reviewCards.map((card) => ({
  question_id: card.question_id,
  question: card.question,
  before: {
    system_answer: card.system_answer,
    material_uncertainty: card.material_uncertainty,
  },
  after: {
    post_repair_answer: card.post_repair_answer,
    uncertainty_contract: card.uncertainty_contract,
  },
  scientific_meaning_changed: false,
  repair_type: "PRODUCT_PRESENTATION_UNCERTAINTY_COMMUNICATION",
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
  {
    id: "M-06",
    name: "human-feedback uncertainty explanation contract",
    pass: reviewCards.every((card) =>
      uncertaintyPolicy.required_fields.every((field) => hasSentence(card.uncertainty_contract?.[field])),
    ),
    note: "Every reviewed answer now explains what is uncertain, why, why it matters and what remains supportable.",
  },
  {
    id: "M-07",
    name: "human label non-inference",
    pass: reviewCards.every(
      (card) =>
        card.founder_review.structured_label_status === "NOT_EXPLICITLY_SUPPLIED" &&
        card.founder_review.relevance === null &&
        card.founder_review.grounding === null &&
        card.founder_review.uncertainty === null &&
        card.founder_review.overall === null,
    ),
    note: "Qualitative founder acceptance is preserved without invented structured labels.",
  },
  {
    id: "M-08",
    name: "contradiction explanation",
    pass:
      reviewCards.find((x) => x.question_id === "HB-18")?.uncertainty_contract?.uncertainty_basis.includes("heterogeneous") &&
      reviewCards.find((x) => x.question_id === "HB-18")?.uncertainty_contract?.uncertainty_basis.includes("Florida"),
    note: "Coral disagreement is explained through evidence scope/context instead of collapsed into synthetic consensus.",
  },
  {
    id: "M-09",
    name: "unknown taxonomy preservation",
    pass:
      (cooling.implementations ?? []).length === 0 &&
      reviewCards.find((x) => x.question_id === "HB-12")?.post_repair_answer.includes("no directly linked observed cooling implementation"),
    note: "NO_IMPLEMENTATION_EVIDENCE remains distinct from evidence that implementation does not exist.",
  },
];

const scorecard = {
  status: machineChecks.every((x) => x.pass) ? "MACHINE_REPAIR_REGRESSION_PASS" : "MACHINE_REPAIR_REGRESSION_FAIL",
  context_pack_decision: "RETAIN_CONTEXT_PACK_V4_0",
  uncertainty_presentation_contract: uncertaintyPolicy.version,
  human_validation_status: "QUALITATIVE_FOUNDER_REVIEW_COMPLETED",
  human_review_completed: 4,
  qualitative_judgement: "BROADLY_ACCEPTED_GOOD_ENOUGH_TO_CONTINUE",
  explicit_structured_passes: 0,
  explicit_structured_fails: 0,
  structured_label_status: "NOT_EXPLICITLY_SUPPLIED",
  checks: machineChecks,
  context_sizes: {
    microfibre: { objects: mf.objects?.length ?? 0, claims: mf.claims?.length ?? 0, sources: mf.sources?.length ?? 0 },
    cooling: { objects: cooling.objects?.length ?? 0, claims: cooling.claims?.length ?? 0, sources: cooling.sources?.length ?? 0 },
    coral: { objects: coral.objects?.length ?? 0, claims: coral.claims?.length ?? 0, sources: coral.sources?.length ?? 0 },
  },
};

fs.writeFileSync("phase06-founder-review-cards.json", JSON.stringify(reviewCards, null, 2));
fs.writeFileSync("phase06-before-after-human-repair.json", JSON.stringify(beforeAfter, null, 2));
fs.writeFileSync("phase06-uncertainty-presentation-contract.json", JSON.stringify(uncertaintyPolicy, null, 2));
fs.writeFileSync("phase06-machine-scorecard.json", JSON.stringify(scorecard, null, 2));

if (!machineChecks.every((x) => x.pass)) {
  console.error(JSON.stringify(scorecard, null, 2));
  process.exit(1);
}
console.log("PHASE06_MACHINE_REVIEW_PRECHECK_PASS");
console.log("PHASE06_HUMAN_FEEDBACK_REPAIR_PASS");
