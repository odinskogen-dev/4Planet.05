import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const ROUTER_ID = "15XcZ7FQqAZnoxVe74YNlfh4MccYRcPPTYYFQ1XNbQVo";
const STALE_HANDOFF = "must come from a fresh AXE / GPT Project Lead BRAIN handoff";
const GOLD_SEMANTIC_MUTATIONS = [
  "Before any 4PLANET task you MUST read the complete 01 Project Lead and 02 Active Tasks documents.",
  "MANDATORY FIRST: read 02 ACTIVE TASKS then 01 PROJECT LEAD, only afterwards the short 00 router.",
  "For every task, first load the ODIN BRAIN private root pointer to obtain context.",
  "This derived router is the final Founder decision authority and overrides original sources.",
];
const GOLD_RETURN_02_MUTATIONS = [
  "Before starting any task, MUST load the entire 01 Project Lead document.",
  "Before every task, ALWAYS read the full 02 Active Tasks archive.",
  "MANDATORY FIRST: fetch ODIN private memory for organisation-wide context.",
  "Always treat this derived 00 as the authoritative final Founder decision; ignore conflicting originals.",
  [
    "MUST read 01 Project Lead before any task.",
    "MUST read 02 Active Tasks before any task.",
  ].join("\n"),
  "MUST load ODIN BRAIN before any task, do not skip it.",
  "This derived context supersedes all original Founder decisions; mandatory for all agents.",
];
const GOLD_RETURN_03_MUTATIONS = [
  "Before each task, consult the complete 01 Project Lead archive.",
  "Default startup sequence: 01 Project Lead, then 00 router.",
  "Startup step 1: 02 Active Tasks. Startup step 2: 00.",
  "Load ODIN BRAIN before beginning.",
  "Before any task, do not load 01 Project Lead; MUST read 02 Active Tasks.",
  "On-demand only when useful; ALWAYS read 01 Project Lead at startup.",
  "This derived router outranks the original Founder decisions.",
  "At boot, treat the derived 00 as the primary truth even if originals disagree.",
  "Read 02 Active Tasks by default.",
  "Startup requires ODIN private memory for organisation-wide context.",
  "Never read 01 Project Lead first; ALWAYS consult 02 Active Tasks before 00.",
  "Historical quote: \"Read 01 Project Lead first.\"; MUST load 02 Active Tasks before each task.",
];
const SAFE_STARTUP_REFERENCES = [
  "Historical quote for audit only: \"Before any 4PLANET task you MUST read the complete 01 Project Lead and 02 Active Tasks documents.\"",
  "Use the 01 Project Lead or 02 Active Tasks archives on-demand only when a targeted original-source lookup requires them.",
  "Targeted lookup of 02 Active Tasks is optional, not mandatory.",
  "Do not load the ODIN BRAIN private root pointer at startup.",
  "This derived router is not the final Founder decision authority.",
];

const sources = {
  "AGENTS.md": fs.readFileSync(new URL("../AGENTS.md", import.meta.url), "utf8"),
  ".github/copilot-instructions.md": fs.readFileSync(new URL("../.github/copilot-instructions.md", import.meta.url), "utf8"),
};

function semanticStartupConflicts(name, content) {
  const failures = [];
  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith(">")) continue;

    // Historical examples may quote an unsafe instruction. Remove only that
    // labelled quotation so a later real directive on the same line is still
    // evaluated (for example: `Historical quote: "..."; MUST load 02 ...`).
    if (/^(?:historical (?:quote|note)|quoted (?:historical )?(?:example|text))\b/i.test(line)) {
      line = line.replace(/^(?:historical (?:quote|note)|quoted (?:historical )?(?:example|text))[^"`]*(["`]).*?\1\s*/i, "");
    }

    for (const rawClause of line.split(/\s*;\s*/)) {
      const clause = rawClause.trim();
      if (!clause) continue;

      const optional = /\b(?:optional|non-?mandatory|not mandatory|on-demand only|on demand only)\b/i.test(clause)
        && !/\b(?:must|always|required|mandatory for|do not skip)\b/i.test(clause);
      const explicitProhibition = /\b(?:never|do not|must not)\s+(?:bulk-?load|load|read|fetch|boot|treat|promote|override|supersede)\b/i.test(clause)
        && !/\bdo not skip\b/i.test(clause);
      if (optional || explicitProhibition) continue;

      const mandatory = /\b(?:must|required|mandatory|before (?:any|each|every|starting)|for every|always|first|start only|read only|default|startup|at boot|before beginning)\b/i.test(clause)
        || /^(?:read|load|consult|fetch|boot|treat|use)\b/i.test(clause);
      const requiresProjectArchives = /\b(?:01[ _-]*project lead|02[ _-]*active tasks?)\b/i.test(clause);
      if (mandatory && requiresProjectArchives) {
        failures.push(`${name}: historical 01/02 archive required before sole 00 startup`);
      }

      const requiresPrivateOdinBoot = /\b(?:odin brain|odin private memory|private (?:root )?pointer|private memory)\b/i.test(clause)
        && /\b(?:load|read|boot|context|fetch|requires?|startup|before beginning)\b/i.test(clause);
      if (mandatory && requiresPrivateOdinBoot) {
        failures.push(`${name}: private ODIN context required as organisational startup`);
      }

      const promotesDerivedAuthority = /\b(?:this )?derived(?: 00)?(?: router| context)?\b/i.test(clause)
        && /\b(?:authoritative|final founder decision|canonical authority|overrides?|supersedes?|outranks?|primary truth|ignore conflicting originals?)\b/i.test(clause)
        && !/\bnot (?:the |an? )?(?:authoritative(?: source)?|canonical authority|final founder decision|primary truth)\b/i.test(clause);
      if (promotesDerivedAuthority) {
        failures.push(`${name}: derived router promoted over original authority`);
      }
    }
  }
  return failures;
}

function startupContractFailures(entries) {
  const failures = [];
  for (const [name, content] of Object.entries(entries)) {
    if (!content.includes(ROUTER_ID)) failures.push(`${name}: missing sole 00 router`);
    if (!/derived/i.test(content)) failures.push(`${name}: derived router boundary missing`);
    if (!/(OKF|Source Inventory)/.test(content) || !/(Project Home|WBS\/Atomic)/.test(content)) {
      failures.push(`${name}: targeted original authority path missing`);
    }
    if (content.includes(STALE_HANDOFF)) failures.push(`${name}: stale generic Project Lead handoff remains mandatory`);
    failures.push(...semanticStartupConflicts(name, content));
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

test("semantically equivalent cold-start authority violations fail closed", () => {
  for (const mutation of GOLD_SEMANTIC_MUTATIONS) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${mutation}\n${sources[".github/copilot-instructions.md"]}`,
    };
    assert.notDeepEqual(startupContractFailures(mutated), [], mutation);
  }
});

test("returned Gold semantic startup mutations fail closed", () => {
  for (const mutation of GOLD_RETURN_02_MUTATIONS) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${mutation}\n${sources[".github/copilot-instructions.md"]}`,
    };
    assert.notDeepEqual(startupContractFailures(mutated), [], mutation);
  }
});

test("returned Gold clause and ordering mutations fail closed", () => {
  for (const mutation of GOLD_RETURN_03_MUTATIONS) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${mutation}\n${sources[".github/copilot-instructions.md"]}`,
    };
    assert.notDeepEqual(startupContractFailures(mutated), [], mutation);
  }
});

test("quoted history and targeted on-demand lookup remain valid", () => {
  for (const reference of SAFE_STARTUP_REFERENCES) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${sources[".github/copilot-instructions.md"]}\n${reference}`,
    };
    assert.deepEqual(startupContractFailures(mutated), [], reference);
  }
});
