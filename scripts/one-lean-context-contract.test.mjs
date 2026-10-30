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
const GOLD_RETURN_04_MUTATIONS = [
  "Do not load 01 Project Lead, but MUST read 02 Active Tasks before each task.",
  "Never load ODIN BRAIN, but always read 02 Active Tasks before 00.",
  "Do not read 01 Project Lead. MUST read 02 Active Tasks before any task.",
  "Do not treat the derived router as final authority, but this derived router overrides all original Founder decisions.",
  "Do not load ODIN private memory, but before beginning fetch the private ODIN BRAIN root.",
  "Do not read 01 Project Lead, and then read 02 Active Tasks before 00.",
  "Do not read 02 Active Tasks, yet MUST load 01 Project Lead at boot.",
  "Do not load 01 Project Lead; instead, read 02 Active Tasks before 00.",
  "Never routinely read 01 Project Lead; MUST read 02 Active Tasks before every task.",
];
const GOLD_RETURN_05_TASK_CLASS_MUTATIONS = [
  "Non-user-facing control tasks: before every edit, load the complete FOUR_STATE_PRODUCT_CONTROL.md, PRODUCT_SURFACE_REGISTRY.json, CODE_LINEAGE_REGISTER.md, GOLD_CURRENT_BRIEF.md and BRAND OS.",
  "Before any non-user-facing test change, read the full Gold document bundle and all four-state product authority files.",
  "Control-only edits require the complete Brand OS and all product lineage files as mandatory bootstrap.",
  "Before changing any code, first fetch all nine global Gold and Brand control documents.",
  "Every non-user-facing test task must preload the entire project lineage archive before starting.",
  "For a control-only task, always preload the complete product lineage archive before editing.",
];
const GOLD_RETURN_06_BARE_CONTRAST_MUTATIONS = [
  "Non-user-facing control work: do not automatically read Brand OS but MUST load GOLD_CURRENT_BRIEF before every edit.",
  "Never routinely read 01 Project Lead but MUST read 02 Active Tasks before every task.",
  "Non-user-facing control work: do not automatically read Brand OS but you MUST load GOLD_CURRENT_BRIEF before every edit.",
  "Never routinely read 01 Project Lead but you MUST read 02 Active Tasks before every task.",
  "Non-user-facing control work: do not automatically read Brand OS but the operator MUST load GOLD_CURRENT_BRIEF before every edit.",
  "Never routinely read 01 Project Lead but the operator MUST read 02 Active Tasks before every task.",
];
const GOLD_RETURN_07_SAFE_CONTRASTIVE_PROHIBITIONS = [
  "Never routinely read 01 Project Lead but you MUST NOT read 02 Active Tasks before any task.",
  "Never routinely read 01 Project Lead but you MUST NOT automatically read 02 Active Tasks before any task.",
];
const SAFE_STARTUP_REFERENCES = [
  "Historical quote for audit only: \"Before any 4PLANET task you MUST read the complete 01 Project Lead and 02 Active Tasks documents.\"",
  "Use the 01 Project Lead or 02 Active Tasks archives on-demand only when a targeted original-source lookup requires them.",
  "Targeted lookup of 02 Active Tasks is optional, not mandatory.",
  "Do not load the ODIN BRAIN private root pointer at startup.",
  "This derived router is not the final Founder decision authority.",
  "Read 01 Project Lead only when the assigned task requires that original source.",
  "Consult 02 Active Tasks if a targeted original-source lookup is needed; otherwise start with 00.",
  "Historical example for audit: \"MUST load 02 Active Tasks before any task.\"",
  "The derived router overrides nothing; original Founder decisions remain authoritative.",
  "Never routinely read old 00 READ FIRST → 01 Project Lead → 02 Tasks.",
];
const SAFE_TASK_CLASS_REFERENCES = [
  "For non-user-facing control work, do not automatically load the full four-state, Gold, Brand OS or lineage bundle.",
  "Material public-product work must read the applicable four-state, Brand OS, rights, lineage and Gold sources before the affected mutation.",
  "If a material public UI task changes a governed surface, read the applicable four-state and Brand OS sources.",
  "Targeted Gold or lineage sources are read only when required by the assigned task.",
  "Control-only edits must not preload the complete Brand OS and product lineage bundle.",
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
    if (/^(?:historical (?:quote|note|example)(?: for audit)?|quoted (?:historical )?(?:example|text))\b/i.test(line)) {
      line = line.replace(/^(?:historical (?:quote|note|example)(?: for audit)?|quoted (?:historical )?(?:example|text))[^"`]*(["`]).*?\1\s*/i, "");
    }

    const lineHasGlobalControlScope = /\b(?:non-user-facing|control-only|before changing any code|before every edit)\b/i.test(line);

    // Split only at explicit instruction boundaries. A contrast becomes a
    // boundary when its same instruction clause contains a mandate, regardless
    // of the actor phrase between the conjunction and the modal.
    const clauses = line.split(/\s*;\s*(?:instead,?\s*)?|(?<=[.!?])\s+|,\s*(?:but|yet|and then|instead,?)\s+|\s+(?=(?:but|yet|however)\b(?:(?![.!?;]).){0,80}\b(?:must|always|required|mandatory)\b)/i);
    for (const rawClause of clauses) {
      const clause = rawClause.trim().replace(/^(?:but|yet|and then|instead),?\s+/i, "");
      if (!clause) continue;

      const optional = /\b(?:optional|non-?mandatory|not mandatory|on-demand only|on demand only)\b/i.test(clause)
          || /\bonly when\b.*\b(?:requires?|needs?)\b/i.test(clause)
          || /\bif\b.*\b(?:needed|required)\b/i.test(clause);
      const optionalWithoutMandate = optional
        && !/\b(?:must|always|required before|required at|mandatory for|do not skip)\b/i.test(clause);
      const contrastingMandatory = /\b(?:but|yet|however)\b(?:(?![.!?;]).){0,80}\b(?:must|always|required|mandatory)\b/i.test(clause);
      const explicitProhibition = /^(?:never|do not|must not)\s+(?:(?:routinely|automatically)\s+)?(?:bulk-?load|load|read|fetch|boot|treat|promote|override|supersede)\b/i.test(clause)
        && !contrastingMandatory
        && !/\bdo not skip\b/i.test(clause);

      // Non-user-facing control work must not acquire public-product authority
      // bundles as a universal bootstrap. Keep this finite: require a global
      // control scope, a mandate, and a named broad supplemental bundle in the
      // same clause. An explicit prohibition remains valid guidance.
      const globalControlScope = lineHasGlobalControlScope
        || /\b(?:non-user-facing|control-only|before changing any code|before every edit)\b/i.test(clause);
      const mandatorySupplementalRead = /\b(?:must\s+(?:read|load|fetch|preload)|requires?|mandatory bootstrap|before (?:any|each|every|changing)[^.!?]*(?:read|load|fetch|preload)|first\s+(?:read|load|fetch|preload)|always\s+(?:read|load|fetch|preload))\b/i.test(clause);
      const broadSupplementalBundle = /\b(?:four[- ]state(?: product authority)?|FOUR_STATE_PRODUCT_CONTROL|PRODUCT_SURFACE_REGISTRY|Gold(?: document| control)? bundle|GOLD_CURRENT_BRIEF|Brand OS|Brand control documents?|CODE_LINEAGE_REGISTER|product lineage files?|(?:project|product) lineage archive)\b/i.test(clause);
      const scopedSupplementalProhibition = /\b(?:do not|never|must not)\s+(?:automatically\s+)?(?:read|load|fetch|preload|require)\b/i.test(clause)
        && !contrastingMandatory;
      if (globalControlScope && mandatorySupplementalRead && broadSupplementalBundle && !scopedSupplementalProhibition) {
        failures.push(`${name}: broad supplemental product/Gold/Brand/lineage preload required for control work`);
      }
      if (optionalWithoutMandate || explicitProhibition) continue;

      const actionBoundMustNot = /\bmust\s+not\s+(?:(?:routinely|automatically)\s+)?(?:bulk-?load|load|read|fetch|preload|boot|treat|promote|override|supersede|require)\b/i.test(clause);
      const mandatory = !actionBoundMustNot && (
        /\b(?:must|required|mandatory|before (?:any|each|every|starting)|for every|always|first|start only|read only|default|startup|at boot|before beginning)\b/i.test(clause)
        || /^(?:read|load|consult|fetch|boot|treat|use)\b/i.test(clause)
      );
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
        && !/\b(?:not (?:the |an? )?(?:authoritative(?: source)?|canonical authority|final founder decision|primary truth)|overrides? nothing)\b/i.test(clause);
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

test("returned Gold mixed-clause mutations fail closed", () => {
  for (const mutation of GOLD_RETURN_04_MUTATIONS) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${mutation}\n${sources[".github/copilot-instructions.md"]}`,
    };
    assert.notDeepEqual(startupContractFailures(mutated), [], mutation);
  }
});

test("returned Gold task-class preload mutations fail closed", () => {
  for (const mutation of GOLD_RETURN_05_TASK_CLASS_MUTATIONS) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${mutation}\n${sources[".github/copilot-instructions.md"]}`,
    };
    assert.notDeepEqual(startupContractFailures(mutated), [], mutation);
  }
});

test("returned Gold bare-contrast mandates fail closed in both entrypoints", () => {
  for (const mutation of GOLD_RETURN_06_BARE_CONTRAST_MUTATIONS) {
    for (const name of Object.keys(sources)) {
      const mutated = {
        ...sources,
        [name]: `${sources[name]}\n${mutation}`,
      };
      assert.notDeepEqual(startupContractFailures(mutated), [], `${name}: ${mutation}`);
    }
  }
});

test("returned Gold contrastive MUST NOT remains safe in both entrypoints", () => {
  for (const reference of GOLD_RETURN_07_SAFE_CONTRASTIVE_PROHIBITIONS) {
    for (const name of Object.keys(sources)) {
      const mutated = {
        ...sources,
        [name]: `${sources[name]}\n${reference}`,
      };
      assert.deepEqual(startupContractFailures(mutated), [], `${name}: ${reference}`);
    }
  }
});

test("repository entrypoints condition supplemental reads by task class", () => {
  assert.match(
    sources["AGENTS.md"],
    /Non-user-facing test and control work[\s\S]*Material public-product work/,
  );
  assert.match(
    sources[".github/copilot-instructions.md"],
    /For non-user-facing test and control work[\s\S]*For material public-product work/,
  );
  assert.doesNotMatch(
    sources[".github/copilot-instructions.md"],
    /Before changing code,[^\n]*Read `AGENTS\.md`, `docs\/control\/FOUR_STATE_PRODUCT_CONTROL\.md`/,
  );
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

test("task-conditional and prohibitive supplemental guidance remains valid", () => {
  for (const reference of SAFE_TASK_CLASS_REFERENCES) {
    const mutated = {
      ...sources,
      ".github/copilot-instructions.md": `${sources[".github/copilot-instructions.md"]}\n${reference}`,
    };
    assert.deepEqual(startupContractFailures(mutated), [], reference);
  }
});
