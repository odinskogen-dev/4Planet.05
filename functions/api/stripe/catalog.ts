export type PaymentEnvironment = "TEST" | "LIVE";
export type CheckoutMode = "payment" | "subscription";
export type CommerceChannel = "checkout" | "invoice";

export type ProductKind =
  | "IMPACT_CONTRIBUTION"
  | "SUPPORT"
  | "FOUNDING_PATRON"
  | "MEMBERSHIP"
  | "MISSION_SUPPORTER"
  | "SPONSOR_PACKAGE"
  | "PROJECT_SPONSOR"
  | "MISSION_SPONSOR"
  | "B2B_FUNDING_OBJECT";

export type ProductFamily = "IMPACT" | "SUPPORT" | "PATRON" | "MEMBERSHIP" | "MISSION_SUPPORT" | "SPONSOR" | "B2B";

export type ProductKey =
  | "impact_tree"
  | "impact_plastic"
  | "impact_coral"
  | "impact_rewild"
  | "support_4planet"
  | "founding_patron"
  | "membership_supporter"
  | "sponsor_package"
  | "project_sponsor"
  | "mission_sponsor"
  | "b2b_pilot_funder"
  | "mission_supporter_cle4n"
  | "mission_supporter_wh4les"
  | "mission_supporter_cor4l"
  | "mission_supporter_rewild_marine"
  | "mission_supporter_clim4te"
  | "mission_supporter_am4zonia"
  | "mission_supporter_species"
  | "mission_supporter_rewild_land"
  | "mission_supporter_food"
  | "mission_supporter_en4rgy"
  | "mission_supporter_circular_city"
  | "mission_supporter_f4shion"
  | "mission_supporter_m4gazine"
  | "mission_supporter_4rt"
  | "mission_supporter_4film"
  | "mission_supporter_4play";

export interface StripeEnv {
  [key: string]: string | undefined;
  STRIPE_PAYMENT_ENV?: string;
  STRIPE_TEST_SECRET_KEY?: string;
  STRIPE_LIVE_SECRET_KEY?: string;
  STRIPE_CHECKOUT_TEST_ENABLED?: string;
  STRIPE_CHECKOUT_LIVE_ENABLED?: string;
  STRIPE_LIVE_RELEASE_APPROVED?: string;
  STRIPE_WEBHOOK_SECRET_TEST?: string;
  STRIPE_WEBHOOK_SECRET_LIVE?: string;
  STRIPE_INTERNAL_BILLING_TOKEN?: string;
  STRIPE_INVOICE_TEST_ENABLED?: string;
  STRIPE_INVOICE_LIVE_ENABLED?: string;
  STRIPE_PORTAL_TEST_ENABLED?: string;
  STRIPE_PORTAL_LIVE_ENABLED?: string;
}

export interface CatalogEntry {
  key: ProductKey;
  kind: ProductKind;
  family: ProductFamily;
  channel: CommerceChannel;
  mode: CheckoutMode;
  testPriceId: string | null;
  livePriceId: string | null;
  liveEnabled: boolean;
  minQuantity: number;
  maxQuantityPerCheckout: number;
  returnPath: string;
  action?: string;
  mission?: string;
  missionSlug?: string;
  negotiatedMinNok?: number;
  negotiatedMaxNok?: number;
  taxDeductibleClaim: false;
}

const checkout = (
  key: ProductKey,
  kind: ProductKind,
  family: ProductFamily,
  mode: CheckoutMode,
  testPriceId: string,
  livePriceId: string,
  extras: Partial<Pick<CatalogEntry, "action" | "mission" | "missionSlug" | "maxQuantityPerCheckout">> = {},
): CatalogEntry => ({
  key,
  kind,
  family,
  channel: "checkout",
  mode,
  testPriceId,
  livePriceId,
  liveEnabled: true,
  minQuantity: 1,
  maxQuantityPerCheckout: extras.maxQuantityPerCheckout ?? 1,
  returnPath: "/checkout/return",
  action: extras.action,
  mission: extras.mission,
  missionSlug: extras.missionSlug,
  taxDeductibleClaim: false,
});

const negotiated = (
  key: ProductKey,
  kind: ProductKind,
  family: ProductFamily,
  minNok: number,
  maxNok: number,
): CatalogEntry => ({
  key,
  kind,
  family,
  channel: "invoice",
  mode: "payment",
  testPriceId: null,
  livePriceId: null,
  liveEnabled: true,
  minQuantity: 1,
  maxQuantityPerCheckout: 1,
  returnPath: "/checkout/return",
  negotiatedMinNok: minNok,
  negotiatedMaxNok: maxNok,
  taxDeductibleClaim: false,
});

export const CATALOG: Record<ProductKey, CatalogEntry> = {
  // Public LIVE IMPACT contribution paths. These are pathway contributions, not fulfilled ecological units.
  // Payment remains separate from partner allocation, delivery, evidence and outcome.
  impact_tree: checkout("impact_tree", "IMPACT_CONTRIBUTION", "IMPACT", "payment", "price_1U7w9lBIIif9wShMBdiJkElA", "price_1U85DSPd4O2xtXFRP0mtFTRw", { action: "tree-pathway", mission: "CLIM4TE_", missionSlug: "clim4te", maxQuantityPerCheckout: 20 }),
  impact_plastic: checkout("impact_plastic", "IMPACT_CONTRIBUTION", "IMPACT", "payment", "price_1U7w9uBIIif9wShMkSYviyab", "price_1U85DbPd4O2xtXFRgkhyKfXe", { action: "plastic-pathway", mission: "CLE4N_", missionSlug: "cle4n", maxQuantityPerCheckout: 20 }),
  impact_coral: checkout("impact_coral", "IMPACT_CONTRIBUTION", "IMPACT", "payment", "price_1U7wA2BIIif9wShMG7qg2s65", "price_1U85DlPd4O2xtXFRgsxxhMcy", { action: "coral-pathway", mission: "COR4L_", missionSlug: "cor4l", maxQuantityPerCheckout: 20 }),
  impact_rewild: checkout("impact_rewild", "IMPACT_CONTRIBUTION", "IMPACT", "payment", "price_1U7wABBIIif9wShMA2EXSeqQ", "price_1U85DvPd4O2xtXFRcqBEq2EH", { action: "rewild-pathway", mission: "RE:WILD_ Land", missionSlug: "rewild-land", maxQuantityPerCheckout: 20 }),

  support_4planet: checkout("support_4planet", "SUPPORT", "SUPPORT", "subscription", "price_1U84dzBIIif9wShM0aP4dCJD", "price_1U84WtPd4O2xtXFRU60ePdoZ"),
  membership_supporter: checkout("membership_supporter", "MEMBERSHIP", "MEMBERSHIP", "subscription", "price_1U7wGQBIIif9wShM2RckyATg", "price_1U85CxPd4O2xtXFR8VpbdqHk"),

  mission_supporter_cle4n: checkout("mission_supporter_cle4n", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQXBIIif9wShMbs2whL1v", "price_1U84X1Pd4O2xtXFRU92oXY75", { mission: "CLE4N_", missionSlug: "cle4n" }),
  mission_supporter_wh4les: checkout("mission_supporter_wh4les", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQiBIIif9wShM5UAxHWyR", "price_1U84X9Pd4O2xtXFRJB13EXTC", { mission: "WH4LES_", missionSlug: "wh4les" }),
  mission_supporter_cor4l: checkout("mission_supporter_cor4l", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQuBIIif9wShMwOMDwgl0", "price_1U84XHPd4O2xtXFRKHhsezW7", { mission: "COR4L_", missionSlug: "cor4l" }),
  mission_supporter_rewild_marine: checkout("mission_supporter_rewild_marine", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yR3BIIif9wShMXtZ5cn8l", "price_1U84XOPd4O2xtXFRi5nptElC", { mission: "RE:WILD_ Marine", missionSlug: "rewild-marine" }),
  mission_supporter_clim4te: checkout("mission_supporter_clim4te", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yREBIIif9wShMrpAMXTAC", "price_1U84XXPd4O2xtXFRTNXyT1GR", { mission: "CLIM4TE_", missionSlug: "clim4te" }),
  mission_supporter_am4zonia: checkout("mission_supporter_am4zonia", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRQBIIif9wShMJgNmPsSS", "price_1U84XhPd4O2xtXFRgXgQsHMp", { mission: "AM4ZONIA_", missionSlug: "am4zonia" }),
  mission_supporter_species: checkout("mission_supporter_species", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRbBIIif9wShMn1K9fGvy", "price_1U84XpPd4O2xtXFRRJqxLPQk", { mission: "SPECIES_", missionSlug: "species" }),
  mission_supporter_rewild_land: checkout("mission_supporter_rewild_land", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRrBIIif9wShMJmXUD484", "price_1U84XxPd4O2xtXFRU4Sp5Ucz", { mission: "RE:WILD_ Land", missionSlug: "rewild-land" }),
  mission_supporter_food: checkout("mission_supporter_food", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRzBIIif9wShMOcMVnTdF", "price_1U84Y5Pd4O2xtXFRAgEC3H96", { mission: "FOOD_", missionSlug: "food" }),
  mission_supporter_en4rgy: checkout("mission_supporter_en4rgy", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yS9BIIif9wShMsYCQyW8D", "price_1U84YEPd4O2xtXFRPZuyCJLy", { mission: "EN4RGY_", missionSlug: "en4rgy" }),
  mission_supporter_circular_city: checkout("mission_supporter_circular_city", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySMBIIif9wShMMoKKCOQg", "price_1U84YMPd4O2xtXFReb5j9CSk", { mission: "CIRCULAR CITY_", missionSlug: "circular-city" }),
  mission_supporter_f4shion: checkout("mission_supporter_f4shion", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySWBIIif9wShMUnNlxVe8", "price_1U84YUPd4O2xtXFRta3M36cH", { mission: "F4SHION_", missionSlug: "f4shion" }),
  mission_supporter_m4gazine: checkout("mission_supporter_m4gazine", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySjBIIif9wShMhXmImSGv", "price_1U84YcPd4O2xtXFRcSbPY6E0", { mission: "M4GAZINE_", missionSlug: "m4gazine" }),
  mission_supporter_4rt: checkout("mission_supporter_4rt", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySsBIIif9wShMVPgoxS8X", "price_1U84YjPd4O2xtXFRVADbljiW", { mission: "4RT_", missionSlug: "4rt" }),
  mission_supporter_4film: checkout("mission_supporter_4film", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yT4BIIif9wShM7TmY7E62", "price_1U84YtPd4O2xtXFRvKXXfeFy", { mission: "4FILM_", missionSlug: "4film" }),
  mission_supporter_4play: checkout("mission_supporter_4play", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yTLBIIif9wShMUUvXPq27", "price_1U84Z1Pd4O2xtXFRehIgZzg8", { mission: "4PLAY_", missionSlug: "4play" }),

  // High-value public routes are payable through a reviewed Stripe Invoice, never an anonymous high-value card checkout.
  project_sponsor: negotiated("project_sponsor", "PROJECT_SPONSOR", "SPONSOR", 50_000, 250_000),
  mission_sponsor: negotiated("mission_sponsor", "MISSION_SPONSOR", "SPONSOR", 250_000, 750_000),
  founding_patron: negotiated("founding_patron", "FOUNDING_PATRON", "PATRON", 250_000, 1_500_000),
  sponsor_package: negotiated("sponsor_package", "SPONSOR_PACKAGE", "SPONSOR", 100_000, 500_000),
  b2b_pilot_funder: negotiated("b2b_pilot_funder", "B2B_FUNDING_OBJECT", "B2B", 100_000, 300_000),
};

export const LEGACY_PRODUCT_ALIASES: Record<string, ProductKey> = {
  impact_tree_test: "impact_tree",
  impact_plastic_test: "impact_plastic",
  impact_coral_test: "impact_coral",
  impact_rewild_test: "impact_rewild",
  membership_supporter_test: "membership_supporter",
  sponsor_package_test: "sponsor_package",
};

export function readCatalogKey(value: unknown): ProductKey | null {
  if (typeof value !== "string") return null;
  if (Object.prototype.hasOwnProperty.call(CATALOG, value)) return value as ProductKey;
  return LEGACY_PRODUCT_ALIASES[value] ?? null;
}

export function resolveEnvironment(env: StripeEnv) {
  const environment: PaymentEnvironment = env.STRIPE_PAYMENT_ENV === "LIVE" ? "LIVE" : "TEST";
  if (environment === "LIVE") {
    const enabled = env.STRIPE_CHECKOUT_LIVE_ENABLED === "true" && env.STRIPE_LIVE_RELEASE_APPROVED === "true";
    const secret = env.STRIPE_LIVE_SECRET_KEY?.trim();
    return { environment, enabled, secret, expectedSecretPrefix: "sk_live_", expectedSessionPrefix: "cs_live_", livemode: true } as const;
  }
  return { environment, enabled: env.STRIPE_CHECKOUT_TEST_ENABLED === "true", secret: env.STRIPE_TEST_SECRET_KEY?.trim(), expectedSecretPrefix: "sk_test_", expectedSessionPrefix: "cs_test_", livemode: false } as const;
}

export function resolvePriceId(entry: CatalogEntry, environment: PaymentEnvironment) {
  if (entry.channel !== "checkout") return null;
  if (environment === "TEST") return entry.testPriceId;
  if (!entry.liveEnabled) return null;
  return entry.livePriceId?.startsWith("price_") ? entry.livePriceId : null;
}
