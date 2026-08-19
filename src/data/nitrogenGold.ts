export type GoldReadiness = "DISCOVERED" | "SOURCE-CHECKED" | "FRONTIER" | "OPEN GAP";

export type NitrogenOption = {
  id: string;
  canonicalRef: string;
  label: string;
  type: "Solution pathway" | "Intervention" | "Innovation candidate" | "Open gap";
  readiness: GoldReadiness;
  mechanism: string;
  evidenceState: string;
  unknowns: string;
  actorNeed: string;
  capitalNeed: string;
  nextMove: string;
  sourceRef: string;
  sourceUrl?: string;
};

export const NITROGEN_GOLD = {
  caseId: "CASE-07",
  problemId: "4P-PROB-00021",
  title: "Agricultural nitrogen pollution",
  system: "FOOD_",
  valueChainStage: "Inputs → Production",
  problemFraming:
    "Excess nitrogen fertiliser and nutrient losses can create water, air and climate pressure. The Gold case treats intervention performance as highly context-dependent across crop, soil, weather, management and water vulnerability.",
  goldDirection:
    "Improve nitrogen-use efficiency + manure/fertiliser management + circular nutrient recovery while avoiding pollution shifting.",
  sourceRef: "SRC-0013",
  sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
  gaps: [
    {
      id: "4P-GAP-00013",
      type: "EVIDENCE",
      statement: "Nitrogen interventions vary by crop, soil, weather and baseline management.",
      assessment: "4PLANET_HYPOTHESIS",
    },
    {
      id: "4P-GAP-00014",
      type: "IMPLEMENTATION",
      statement: "Farm-level decision support and incentive structures can limit adoption of nutrient-efficiency measures.",
      assessment: "4PLANET_HYPOTHESIS",
    },
  ],
  options: [
    {
      id: "pathway",
      canonicalRef: "4P-SOL-000061",
      label: "REDUCE OR PREVENT NITROGEN LOSS",
      type: "Solution pathway",
      readiness: "DISCOVERED",
      mechanism: "Parent pathway for interventions intended to reduce excess nitrogen losses before downstream restoration is required.",
      evidenceState: "Pathway scaffold for retrieval; no universal effectiveness claim.",
      unknowns: "Which intervention mix is appropriate depends on local agronomy, baseline management and receiving-system vulnerability.",
      actorNeed: "Farmers · agronomists · advisers · buyers · public actors",
      capitalNeed: "Implementation finance · advisory capacity · procurement / incentive design",
      nextMove: "Choose a defined crop/place context and compare intervention mechanisms against baseline evidence.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
    {
      id: "precision",
      canonicalRef: "4P-SOL-000062",
      label: "PRECISION NUTRIENT MANAGEMENT",
      type: "Intervention",
      readiness: "DISCOVERED",
      mechanism: "Use crop need and soil data to improve the timing, placement and amount of nutrient application.",
      evidenceState: "Discovery-level internal record; source anchors the problem/solution domain rather than proving universal performance.",
      unknowns: "Local data quality, advisory capacity, equipment, farmer economics and context-specific outcome evidence.",
      actorNeed: "Farmer · adviser · data provider · equipment / software actor · verifier",
      capitalNeed: "Paid pilot · farm capex · advisory support · adoption incentive",
      nextMove: "Bind one real implementation to place, baseline, measured nutrient use, yield and loss indicators.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
    {
      id: "variable-rate",
      canonicalRef: "4P-SOL-000331",
      label: "VARIABLE-RATE NITROGEN APPLICATION",
      type: "Intervention",
      readiness: "SOURCE-CHECKED",
      mechanism: "Match nitrogen application spatially to crop and soil need; calibration, equipment and agronomy remain material.",
      evidenceState: "Source-checked internal deep-case candidate; context dependent and still unreviewed for public recommendation.",
      unknowns: "Transferability, economics, calibration quality, baseline management and rebound / displacement effects.",
      actorNeed: "Equipment provider · agronomist · farmer · data / sensing provider · verifier",
      capitalNeed: "Capex · paid pilot · equipment finance · adoption support",
      nextMove: "Connect a named implementation only after source-backed operator, place and measured result records exist.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
    {
      id: "inhibitors",
      canonicalRef: "4P-SOL-000332",
      label: "NITRIFICATION INHIBITORS",
      type: "Intervention",
      readiness: "SOURCE-CHECKED",
      mechanism: "Use input-management chemistry where agronomically justified to reduce selected nitrogen-loss pathways.",
      evidenceState: "Source-checked internal deep-case candidate; effectiveness is explicitly context dependent.",
      unknowns: "Soil, climate, crop, management, cost, side effects and lifecycle implications by context.",
      actorNeed: "Input producer · agronomist · farmer · researcher · verifier",
      capitalNeed: "Field trials · procurement · adoption / agronomy support",
      nextMove: "Build a place-specific evidence card before any comparative capital recommendation.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
    {
      id: "biofix",
      canonicalRef: "RAD-029 / 4P-SOL-000333",
      label: "BIOLOGICAL NITROGEN-FIXATION ENHANCEMENT",
      type: "Innovation candidate",
      readiness: "FRONTIER",
      mechanism: "Explore biological routes intended to reduce synthetic nitrogen demand, including established legume-system mechanisms and newer enhancement products.",
      evidenceState: "Innovation Radar marks enhancement products as a frontier candidate; commercial claims and active research exist, but independent field performance is a key unknown.",
      unknowns: "Consistency across crops and conditions, independent field performance, lifecycle benefit, agronomic fit and economics.",
      actorNeed: "Researcher · biological-input innovator · farmer · independent trial partner · verifier",
      capitalNeed: "R&D · independent field validation · pilot capital · later scale capital only after evidence strengthens",
      nextMove: "Separate established biological fixation practice from frontier enhancement products and require independent evidence for the latter.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
    {
      id: "open-gap",
      canonicalRef: "4P-GAP-00013 + 4P-GAP-00014",
      label: "CONTEXT-AWARE ADOPTION + EVIDENCE GAP",
      type: "Open gap",
      readiness: "OPEN GAP",
      mechanism: "The system needs decision support that can match intervention choice to local agronomy while also overcoming adoption and incentive constraints.",
      evidenceState: "Explicit 4PLANET hypothesis objects with source anchors and review-required status; not a claim that no solution exists globally.",
      unknowns: "Which capability, incentive structure or combination best closes the gap in a defined geography and farm system.",
      actorNeed: "Farmers · agronomists · behavioural / economics researchers · technology builders · buyers · public actors",
      capitalNeed: "Challenge grant · research / pilot capital · mission procurement · adoption-finance experimentation",
      nextMove: "Turn the gap into a falsifiable challenge brief with requirements, context, evidence threshold and prospective adopters.",
      sourceRef: "SRC-0013",
      sourceUrl: "https://www.fao.org/newsroom/detail/FAO-nitrogen-use-efficiency-report/",
    },
  ] satisfies NitrogenOption[],
} as const;
