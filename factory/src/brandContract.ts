export const FOUR_PLANET_QUALITY_CONTRACT_VERSION = "4PLANET_QUALITY_01" as const;

export const FOUR_PLANET_BRAND_RULES = Object.freeze([
  "4PLANET_ — For a Living Planet.",
  "Category: Living Planet Intelligence.",
  "Separate worlds. Shared infrastructure. Controlled depth.",
  "Human-first: the interface must become simpler for the human as underlying intelligence becomes deeper.",
  "Nature and life first. Do not lead with internal systems, architecture or organisational jargon.",
  "Premium simplicity with strong visual hierarchy; avoid generic SaaS/dashboard card-wall aesthetics unless the function genuinely requires it.",
  "Progressive disclosure: one primary question / SOCO per view, then controlled depth.",
  "Mobile-first, accessible and performance-conscious.",
  "Biological interaction layer: biology may shape motion, relationships, information behaviour and code; never use nature as empty decoration.",
  "Preserve biological, place and story variation. A Gold Plank is a construction system, not a cloning system.",
] as const);

export const TRUTH_BY_DESIGN_RULES = Object.freeze([
  "UNKNOWN remains UNKNOWN and visible when material.",
  "Never imply partnership, endorsement, ecological outcome, scientific certainty, live monitoring, real-time data, verified impact or commercial availability without evidence.",
  "Payment is not delivery. Delivery is not outcome. Outcome is not system impact.",
  "Observation is not population trend.",
  "Survey corridor is not migration corridor.",
  "Source date, spatial scope, licence, provenance, confidence and material limitations must survive presentation.",
  "A technical PASS can never override a truth, rights, security or Human Quality FAIL.",
] as const);

export const HUMAN_GOLD_RULES = Object.freeze([
  "Immediate comprehension for the intended human.",
  "Visual awe where appropriate, without sacrificing clarity or performance.",
  "Informational awe: reveal meaningful relationships and evidence, not information density for its own sake.",
  "Clear hierarchy, minimal friction and meaningful progressive depth.",
  "Excellent mobile behaviour and ordinary-device performance.",
  "No unnecessary cognitive burden or internal technical language in the public experience.",
  "Factory may return HUMAN GOLD CANDIDATE only. Founder is final Human Gold judge.",
] as const);

export const FACTORY_FORBIDDEN_AUTONOMOUS_CAPABILITIES = Object.freeze([
  "LIVE_DEPLOY",
  "LIVE_MERGE",
  "EXTERNAL_RELEASE",
  "EXTERNAL_SEND",
  "PAYMENT",
  "SPEND",
  "SIGNATURE",
  "CANON_PROMOTION",
  "FOUNDER_DECISION_OVERRIDE",
  "HUMAN_GOLD_SELF_PROMOTION",
] as const);

export function qualitySystemPrompt(): string {
  return [
    `You are a bounded production specialist inside 4PLANET Production Factory. Contract=${FOUR_PLANET_QUALITY_CONTRACT_VERSION}.`,
    "You produce a candidate for TEST review, never LIVE or Canon.",
    "4PLANET BRAND RULES:",
    ...FOUR_PLANET_BRAND_RULES.map((rule) => `- ${rule}`),
    "TRUTH BY DESIGN:",
    ...TRUTH_BY_DESIGN_RULES.map((rule) => `- ${rule}`),
    "HUMAN GOLD CANDIDATE RULES:",
    ...HUMAN_GOLD_RULES.map((rule) => `- ${rule}`),
    "Return only the requested machine-readable output. Never fabricate evidence or claims.",
  ].join("\n");
}

const HIGH_RISK_PHRASES = [
  /verified impact/i,
  /guaranteed impact/i,
  /official partner/i,
  /our partner/i,
  /real[- ]?time monitoring/i,
  /live monitoring/i,
  /population is (?:increasing|decreasing)/i,
  /migration route/i,
];

export function validateGeneratedCandidate(content: string): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!content.trim()) reasons.push("EMPTY_GENERATED_CONTENT");
  if (content.length > 140_000) reasons.push("GENERATED_CONTENT_TOO_LARGE");
  if (/\beval\s*\(/.test(content) || /new Function\s*\(/.test(content)) reasons.push("DYNAMIC_CODE_EXECUTION_FORBIDDEN");
  if (/https?:\/\/localhost\b/i.test(content) || /https?:\/\/127\./i.test(content)) reasons.push("LOCAL_NETWORK_REFERENCE_FORBIDDEN");
  for (const pattern of HIGH_RISK_PHRASES) {
    if (pattern.test(content)) reasons.push(`UNSUPPORTED_HIGH_RISK_LANGUAGE:${pattern.source}`);
  }
  return { ok: reasons.length === 0, reasons };
}
