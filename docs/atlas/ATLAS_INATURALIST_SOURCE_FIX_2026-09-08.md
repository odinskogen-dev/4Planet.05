# ATLAS iNaturalist source hardening — 2026-09-08

Status: SANDBOX PROOF / NO LIVE AUTHORITY
Sandbox: `work/atlas-zero-loss-gold-convergence-01`
Product: ATLAS

## Trigger

The immutable remote ATLAS proof on prior sandbox SHA `118abbb1695b072fe3d6687a3c51ed984d510243` passed the broader ATLAS browser/source suite except for three iNaturalist-dependent assertions. The failures resolved to taxon-name/source availability, not map, pointer, mobile, layer, TIME, My Atlas, GBIF, FIRMS or general ATLAS runtime regressions.

## Bounded correction

`functions/api/inaturalist.ts` now resolves scientific-name queries through iNaturalist `/v1/taxa/autocomplete` instead of relying on ranked `/v1/taxa?q=` search results.

4PLANET truth semantics are unchanged and remain stricter than provider ranking:

- exact scientific-name equality is still required before taxon identity is promoted;
- fuzzy/provider-ranked suggestions are never promoted to identity;
- unresolved taxon identity fails closed;
- occurrence records remain observations, never range, abundance, population trend or live tracking;
- obscured/private coordinates are never reconstructed;
- observation and photo reuse licences remain distinct.

Source-fix commit before this evidence record: `9c267aca32f02ae3a4582d12ea33020518a46797`.

## Required proof

The ATLAS Zero Loss Gate must run on the resulting exact sandbox head and must retain remote-source enforcement. No test weakening, source stubbing or `REQUIRE_REMOTE_SOURCES` relaxation is authorised.

Only after exact-head proof passes may the accepted sandbox delta converge selectively into `king/test`. Current HEIR `GOLD_CURRENT_BRIEF.md` must be preserved rather than overwritten by the sandbox copy.
