import type { Channel, StoryRecord } from "./types";

export interface ChannelDefinition {
  channel: Channel;
  role: string;
  defaultFormat: string;
  primaryMetric: string;
  guardrails: string[];
}

export interface ChannelOutputPlan {
  outputId: string;
  storyId: string;
  channel: Channel;
  contentFingerprintSeed: string;
  role: string;
  format: string;
  truthCore: string;
  audienceJob: string;
  openingJob: string;
  destination: string;
  primaryMetric: string;
  guardrails: string[];
  distributionPackRequired: boolean;
}

export interface DistributionTarget {
  targetId: string;
  name: string;
  targetType: "EDITORIAL" | "EXPERT" | "CREATOR" | "PARTNER" | "COMMUNITY" | "INSTITUTION";
  channel: Channel;
  topicalFit: number;
  geographicFit: number;
  relationshipFit: number;
  rightsUsefulness: number;
  evidenceAuthority: number;
  notes: string;
}

export interface RankedDistributionTarget extends DistributionTarget {
  score: number;
}

export const channels: Record<Channel, ChannelDefinition> = {
  web: {
    channel: "web",
    role: "Canonical public destination and source-of-truth experience.",
    defaultFormat: "Living story / place / species page with provenance and return path",
    primaryMetric: "qualified_story_depth",
    guardrails: ["Do not hide source or coverage limitations.", "Maintain a durable canonical URL."],
  },
  instagram: {
    channel: "instagram",
    role: "Visual memory, discovery and relationship surface.",
    defaultFormat: "Documentary single frame, 2–4 frame reveal, carousel or short motion",
    primaryMetric: "qualified_shares_and_saves",
    guardrails: ["Interesting before promotional.", "Caption may compress context but may not change truth state."],
  },
  youtube: {
    channel: "youtube",
    role: "Cinema, explainers and searchable audiovisual archive.",
    defaultFormat: "Short / explainer / field film with transcript and sources",
    primaryMetric: "qualified_watch_time",
    guardrails: ["Captions/transcript required.", "Synthetic media cannot masquerade as documentary capture."],
  },
  linkedin: {
    channel: "linkedin",
    role: "Institutional understanding, build transparency, proof and professional distribution.",
    defaultFormat: "Evidence-led post, build note, carousel or linked canonical story",
    primaryMetric: "qualified_professional_actions",
    guardrails: ["Avoid generic corporate sustainability voice.", "Claims keep the same provenance state as BRAIN."],
  },
  tiktok: {
    channel: "tiktok",
    role: "Episodic discovery and cultural translation.",
    defaultFormat: "Fast short-form explanation or documentary moment",
    primaryMetric: "qualified_completion_and_shares",
    guardrails: ["Hook may sharpen attention, never scientific certainty.", "No trend-chasing that damages subject dignity."],
  },
  newsletter: {
    channel: "newsletter",
    role: "Owned relationship, return and deeper continuity.",
    defaultFormat: "Field note, signal brief, story digest or proof update",
    primaryMetric: "qualified_return",
    guardrails: ["No CTA addiction.", "Prefer durable relationship and context over campaign pressure."],
  },
};

const openings: Record<Channel, string> = {
  web: "Orient the visitor to the living subject or place within five seconds.",
  instagram: "Create one visually legible reason to stop, then reveal the relationship.",
  youtube: "Open on the living subject, observation or unresolved question before system explanation.",
  linkedin: "Lead with the concrete build, evidence or decision rather than a generic mission statement.",
  tiktok: "Make the surprising relationship understandable immediately without overstating it.",
  newsletter: "Begin with one observed thing worth returning for.",
};

export function planChannelOutput(story: StoryRecord, channel: Channel): ChannelOutputPlan {
  const definition = channels[channel];
  const targetAllowed = story.targetChannels.includes(channel);

  return {
    outputId: `OUT-${story.storyId}-${channel.toUpperCase()}-001`,
    storyId: story.storyId,
    channel,
    contentFingerprintSeed: `${story.slug}:${channel}:truth-core-v1`,
    role: definition.role,
    format: definition.defaultFormat,
    truthCore: story.truthCore,
    audienceJob: story.audienceJob,
    openingJob: openings[channel],
    destination: channel === "web" ? `/stories/${story.slug}` : `/stories/${story.slug}`,
    primaryMetric: definition.primaryMetric,
    guardrails: [
      ...definition.guardrails,
      ...(targetAllowed ? [] : ["This channel is not in the current story target set; founder/programme decision required before use."]),
    ],
    distributionPackRequired: channel !== "web" && channel !== "newsletter",
  };
}

export function buildStoryChannelFamily(story: StoryRecord): ChannelOutputPlan[] {
  return story.targetChannels.map((channel) => planChannelOutput(story, channel));
}

export function rankDistributionTargets(targets: DistributionTarget[]): RankedDistributionTarget[] {
  return targets
    .map((target) => ({
      ...target,
      score: Number((
        target.topicalFit * 0.35
        + target.geographicFit * 0.15
        + target.relationshipFit * 0.2
        + target.rightsUsefulness * 0.1
        + target.evidenceAuthority * 0.2
      ).toFixed(2)),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export function selectVerificationQueue(
  targets: DistributionTarget[],
  minimum = 20,
  maximum = 50,
): RankedDistributionTarget[] {
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum < minimum || maximum > 50) {
    throw new Error("Verification queue must use 1–50 targets with maximum >= minimum.");
  }

  const ranked = rankDistributionTargets(targets);
  return ranked.slice(0, Math.min(maximum, Math.max(minimum, ranked.length)));
}
