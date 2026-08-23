export type EditorialStatus = "PRE_PUBLICATION" | "REPORTING_REQUIRED" | "EDITORIAL_REVIEW" | "PUBLIC";

export interface MagazineEditorialItem {
  id: string;
  order: number;
  format: string;
  title: string;
  summary: string;
  status: EditorialStatus;
  sourceState: string;
  rightsState: string;
  productBridgeState: string;
}

/**
 * M4GAZINE Founding Edition — WHAT HOLDS.
 * Pre-publication register derived from the current editorial master brief.
 * These are not public articles until the editorial/source/rights gates close.
 */
export const FOUNDING_EDITION = {
  editionId: "m4gazine-founding-01",
  workingTitle: "WHAT HOLDS",
  subtitle:
    "Stories about the relationships that keep living systems alive — and what happens when those relationships change.",
  status: "PRE_PUBLICATION" as const,
  responsibilityState: "OPEN — responsible editor / editorial lead must be designated before real publication",
  items: [
    {
      id: "a23a-bloom",
      order: 1,
      format: "VISUAL OPENING / RELATIONSHIP",
      title: "THE BLOOM AROUND A BREAKING ICEBERG",
      summary:
        "A visual science story about A-23A, chlorophyll-rich plumes seen from space and the discipline of keeping causal uncertainty visible.",
      status: "EDITORIAL_REVIEW",
      sourceState: "Strong primary-source base recorded in the editorial pack",
      rightsState: "Asset-specific final rights check required",
      productBridgeState: "Open",
    },
    {
      id: "humpbacks-places",
      order: 2,
      format: "SCIENCE / ANIMAL BEHAVIOUR",
      title: "THEY KEPT THEIR PLACES",
      summary:
        "Humpback whales hunting along the seafloor; measured coordination, stable relative positions and the boundary between documented cooperation and stronger interpretations.",
      status: "EDITORIAL_REVIEW",
      sourceState: "Strong primary-source base recorded in the editorial pack",
      rightsState: "Recorded CC BY source; final asset credit / modification check required",
      productBridgeState: "Open",
    },
    {
      id: "oslofjord-nitrogen",
      order: 3,
      format: "INVESTIGATION / LOCAL SYSTEM",
      title: "OSLOFJORDEN: WHERE THE NITROGEN COMES FROM",
      summary:
        "A source-led investigation into agricultural and wastewater nitrogen loads, modelled reduction pathways and why a modelled reduction is not the same as ecological recovery.",
      status: "REPORTING_REQUIRED",
      sourceState: "Editorial source-pack assembly and local/expert reporting required",
      rightsState: "Open",
      productBridgeState: "Open",
    },
    {
      id: "urchin-paradox",
      order: 4,
      format: "SOLUTIONS / RESTORATION",
      title: "ADD THEM HERE. REMOVE THEM THERE.",
      summary:
        "The sea-urchin paradox: why one ecosystem can need a grazer restored while another needs grazing pressure reduced — and why intervention is not proof of recovery.",
      status: "EDITORIAL_REVIEW",
      sourceState: "Strong source base recorded in the editorial pack",
      rightsState: "Final asset/source credit check required",
      productBridgeState: "Open",
    },
    {
      id: "oslofjord-human-slot",
      order: 5,
      format: "FIELD STORY / PEOPLE + PLACE",
      title: "OSLOFJORDEN FIELD NOTE — HUMAN SLOT",
      summary:
        "An original reported piece following one real person working with, studying or depending on the fjord, connecting system-level data to lived reality.",
      status: "REPORTING_REQUIRED",
      sourceState: "Empty by design — a real person and original reporting are required",
      rightsState: "Open",
      productBridgeState: "Open",
    },
    {
      id: "simple-solutions",
      order: 6,
      format: "CULTURE / ESSAY",
      title: "THE PROBLEM WITH SIMPLE SOLUTIONS",
      summary:
        "An editorial essay about why environmental stories repeatedly collapse complex systems into one villain, one hero or one technology — and what disappears when context is removed.",
      status: "PRE_PUBLICATION",
      sourceState: "Internal commission concept; author not assigned",
      rightsState: "Open",
      productBridgeState: "Not required",
    },
    {
      id: "read-living-system",
      order: 7,
      format: "VISUAL / DATA / EXPLANATION",
      title: "HOW TO READ A LIVING SYSTEM",
      summary:
        "A visual explainer distinguishing observation, relationship, pressure, model, interpretation and outcome through selected 4PLANET intelligence objects.",
      status: "PRE_PUBLICATION",
      sourceState: "Depends on exact public source objects; product UI is not editorial evidence",
      rightsState: "Open",
      productBridgeState: "Required",
    },
    {
      id: "transparency-desk",
      order: 8,
      format: "TRANSPARENCY / CORRECTIONS DESK",
      title: "WHAT WE KNOW. WHAT WE DON’T. WHAT CHANGED.",
      summary:
        "A compact source, correction and uncertainty ledger showing material sources, rights states, corrections and unresolved questions behind the edition.",
      status: "PRE_PUBLICATION",
      sourceState: "Architecture ready; populated only from release-cleared pieces",
      rightsState: "Not applicable",
      productBridgeState: "Transparency layer",
    },
  ] satisfies MagazineEditorialItem[],
};

export const MAGAZINE_EDITORIAL_PRINCIPLES = [
  "Editorial judgement is separate from commercial, partnership and fundraising judgement.",
  "Funding never purchases favourable coverage, factual conclusions, story approval or suppression of material criticism.",
  "Material factual claims require traceable sources; important uncertainty and limitations remain visible.",
  "Commercial 4PLANET content, sponsor content and M4GAZINE editorial content must be visibly distinguishable.",
  "Corrections and material conflicts are disclosed openly.",
  "4PLANET tools may support reporting and visualisation, but the tools are not evidence by themselves.",
] as const;

export const MAGAZINE_SOURCE_WORKFLOW = [
  "SOURCE PACK",
  "CLAIM MAP",
  "RIGHTS / ASSET RECORD",
  "EDITORIAL DRAFT",
  "FACT / CERTAINTY CHECK",
  "CONFLICT / DISCLOSURE CHECK",
  "RESPONSIBLE EDITOR ACCEPTANCE",
  "PUBLIC VERSION",
  "CORRECTION LOG",
] as const;
