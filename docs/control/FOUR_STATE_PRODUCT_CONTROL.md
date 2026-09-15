# 4PLANET FOUR-STATE PRODUCT CONTROL

Status: FOUNDER-DIRECTED CONTROL IMPLEMENTATION / WORKING CONTROL / NO LIVE PROMOTION
Owner: AXE / GPT Project Lead
Founder authority: Odin Oddekalv

## Founder decision — 04 SEP 2026

Every material 4PLANET public product is controlled through four human-visible states:

1. **LIVE** — the public production surface.
2. **HEIR** — the sole leading successor under active convergence; formerly TEST KING at programme level.
3. **SANDBOX** — the one bounded experimental/implementation surface for the product when needed.
4. **ARCHIVED** — immutable historical deliveries retained for visual comparison, donor recovery and rollback evidence.

The operating purpose is human-visible product control. Odin must be able to inspect the actual rendered output of LIVE, HEIR, every active SANDBOX and ARCHIVED deliveries without reconstructing branch history.

## ABSOLUTE PRODUCT WRITE AUTHORITY

This is the default and mandatory 4PLANET product-development law from 04 SEP 2026 onward.

### Only two product-development write targets exist

**HEIR and the single registered SANDBOX are the only legal product-development write targets.**

- `HEIR` = `king/test`, the sole moving integrated successor.
- `SANDBOX` = at most one explicitly registered active sandbox branch for the affected product.
- `LIVE` is **not** a development branch. LIVE may change only through an exact-artifact Founder-gated promotion transaction from HEIR.
- `ARCHIVED` is **never** a development branch. ARCHIVED may only be read, rendered, compared and used as donor evidence.

An agent/chat/tool may inspect any historical artifact, but it may not continue development on it, repair it in place, merge into it, use it as a receiving branch, create a candidate from it, or mutate its archived identity.

### Archive means immutable

`ARCHIVED` means a frozen exact SHA/artifact/tag/release/deployment record. It does **not** mean “an old branch that is still available to work on”.

Historical branches that have not yet completed archive disposition are classified:

`QUARANTINE_PENDING_ARCHIVE`

They have **zero write authority and zero candidate authority**. They are read-only donor sources from the product-control perspective.

If value is recovered from ARCHIVED or QUARANTINE material, the value must be copied/adapted into the current HEIR or registered SANDBOX. The source remains unchanged.

### No new candidate classes

No agent/chat/tool may create a new product continuation class, “candidate”, “recovery candidate”, “gold candidate”, parallel test line, branch preview authority or alternate heir.

The only permitted active product states are:

`LIVE → HEIR → SANDBOX → ARCHIVED`

A technical support branch may exist only for bounded governance/infrastructure work that contains no product mutation and confers no product authority. It may never become a hidden product candidate.

### Every active product mutation must be human-visible

Every material product mutation must belong to HEIR or the registered SANDBOX and must have a working Founder-visible URL:

- HEIR: `https://test.4planet.org/<product>`
- SANDBOX: `https://test.4planet.org/<product>/sandbox`

No local-only, container-only, branch-only or agent-only material product delivery may be treated as completed work or candidate value. Containers may be used for execution, testing and build support, but the resulting material product state must be deployed to the registered Founder-visible HEIR/SANDBOX URL before it can be returned as a product delivery.

### New idea / new product law

**Every new user-facing 4PLANET idea must enter this control system before the first material product-code mutation.**

The intake transaction is:

`IDEA → PRODUCT/SEAM REGISTRY ENTRY → LIVE state (released or UNRELEASED) → HEIR review path → SANDBOX slot (NONE or one registered branch) → ARCHIVE namespace → exact parent/write scope → then code`

For an unreleased idea, LIVE may explicitly be `UNRELEASED`; this does not permit hidden work. HEIR and any active SANDBOX must still have Founder-visible review URLs before material product work is returned.

No registry entry = no product mutation.

## Human-visible URL contract

### LIVE
Existing public domains remain the production addresses, for example:
- `https://4planet.org/`
- `https://4planetmagazine.com/`
- `https://s4piens.com/`
- `https://4species.com/`
- `https://cre4tors.com/`
- `https://4planetmarket.com/`

LIVE identity is **domain + exact deployed artifact/SHA**, not a branch name. LIVE is promotion-only and not an ordinary write target.

### HEIR
The shared Founder-review environment is:

`https://test.4planet.org/<product>`

Examples:
- `/atlas`
- `/species`
- `/living-systems`
- `/orca`
- `/amazonia`
- `/oslofjord`
- `/impact`
- `/magazine`
- `/s4piens`
- `/food`
- `/cre4tors`
- `/market`

HEIR defaults to the current `king/test` deployment unless the registry explicitly states another bounded operational source. There may be **one and only one HEIR per product**.

### SANDBOX
Every active user-facing sandbox must have a stable Founder-visible address beneath the same test control world:

`https://test.4planet.org/<product>/sandbox`

Only one active SANDBOX is permitted per product. Multiple workers may collaborate on that same registered sandbox, but they may not create additional product branches/candidates.

No sandbox may replace HEIR merely because it is newer, builds successfully or has a more recent deployment.

### ARCHIVED
Human-visible historical deliveries are indexed at:

`https://archive.4planet.org/`

Each archive entry must record:
- product;
- human-readable label/version;
- exact SHA/artifact identity;
- original branch/PR when applicable;
- archived date;
- prior role: LIVE / HEIR / SANDBOX / DONOR;
- visual URL or immutable deployment URL;
- donor disposition status;
- rollback relevance;
- reason superseded/rejected/deferred where known.

Archived items are immutable evidence and donor sources. **They are never checkout/write/merge targets for product development.**

## One control world for all 4PLANET domains

Product development for separate public domains uses the common Founder-review world under `test.4planet.org` unless a technical origin is required behind the proxy.

Examples:
- current CRE4TORS work → `test.4planet.org/cre4tors`;
- current Magazine work → `test.4planet.org/magazine`;
- current S4PIENS work → `test.4planet.org/s4piens`;
- current Market work → `test.4planet.org/market`.

The final LIVE domain remains product-specific. The common test world is a review/control surface, not a merger of public brand identities.

## Git branch relationship

The four human states are product authority states, not four mutable Git branches.

- LIVE = exact deployed artifact/SHA + production domain; promotion-only.
- HEIR = `king/test`; mutable integrated product-development line.
- SANDBOX = at most one registered active product branch per product seam, descended from HEIR.
- ARCHIVED = immutable SHA/tag/release/deployment records; no ongoing work.
- QUARANTINE_PENDING_ARCHIVE = historical branches awaiting disposition; no writes and no candidate authority.

No ordinary product-development branch is permitted outside HEIR or the one registered SANDBOX.

## Hard authority laws

1. ONE HEIR PER PRODUCT.
2. MAX ONE ACTIVE SANDBOX PER PRODUCT.
3. HEIR OR REGISTERED SANDBOX ARE THE ONLY PRODUCT-DEVELOPMENT WRITE TARGETS.
4. LIVE IS PROMOTION-ONLY; NEVER AN ORDINARY DEVELOPMENT TARGET.
5. ARCHIVED IS READ-ONLY; NEVER A CHECKOUT/WRITE/MERGE TARGET.
6. QUARANTINE_PENDING_ARCHIVE IS READ-ONLY DONOR MATERIAL WITH ZERO AUTHORITY.
7. NEWEST WINS IS FORBIDDEN.
8. BRANCH NAME IS NOT AUTHORITY.
9. DEPLOYMENT RECENCY IS NOT AUTHORITY.
10. A PR IS NOT A CANDIDATE BY EXISTENCE.
11. NO NEW PRODUCT CANDIDATE CLASS MAY BE INVENTED.
12. EVERY MATERIAL ACTIVE PRODUCT STATE MUST HAVE A FOUNDER-VISIBLE REVIEW URL.
13. SANDBOX → HEIR requires exact-SHA QA + human review decision.
14. HEIR → LIVE requires exact-SHA QA + explicit Founder release.
15. On promotion, the prior state is archived before mutation.
16. Historical/recovery branches are donor/quarantine/archive unless explicitly registered into the one SANDBOX slot before work.
17. Unknown lineage fails closed as `PRODUCT AUTHORITY CONTEXT UNRESOLVED`.
18. EVERY NEW USER-FACING IDEA/PRODUCT/SEAM MUST BE REGISTERED INTO THIS MODEL BEFORE MATERIAL PRODUCT CODE.

## Mandatory agent bootstrap

Before any material product-code mutation an agent/chat/tool must resolve, from connected current authority:

- repository;
- product/seam;
- current LIVE state + URL + SHA/artifact when released;
- current HEIR URL + branch + exact current SHA;
- active SANDBOX branch + exact current SHA + URL, or explicit `NONE`;
- archive/quarantine donor identities;
- current task/WBS/Project Home;
- exact parent SHA;
- legal write target: HEIR or registered SANDBOX;
- write scope;
- human-review URL;
- return path to HEIR;
- rollback identity.

If this cannot be resolved, stop product mutation with:

`PRODUCT AUTHORITY CONTEXT UNRESOLVED`

Inspection/research is permitted. Product mutation, branch continuation, candidate creation, hidden preview work and production mutation are not.

## Human review law

Technical PASS is not Human Gold.

Every material user-facing delivery must be rendered and reachable by Odin before Founder acceptance or rejection. A return without a working Founder-visible URL is incomplete unless the work is purely non-product governance/support.

The default review sequence is:

`SANDBOX render → technical/truth regression gates → Odin visual/use judgement → adopt/correct/reject → HEIR → final gates → Odin LIVE release judgement`.

Work may also occur directly on HEIR when no SANDBOX is needed, but HEIR remains the one integrated successor and its review URL remains visible.

## Promotion transaction

### SANDBOX → HEIR
1. Freeze sandbox exact SHA.
2. Verify it descends from the registered HEIR ancestor or produce explicit zero-loss donor disposition.
3. Run required product + truth + browser gates.
4. Present stable sandbox URL and exact SHA to Odin.
5. Odin/AXE classification: ADOPT / CORRECT / REJECT / DEFER.
6. Accepted delta converges to `king/test`.
7. Verify `test.4planet.org/<product>` resolves to the new HEIR exact SHA.
8. Archive/freeze the sandbox delivery and remove active sandbox authority.

### HEIR → LIVE
1. Freeze exact HEIR SHA/artifact.
2. Archive prior LIVE exact artifact first.
3. Run final release gates on the same artifact.
4. Odin provides explicit action-specific release authority.
5. Promote the exact tested artifact; do not rebuild from a different branch.
6. Verify public domain readback against expected artifact/SHA.
7. Update LIVE/HEIR/archive registry atomically.

## Donor recovery transaction

For ARCHIVED or QUARANTINE donor value:

`READ SOURCE → IDENTIFY EXACT DELTA → COPY/ADAPT INTO CURRENT HEIR OR REGISTERED SANDBOX → TEST → HUMAN REVIEW → DISPOSITION DONOR → LEAVE SOURCE UNCHANGED`

Never fix the donor in place. Never restart a donor branch. Never promote a donor branch itself.

## Cleanup law

Repository cleanup must preserve unique value before deleting historical branch refs.

For every historical user-facing branch/PR:

`ADOPT | ALREADY PRESENT / SUPERSEDED_BY | DEFER_WITH_REASON | BLOCKED_TRUTH_RIGHTS | REJECT_WITH_REASON`

After disposition:
- preserve exact SHA/tag/archive record;
- close stale PR;
- remove active branch ref when safe;
- retain the immutable archive artifact;
- never allow the archived source to regain authority by recency or agent inference.

## Enforcement layers

1. **Agent contract:** repository instructions fail closed before mutation.
2. **Machine gate:** `scripts/product-authority-gate.mjs` rejects product-code mutation outside HEIR/registered SANDBOX and rejects state-law drift.
3. **CI gate:** every authorised PR/push runs product-authority validation and branch inventory.
4. **Human visibility:** material HEIR/SANDBOX outputs require registered working review URLs.
5. **GitHub repository admin rules:** branch/ruleset protection must physically prevent direct unauthorised writes and archive ref mutation. Until this admin layer is verified, software/CI enforcement is strong but not a mathematically absolute guarantee against a credential with direct Git write power.

No system may claim 100% physical enforcement until layer 5 is verified green.

## Current implementation priority

P0-A — harden absolute HEIR/SANDBOX-only product write authority.
P0-B — harden ARCHIVE/QUARANTINE as donor-only immutable state.
P0-C — require registry + visible URL before every new product idea enters code.
P0-D — inventory LIVE / HEIR / SANDBOX / ARCHIVE for every active product.
P0-E — recover ATLAS and Magazine into one HEIR each.
P0-F — maintain `test.4planet.org` Founder-review routing and `archive.4planet.org` visual history.
P0-G — disposition stale branches/PRs without losing donor value.
P0-H — complete repository-admin ruleset protection so unauthorised writes are physically rejected before acceptance.

No broad new product feature work may bypass these controls.
