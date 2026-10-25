import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const ROUTER_ID = "15XcZ7FQqAZnoxVe74YNlfh4MccYRcPPTYYFQ1XNbQVo";
const STALE_HANDOFF = "must come from a fresh AXE / GPT Project Lead BRAIN handoff";

const sources = {
  "AGENTS.md": fs.readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8"),
  ".github/copilot-instructions.md": fs.readFileSync(new URL("../.github/copilot-instructions.md", import.meta.url), "utf8"),
};

function startupContractFailures(entries) {
  const failures = [];
  for (const [name, content] of Object.entries(entries)) {
    if (!content.includes(ROUTER_ID)) failures.push(`${name}: missing sole 00 router`);
    if (!/derived/i.test(content)) failures.push(`${name}: derived router boundary missing`);
    if (!/(OKF|Source Inventory)/.test(content) || !/(Project Home|WBS\/Atomic)/.test(content)) {
      failures.push(`${name}: targeted original authority path missing`);
    }
    if (content.includes(STALE_HANDOFF)) failures.push(`${name}: stale generic Project Lead handoff remains mandatory`);
  }

  const combined = Object.values(entries).join("\n");
  if (/Minimum current-state path:\s*`[^`]*01_ PROJECT LEAD[^`]*02_ ACTIVE TASKS/i.test(combined)) {
    failures.push("historical 01/02 remains a mandatory cold-start chain");
  }
  if (!/(on-demand only|Never bulk-load historical 01 Project Lead, 02 task archives)/i.test(combined)) {
    failures.push("historical context is not explicitly on-demand");
  }
  if (!/(HOLD only the unsafe|holds only the affected unsafe)/i.test(combined)) {
    failures.push("bounded stale-source HOLD missing");
  }
  return failures;
}

test("all mandatory startup instructions route through only the derived 00 context", () => {
  assert.deepEqual(startupContractFailures(sources), []);
});

test("old Project Lead mandatory-handoff sentence is a failing regression fixture", () => {
  const mutated = {
    ...sources,
    ".github/copilot-instructions.md": `${sources[".github/copilot-instructions.md"]}\n${STALE_HANDOFF}`,
  };
  assert.deepEqual(
    startupContractFailures(mutated).filter((failure) => failure.includes("stale generic Project Lead")),
    [".github/copilot-instructions.md: stale generic Project Lead handoff remains mandatory"],
  );
});
