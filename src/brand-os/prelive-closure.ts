import type { Channel } from "./types";

export type ReleaseSurface = "INSTAGRAM_FEED" | "INSTAGRAM_STORY" | "LINKEDIN" | "OWNED_WEB" | "MOTION";
export type PreparedState = "PREPARED" | "AUTH_REQUIRED" | "AUTHENTICATED" | "TESTED" | "LIVE";
export type VariantReadiness = "FINAL_FOR_FOUNDER_REVIEW" | "DEFERRED_UNTIL_LEARNING";

export interface ReleaseVariant {
  variantId: string;
  storyId: string;
  manifestId: string;
  surface: ReleaseSurface;
  channel: Channel;
  readiness: VariantReadiness;
  format: string;
  aspectRatio: string;
  framePlan: string[];
  caption: string;
  altText: string;
  sourceFooter: string;
  destination: string;
  truthBoundary: string;
  trackingId: string;
}

export interface ReleaseFamily {
  familyId: string;
  storyId: string;
  manifestId: string;
  truthCoreVersion: string;
  recommendedPrimarySurface: ReleaseSurface;
  whyThisFamily: string;
  variants: ReleaseVariant[];
}

const deferredMotion = (
  variantId: string,
  storyId: string,
  manifestId: string,
  destination: string,
  truthBoundary: string,
): ReleaseVariant => ({
  variantId,
  storyId,
  manifestId,
  surface: "MOTION",
  channel: "instagram",
  readiness: "DEFERRED_UNTIL_LEARNING",
  format: "Short motion derivative — intentionally not rendered before first real audience learning",
  aspectRatio: "9:16",
  framePlan: ["No motion production before the static truth mechanism earns a reason to scale."],
  caption: "",
  altText: "",
  sourceFooter: "",
  destination,
  truthBoundary,
  trackingId: `${variantId}-DEFERRED`,
});

export const ORCA_RELEASE_FAMILY: ReleaseFamily = {
  familyId: "FAM-BOS-ORCA-001",
  storyId: "STORY-BOS-ORCA-001",
  manifestId: "MAN-BOS-ORCA-001",
  truthCoreVersion: "orca-source-first-v1",
  recommendedPrimarySurface: "INSTAGRAM_FEED",
  whyThisFamily: "A source-first species object should make one observation memorable without converting that observation into a population, place or ecosystem claim.",
  variants: [
    {
      variantId: "VAR-BOS-ORCA-IGFEED-001",
      storyId: "STORY-BOS-ORCA-001",
      manifestId: "MAN-BOS-ORCA-001",
      surface: "INSTAGRAM_FEED",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "4-frame 4:5 source-first carousel",
      aspectRatio: "4:5",
      framePlan: [
        "01 — ONE RECORD. A WIDER LIVING SYSTEM. / Orca · Orcinus orca",
        "02 — SOURCE RECORD / GBIF 5939349319 · human observation · Norway · 3 January 2026",
        "03 — RELATIONSHIP / socially structured groups + underwater sound for communication and navigation / NOAA context",
        "04 — LIMIT / one occurrence is not range, abundance, trend, live location, place membership, ecosystem condition or a 4PLANET Signal",
      ],
      caption: "One Orca record can tell us something real — if we keep its limits visible. GBIF occurrence 5939349319 reports an Orca observation in Norway on 3 January 2026. Around that record sits wider species context: Orcas live in socially structured groups and use underwater sound for communication and navigation. 4PLANET keeps those layers separate. The occurrence is an observation, not a Signal, and it does not establish range, abundance, trend, current location, place membership or ecosystem condition.",
      altText: "Four-frame source-first Orca carousel: an opening species frame, one exact GBIF observation, bounded social and acoustic context, and a final limitation explaining what one occurrence cannot establish.",
      sourceFooter: "SOURCES: GBIF occurrence 5939349319 · CC BY 4.0 · NOAA Fisheries / SRC-015. 4PLANET CONTEXT. Coordinates rounded; limits apply.",
      destination: "/species/orca",
      truthBoundary: "Observation ≠ Signal. Do not infer range, abundance, population trend, current location, place membership or ecosystem condition from one occurrence.",
      trackingId: "EXP-BOS-ORCA-IG-001",
    },
    {
      variantId: "VAR-BOS-ORCA-IGSTORY-001",
      storyId: "STORY-BOS-ORCA-001",
      manifestId: "MAN-BOS-ORCA-001",
      surface: "INSTAGRAM_STORY",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "3-frame 9:16 story derivative; asset prepared, publication route remains account/auth dependent",
      aspectRatio: "9:16",
      framePlan: [
        "01 — ONE RECORD. / Orca · Norway · 3 Jan 2026",
        "02 — A WIDER LIVING SYSTEM. / social + acoustic species context",
        "03 — BUT STILL ONE RECORD. / Observation ≠ Signal · SEE THE SOURCE_",
      ],
      caption: "",
      altText: "Three vertical frames moving from one attributed Orca observation to bounded species context and ending with the explicit statement Observation is not Signal.",
      sourceFooter: "GBIF 5939349319 · NOAA Fisheries / SRC-015 · limits apply.",
      destination: "/species/orca",
      truthBoundary: "Story compression may not remove the one-record limitation.",
      trackingId: "EXP-BOS-ORCA-IGS-001",
    },
    {
      variantId: "VAR-BOS-ORCA-LI-001",
      storyId: "STORY-BOS-ORCA-001",
      manifestId: "MAN-BOS-ORCA-001",
      surface: "LINKEDIN",
      channel: "linkedin",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Evidence-led text + single source-first visual",
      aspectRatio: "4:5",
      framePlan: ["Hero visual: ONE RECORD. A WIDER LIVING SYSTEM. with source ID and limitation visible."],
      caption: "A useful ecological interface has to make evidence easier to understand without making it more certain than it is. This Orca example starts with one exact GBIF occurrence, adds separately sourced species context, and keeps the boundary explicit: one observation is not range, abundance, trend, live location, place membership or ecosystem condition. That separation is part of the product, not a footnote.",
      altText: "Source-first Orca graphic separating one GBIF record from general species context and its limitations.",
      sourceFooter: "GBIF 5939349319 · NOAA Fisheries / SRC-015 · 4PLANET CONTEXT.",
      destination: "/species/orca",
      truthBoundary: "Institutional framing cannot imply validation, endorsement or a population inference.",
      trackingId: "EXP-BOS-ORCA-LI-001",
    },
    {
      variantId: "VAR-BOS-ORCA-WEB-001",
      storyId: "STORY-BOS-ORCA-001",
      manifestId: "MAN-BOS-ORCA-001",
      surface: "OWNED_WEB",
      channel: "web",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Species-page source module",
      aspectRatio: "responsive",
      framePlan: ["Record → source → relationship context → explicit limits → return path to species profile."],
      caption: "One attributed observation, kept separate from what we know about the species around it.",
      altText: "Orca source module showing an exact occurrence, contextual species information and explicit evidence limits.",
      sourceFooter: "GBIF 5939349319 · NOAA Fisheries / SRC-015.",
      destination: "/species/orca",
      truthBoundary: "The owned page remains the full provenance destination; social derivatives may compress but never override it.",
      trackingId: "EXP-BOS-ORCA-WEB-001",
    },
    deferredMotion("VAR-BOS-ORCA-MOTION-001", "STORY-BOS-ORCA-001", "MAN-BOS-ORCA-001", "/species/orca", "Do not animate one observation into apparent movement, live location or trend."),
  ],
};

export const BEE_RELEASE_FAMILY: ReleaseFamily = {
  familyId: "FAM-BOS-BEE-001",
  storyId: "STORY-BOS-BEE-001",
  manifestId: "MAN-BOS-BEE-001",
  truthCoreVersion: "bee-relationship-reveal-v1",
  recommendedPrimarySurface: "INSTAGRAM_FEED",
  whyThisFamily: "The bounded dependency chain is visually simple, original, rights-clean and ideal for testing whether Relationship Reveal creates meaningful saves, shares and owned exploration.",
  variants: [
    {
      variantId: "VAR-BOS-BEE-IGFEED-001",
      storyId: "STORY-BOS-BEE-001",
      manifestId: "MAN-BOS-BEE-001",
      surface: "INSTAGRAM_FEED",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "5-frame 4:5 Relationship Reveal carousel",
      aspectRatio: "4:5",
      framePlan: [
        "01 — WHAT DEPENDS ON WHAT? / Bee → pollination → apple → one part of the food system",
        "02 — BEES → POLLINATION / bees are one important group of animal pollinators — not the only pollinators",
        "03 — POLLINATION → APPLE / many crops depend partly on animal pollination; apple is the bounded production example",
        "04 — APPLE → FOOD / one concrete food relationship, labelled 4PLANET CONTEXT — not all food",
        "05 — LIMIT + SOURCES / bees ≠ all pollinators · apples ≠ all food · FAO / SRC-017 + Garratt et al. / SRC-019 · EXPLORE THE RELATIONSHIP_",
      ],
      caption: "A bee is not the whole food system. It is one way into it. Bees are an important group of animal pollinators, but they are not the only pollinators. Many crop plants depend at least partly on animal pollination. Apple gives us one bounded example: different pollinator groups can contribute differently across varieties. That is the relationship this first reveal shows — not a claim that all food depends on bees.",
      altText: "Five-frame relationship carousel showing bees, pollination, apple and one part of the food system, with source labels and a final limit that bees are not all pollinators and apples are not all food.",
      sourceFooter: "SOURCES: FAO / SRC-017 · Garratt et al. / SRC-019 · CLM-BOS-BEE-001..004. Bounded apple example; limits apply.",
      destination: "/living-systems",
      truthBoundary: "Do not say all food depends on bees, collapse bees into all pollinators or generalise the cited four-variety apple study to all crops.",
      trackingId: "EXP-BOS-BEE-IG-001",
    },
    {
      variantId: "VAR-BOS-BEE-IGSTORY-001",
      storyId: "STORY-BOS-BEE-001",
      manifestId: "MAN-BOS-BEE-001",
      surface: "INSTAGRAM_STORY",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "4-frame 9:16 relationship sequence; publication route remains account/auth dependent",
      aspectRatio: "9:16",
      framePlan: [
        "01 — WHAT DEPENDS ON WHAT?",
        "02 — BEE → POLLINATION",
        "03 — POLLINATION → APPLE → ONE PART OF FOOD",
        "04 — BEES ≠ ALL POLLINATORS. APPLES ≠ ALL FOOD. / EXPLORE THE RELATIONSHIP_",
      ],
      caption: "",
      altText: "Four vertical frames revealing the bounded relationship bee to pollination to apple to one part of the food system, ending with the source-scope limit.",
      sourceFooter: "FAO / SRC-017 · Garratt et al. / SRC-019.",
      destination: "/living-systems",
      truthBoundary: "Vertical compression must retain the final non-universal limitation.",
      trackingId: "EXP-BOS-BEE-IGS-001",
    },
    {
      variantId: "VAR-BOS-BEE-LI-001",
      storyId: "STORY-BOS-BEE-001",
      manifestId: "MAN-BOS-BEE-001",
      surface: "LINKEDIN",
      channel: "linkedin",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Evidence-led text + single Relationship Reveal visual",
      aspectRatio: "4:5",
      framePlan: ["Hero visual: BEE → POLLINATION → APPLE → ONE PART OF FOOD, with SOURCE / 4PLANET CONTEXT states visible."],
      caption: "Complex living systems become more useful when we can see one dependency without pretending it is the whole system. Bee → pollination → apple is a bounded example: bees are one important group of animal pollinators, many crops depend at least partly on animal pollination, and apple gives us one concrete production relationship. The important part is also the limit: bees are not all pollinators, and apples are not all food.",
      altText: "Relationship Reveal graphic showing the bounded chain from bees through pollination and apple to one part of the food system.",
      sourceFooter: "FAO / SRC-017 · Garratt et al. / SRC-019 · 4PLANET CONTEXT.",
      destination: "/living-systems",
      truthBoundary: "Professional framing must not convert the example into a universal food-system claim.",
      trackingId: "EXP-BOS-BEE-LI-001",
    },
    {
      variantId: "VAR-BOS-BEE-WEB-001",
      storyId: "STORY-BOS-BEE-001",
      manifestId: "MAN-BOS-BEE-001",
      surface: "OWNED_WEB",
      channel: "web",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Interactive/responsive Relationship Reveal module",
      aspectRatio: "responsive",
      framePlan: ["Bee → Pollination → Apple → Food context, each node preserving SOURCE or 4PLANET CONTEXT state and source sidecar."],
      caption: "One relationship into a much larger living system.",
      altText: "Responsive relationship module with four nodes: bees, pollination, apple and food context, each with provenance state.",
      sourceFooter: "FAO / SRC-017 · Garratt et al. / SRC-019.",
      destination: "/living-systems",
      truthBoundary: "Owned context must show source state and limitation alongside the relationship, not hide them in a modal-only path.",
      trackingId: "EXP-BOS-BEE-WEB-001",
    },
    {
      variantId: "VAR-BOS-BEE-MOTION-001",
      storyId: "STORY-BOS-BEE-001",
      manifestId: "MAN-BOS-BEE-001",
      surface: "MOTION",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "9:16 12–18s typographic/data motion derivative; QA-ready specification, not claimed rendered",
      aspectRatio: "9:16",
      framePlan: [
        "0–2s — WHAT DEPENDS ON WHAT?",
        "2–5s — BEE → POLLINATION",
        "5–9s — POLLINATION → APPLE",
        "9–12s — APPLE → ONE PART OF FOOD",
        "12–18s — BEES ≠ ALL POLLINATORS · APPLES ≠ ALL FOOD · source footer + EXPLORE THE RELATIONSHIP_",
      ],
      caption: "Same truth core as VAR-BOS-BEE-IGFEED-001; motion changes pacing, not certainty.",
      altText: "Short motion sequence revealing the bounded dependency from bee to pollination to apple to one part of food, ending with explicit limits.",
      sourceFooter: "FAO / SRC-017 · Garratt et al. / SRC-019.",
      destination: "/living-systems",
      truthBoundary: "Motion cannot imply a deterministic or universal causal chain beyond the cited bounded relationship.",
      trackingId: "EXP-BOS-BEE-MOTION-001",
    },
  ],
};

export const OSLO_RELEASE_FAMILY: ReleaseFamily = {
  familyId: "FAM-BOS-OSLO-001",
  storyId: "STORY-BOS-OSLO-001",
  manifestId: "MAN-BOS-OSLO-001",
  truthCoreVersion: "oslofjord-one-place-v1",
  recommendedPrimarySurface: "INSTAGRAM_FEED",
  whyThisFamily: "ONE PLACE can demonstrate the 4PLANET category strongly, but the first derivative must keep model, mapping and monitoring as different evidence classes.",
  variants: [
    {
      variantId: "VAR-BOS-OSLO-IGFEED-001",
      storyId: "STORY-BOS-OSLO-001",
      manifestId: "MAN-BOS-OSLO-001",
      surface: "INSTAGRAM_FEED",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "5-frame 4:5 ONE PLACE carousel",
      aspectRatio: "4:5",
      framePlan: [
        "01 — OSLOFJORDEN IS NOT ONE CONDITION. / one place · three evidence classes",
        "02 — MODELLED PRESSURE / M-3141 nitrogen input baseline + scenarios / model ≠ observed ecological outcome",
        "03 — MAPPED MARINE NATURE / HB19 mapped-known nature / incomplete + partly older mapping / missing mapping ≠ absence",
        "04 — MONITORING COVERAGE / Økokyst/Vannmiljø locations / monitoring point ≠ condition or trend",
        "05 — ONE PLACE, DIFFERENT EVIDENCE / co-location ≠ causality · EXPLORE OSLOFJORDEN_",
      ],
      caption: "To understand Oslofjorden, we have to keep different kinds of evidence different. This first ONE PLACE object combines three bounded official layers: modelled nitrogen pressure and intervention scenarios; mapped-known marine nature, with explicit coverage gaps and older mapping; and locations where Økokyst/Vannmiljø monitoring records exist. None of those layers is the whole fjord. A model is not an observed ecological outcome. A mapped occurrence is not complete current distribution. A monitoring point is not condition or trend. Seeing the layers together can help us ask better questions — without pretending co-location proves cause.",
      altText: "Five-frame Oslofjorden carousel separating modelled nitrogen pressure, mapped-known marine nature and monitoring-location coverage, ending with the limits that the layers are not equivalent and co-location is not causality.",
      sourceFooter: "SOURCES: M-3141 / SRC-021 · Naturbase HB19 / SRC-022 · Vannmiljø Økokyst / SRC-023. Model ≠ observation; mapped-known ≠ complete; monitoring location ≠ condition.",
      destination: "/atlas?place=place%3A4p%3Aoslofjord",
      truthBoundary: "Never present model scenario as observed outcome, HB19 as complete current coverage, monitoring location as condition, or overlap as causal proof.",
      trackingId: "EXP-BOS-OSLO-IG-001",
    },
    {
      variantId: "VAR-BOS-OSLO-IGSTORY-001",
      storyId: "STORY-BOS-OSLO-001",
      manifestId: "MAN-BOS-OSLO-001",
      surface: "INSTAGRAM_STORY",
      channel: "instagram",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "4-frame 9:16 ONE PLACE sequence; publication route remains account/auth dependent",
      aspectRatio: "9:16",
      framePlan: [
        "01 — OSLOFJORDEN IS NOT ONE CONDITION.",
        "02 — MODELLED PRESSURE ≠ OBSERVED OUTCOME",
        "03 — MAPPED NATURE ≠ COMPLETE / MONITORING LOCATION ≠ CONDITION",
        "04 — CO-LOCATION ≠ CAUSALITY / EXPLORE OSLOFJORDEN_",
      ],
      caption: "",
      altText: "Four vertical frames explaining that Oslofjorden contains different evidence classes that cannot be collapsed into one condition or causal claim.",
      sourceFooter: "M-3141 / SRC-021 · HB19 / SRC-022 · Økokyst/Vannmiljø / SRC-023.",
      destination: "/atlas?place=place%3A4p%3Aoslofjord",
      truthBoundary: "Story compression may not collapse the three evidence classes.",
      trackingId: "EXP-BOS-OSLO-IGS-001",
    },
    {
      variantId: "VAR-BOS-OSLO-LI-001",
      storyId: "STORY-BOS-OSLO-001",
      manifestId: "MAN-BOS-OSLO-001",
      surface: "LINKEDIN",
      channel: "linkedin",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Evidence-led build note + single ONE PLACE visual",
      aspectRatio: "4:5",
      framePlan: ["Hero visual: ONE PLACE / three evidence classes, with model/mapping/monitoring distinctions visible."],
      caption: "A place can contain many kinds of environmental evidence without any one of them being 'the state of the place'. Our first Oslofjorden ONE PLACE object keeps three classes separate: modelled pressure and scenarios, mapped-known marine nature, and monitoring-location coverage. The design goal is not to flatten those layers into one score. It is to let people see them together while preserving method, coverage and uncertainty.",
      altText: "ONE PLACE graphic for Oslofjorden separating modelled pressure, mapped-known marine nature and monitoring coverage.",
      sourceFooter: "M-3141 / SRC-021 · Naturbase HB19 / SRC-022 · Vannmiljø Økokyst / SRC-023.",
      destination: "/atlas?place=place%3A4p%3Aoslofjord",
      truthBoundary: "Do not imply agency endorsement, causal attribution or a complete fjord condition assessment.",
      trackingId: "EXP-BOS-OSLO-LI-001",
    },
    {
      variantId: "VAR-BOS-OSLO-WEB-001",
      storyId: "STORY-BOS-OSLO-001",
      manifestId: "MAN-BOS-OSLO-001",
      surface: "OWNED_WEB",
      channel: "web",
      readiness: "FINAL_FOR_FOUNDER_REVIEW",
      format: "Canonical ATLAS place handoff",
      aspectRatio: "responsive",
      framePlan: ["Place header → evidence-class legend → individual source layers → coverage notes → source/proof access."],
      caption: "One place. Different evidence. Kept different on purpose.",
      altText: "Oslofjorden ATLAS place context with separate evidence classes and visible coverage and causal limits.",
      sourceFooter: "M-3141 / SRC-021 · Naturbase HB19 / SRC-022 · Vannmiljø Økokyst / SRC-023.",
      destination: "/atlas?place=place%3A4p%3Aoslofjord",
      truthBoundary: "ATLAS remains source-aware and may not convert layer overlap into causal interpretation.",
      trackingId: "EXP-BOS-OSLO-WEB-001",
    },
    deferredMotion("VAR-BOS-OSLO-MOTION-001", "STORY-BOS-OSLO-001", "MAN-BOS-OSLO-001", "/atlas?place=place%3A4p%3Aoslofjord", "Do not animate modelled or mapped layers in a way that implies temporal change or live monitoring."),
  ],
};

export const P0_RELEASE_FAMILIES: ReleaseFamily[] = [ORCA_RELEASE_FAMILY, BEE_RELEASE_FAMILY, OSLO_RELEASE_FAMILY];

export interface FirstLiveRecommendation {
  storyId: string;
  variantId: string;
  channel: Channel;
  rank: number;
  rationale: string[];
  materialRisks: string[];
}

export const FIRST_LIVE_RECOMMENDATION: FirstLiveRecommendation = {
  storyId: "STORY-BOS-BEE-001",
  variantId: "VAR-BOS-BEE-IGFEED-001",
  channel: "instagram",
  rank: 1,
  rationale: [
    "Cleanest first-party/original visual rights route of the three P0 objects.",
    "The bounded relationship can be understood without requiring a map, live data or documentary-image interpretation.",
    "The mechanism is native to 4PLANET: Relationship Reveal tests category distinctiveness rather than only subject popularity.",
    "Instagram can expose shares, saved, reach and interaction metrics for professional-account media once authorised.",
    "Failure is cheap to diagnose: hook, relationship comprehension, save/share value and owned exploration can be separated.",
  ],
  materialRisks: [
    "Users may still overgeneralise the relationship unless the non-universal limit remains visually prominent.",
    "A visually clean systems graphic can feel educational rather than emotionally alive; this is a deliberate first mechanism test, not a verdict on documentary storytelling.",
  ],
};

export interface PlatformReadiness {
  channel: Channel;
  state: PreparedState;
  intendedAccount: string;
  authRequirements: string[];
  publishRoute: string[];
  receiptFields: string[];
  metricFields: string[];
  failureStates: string[];
  rollback: string[];
  externalActionAllowed: false;
  verifiedAgainst: string[];
}

export const INSTAGRAM_PRELIVE_READINESS: PlatformReadiness = {
  channel: "instagram",
  state: "AUTH_REQUIRED",
  intendedAccount: "Canonical 4PLANET Instagram Professional account — exact account ID intentionally unresolved until founder-controlled authentication.",
  authRequirements: [
    "Professional Instagram account (Business or Creator); exact account binding must be verified at auth time.",
    "Meta app / supported Instagram login flow and secure server-side token storage.",
    "Publishing permission/scopes appropriate to the selected Meta login flow; never store token material in BRAIN or the client bundle.",
    "Insights permission/scopes appropriate to the selected login flow before automated metric ingestion.",
    "For API image publishing, final media must be reachable by the platform at publish time; hosting is a separate preflight gate.",
  ],
  publishRoute: [
    "Founder approves exact frozen variant.",
    "Authenticated server-side adapter resolves canonical account and capabilities.",
    "Create media/container with caption, media and supported accessibility metadata where applicable.",
    "Check container/media state where required.",
    "Publish exactly once using the release idempotency key.",
    "Persist returned media/post ID as the publication receipt.",
  ],
  receiptFields: ["release_id", "story_id", "variant_id", "platform_media_id", "permalink when available", "published_at", "idempotency_key", "adapter_version"],
  metricFields: ["shares", "saved", "comments", "likes", "reach", "total_interactions", "profile_activity when available", "owned-destination attributed session events"],
  failureStates: ["MISSING_FOUNDER_RELEASE", "AUTH_MISSING_OR_REVOKED", "WRONG_ACCOUNT_BINDING", "MEDIA_NOT_FETCHABLE", "CONTAINER_ERROR", "PLATFORM_RATE_OR_TRANSIENT_ERROR", "DUPLICATE_REQUEST", "PARTIAL_RECEIPT", "METRIC_PERMISSION_MISSING"],
  rollback: ["Never delete/repost automatically.", "Stop retries after bounded failure policy.", "If published content is materially wrong, open correction incident; founder decides correction/delete/replacement where public action is required.", "Preserve original receipt and correction chain."],
  externalActionAllowed: false,
  verifiedAgainst: [
    "Meta Instagram API official Postman collection — professional-account publishing requirements and content publish permissions, checked 2026-08-11.",
    "Meta Instagram API official Postman collection — media insights including shares/saved/reach/interaction metrics, checked 2026-08-11.",
  ],
};

export interface LearningContract {
  contractId: string;
  storyId: string;
  releaseVariantId: string;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrails: string[];
  decisionRules: string[];
  minimumEvidence: string[];
  cannotConclude: string[];
  burdenMeasures: string[];
}

export const BEE_FIRST_LIVE_LEARNING_CONTRACT: LearningContract = {
  contractId: "LC-BOS-BEE-IG-001",
  storyId: "STORY-BOS-BEE-001",
  releaseVariantId: "VAR-BOS-BEE-IGFEED-001",
  hypothesis: "A bounded Relationship Reveal can make one living-system dependency memorable enough to earn meaningful saves/shares and owned exploration without requiring scientific overstatement or founder explanation.",
  primaryMetric: "qualified_shares_and_saves per reached account, interpreted separately rather than collapsed into a vanity engagement rate",
  secondaryMetrics: [
    "carousel completion/progression where platform data permits",
    "comments that accurately restate or question the relationship",
    "source/proof opens on owned destination",
    "attributed Living Systems sessions and meaningful downstream interaction",
    "profile activity / follows as context only",
    "raw reach, impressions and likes as exposure context only",
  ],
  guardrails: [
    "No success declaration from reach or likes alone.",
    "No inference of comprehension from a save/share without supporting behavioural or qualitative evidence.",
    "No canon or scientific claim mutation from performance data.",
    "No comparison against ORCA/OSLO until equivalent exposure windows exist.",
    "Dry-run metrics remain system-test evidence only and are excluded from audience learning.",
  ],
  decisionRules: [
    "SCALE_MECHANISM only after meaningful save/share behaviour plus no truth/rights failure, and after at least one owned-depth or qualitative comprehension signal supports the same direction.",
    "ITERATE if attention exists but meaningful saves/shares or owned-depth are weak; change one major variable at a time.",
    "REPURPOSE if the truth object is strong but Instagram format is the likely mismatch.",
    "HOLD/KILL immediately on material truth, rights or misleading-provenance failure.",
    "One release cannot authorise a full content-bank scale-up; it opens only the next bounded learning step.",
  ],
  minimumEvidence: [
    "one real publication receipt",
    "24–72h media metrics",
    "7-day metrics before durable mechanism judgment",
    "owned-destination analytics if the CTA is live",
    "founder decision event recorded; duration only if actually instrumented",
    "production/intervention/failure time and direct platform/tool cost recorded where observable",
  ],
  cannotConclude: [
    "that Relationship Reveal is globally validated",
    "that bees outperform other heroes/topics",
    "that the audience scientifically understands pollination",
    "that Instagram is the optimal long-term channel",
    "that one strong or weak post justifies changing Brand Canon",
  ],
  burdenMeasures: ["founder review seconds if instrumented", "number of founder interventions", "production minutes", "manual platform steps", "failed retries/interventions", "direct variable cost"],
};

export interface PreliveFailureSimulation {
  caseId: string;
  trigger: string;
  expectedResult: string;
  externalCallAllowed: false;
}

export const PRELIVE_FAILURE_SIMULATIONS: PreliveFailureSimulation[] = [
  { caseId: "PRELIVE-FAIL-001", trigger: "Founder gate OPEN", expectedResult: "Release preflight BLOCKED before any adapter call.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-002", trigger: "Founder decision APPROVED but founder gate still OPEN", expectedResult: "Release remains BLOCKED; approval UI alone cannot bypass database/runtime gate.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-003", trigger: "Duplicate idempotency key", expectedResult: "Second publication attempt is suppressed and no second platform call is allowed.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-004", trigger: "Missing/revoked platform auth", expectedResult: "Adapter returns AUTH_REQUIRED/REVOKED and no platform call is attempted.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-005", trigger: "Rights gate not PASS/NOT_APPLICABLE", expectedResult: "Release preflight BLOCKED before scheduling/publish.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-006", trigger: "QA gate BLOCKED", expectedResult: "Release preflight BLOCKED and founder approval cannot override QA silently.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-007", trigger: "Transient platform error", expectedResult: "Bounded retry only; after max attempts move to DEAD_LETTER, preserve error and require intervention.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-008", trigger: "Platform may have published but receipt write failed", expectedResult: "Enter PARTIAL_RECEIPT incident state; reconcile platform before any retry to avoid duplicate publication.", externalCallAllowed: false },
  { caseId: "PRELIVE-FAIL-009", trigger: "Post-publication material correction required", expectedResult: "Open correction incident, freeze automation, preserve original receipt and require founder-controlled public correction action.", externalCallAllowed: false },
];

export interface FirstTenCandidate {
  position: number;
  objectId: string;
  workingTitle: string;
  sourceState: string;
  rightsRoute: string;
  masterStory: string;
  recommendedFormat: string;
  destination: string;
  distributionOpportunity: string;
  productionReadiness: "READY_TO_DEVELOP" | "VERIFY_PRIMARY_SOURCE_FIRST" | "VERIFY_EFFECTIVENESS_AND_RIGHTS_FIRST";
}

export const FIRST_TEN_NEXT_SEVEN: FirstTenCandidate[] = [
  {
    position: 4,
    objectId: "FT-BOS-A23A-004",
    workingTitle: "A melting megaberg fuels a bloom of microscopic life",
    sourceState: "Primary NASA source already source-backed in Story Intelligence; bounded causality remains mandatory.",
    rightsRoute: "NASA asset-by-asset credit/no-endorsement route already mapped in current story controls; re-check exact selected media at production lock.",
    masterStory: "A planetary-scale ice event becomes a story about microscopic life, evidence and uncertainty rather than a generic climate spectacle.",
    recommendedFormat: "3–5 frame evidence-led carousel; short motion only if rights-cleared footage adds material explanatory value.",
    destination: "ATLAS / Living Systems source-aware object, exact final route resolved in Product Bridge.",
    distributionOpportunity: "Planetary science, Earth observation, climate/ecology and editorial channels after release authority.",
    productionReadiness: "READY_TO_DEVELOP",
  },
  {
    position: 5,
    objectId: "FT-BOS-HUMPBACK-005",
    workingTitle: "Humpback whales coordinate a seafloor hunt",
    sourceState: "Primary NOAA + peer-reviewed evidence already hardened in current story controls.",
    rightsRoute: "Existing CC BY 4.0 evidence route; verify every final visual/figure credit before lock.",
    masterStory: "Actual behavioural evidence reveals coordination around a familiar animal without inflating cognition claims.",
    recommendedFormat: "5-frame evidence-led carousel; evidence image carries the opening.",
    destination: "Species / Living Systems object through Product Bridge.",
    distributionOpportunity: "Marine mammal, ocean science, behavioural ecology and science/editorial channels after release authority.",
    productionReadiness: "READY_TO_DEVELOP",
  },
  {
    position: 6,
    objectId: "FT-BOS-URCHIN-006",
    workingTitle: "The sea urchin paradox: restore one coast by adding them, another by removing them",
    sourceState: "NOAA primary route hardened; 42% language corrected to retention in weeks after placement.",
    rightsRoute: "Selected NOAA stills + original 4PLANET treatment; exact media credits remain attached.",
    masterStory: "The same kind of animal can sit on opposite sides of restoration depending on the system around it.",
    recommendedFormat: "5-frame split-system carousel with explicit species/ecosystem separation.",
    destination: "Living Systems / solution-context object through Product Bridge.",
    distributionOpportunity: "Restoration, kelp/coral, marine science and systems-thinking channels after release authority.",
    productionReadiness: "READY_TO_DEVELOP",
  },
  {
    position: 7,
    objectId: "FT-BOS-LISIMA-007",
    workingTitle: "Angola's Lisima plateau reveals dozens of unknown species",
    sourceState: "Current Top 10 is secondary-sourced; primary expedition/scientific source must be recovered before claims are locked.",
    rightsRoute: "No final media route yet; source access is not reuse permission.",
    masterStory: "A place that still contains life unknown to science can carry wonder, field discovery and watershed context without exoticising the place.",
    recommendedFormat: "Documentary/evidence carousel only after primary-source and visual-rights closure.",
    destination: "ATLAS place + Species/Living Systems handoff.",
    distributionOpportunity: "Biodiversity discovery, African field science, freshwater/headwaters and science/editorial channels.",
    productionReadiness: "VERIFY_PRIMARY_SOURCE_FIRST",
  },
  {
    position: 8,
    objectId: "FT-BOS-CANOPY-008",
    workingTitle: "Canopy bridges log 15,000 safe wildlife crossings and zero roadkill",
    sourceState: "Current Top 10 is secondary-sourced; exact programme dataset/method must be recovered before using numeric proof.",
    rightsRoute: "Field imagery/video route not yet cleared.",
    masterStory: "A legible piece of infrastructure can become a problem → solution → proof story if the crossing and roadkill evidence survives primary verification.",
    recommendedFormat: "Proof-led carousel or short documentary clip only after evidence/right closure.",
    destination: "Solutions / IMPACT proof context plus place/species handoff where legitimate.",
    distributionOpportunity: "Road ecology, infrastructure, Amazon/biodiversity and solutions channels.",
    productionReadiness: "VERIFY_PRIMARY_SOURCE_FIRST",
  },
  {
    position: 9,
    objectId: "FT-BOS-MOLERAT-009",
    workingTitle: "A naked mole-rat queen's scent helps govern reproduction",
    sourceState: "Primary peer-reviewed Nature source exists; claim boundaries need exact paper-level extraction before master lock.",
    rightsRoute: "Article is open under CC BY route with third-party-material exceptions; any figure/photo must be checked individually.",
    masterStory: "A strange social system creates a memorable doorway into chemical communication, hierarchy and reproduction.",
    recommendedFormat: "3–5 frame species relationship reveal; no generic stock-animal filler.",
    destination: "Species / Living Systems.",
    distributionOpportunity: "Animal behaviour, biology, science-curiosity and editorial channels.",
    productionReadiness: "READY_TO_DEVELOP",
  },
  {
    position: 10,
    objectId: "FT-BOS-GLASS-010",
    workingTitle: "New Orleans glass is crushed into sand for coastal restoration",
    sourceState: "First-party project source exists; independent effectiveness evidence is still required before proof framing.",
    rightsRoute: "Visual and programme reuse rights not yet closed; do not infer permission from public site access.",
    masterStory: "Waste → material → coast is immediately legible, but 4PLANET should only call it proof when independent restoration evidence supports the outcome.",
    recommendedFormat: "Problem → solution → evidence carousel after effectiveness and rights closure.",
    destination: "Solutions / IMPACT context if proof threshold is reached; otherwise editorial Solution Intelligence only.",
    distributionOpportunity: "Circularity, coastal restoration, city innovation and solutions channels.",
    productionReadiness: "VERIFY_EFFECTIVENESS_AND_RIGHTS_FIRST",
  },
];

export interface AssetRetrievalProof {
  queryId: string;
  query: string;
  resolvedAssetIds: string[];
  resolvedRightsDecisionIds: string[];
  result: "PASS" | "PARTIAL";
  note: string;
}

export const P0_ASSET_RETRIEVAL_PROOFS: AssetRetrievalProof[] = [
  {
    queryId: "RET-BOS-ORCA-001",
    query: "ORCA + original/source/data/design + social-cleared",
    resolvedAssetIds: ["AST-0025"],
    resolvedRightsDecisionIds: ["RD-0019"],
    result: "PASS",
    note: "P0 source-first object resolves without manual founder folder search; optional documentary routes remain separate.",
  },
  {
    queryId: "RET-BOS-OSLO-001",
    query: "OSLOFJORDEN + map/data + web/social-cleared",
    resolvedAssetIds: ["AST-0022"],
    resolvedRightsDecisionIds: ["RD-0016"],
    result: "PASS",
    note: "Original ONE PLACE source/data/design route resolves without agency screenshots/tiles or documentary media.",
  },
  {
    queryId: "RET-BOS-BEE-001",
    query: "BEE + relationship + original design + motion-safe",
    resolvedAssetIds: ["AST-0020"],
    resolvedRightsDecisionIds: ["RD-0014"],
    result: "PASS",
    note: "Original Relationship Reveal resolves directly; motion specification uses the same rights-clean design route.",
  },
];

export function releaseFamilyForStory(storyId: string): ReleaseFamily {
  const family = P0_RELEASE_FAMILIES.find((candidate) => candidate.storyId === storyId);
  if (!family) throw new Error(`No pre-live release family for ${storyId}.`);
  return family;
}
