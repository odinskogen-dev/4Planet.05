import type { EvidenceBlock, TruthSource } from "@/data/truthSpine";

export type CompanyActorState = "RESOLVED" | "ACTOR_ID_UNRESOLVED";
export type CompanyClaimState = "SOURCE_BACKED" | "COMPANY_REPORTED" | "UNKNOWN";
export type CompanyLoopState = "OBSERVED" | "HYPOTHESIS" | "UNKNOWN";

export type CompanyClaim = {
  id: string;
  statement: string;
  state: CompanyClaimState;
  sourceIds: string[];
  limitation: string;
};

export type CompanyActionRecord = {
  id: string;
  statement: string;
  sourceIds: string[];
  state: "COMPANY_REPORTED" | "SOURCE_BACKED";
  outcomeState: CompanyLoopState;
  outcome: string;
  causalityNote: string;
};

export type CompanyIntelligenceProjection = {
  slug: string;
  actorId?: string;
  actorState: CompanyActorState;
  name: string;
  actorType: "COMPANY";
  role: string;
  proofDomain: "FOOD" | "FOOD_VALUE_CHAIN";
  productGtins: string[];
  sourceIds: string[];
  claims: CompanyClaim[];
  evidence: EvidenceBlock[];
  unknowns: string[];
  leveragePoints: string[];
  action?: CompanyActionRecord;
  choiceSignalRule: string;
  marketIncentiveState: "HYPOTHESIS_ONLY";
};

/**
 * COMPANY PROOF 01 is a read-only projection for testing Company Intelligence.
 * Company remains an Actor. This file must not mint canonical Actor IDs or become
 * a second Company database. Unresolved identities stay unresolved until the
 * canonical Actor Master reconciles them.
 */
export const COMPANY_PROOF_SOURCES: TruthSource[] = [
  {
    id: "SRC-TINE-PRODUCT-5565",
    label: "TINE product catalogue — TINE Yoghurt Naturell 500 g / GTIN 7038010055652",
    provider: "TINE",
    sourceType: "PRIMARY_COMPANY_PRODUCT",
    url: "https://webfiles.tine.no/TSDK/tine-produktkatalog-2021.pdf",
  },
  {
    id: "SRC-TINE-ANNUAL-2025",
    label: "TINE Group annual report 2025 — reporting index",
    provider: "TINE",
    sourceType: "PRIMARY_COMPANY_REPORT",
    url: "https://www.tine.no/om-tine/finansiell-informasjon",
  },
  {
    id: "SRC-TINE-CLIMATE-ADVICE-2026",
    label: "TINE invests NOK 27 million in farm climate advice — 9 June 2026",
    provider: "TINE",
    sourceType: "PRIMARY_COMPANY_ACTION",
    url: "https://medlem.tine.no/aktuelt-fra-tine/tine-investerer-27-millioner-i-klimaradgiving",
  },
  {
    id: "SRC-TINE-TRANSITION-2026",
    label: "TINE Group transition plan 2026",
    provider: "TINE",
    sourceType: "PRIMARY_COMPANY_TRANSITION_PLAN",
    url: "https://www.tine.no/b%C3%A6rekraft/baerekraftstrategi/_/attachment/inline/48d344c0-a76d-46ca-881c-cfb94f2f7aee%3A89fc830c7bc7d8b6dd2a2987d460c7c615596cb5/TINE%20Gruppas%20omstillingsplan%202026.pdf",
  },
  {
    id: "SRC-OATLY-SUSTAINABILITY-2025",
    label: "Oatly sustainability reporting 2025",
    provider: "Oatly Group AB",
    sourceType: "PRIMARY_COMPANY_REPORT",
    url: "https://www.oatly.com/sustainability",
  },
  {
    id: "SRC-ORKLA-ANNUAL-2025",
    label: "Orkla Annual Report 2025",
    provider: "Orkla ASA",
    sourceType: "PRIMARY_COMPANY_REPORT",
    url: "https://www.orkla.com/about-us/annualreport/",
  },
  {
    id: "SRC-MOWI-ANNUAL-2025",
    label: "Mowi Annual Report 2025",
    provider: "Mowi ASA",
    sourceType: "PRIMARY_COMPANY_REPORT",
    url: "https://mowi.com/investors/reports/",
  },
  {
    id: "SRC-YARA-ANNUAL-2025",
    label: "Yara Annual Report 2025",
    provider: "Yara International ASA",
    sourceType: "PRIMARY_COMPANY_REPORT",
    url: "https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2025/yara-annual-report-2025.pdf",
  },
];

export const COMPANY_PROOF_PROJECTIONS: CompanyIntelligenceProjection[] = [
  {
    slug: "tine",
    actorState: "ACTOR_ID_UNRESOLVED",
    name: "TINE SA",
    actorType: "COMPANY",
    role: "Dairy cooperative, processor and consumer-brand operator",
    proofDomain: "FOOD",
    productGtins: ["7038010055652"],
    sourceIds: ["SRC-TINE-PRODUCT-5565", "SRC-TINE-ANNUAL-2025", "SRC-TINE-CLIMATE-ADVICE-2026", "SRC-TINE-TRANSITION-2026"],
    claims: [
      {
        id: "CLAIM-TINE-PRODUCT-5565",
        statement: "GTIN 7038010055652 maps to TINE Yoghurt Naturell 500 g in TINE's own product catalogue.",
        state: "SOURCE_BACKED",
        sourceIds: ["SRC-TINE-PRODUCT-5565"],
        limitation: "The catalogue source is from 2021; the current TINE site still lists the 500 g product, but the GTIN should be rechecked if packaging changes.",
      },
      {
        id: "CLAIM-TINE-FARM-LEVER",
        statement: "TINE's transition plan treats farm-level milk production as a material climate leverage point and describes feeding, breeding/animal health, manure, energy and soil measures.",
        state: "COMPANY_REPORTED",
        sourceIds: ["SRC-TINE-TRANSITION-2026"],
        limitation: "This is TINE's own transition plan. Estimated reductions and future targets are not treated as achieved outcomes.",
      },
      {
        id: "CLAIM-TINE-CLIMATE-PLAN-BASELINE",
        statement: "TINE reported in June 2026 that 33% of its milk farmers had a climate plan and set a goal for all TINE farmers to have one by the end of 2027.",
        state: "COMPANY_REPORTED",
        sourceIds: ["SRC-TINE-CLIMATE-ADVICE-2026"],
        limitation: "A climate plan is an activity/readiness indicator, not proof of a quantified emissions outcome.",
      },
    ],
    evidence: [
      { summary: "Exact product identity is source-backed through TINE's product catalogue.", confidence: "HIGH", sourceIds: ["SRC-TINE-PRODUCT-5565"] },
      { summary: "Company-level transition and action evidence is first-party and therefore useful but not independent verification of impact.", confidence: "MEDIUM", sourceIds: ["SRC-TINE-CLIMATE-ADVICE-2026", "SRC-TINE-TRANSITION-2026"] },
    ],
    unknowns: [
      "No verified product-specific lifecycle footprint is attached to GTIN 7038010055652 in this proof.",
      "No causal link is established between one 4SAPIEN choice signal and TINE's corporate actions.",
      "Independent verification of claimed transition effects has not been assembled for this proof.",
      "Canonical Actor Master ID is not yet resolved for TINE SA.",
    ],
    leveragePoints: ["Farm methane and feed", "Animal health and breeding", "Manure management", "Farm energy", "Soil carbon", "Consumer product demand"],
    action: {
      id: "ACTION-TINE-CLIMATE-ADVICE-2026",
      statement: "TINE announced NOK 27 million for expanded climate advice and a 4 øre/litre milk payment for producers with an approved climate plan.",
      sourceIds: ["SRC-TINE-CLIMATE-ADVICE-2026"],
      state: "COMPANY_REPORTED",
      outcomeState: "UNKNOWN",
      outcome: "The action is observable as an announced programme. A resulting farm-level emissions outcome is not yet established in this proof.",
      causalityNote: "This company action predates this proof and must never be represented as caused by 4SAPIEN demand signals.",
    },
    choiceSignalRule: "A user selecting or rejecting a product may create a bounded internal choice signal only after consented analytics. One or a few signals must never be presented as market demand.",
    marketIncentiveState: "HYPOTHESIS_ONLY",
  },
  {
    slug: "oatly",
    actorState: "ACTOR_ID_UNRESOLVED",
    name: "Oatly Group AB",
    actorType: "COMPANY",
    role: "Oat-based food and beverage company",
    proofDomain: "FOOD",
    productGtins: [],
    sourceIds: ["SRC-OATLY-SUSTAINABILITY-2025"],
    claims: [{ id: "CLAIM-OATLY-REPORTING", statement: "Oatly publishes a 2025 sustainability report and product/climate claims with disclosed methodology references.", state: "COMPANY_REPORTED", sourceIds: ["SRC-OATLY-SUSTAINABILITY-2025"], limitation: "Avoided-emissions figures are company-reported estimates, not independent proof that a specific purchase caused an avoided emission." }],
    evidence: [{ summary: "Current first-party sustainability reporting is available and can support a source-aware company profile.", confidence: "MEDIUM", sourceIds: ["SRC-OATLY-SUSTAINABILITY-2025"] }],
    unknowns: ["No Oatly GTIN is bound to the FOOD proof yet.", "Independent validation of company-reported avoided-emissions estimates is not assembled here.", "Canonical Actor Master ID is unresolved."],
    leveragePoints: ["Raw-material sourcing", "Product substitution", "Manufacturing", "Packaging", "Consumer demand"],
    choiceSignalRule: "Alternative eligibility requires comparable product evidence; plant-based positioning alone is not a ranking shortcut.",
    marketIncentiveState: "HYPOTHESIS_ONLY",
  },
  {
    slug: "orkla",
    actorState: "ACTOR_ID_UNRESOLVED",
    name: "Orkla ASA",
    actorType: "COMPANY",
    role: "Consumer-oriented investment and branded-goods company",
    proofDomain: "FOOD",
    productGtins: [],
    sourceIds: ["SRC-ORKLA-ANNUAL-2025"],
    claims: [{ id: "CLAIM-ORKLA-2025", statement: "Orkla's 2025 annual report includes group sustainability metrics and 2030 targets alongside financial reporting.", state: "COMPANY_REPORTED", sourceIds: ["SRC-ORKLA-ANNUAL-2025"], limitation: "Group metrics cannot be silently inherited by every individual brand or product." }],
    evidence: [{ summary: "Current audited/corporate reporting provides a strong group-level evidence source, but product-level transfer requires separate evidence.", confidence: "MEDIUM", sourceIds: ["SRC-ORKLA-ANNUAL-2025"] }],
    unknowns: ["No individual Orkla product is connected to this proof yet.", "Product-level impact cannot be inferred from group-level targets.", "Canonical Actor Master ID is unresolved."],
    leveragePoints: ["Portfolio governance", "Ingredients and sourcing", "Packaging", "Brand demand", "Supplier requirements"],
    choiceSignalRule: "Group ownership may resolve identity, but recommendations must use evidence at the product/value-chain level appropriate to the claim.",
    marketIncentiveState: "HYPOTHESIS_ONLY",
  },
  {
    slug: "mowi",
    actorState: "ACTOR_ID_UNRESOLVED",
    name: "Mowi ASA",
    actorType: "COMPANY",
    role: "Integrated salmon farming and seafood company",
    proofDomain: "FOOD_VALUE_CHAIN",
    productGtins: [],
    sourceIds: ["SRC-MOWI-ANNUAL-2025"],
    claims: [{ id: "CLAIM-MOWI-FEED", statement: "Mowi reports feed as a major scope-3 emissions source and reports using lower-GHG feed raw materials as a procurement lever.", state: "COMPANY_REPORTED", sourceIds: ["SRC-MOWI-ANNUAL-2025"], limitation: "This is company-reported value-chain accounting; ecological and biodiversity outcomes require separate evidence." }],
    evidence: [{ summary: "The annual report gives unusually useful value-chain structure and quantified emissions context for testing upstream dependency intelligence.", confidence: "MEDIUM", sourceIds: ["SRC-MOWI-ANNUAL-2025"] }],
    unknowns: ["No Mowi product GTIN is connected to the consumer proof.", "Biodiversity outcomes cannot be inferred from GHG accounting.", "Canonical Actor Master ID is unresolved."],
    leveragePoints: ["Feed raw materials", "Farming operations", "Transport", "Energy", "Aquatic ecosystem interactions"],
    choiceSignalRule: "Climate, animal-health, ecosystem and price evidence remain separate axes unless a justified decision rule combines them.",
    marketIncentiveState: "HYPOTHESIS_ONLY",
  },
  {
    slug: "yara",
    actorState: "ACTOR_ID_UNRESOLVED",
    name: "Yara International ASA",
    actorType: "COMPANY",
    role: "Crop-nutrition and nitrogen-fertiliser company upstream of food systems",
    proofDomain: "FOOD_VALUE_CHAIN",
    productGtins: [],
    sourceIds: ["SRC-YARA-ANNUAL-2025"],
    claims: [{ id: "CLAIM-YARA-VALUE-CHAIN", statement: "Yara's 2025 annual report quantifies operational and value-chain emissions and identifies both ammonia production and fertiliser use as major emissions sources.", state: "COMPANY_REPORTED", sourceIds: ["SRC-YARA-ANNUAL-2025"], limitation: "Company-level emissions do not establish the footprint of a specific food product without traceable supplier and application data." }],
    evidence: [{ summary: "Yara provides quantified upstream and downstream emissions context useful for mapping food-system dependencies and intervention points.", confidence: "MEDIUM", sourceIds: ["SRC-YARA-ANNUAL-2025"] }],
    unknowns: ["No trace from the TINE yoghurt product to Yara fertiliser is established.", "No product-level causal allocation is permitted without supplier evidence.", "Canonical Actor Master ID is unresolved."],
    leveragePoints: ["Ammonia production", "Natural-gas feedstock", "Fertiliser efficiency", "Soil N2O", "Low-carbon fertiliser innovation"],
    choiceSignalRule: "Upstream actor relevance must be traceable. A generic food-category relation is not enough to attach Yara to a specific product.",
    marketIncentiveState: "HYPOTHESIS_ONLY",
  },
];

export function companyProofBySlug(slug?: string) {
  return COMPANY_PROOF_PROJECTIONS.find((company) => company.slug === slug);
}

export function companyProofForProduct(gtin?: string, brand?: string) {
  const normalizedBrand = (brand ?? "").trim().toLowerCase();
  return COMPANY_PROOF_PROJECTIONS.find((company) => company.productGtins.includes(gtin ?? ""))
    ?? COMPANY_PROOF_PROJECTIONS.find((company) => normalizedBrand && normalizedBrand.includes(company.slug));
}

export function companyProofSource(id: string) {
  return COMPANY_PROOF_SOURCES.find((source) => source.id === id);
}
