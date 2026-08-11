import { evaluateRelease } from "./runtime";
import type { Channel, ReleaseRecord, StoryRecord } from "./types";

export type AdapterAuthState = "UNCONFIGURED" | "AUTH_REQUIRED" | "READY" | "REVOKED";
export type AdapterMode = "DRY_RUN_ONLY" | "PRODUCTION_CAPABLE";

export interface PublishingAdapterDefinition {
  channel: Channel;
  provider: string;
  authState: AdapterAuthState;
  mode: AdapterMode;
  requiredCapabilities: string[];
  productionEnabled: boolean;
  notes: string[];
}

export interface PublicationPreflight {
  status: "PASS" | "BLOCKED";
  channel: Channel;
  adapter: PublishingAdapterDefinition;
  reasons: string[];
  externalCallAllowed: boolean;
}

const dryRunAdapter = (
  channel: Channel,
  provider: string,
  requiredCapabilities: string[],
  notes: string[],
): PublishingAdapterDefinition => ({
  channel,
  provider,
  authState: "AUTH_REQUIRED",
  mode: "DRY_RUN_ONLY",
  requiredCapabilities,
  productionEnabled: false,
  notes,
});

export const publishingAdapters: Record<Channel, PublishingAdapterDefinition> = {
  web: {
    channel: "web",
    provider: "4PLANET application deployment",
    authState: "UNCONFIGURED",
    mode: "DRY_RUN_ONLY",
    requiredCapabilities: ["accepted deployment target", "founder release", "rollback-capable deploy"],
    productionEnabled: false,
    notes: ["Public web deployment is a separate product-release decision."],
  },
  instagram: dryRunAdapter(
    "instagram",
    "Meta / Instagram Professional publishing API",
    ["approved professional account", "content publish permission", "secure token storage", "correct account binding"],
    ["No cold-DM behaviour belongs in this adapter.", "No credential material may be stored in BRAIN or the client bundle."],
  ),
  youtube: dryRunAdapter(
    "youtube",
    "YouTube Data API",
    ["OAuth client", "channel-scoped authorization", "video upload permission", "production project verification where required"],
    ["Uploads require a separate media/render object and publication receipt."],
  ),
  linkedin: dryRunAdapter(
    "linkedin",
    "LinkedIn Posts API",
    ["approved application access", "organization/member authorization", "post permission", "secure token storage"],
    ["Institutional truth state must remain identical to BRAIN provenance."],
  ),
  tiktok: dryRunAdapter(
    "tiktok",
    "TikTok Content Posting API",
    ["approved app", "user authorization", "content posting scope", "audit/production eligibility"],
    ["Unaudited/test limitations must not be mistaken for public production readiness."],
  ),
  newsletter: dryRunAdapter(
    "newsletter",
    "Owned email provider",
    ["provider selected", "sender authentication", "list consent basis", "unsubscribe/consent handling"],
    ["No provider is canonically bound yet; keep this adapter vendor-portable."],
  ),
};

export function preflightPublication(
  story: StoryRecord,
  release: ReleaseRecord,
  adapter = publishingAdapters[release.channel],
): PublicationPreflight {
  const reasons = [...evaluateRelease(story, release).reasons];

  if (!adapter) reasons.push(`No publishing adapter exists for ${release.channel}.`);
  if (adapter?.authState !== "READY") reasons.push(`Adapter authentication is ${adapter?.authState ?? "MISSING"}.`);
  if (adapter?.mode !== "PRODUCTION_CAPABLE") reasons.push(`Adapter mode is ${adapter?.mode ?? "MISSING"}.`);
  if (adapter?.productionEnabled !== true) reasons.push("Production publishing is disabled for this adapter.");

  return {
    status: reasons.length === 0 ? "PASS" : "BLOCKED",
    channel: release.channel,
    adapter,
    reasons,
    externalCallAllowed: reasons.length === 0,
  };
}

export async function executeExternalPublication(): Promise<never> {
  throw new Error(
    "External publication is intentionally unavailable in Brand OS Activation. "
    + "A separate founder release, deployed server-side adapter, secure credentials and passing preflight are required.",
  );
}
