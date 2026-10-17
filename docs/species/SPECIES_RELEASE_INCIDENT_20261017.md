# 4SPECIES restoration — 17 October 2026

## Decision
Founder supersedes blanket REVIEWED-only search suppression. Publish complete source-bearing Claude v53 species profiles under their own canonical URLs while preserving their factual DRAFT provenance. Incomplete, invalid or non-canonical routes remain noindex. Never change Claude's design template without permission.

## Incident chronology
- 14 Oct: existing 4species Worker referenced mutable species-v53.4planet-05.pages.dev.
- 15 Oct 08:37 UTC: repository commit 827b5f374197 added REVIEWED-only indexing rules in code (later strengthened 16 and 17 Oct); deployment of these particular commits was not established.
- 17 Oct: read-only audit found mutable alias with 8 data profiles, but immutable 72494005.4planet-05.pages.dev still had 28.
- Run 39029409741: initial restoration QA failed, rollback succeeded.
- Run 39029480644: 28 distinct original Claude profile pages successfully restored to production. Version pinned to immutable 72494005.
- Run 39029619668: independent Chromium verified 28/28 profiles with native Claude premium component, source list, indexable HTML and canonical URLs. AI and standard search crawler user agents could access Orca.
- Run 39029719128: IndexNow accepted all 28 public URLs (HTTP 200). Google or AI indexing is not proven by this receipt.

## Cause and corrective action
The primary verified production regression was the mutable Pages alias losing 20 data profiles while the existing Worker continued referencing it. The unrelated REVIEWED-only source code change was a policy risk but was not proven deployed on the then-current Worker. The repository author field does not identify which human or autonomous agent originated the commit.

Keep immutable origin pin in the canonical router, preserve rollback and full-inventory QA, never allow drift to a mutable preview alias. Use source-backed completeness and honest DRAFT state for public discovery, not a blanket unpublished-only gate.

## Incomplete deliverables
Eleven of the 39 catalogue species still require full individual Claude v53 page data, sources, licence-verified wild photography and preview/production Gold QA. Only then claim 39/39, and later 100/100. Native Google Search Console still requires the existing Google identity's API enablement/permissions; Bing Webmaster key is not present. Cloudflare traffic instrumentation is available.
