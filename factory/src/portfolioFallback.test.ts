import { describe, expect, it } from "vitest";
import {
  createPortfolioFallbackQueue,
  isOnlyReceiverWriterConflict,
} from "./portfolioFallback";

const TEST_SHA = "ce532830640817f83c11923bdfb4c394f222baad";
const FACTORY_SHA = "eff122f67a9e99cc5749b5b23609afd6b33d89d6";

describe("portfolio fallback", () => {
  it("builds an ordered conflict-free read-only queue across real transfer projects", () => {
    const queue = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T14:45:00.000Z");

    expect(queue.projects.map((project) => project.id)).toEqual([
      "PLANET_GBR_TRANSFER_02",
      "PLANET_AMAZONIA_TRANSFER_03",
    ]);
    expect(queue.packages).toHaveLength(3);
    expect(queue.packages[0].projectId).toBe("PLANET_GBR_TRANSFER_02");
    expect(queue.packages[1].projectId).toBe("PLANET_GBR_TRANSFER_02");
    expect(queue.packages[2].projectId).toBe("PLANET_AMAZONIA_TRANSFER_03");

    for (const pkg of queue.packages) {
      expect(pkg.status).toBe("READY");
      expect(pkg.writeScopes).toEqual([]);
      expect(pkg.section).toBe("RESEARCH_DATA");
      expect(pkg.execution?.kind).toBe("HTTP_SOURCE_CHECK");
      expect(pkg.resourceBudget?.maxModelCalls).toBe(0);
      expect(pkg.run?.expectedBaseSha).toBe(TEST_SHA);
    }
  });

  it("recognises only the proven local receiver-writer conflict as a safe fallback trigger", () => {
    expect(isOnlyReceiverWriterConflict({
      error: "ACTIVATION_PREFLIGHT_BLOCKED",
      preflight: {
        authority: [
          { code: "RECEIVER_SINGLE_WRITER_CONFLICT" },
          { code: "RECEIVER_SINGLE_WRITER_CONFLICT" },
        ],
      },
    })).toBe(true);

    expect(isOnlyReceiverWriterConflict({
      error: "ACTIVATION_PREFLIGHT_BLOCKED",
      preflight: { authority: [{ code: "TEST_KING_MOVED" }] },
    })).toBe(false);
    expect(isOnlyReceiverWriterConflict({ error: "OTHER" })).toBe(false);
  });

  it("binds fallback identity to exact TEST state so prior outcomes cannot satisfy a changed receiver", () => {
    const first = createPortfolioFallbackQueue(TEST_SHA, FACTORY_SHA, "2026-09-06T14:45:00.000Z");
    const changedTest = `a${TEST_SHA.slice(1)}`;
    const second = createPortfolioFallbackQueue(changedTest, FACTORY_SHA, "2026-09-06T14:45:00.000Z");

    expect(first.packages[0].id).not.toBe(second.packages[0].id);
    expect(first.packages[0].run?.inputStateHash).toContain(`test=${TEST_SHA}`);
    expect(second.packages[0].run?.inputStateHash).toContain(`test=${changedTest}`);
  });
});
