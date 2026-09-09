export type PaymentEnvironment = "TEST" | "LIVE";
export type CheckoutMode = "payment" | "subscription";
export type CommerceChannel = "checkout" | "invoice";

export type ProductKind =
  | "IMPACT_UNIT"
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
  testPriceId: string;
  livePriceEnv: string;
  minQuantity: number;
  maxQuantityPerCheckout: number;
  returnPath: string;
  action?: string;
  mission?: string;
  missionSlug?: string;
  taxDeductibleClaim: false;
}

const checkout = (
  key: ProductKey,
  kind: ProductKind,
  family: ProductFamily,
  mode: CheckoutMode,
  testPriceId: string,
  livePriceEnv: string,
  returnPath: string,
  extras: Partial<Pick<CatalogEntry, "action" | "mission" | "missionSlug" | "maxQuantityPerCheckout">> = {},
): CatalogEntry => ({
  key,
  kind,
  family,
  channel: "checkout",
  mode,
  testPriceId,
  livePriceEnv,
  minQuantity: 1,
  maxQuantityPerCheckout: extras.maxQuantityPerCheckout ?? 1,
  returnPath,
  action: extras.action,
  mission: extras.mission,
  missionSlug: extras.missionSlug,
  taxDeductibleClaim: false,
});

export const CATALOG: Record<ProductKey, CatalogEntry> = {
  impact_tree: checkout("impact_tree", "IMPACT_UNIT", "IMPACT", "payment", "price_1U7w9lBIIif9wShMBdiJkElA", "STRIPE_LIVE_PRICE_IMPACT_TREE", "/checkout/return", { action: "plant-trees", mission: "CLIM4TE_", missionSlug: "clim4te", maxQuantityPerCheckout: 20 }),
  impact_plastic: checkout("impact_plastic", "IMPACT_UNIT", "IMPACT", "payment", "price_1U7w9uBIIif9wShMkSYviyab", "STRIPE_LIVE_PRICE_IMPACT_PLASTIC", "/checkout/return", { action: "clean-plastic", mission: "CLE4N_", missionSlug: "cle4n", maxQuantityPerCheckout: 20 }),
  impact_coral: checkout("impact_coral", "IMPACT_UNIT", "IMPACT", "payment", "price_1U7wA2BIIif9wShMG7qg2s65", "STRIPE_LIVE_PRICE_IMPACT_CORAL", "/checkout/return", { action: "restore-coral", mission: "COR4L_", missionSlug: "cor4l", maxQuantityPerCheckout: 20 }),
  impact_rewild: checkout("impact_rewild", "IMPACT_UNIT", "IMPACT", "payment", "price_1U7wABBIIif9wShMA2EXSeqQ", "STRIPE_LIVE_PRICE_IMPACT_REWILD", "/checkout/return", { action: "rewild-nature", mission: "RE:WILD_ Land", missionSlug: "rewild-land", maxQuantityPerCheckout: 20 }),
  support_4planet: checkout("support_4planet", "SUPPORT", "SUPPORT", "payment", "price_1U7yPWBIIif9wShMgT57NW4Y", "STRIPE_LIVE_PRICE_SUPPORT_4PLANET", "/checkout/return"),
  founding_patron: checkout("founding_patron", "FOUNDING_PATRON", "PATRON", "payment", "price_1U7yPqBIIif9wShMVxTsEJH1", "STRIPE_LIVE_PRICE_FOUNDING_PATRON", "/checkout/return"),
  membership_supporter: checkout("membership_supporter", "MEMBERSHIP", "MEMBERSHIP", "subscription", "price_1U7wGQBIIif9wShM2RckyATg", "STRIPE_LIVE_PRICE_MEMBERSHIP_SUPPORTER", "/checkout/return"),
  sponsor_package: checkout("sponsor_package", "SPONSOR_PACKAGE", "SPONSOR", "payment", "price_1U7wGeBIIif9wShMi9z76s8m", "STRIPE_LIVE_PRICE_SPONSOR_PACKAGE", "/checkout/return"),
  project_sponsor: checkout("project_sponsor", "PROJECT_SPONSOR", "SPONSOR", "payment", "price_1U7yQ1BIIif9wShMtSDnQB4G", "STRIPE_LIVE_PRICE_PROJECT_SPONSOR", "/checkout/return"),
  mission_sponsor: checkout("mission_sponsor", "MISSION_SPONSOR", "SPONSOR", "payment", "price_1U7yQABIIif9wShMPsHNsZbm", "STRIPE_LIVE_PRICE_MISSION_SPONSOR", "/checkout/return"),
  b2b_pilot_funder: { key: "b2b_pilot_funder", kind: "B2B_FUNDING_OBJECT", family: "B2B", channel: "invoice", mode: "payment", testPriceId: "price_1U7yQMBIIif9wShMucKia4tx", livePriceEnv: "STRIPE_LIVE_PRICE_B2B_PILOT_FUNDER", minQuantity: 1, maxQuantityPerCheckout: 1, returnPath: "/checkout/return", taxDeductibleClaim: false },

  mission_supporter_cle4n: checkout("mission_supporter_cle4n", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQXBIIif9wShMbs2whL1v", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_CLE4N", "/checkout/return", { mission: "CLE4N_", missionSlug: "cle4n" }),
  mission_supporter_wh4les: checkout("mission_supporter_wh4les", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQiBIIif9wShM5UAxHWyR", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_WH4LES", "/checkout/return", { mission: "WH4LES_", missionSlug: "wh4les" }),
  mission_supporter_cor4l: checkout("mission_supporter_cor4l", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yQuBIIif9wShMwOMDwgl0", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_COR4L", "/checkout/return", { mission: "COR4L_", missionSlug: "cor4l" }),
  mission_supporter_rewild_marine: checkout("mission_supporter_rewild_marine", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yR3BIIif9wShMXtZ5cn8l", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_REWILD_MARINE", "/checkout/return", { mission: "RE:WILD_ Marine", missionSlug: "rewild-marine" }),
  mission_supporter_clim4te: checkout("mission_supporter_clim4te", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yREBIIif9wShMrpAMXTAC", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_CLIM4TE", "/checkout/return", { mission: "CLIM4TE_", missionSlug: "clim4te" }),
  mission_supporter_am4zonia: checkout("mission_supporter_am4zonia", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRQBIIif9wShMJgNmPsSS", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_AM4ZONIA", "/checkout/return", { mission: "AM4ZONIA_", missionSlug: "am4zonia" }),
  mission_supporter_species: checkout("mission_supporter_species", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRbBIIif9wShMn1K9fGvy", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_SPECIES", "/checkout/return", { mission: "SPECIES_", missionSlug: "species" }),
  mission_supporter_rewild_land: checkout("mission_supporter_rewild_land", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRrBIIif9wShMJmXUD484", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_REWILD_LAND", "/checkout/return", { mission: "RE:WILD_ Land", missionSlug: "rewild-land" }),
  mission_supporter_food: checkout("mission_supporter_food", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yRzBIIif9wShMOcMVnTdF", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_FOOD", "/checkout/return", { mission: "FOOD_", missionSlug: "food" }),
  mission_supporter_en4rgy: checkout("mission_supporter_en4rgy", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yS9BIIif9wShMsYCQyW8D", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_EN4RGY", "/checkout/return", { mission: "EN4RGY_", missionSlug: "en4rgy" }),
  mission_supporter_circular_city: checkout("mission_supporter_circular_city", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySMBIIif9wShMMoKKCOQg", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_CIRCULAR_CITY", "/checkout/return", { mission: "CIRCULAR CITY_", missionSlug: "circular-city" }),
  mission_supporter_f4shion: checkout("mission_supporter_f4shion", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySWBIIif9wShMUnNlxVe8", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_F4SHION", "/checkout/return", { mission: "F4SHION_", missionSlug: "f4shion" }),
  mission_supporter_m4gazine: checkout("mission_supporter_m4gazine", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySjBIIif9wShMhXmImSGv", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_M4GAZINE", "/checkout/return", { mission: "M4GAZINE_", missionSlug: "m4gazine" }),
  mission_supporter_4rt: checkout("mission_supporter_4rt", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7ySsBIIif9wShMVPgoxS8X", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_4RT", "/checkout/return", { mission: "4RT_", missionSlug: "4rt" }),
  mission_supporter_4film: checkout("mission_supporter_4film", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yT4BIIif9wShM7TmY7E62", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_4FILM", "/checkout/return", { mission: "4FILM_", missionSlug: "4film" }),
  mission_supporter_4play: checkout("mission_supporter_4play", "MISSION_SUPPORTER", "MISSION_SUPPORT", "subscription", "price_1U7yTLBIIif9wShMUUvXPq27", "STRIPE_LIVE_PRICE_MISSION_SUPPORTER_4PLAY", "/checkout/return", { mission: "4PLAY_", missionSlug: "4play" }),
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

export function resolvePriceId(entry: CatalogEntry, env: StripeEnv, environment: PaymentEnvironment) {
  if (environment === "TEST") return entry.testPriceId;
  const livePrice = env[entry.livePriceEnv]?.trim();
  return livePrice?.startsWith("price_") ? livePrice : null;
}
