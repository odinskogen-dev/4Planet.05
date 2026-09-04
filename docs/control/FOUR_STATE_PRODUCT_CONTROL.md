# 4PLANET FOUR-STATE PRODUCT CONTROL

Status: FOUNDER-DIRECTED CONTROL IMPLEMENTATION / WORKING CONTROL / NO LIVE PROMOTION
Owner: AXE / GPT Project Lead
Founder authority: Odin Oddekalv

## Founder decision — 04 SEP 2026

Every material 4PLANET public product is controlled through four human-visible states:

1. **LIVE** — the public production surface.
2. **HEIR** — the sole leading successor under active convergence; formerly TEST KING at programme level.
3. **SANDBOX** — bounded experimental/implementation work that may become donor value for the HEIR but has no candidate authority by existence.
4. **ARCHIVED** — immutable historical deliveries retained for visual comparison, donor recovery and rollback evidence; never an active continuation line.

The operating purpose is human-visible product control. Odin must be able to inspect the actual rendered output of LIVE, HEIR, every active SANDBOX and ARCHIVED deliveries without reconstructing branch history.

## Human-visible URL contract

### LIVE
Existing public domains remain the production addresses, for example:
- `https://4planet.org/`
- `https://4planetmagazine.com/`
- `https://s4piens.com/`
- `https://4species.com/`
- `https://cre4tors.com/`
- `https://4planetmarket.com/`

LIVE identity is **domain + exact deployed artifact/SHA**, not a branch name.

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

If more than one technical worker is required behind one product seam, only one may be designated `ACTIVE SANDBOX`; additional branches are code-only support/donors and may not be called candidates. The active sandbox route resolves to its exact registered branch/SHA deployment.

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

Archived items are **immutable evidence**, not working branches.

## One control world for all 4PLANET domains

Product development for separate public domains may use the common Founder-review world under `test.4planet.org` unless a technical reason requires an isolated deployment origin.

Examples:
- current CRE4TORS work → `test.4planet.org/cre4tors`;
- current Magazine work → `test.4planet.org/magazine`;
- current S4PIENS work → `test.4planet.org/s4piens`;
- current Market work → `test.4planet.org/market`.

The final LIVE domain remains product-specific. The common test world is a review/control surface, not a merger of public brand identities.

## Git branch relationship

The four human states are **product authority states**, not a requirement to maintain four Git branches.

- LIVE = exact deployed artifact/SHA + production domain.
- HEIR = `king/test` integrated product state unless explicitly registered otherwise.
- SANDBOX = at most one active bounded user-facing branch per product seam, always descended from the registered HEIR ancestor.
- ARCHIVED = tags/releases/deployment artifacts and records; no ongoing work.

Short-lived implementation/support branches may exist only when registered to an active sandbox or non-product system task. They have no independent product authority and must not receive stable Founder-review URLs unless promoted to the single active sandbox slot.

## Hard authority laws

1. ONE HEIR PER PRODUCT.
2. MAX ONE ACTIVE USER-FACING SANDBOX PER PRODUCT.
3. NEWEST WINS IS FORBIDDEN.
4. BRANCH NAME IS NOT AUTHORITY.
5. DEPLOYMENT RECENCY IS NOT AUTHORITY.
6. A PR IS NOT A CANDIDATE BY EXISTENCE.
7. LIVE CHANGES ONLY THROUGH FOUNDER-GATED PROMOTION.
8. SANDBOX → HEIR requires exact-SHA QA + human review decision.
9. HEIR → LIVE requires exact-SHA QA + explicit Founder release.
10. On promotion, the prior state is archived before mutation.
11. Historical/recovery branches are DONOR/ARCHIVE unless explicitly registered into the single sandbox slot.
12. Unknown lineage fails closed as `CODE LINEAGE UNRESOLVED`.

## Mandatory agent bootstrap

Before any material code mutation an agent must resolve, from connected current authority:

- repository;
- product/seam;
- current LIVE URL + SHA/artifact when relevant;
- current HEIR URL + branch + SHA;
- active SANDBOX branch + SHA + URL, or explicit `NONE`;
- allowed donors;
- archive/recovery constraints;
- current task/WBS/Project Home;
- exact parent SHA;
- write scope;
- human-review gate;
- return path to HEIR;
- rollback identity.

If this cannot be resolved, the agent must stop product mutation with:

`PRODUCT AUTHORITY CONTEXT UNRESOLVED`

It may inspect/research, but may not create a new product candidate, user-facing branch, preview authority or production change.

## Human review law

Technical PASS is not Human Gold.

Every material user-facing delivery must be rendered and reachable by Odin before Founder acceptance or rejection. A return without a working Founder-visible URL is incomplete unless the failure is a proven external infrastructure blocker.

The default review sequence is:

`SANDBOX render → technical/truth regression gates → Odin visual/use judgement → adopt/correct/reject → HEIR → final gates → Odin LIVE release judgement`.

## Promotion transaction

### SANDBOX → HEIR
1. Freeze sandbox exact SHA.
2. Verify it descends from registered HEIR ancestor or produce explicit zero-loss convergence disposition.
3. Run required product + truth + browser gates.
4. Present stable sandbox URL and exact SHA to Odin.
5. Odin/AXE classification: ADOPT / CORRECT / REJECT / DEFER.
6. Accepted delta converges to `king/test`.
7. Verify `test.4planet.org/<product>` resolves to new HEIR exact SHA.
8. Archive/freeze the sandbox delivery and remove active sandbox authority.

### HEIR → LIVE
1. Freeze exact HEIR SHA/artifact.
2. Archive prior LIVE exact artifact first.
3. Run final release gates on the same artifact.
4. Odin provides explicit action-specific release authority.
5. Promote the exact tested artifact; do not rebuild from a different branch.
6. Verify public domain readback against expected artifact/SHA.
7. Update LIVE/HEIR/archive registry atomically.

## Cleanup law

Repository cleanup must preserve unique value before deleting active branch refs.

For every historical user-facing branch/PR:

`ADOPT | ALREADY PRESENT / SUPERSEDED_BY | DEFER_WITH_REASON | BLOCKED_TRUTH_RIGHTS | REJECT_WITH_REASON`

After disposition:
- preserve exact SHA/tag/archive record;
- close stale PR;
- remove active branch ref when safe;
- never allow the archived source to regain authority by recency or agent inference.

## Current implementation priority

P0-A — harden product authority and agent bootstrap.
P0-B — inventory LIVE / HEIR / SANDBOX / ARCHIVE for every active product.
P0-C — recover ATLAS and Magazine into one HEIR each.
P0-D — establish `test.4planet.org` Founder-review routing.
P0-E — establish `archive.4planet.org` visual archive/index.
P0-F — close/disposition stale user-facing branches and PRs without losing donor value.
P0-G — install automated drift detection and fail-closed enforcement.

No broad new product feature work should bypass these controls while P0 branch/candidate ambiguity remains open.
