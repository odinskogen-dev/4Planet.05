# 4PLANET Claude Context Protocol

Purpose: make Claude functionally expert in the **relevant current 4PLANET scope** without wasting context by re-reading the entire Knowledge OS every run.

## Principle

The goal is not to preload everything. The goal is to provide a reliable map of truth, current state and retrieval paths so the agent can pull detail when it matters.

More context is not automatically better context. Stale or duplicated context is worse than a smaller current pack.

## Context layers

### L0 — Durable operating contract
Always loaded:
- `CLAUDE.md`
- `AGENTS.md`

Contains stable authority, safety, TEST KING, Zero Loss, Gold, lineage and return rules.

### L1 — Current 4PLANET digest
Read when programme state matters:
- `docs/claude/CURRENT_4PLANET_CONTEXT.md`

This is a compact generated snapshot of the current North Star, GIGA priorities, active product state, major conflicts/locks and current critical path. It must carry a freshness timestamp and source pointers.

Do not treat it as a permanent Canon document. It is a current-context projection.

### L2 — Task / work package
Always read the assigned work order or issue.

A good work order specifies:
- objective / user value;
- why now;
- exact allowed scope;
- active overlap/locks;
- MUST-NOT-LOSE;
- acceptance evidence;
- truth boundaries;
- next handoff.

It should normally **not prescribe the implementation**. Claude owns solution judgement inside the constraints.

### L3 — Relevant product / Gold contracts
Load only what the affected product needs. Examples:
- current Code Lineage Register;
- Gold Current Brief;
- Gold Enforcement Matrix;
- Gold Primitive Registry;
- Brand/content guidance;
- relevant product docs and tests.

Inspect the actual implementation before deciding.

### L4 — Live evidence
Use current git history, open PR/issue information, exact branch/SHA, current preview/runtime and tests when available.

Current evidence outranks an old summary about code state.

### L5 — Deep BRAIN / Google Drive retrieval
Use targeted retrieval only when L0–L4 do not contain enough authoritative detail for a material decision.

Good reasons to fetch deeper Drive context:
- Founder decision detail;
- partner or capital status;
- mission/project history that changes the decision;
- source/provenance truth;
- cross-product dependency not captured in the current digest;
- brand/strategy nuance required for a high-impact judgement.

Bad reason:
- "read the whole Drive so I know 4PLANET".

When deeper retrieval is required, search narrowly, read the minimum authoritative source set, record which source changed the decision, then return to the task.

## Context economy

Default target per run:
- durable rules: small;
- current digest: concise;
- one task pack: concise;
- product-specific files: on demand;
- broad archives: never by default.

Use subagents or targeted repository search for high-volume exploration when useful so the main reasoning context stays clean.

## Freshness

The current digest must state:
- generated_at;
- TEST KING identity when known;
- source authorities used;
- active work checked.

If stale relative to a material code or Founder decision, rehydrate before acting.

## Independence rule

Separate **authority constraints** from **solution hypotheses**.

Authority constraints are binding.
Solution hypotheses are challengeable.

Claude should explicitly say when it believes the work-order author's suggested solution is weaker than another route and explain why with evidence.

## Anti-duplication rule

Before a write task:
1. inspect active work for the same product seam;
2. resolve current active development line;
3. refuse overlapping mutation unless the Conductor has explicitly transferred or shared the lock;
4. prefer review-only analysis when another worker owns the seam.

## Learning return

A strong run should leave behind less uncertainty than it started with.

Persist reusable learning as:
OBSERVATION → ROOT CAUSE → GENERALISABLE RULE → AFFECTED SURFACES → CORRECTION → VERIFICATION → BRAIN WRITEBACK CANDIDATE.

Do not turn every local preference into a universal rule.