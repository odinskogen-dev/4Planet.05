import type { InterpretationRecord, ProductContext, SourceRecord } from "@/data/truthSpine";

const retrievedAt = "2026-09-14T19:20:00Z";

export const TONYS_PRODUCT_SOURCE: SourceRecord = {
  recordType: "SOURCE_RECORD",
  id: "source-record:tonys:milk-chocolate-32-180g:2026-09-14",
  sourceId: "tonys-product",
  sourceAuthority: "Tony's Chocolonely UK",
  sourceRecordId: "milk-chocolate-32-180g",
  sourceUrl: "https://uk.tonyschocolonely.com/products/milk-chocolate-32-180g",
  retrievedAt,
  licence: "SOURCE TERMS / REFERENCE ONLY",
  attribution: "Tony's Chocolonely — milk chocolate bar 32%, 180g",
  rightsStatus: "CONDITIONAL",
  visibility: "INTERNAL",
  payload: {
    companyEntityId: "company:tonys-chocolonely",
    productEntityId: "product:tonys:milk-chocolate-32-180g",
    productName: "Milk Chocolate 32%",
    massG: 180,
    ean: "8717677339914",
    materials: [
      "material:sugar",
      "material:dried-whole-milk",
      "material:cocoa-butter",
      "material:cocoa-mass",
      "material:soy-lecithin",
    ],
    fairtradeStatement: "Fairtrade cocoa and sugar; sugar with mass balance; total 76%.",
    cocoaTraceabilityClaim: "100% traceable beans",
  },
};

export const TONYS_IMPACT_SOURCE: SourceRecord = {
  recordType: "SOURCE_RECORD",
  id: "source-record:tonys:impact:2026-09-14",
  sourceId: "tonys-impact",
  sourceAuthority: "Tony's Chocolonely Global",
  sourceRecordId: "tonys-impact",
  sourceUrl: "https://tonyschocolonely.com/pages/tonys-impact",
  retrievedAt,
  licence: "SOURCE TERMS / REFERENCE ONLY",
  attribution: "Tony's Chocolonely — Tony's Impact",
  rightsStatus: "CONDITIONAL",
  visibility: "INTERNAL",
  payload: {
    companyEntityId: "company:tonys-chocolonely",
    cocoaScope: ["material:cocoa-mass", "material:cocoa-butter"],
    companyLevelOriginCountries: ["Ghana", "Côte d'Ivoire"],
    statement: "All beans used for cocoa mass and cocoa butter are described by Tony's as 100% traceable and purchased directly from partner cooperatives in Ghana and Côte d'Ivoire.",
    productSpecificCooperative: null,
    productSpecificFarm: null,
  },
};

export const TONYS_BEANTRACKER_SOURCE: SourceRecord = {
  recordType: "SOURCE_RECORD",
  id: "source-record:tonys:beantracker:2026-09-14",
  sourceId: "tonys-beantracker",
  sourceAuthority: "Tony's Chocolonely Global",
  sourceRecordId: "bean-tracker",
  sourceUrl: "https://jp.tonyschocolonely.com/en/pages/bean-tracker",
  retrievedAt,
  licence: "SOURCE TERMS / REFERENCE ONLY",
  attribution: "Tony's Chocolonely — BeanTracker",
  rightsStatus: "CONDITIONAL",
  visibility: "INTERNAL",
  payload: {
    companyEntityId: "company:tonys-chocolonely",
    cocoaMassTraceableSince: 2012,
    cocoaButterTraceableSince: 2016,
    flowScope: "cooperative to chocolate production",
    productSpecificContainerOrBatch: null,
  },
};

export const TONYS_COMPANY_CONTEXT: ProductContext = {
  id: "product-context:4p:company:tonys-chocolonely:v1",
  entityId: "company:tonys-chocolonely",
  journeyId: "company-gold-tonys",
  sourceRecordIds: [TONYS_PRODUCT_SOURCE.id, TONYS_IMPACT_SOURCE.id, TONYS_BEANTRACKER_SOURCE.id],
  observationIds: [],
  signalIds: [],
  interpretationIds: [],
  persistedBy: "BUNDLED_FIXTURE",
  persistedAt: retrievedAt,
  disclosure: "Internal Company Gold fixture. Company-level traceability evidence must not be sharpened into a product-specific farm, cooperative, batch or ecological-outcome claim.",
};

export const TONYS_PRODUCT_CONTEXT: ProductContext = {
  id: "product-context:4p:product:tonys:milk-chocolate-32-180g:v1",
  entityId: "product:tonys:milk-chocolate-32-180g",
  journeyId: "company-gold-tonys",
  sourceRecordIds: [TONYS_PRODUCT_SOURCE.id],
  observationIds: [],
  signalIds: [],
  interpretationIds: [],
  persistedBy: "BUNDLED_FIXTURE",
  persistedAt: retrievedAt,
  disclosure: "Internal product identity and ingredient evidence from Tony's own product page. EAN 8717677339914.",
};

export const TONYS_MATERIAL_CONTEXTS: ProductContext[] = [
  ["material:sugar", "Sugar"],
  ["material:dried-whole-milk", "Dried whole milk"],
  ["material:cocoa-butter", "Cocoa butter"],
  ["material:cocoa-mass", "Cocoa mass"],
  ["material:soy-lecithin", "Soy lecithin"],
].map(([entityId, label]) => ({
  id: `product-context:4p:${entityId}:v1`,
  entityId,
  journeyId: "company-gold-tonys",
  sourceRecordIds: [TONYS_PRODUCT_SOURCE.id],
  observationIds: [],
  signalIds: [],
  interpretationIds: [],
  persistedBy: "BUNDLED_FIXTURE" as const,
  persistedAt: retrievedAt,
  disclosure: `${label} is present in the product ingredient list. Supplier, farm and origin are UNKNOWN unless separately source-supported.`,
}));

export const TONYS_RELATIONSHIPS: InterpretationRecord[] = [
  {
    recordType: "INTERPRETATION",
    id: "interpretation:4p:tonys-product-materials:v1",
    aboutRecordIds: [TONYS_PRODUCT_SOURCE.id],
    text: "The Milk Chocolate 32% 180g product contains sugar, dried whole milk, cocoa butter, cocoa mass and soy lecithin according to Tony's product page.",
    status: "SOURCE_STATEMENT",
    reviewStatus: "LITERATURE_CHECKED",
    evidenceStrength: "STRONG",
    limitations: ["Ingredient presence does not establish ingredient supplier, farm, country of origin or ecological outcome."],
    visibility: "INTERNAL",
  },
  {
    recordType: "INTERPRETATION",
    id: "interpretation:4p:tonys-company-cocoa-traceability:v1",
    aboutRecordIds: [TONYS_IMPACT_SOURCE.id, TONYS_BEANTRACKER_SOURCE.id],
    text: "At company level, Tony's states that cocoa used for cocoa mass and cocoa butter is traceable through its BeanTracker system and purchased from partner cooperatives in Ghana and Côte d'Ivoire.",
    status: "PRODUCT_CONTEXT",
    reviewStatus: "LITERATURE_CHECKED",
    evidenceStrength: "STRONG",
    limitations: [
      "This does not identify the cooperative, farm, container or batch used in this specific retail bar.",
      "Company-level origin evidence must not be converted into a precise product-level location claim.",
    ],
    visibility: "INTERNAL",
  },
  {
    recordType: "INTERPRETATION",
    id: "interpretation:4p:tonys-company-gold-unknowns:v1",
    aboutRecordIds: [TONYS_PRODUCT_SOURCE.id, TONYS_IMPACT_SOURCE.id, TONYS_BEANTRACKER_SOURCE.id],
    text: "UNKNOWN: exact cooperative/farm/batch for this retail bar; origin or supplier of milk, soy lecithin and mass-balance sugar; exact farm coordinates; product-specific ecosystem/species impacts; product-specific water/land quantities; outcome attribution.",
    status: "PRODUCT_CONTEXT",
    reviewStatus: "LITERATURE_CHECKED",
    evidenceStrength: "INSUFFICIENT",
    limitations: ["UNKNOWN is a valid terminal evidence state until a source resolves the specific field."],
    visibility: "INTERNAL",
  },
  {
    recordType: "INTERPRETATION",
    id: "interpretation:4p:tonys-company-gold-decision:v1",
    aboutRecordIds: [TONYS_PRODUCT_SOURCE.id, TONYS_IMPACT_SOURCE.id, TONYS_BEANTRACKER_SOURCE.id],
    text: "Next evidence decision: resolve product-level origin granularity before making any location-specific nature claim for this bar.",
    status: "PRODUCT_CONTEXT",
    reviewStatus: "LITERATURE_CHECKED",
    evidenceStrength: "MODERATE",
    limitations: ["This is an evidence-priority decision, not an ecological impact finding or business recommendation."],
    visibility: "INTERNAL",
  },
];

export const TONYS_COMPANY_GOLD = {
  sources: [TONYS_PRODUCT_SOURCE, TONYS_IMPACT_SOURCE, TONYS_BEANTRACKER_SOURCE],
  contexts: [TONYS_COMPANY_CONTEXT, TONYS_PRODUCT_CONTEXT, ...TONYS_MATERIAL_CONTEXTS],
  relationships: TONYS_RELATIONSHIPS,
  unknowns: TONYS_RELATIONSHIPS[2],
  decision: TONYS_RELATIONSHIPS[3],
} as const;
