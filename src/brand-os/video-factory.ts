import type { StoryRecord } from "./types";
import type { MediaTruthClass } from "./production-system";

export type AspectRatio = "9:16" | "1:1" | "16:9";
export type MotionLayerType = "TEXT" | "SOURCE_FOOTER" | "PROVENANCE" | "RELATIONSHIP" | "IMAGE" | "VIDEO" | "MAP";

export interface MotionLayer {
  layerId: string;
  type: MotionLayerType;
  startMs: number;
  endMs: number;
  text?: string;
  assetId?: string;
  truthClass: MediaTruthClass;
  sourceRefs: string[];
  rightsRefs: string[];
  syntheticDisclosure: boolean;
}

export interface VideoRenderManifest {
  renderId: string;
  storyId: string;
  version: number;
  aspectRatio: AspectRatio;
  width: number;
  height: number;
  durationMs: number;
  fps: 24 | 25 | 30;
  audioMode: "NONE" | "LICENSED" | "ORIGINAL" | "VOICE_ONLY";
  captionsRequired: boolean;
  transcriptRequired: boolean;
  layers: MotionLayer[];
  sourceFooter: string;
  coverageLimit: string;
  status: "DRAFT" | "SOURCE_READY" | "RIGHTS_READY" | "QA_READY" | "BLOCKED";
}

export interface VideoManifestQA {
  status: "PASS" | "BLOCKED";
  reasons: string[];
}

export function evaluateVideoManifest(story: StoryRecord, manifest: VideoRenderManifest): VideoManifestQA {
  const reasons: string[] = [];

  if (manifest.storyId !== story.storyId) reasons.push("Video manifest is attached to the wrong story authority.");
  if (manifest.durationMs <= 0 || manifest.durationMs > 180_000) reasons.push("Video duration must be between 1 ms and 180 seconds.");
  if (!manifest.captionsRequired) reasons.push("Captions are required for Brand OS motion outputs.");
  if (!manifest.transcriptRequired) reasons.push("A transcript is required for Brand OS motion outputs.");
  if (!manifest.sourceFooter.trim()) reasons.push("Source footer is required.");
  if (!manifest.coverageLimit.trim()) reasons.push("Coverage/limitation statement is required.");
  if (!manifest.layers.length) reasons.push("At least one motion layer is required.");

  for (const layer of manifest.layers) {
    if (layer.startMs < 0 || layer.endMs <= layer.startMs || layer.endMs > manifest.durationMs) {
      reasons.push(`${layer.layerId} has an invalid timeline range.`);
    }
    if ((layer.type === "IMAGE" || layer.type === "VIDEO") && !layer.assetId) {
      reasons.push(`${layer.layerId} requires an asset ID.`);
    }
    if ((layer.type === "IMAGE" || layer.type === "VIDEO") && layer.rightsRefs.length === 0) {
      reasons.push(`${layer.layerId} requires a rights reference.`);
    }
    if (layer.truthClass === "SYNTHETIC" && !layer.syntheticDisclosure) {
      reasons.push(`${layer.layerId} uses synthetic media without disclosure.`);
    }
    if (layer.truthClass === "DOCUMENTARY_REALITY" && layer.sourceRefs.length === 0) {
      reasons.push(`${layer.layerId} documentary reality requires source/context references.`);
    }
  }

  return { status: reasons.length === 0 ? "PASS" : "BLOCKED", reasons };
}

export function buildBeeMotionManifest(story: StoryRecord): VideoRenderManifest {
  if (story.storyId !== "STORY-BOS-BEE-001") throw new Error("Bee motion manifest requires STORY-BOS-BEE-001.");

  return {
    renderId: "VID-BOS-BEE-001-V1",
    storyId: story.storyId,
    version: 1,
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    durationMs: 18_000,
    fps: 30,
    audioMode: "NONE",
    captionsRequired: true,
    transcriptRequired: true,
    layers: [
      {
        layerId: "L-BEE-01",
        type: "TEXT",
        startMs: 0,
        endMs: 3000,
        text: "WHAT DEPENDS ON WHAT?",
        truthClass: "DESIGN",
        sourceRefs: [],
        rightsRefs: [],
        syntheticDisclosure: false,
      },
      {
        layerId: "L-BEE-02",
        type: "RELATIONSHIP",
        startMs: 2500,
        endMs: 7500,
        text: "BEES → POLLINATION",
        truthClass: "DESIGN",
        sourceRefs: ["SRC-017", "CLM-BOS-BEE-001", "CLM-BOS-BEE-002"],
        rightsRefs: ["RD-0014"],
        syntheticDisclosure: false,
      },
      {
        layerId: "L-BEE-03",
        type: "RELATIONSHIP",
        startMs: 7000,
        endMs: 12_500,
        text: "POLLINATION → APPLE",
        truthClass: "DESIGN",
        sourceRefs: ["SRC-019", "CLM-BOS-BEE-003"],
        rightsRefs: ["RD-0014"],
        syntheticDisclosure: false,
      },
      {
        layerId: "L-BEE-04",
        type: "TEXT",
        startMs: 12_000,
        endMs: 16_000,
        text: "ONE FOOD RELATIONSHIP. NOT ALL FOOD. NOT ALL POLLINATORS.",
        truthClass: "DESIGN",
        sourceRefs: ["CLM-BOS-BEE-004"],
        rightsRefs: ["RD-0014"],
        syntheticDisclosure: false,
      },
      {
        layerId: "L-BEE-05",
        type: "SOURCE_FOOTER",
        startMs: 15_500,
        endMs: 18_000,
        text: "SOURCE: FAO + GARRATT ET AL. / LIMITS APPLY",
        truthClass: "DESIGN",
        sourceRefs: ["SRC-017", "SRC-019"],
        rightsRefs: ["RD-0014"],
        syntheticDisclosure: false,
      },
    ],
    sourceFooter: "SOURCE: FAO / SRC-017; Garratt et al. / SRC-019. Editorial synthesis: 4PLANET CONTEXT.",
    coverageLimit: "Bounded apple example. Bees are not all pollinators; apples are not all food; study results are not universalised beyond source scope.",
    status: "SOURCE_READY",
  };
}
