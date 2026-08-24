import { trackEvent } from "@/analytics/Analytics";

export type StripeProductKey =
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

export type StripeCheckoutMode = "payment" | "subscription";
export type StripeProductKind = "IMPACT_CONTRIBUTION" | "SUPPORT" | "FOUNDING_PATRON" | "MEMBERSHIP" | "MISSION_SUPPORTER" | "SPONSOR_PACKAGE" | "PROJECT_SPONSOR" | "MISSION_SPONSOR";
export type StripeProductFamily = "IMPACT" | "SUPPORT" | "PATRON" | "MEMBERSHIP" | "MISSION_SUPPORT" | "SPONSOR";

export interface StripeCheckoutInput {
  productKey: StripeProductKey;
  quantity?: number;
  customerEmail?: string;
  referenceKey?: string;
  attemptId?: string;
}

export interface StripeCheckoutResponse {
  ok: true;
  environment: "TEST" | "LIVE";
  checkoutMode: StripeCheckoutMode;
  sessionId: string;
  url: string;
  productKey: StripeProductKey;
  productKind: StripeProductKind;
  productFamily: StripeProductFamily;
  quantity: number;
  referenceKey: string | null;
  truthState: "TEST" | "LIVE";
  deliveryAuthority: "none";
}

export interface StripeCheckoutStatus {
  ok: true;
  environment: "TEST" | "LIVE";
  confirmed: boolean;
  sessionId: string;
  checkoutStatus: string | null;
  paymentStatus: string | null;
  checkoutMode: StripeCheckoutMode | null;
  amountMinor: number | null;
  currency: string | null;
  productKey: StripeProductKey | null;
  productKind: StripeProductKind | null;
  productFamily: StripeProductFamily | null;
  mission: string | null;
  missionSlug: string | null;
  referenceKey: string | null;
  financialState: string;
  impactState: string;
  disclosure: string;
}

function safeAttemptId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID().replace(/-/g, "_");
  return `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function commerceAnalytics(event: "checkout_start" | "checkout_redirect" | "checkout_error" | "checkout_confirmed" | "checkout_cancelled", productKey: string, environment?: string) {
  trackEvent(event, {
    product_key: productKey.slice(0, 100),
    payment_environment: environment === "LIVE" ? "LIVE" : "TEST",
  });
}

export async function createStripeCheckoutSession(input: StripeCheckoutInput): Promise<StripeCheckoutResponse> {
  const attemptId = input.attemptId ?? safeAttemptId();
  commerceAnalytics("checkout_start", input.productKey);
  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...input, attemptId }),
  });
  const payload = await response.json().catch(() => null) as StripeCheckoutResponse | { ok?: false; error?: string } | null;
  if (!response.ok || !payload || payload.ok !== true || !("url" in payload)) {
    commerceAnalytics("checkout_error", input.productKey);
    const reason = payload && "error" in payload && payload.error ? payload.error : "checkout_unavailable";
    throw new Error(reason);
  }
  const expectedPrefix = payload.environment === "LIVE" ? "cs_live_" : "cs_test_";
  if (!payload.sessionId.startsWith(expectedPrefix)) {
    commerceAnalytics("checkout_error", input.productKey, payload.environment);
    throw new Error("unexpected_checkout_environment");
  }
  commerceAnalytics("checkout_redirect", input.productKey, payload.environment);
  return payload;
}

export async function startStripeCheckout(input: StripeCheckoutInput) {
  const session = await createStripeCheckoutSession(input);
  window.location.assign(session.url);
}

export async function getStripeCheckoutStatus(sessionId: string): Promise<StripeCheckoutStatus> {
  const response = await fetch(`/api/stripe/checkout-status?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => null) as StripeCheckoutStatus | { ok?: false; error?: string } | null;
  if (!response.ok || !payload || payload.ok !== true || !("confirmed" in payload)) {
    const reason = payload && "error" in payload && payload.error ? payload.error : "checkout_status_unavailable";
    throw new Error(reason);
  }
  if (payload.confirmed && payload.productKey) commerceAnalytics("checkout_confirmed", payload.productKey, payload.environment);
  return payload;
}

export function trackStripeCheckoutCancelled(productKey: string) {
  commerceAnalytics("checkout_cancelled", productKey);
}

const MISSION_KEY_BY_SLUG: Record<string, StripeProductKey> = {
  cle4n: "mission_supporter_cle4n",
  wh4les: "mission_supporter_wh4les",
  cor4l: "mission_supporter_cor4l",
  "rewild-marine": "mission_supporter_rewild_marine",
  clim4te: "mission_supporter_clim4te",
  am4zonia: "mission_supporter_am4zonia",
  species: "mission_supporter_species",
  "rewild-land": "mission_supporter_rewild_land",
  food: "mission_supporter_food",
  en4rgy: "mission_supporter_en4rgy",
  "circular-city": "mission_supporter_circular_city",
  f4shion: "mission_supporter_f4shion",
  m4gazine: "mission_supporter_m4gazine",
  "4rt": "mission_supporter_4rt",
  "4film": "mission_supporter_4film",
  "4play": "mission_supporter_4play",
};

export function missionSupporterProductKey(slug: string): StripeProductKey | null {
  return MISSION_KEY_BY_SLUG[slug] ?? null;
}
