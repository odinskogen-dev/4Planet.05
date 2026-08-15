# 4PLANET ONE INTERFACE — Claude latest handoff — 2026-08-15

Status: exact Claude canonical delivery received and preserved; remote deployable source ingestion still pending.

## Why this exists
The Cloudflare/GitHub deployment path and Claude's local premium-development path diverged. Claude produced local git commits/bundles without GitHub credentials, while remote deployment work used the repository state available on GitHub. This handoff record prevents the latest Claude work from being lost or mistaken for the older remote source.

## NEWEST AUTHORITATIVE CLAUDE SOURCE — EXACT COMMIT
Claude has now delivered an exact delta Git bundle with canonical branch/head:

- branch: `species-premium/one-interface`
- exact Claude HEAD: `efdf3bcb69a8dfa97afdad0f58c42d8307a84280`
- prior code commit: `40ba61b` — SPECIES profile credit/context limitation surface
- prior code commit: `a88582d` — canon/truth cleanup + runtime media manifest + SP-001..SP-010 wiring
- base premium pass: `5beae1de7207c745735a298b5a7737b021a6622e`
- bundle prerequisite/audited ancestor: `ced077305814ad12411b6ce1e5896087ecca5f51`

Original raw delivery preserved in Drive Code Vault:
https://drive.google.com/file/d/1SigW48CV5aySzgZLYlTJCWndS87NElri/view?usp=drivesdk

Drive file ID: `1SigW48CV5aySzgZLYlTJCWndS87NElri`
Raw delivery SHA-256: `0dfab7fe104c603e4d01dd0f0921e77edee6f1ecd497fa4a2914457c960f9597`

Exact Claude canonical source snapshot preserved in Drive Code Vault:
https://drive.google.com/file/d/1mslwOrJmM6k_gPmEBRJ0rVlLYax-VsHC/view?usp=drivesdk

Drive file ID: `1mslwOrJmM6k_gPmEBRJ0rVlLYax-VsHC`
Canonical snapshot SHA-256: `cd3ef4a1b34d9ee5010fa1781719aab7d48b1706a1c98fae1d176aec43bc2fc8`

The raw delivery contains:
- `4planet-one-interface.delta.bundle`
- `GPT_HANDOFF.md`
- `FINAL_SHA.txt`
- `DEPLOY_README.md`
- `CONTINUITY.md`

## RELATION TO THE EARLIER OPENAI RECONSTRUCTION
Before the exact Claude bundle arrived, the newest changed-files export had been reconstructed on top of `5beae1d` and committed locally for audit as:

`d95ba66f8b5ac49db96ee9cf8ba5b53f2ceabe3c`

That SHA remains preserved and MUST NOT be deleted, but it is no longer the best Claude-source authority.

A direct tree comparison between audit-only `d95ba66` and exact Claude `efdf3bc` shows only three differences:
- exact Claude adds `CONTINUITY.md`;
- exact Claude removes `public/assets/missions/4play/bank-hero.jpg`;
- exact Claude removes `public/assets/missions/4play/bank-hero-mobile.jpg`.

Those two 4PLAY files were the previously identified wrong/duplicated bank-hero assets. Therefore `efdf3bc` is the preferred exact Claude source for the current premium lineage.

## PREMIUM LINEAGE INCLUDED
The exact Claude delivery sits on the recovered premium chain that includes, among others:
- Climate TRACE layer/proxy: `129cdc5`
- premium Orca/photo pass: `a652acd`
- Home premium/four-product canon: `8b386d8`
- SPECIES premium repositioning/search: `31c895f`
- reusable LIVING SYSTEMS relationship product: `c45ef1b`
- IMPACT designed pathway: `ba15c74`
- Mission media/thesis pass: `3bb91cc`
- Product switcher/LIVING SYSTEMS pass: `5beae1d`
- canon/truth cleanup + runtime Asset-ID media manifest + SP-001..SP-010 integration: `a88582d`
- SPECIES media credit/context surface: `40ba61b`
- continuity documentation: `efdf3bc`

## CLAUDE-REPORTED GATES AT EXACT HEAD
`typecheck 0 · build OK · smoke 28/28 · assets PASS`

Status remains OUTPUT RECEIVED / AWAITING GPT AUDIT. No self-approval.

## IMPORTANT REMAINING BLOCKERS FROM CLAUDE
- MS-013 controller asset for 4PLAY is still not placed.
- LS-001 eelgrass is registered but not placed/wired.
- LIVING SYSTEMS still needs the deeper progressive relationship-intelligence render conversion.
- the 16 Missions still need true per-mission signature mechanisms from `visualDirection` rather than only shared-template variation.
- IMPACT still needs proof-rail refinement.
- HOME chromeless ATLAS attract-mode remains pending if it can be done safely.

## REMOTE GITHUB WARNING
Remote `claude/one-interface-premium-completion` remains an older lineage and must not be treated as current.

This handoff branch is only an audit/control pointer. Do not deploy this branch itself.

For the next controlled remote product branch, prefer importing the exact Claude bundle at `efdf3bc` rather than reconstructing from the older audit-only `d95ba66` package, unless deployment work has already started and the exact three-file delta is applied explicitly.

Target controlled product branch remains:
`release/one-interface-premium-current`

Before Cloudflare promotion, verify the remote branch tree contains the exact current premium code, binary media, `functions/api/climate-trace.ts`, and does NOT contain the two removed erroneous 4PLAY bank-hero files.
