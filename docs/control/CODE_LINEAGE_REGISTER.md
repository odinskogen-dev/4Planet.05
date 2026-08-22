# 4PLANET CODE LINEAGE REGISTER

Status: CONTROLLED WORKING REGISTER · HISTORY PRESERVED · NOT LOCKED CANON
Owner: AXE / GPT Project Lead
Repository: `odinskogen-dev/4Planet.05`

## Purpose
Prevent branch/candidate drift, lost donor work and accidental regression. Every material code project gets a simple whole-number prototype sequence: `01`, `02`, `03`, `04`… regardless of Git branch naming. Existing historical branch names are preserved; the register adds a canonical project/version identity above them.

## Mandatory rule
No material product branch may begin coding until its intended lineage entry exists or is updated here.

Before first material edit record:
- PROJECT
- PROTOTYPE VERSION
- ROLE: `ACTIVE DEVELOPMENT | FIXED REVIEW | DONOR | SUPERSEDED | PRODUCTION | RECOVERY`
- PARENT VERSION / BASE SHA
- BRANCH
- PR / ISSUE
- EXACT HEAD SHA
- PREVIEW if known
- WHY this line exists
- DONORS permitted
- MUST PRESERVE

After every accepted material iteration update:
- exact head SHA
- verified delta
- tests / evidence
- preview
- donor features adopted
- features deliberately rejected or deferred
- next gate

A new branch must never become the implied latest candidate merely because it is newer.

## Branch creation policy
1. One `ACTIVE DEVELOPMENT` line per product seam.
2. Use a new branch only for isolation, a fixed review artifact, or a materially different bounded experiment.
3. Normal iteration stays on the active continuation branch.
4. Fixed review candidates become immutable and are reclassified `FIXED REVIEW`; the next active continuation is explicitly linked as child.
5. Superseded branches remain recoverable and are never deleted merely to simplify the view.
6. Before promotion, run donor/recovery sweep across recent sibling branches and record `ADOPT | ALREADY PRESENT | REJECT | DEFER` for material differences.

## ONE INTERFACE — canonical lineage reconstruction

| Version | Role | Branch / PR | Exact SHA | Why / status | Donor obligation |
|---|---|---|---|---|---|
| ONE INTERFACE 01 | RECOVERY / historical production anchor | `release/one-interface-sprint2-6bbfebb` | `3364df8b5989582fbcbc31d1ff102ca5bb852954` | Independently referenced rollback/production anchor in later review records. | Preserve as rollback only. |
| ONE INTERFACE 02 | DONOR / integrated universe slice | `release/one-interface-universe-slice09-20260819` / PR #74 lineage | READBACK REQUIRED | Missions × ATLAS × SPECIES × Living Systems integration line. | Check cross-product context, Homo sapiens entry, Mission bridges. |
| ONE INTERFACE 03 | DONOR | `release/one-interface-about-founder-20260820` / PR #86 | `60deeca3de0415833338549dec69fe90f8117766` | About/Founder + Magazine + navigation + Missions convergence. | Check About/Founder pages, editorial, mission narrative. |
| ONE INTERFACE 04 | DONOR | `release/one-interface-navigation-shell-20260820` / PR #87 | `7b0dbc49757690743a7a4b347e3556b468cf95fa` | Premium public navigation shell. | Check desktop/mobile nav behaviour and hierarchy. |
| ONE INTERFACE 05 | DONOR | `release/m4gazine-premium-universe-20260820` / PR #88 | `7bb2307ed524556d93e5be01f27ce995af41f9d6` | Full M4GAZINE editorial universe. | Check magazine front + long-form routes. |
| ONE INTERFACE 06 | FIXED REVIEW DONOR | `release/home-atlas-showcase-20260820` / PR #90 | `e01025ca53414e94ccb8f2c4385edc4edae72ec2` | Public Experience Convergence Candidate with shared ATLAS showcase. | Preserve strongest public shell/product convergence. |
| ONE INTERFACE 07 | FIXED REVIEW DONOR | `fix/one-interface-brand-hierarchy-20260820` / PR #92 | `9884c7333f25a488bd8a4d210032e668a5f6f562` | Brand hierarchy correction + cinematic footer; exact-head gate previously green. | Mandatory donor sweep before final release. |
| ONE INTERFACE 08 | DONOR / divergent S05 line | `release/one-interface-s05-axe-reconciled` | READBACK REQUIRED | Earlier S05 line contains substantial SPECIES, Living Systems, Mission, ProductSwitcher, motion/media and data work not automatically present in current lead. | Mandatory selective donor audit; never wholesale merge. |
| ONE INTERFACE 09 | ACTIVE DEVELOPMENT / CURRENT LEAD | `release/one-interface-premium-current` | `010fd3a765f636007beba75e51d121e6d6bf856d` | Current controlled premium line; base for LENS PR #119. | Final Gold convergence must explicitly harvest or reject material donor value from 02–08. |
| ONE INTERFACE 10 | RESERVED NEXT FIXED REVIEW | not created | — | Only create after current lead has completed donor sweep + integration + exact-head Gold gate. | Must point to ONE INTERFACE 09 exact accepted SHA. |

## Current ONE INTERFACE donor-sweep finding — 22 Aug 2026

`release/one-interface-premium-current` and PR #92 / S05 are not simple parent/child history. They diverged from shared base `de9e01a37482b7678104690056cc6146e9b286a3`.

Verified compare facts:
- current lead `010fd3a...` vs `release/one-interface-s05-axe-reconciled`: diverged; S05 side contains 117 commits not on current lead, while current lead contains 58 commits not on S05;
- current lead vs PR #92 (`9884c733...`): diverged; #92 side contains 222 commits not on current lead, while current lead contains 58 commits not on #92;
- `claude/one-interface-premium-completion` is behind current lead and does not contain unique commits that require donor harvesting.

Therefore the final public candidate must NOT be produced by assuming `latest branch = superset`. Use a selective donor matrix.

### Mandatory donor categories to inspect from PR #92 / its lineage
- `HomeAtlasShowcase` and front-door product integration
- About / Story / System / Founder pages
- M4GAZINE premium front + reading routes
- premium desktop/mobile `PublicShell` navigation
- MissionAtlasWindow and Mission integration
- Homo sapiens + Jaguar/Amazonia integrated entries
- richer Species components: Atlas Window, Evidence, Node Card, Pressure Path
- privacy-first analytics baseline
- one-interface-universe visual grammar and regression tests
- founder/rights/media provenance work

### Mandatory donor categories to inspect from S05
- ProductSwitcher / Product Context behaviour
- MissionStrip baseline
- motion/media primitives
- SPECIES launch-set/media work
- Living Systems S05 work
- ATLAS context/motion/layer improvements
- source/status/rights registries and E2E gates

Every category receives one decision before ONE INTERFACE 10 may exist:
`ADOPT | ALREADY PRESENT | REJECT WITH REASON | DEFER WITH REASON`.

## Core-project register requirement
The same sequential lineage table must be maintained for at minimum:
- ATLAS
- SPECIES
- JAGUAR JOURNEY
- ORCA JOURNEY / LUME
- ECOSYSTEMS
- S4PIENS
- LIVING SYSTEMS
- IMPACT
- 4MARKET
- CRE4TORS
- LENS

Historical reconstruction may be backfilled progressively. New work has no exemption.
