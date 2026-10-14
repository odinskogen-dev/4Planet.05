# 4PLANET SEARCH MEASUREMENT — ZERO-SUBSCRIPTION SETUP

STATUS: CURRENT EXECUTION RUNBOOK — 14 OCT 2026

## PRINCIPLE
Do not pay for GSC Wizard merely to obtain search-performance truth. Use first-party webmaster data.

## GOOGLE
1. Use native Google Search Console (free).
2. Create/verify one property for every canonical public domain that actually serves indexable content. Priority:
   - 4planet.org
   - 4planetatlas.com
   - 4species.com
   - 4planetmagazine.com
   - 4brands.org
   - s4piens.com
   - other public canonical product domains only when substantive/indexable.
3. Prefer Domain properties when DNS control is available. Do not treat parked or placeholder domains as index targets.
4. Submit the canonical sitemap for each domain only after verifying that its URLs resolve to that same canonical domain.
5. Measure clicks, impressions, CTR, average position, queries, pages, countries, devices and search appearance.
6. Connect the verified Search Console account to the available 4PLANET reporting connector; current direct connector state is 0 properties.
7. Use Search Console API for automated read-only reporting. The API is free of charge subject to quotas.
8. Use Looker Studio Search Console connector for a no-subscription human dashboard joined conceptually with GA4 behaviour data.

## BING / ECOSIA
1. Add the same active canonical domains to Bing Webmaster Tools.
2. Track clicks, impressions, CTR, average position, queries, pages, crawl requests/errors and indexed pages.
3. Use Bing's Chat/search-source reporting when available.
4. Keep IndexNow for canonical changed URLs. IndexNow notification != indexing.
5. Ecosia click-through traffic is measured in GA4 as ecosia.org / organic. Do not infer Ecosia impressions from GA4.

## GA4 ROLE
GA4 answers what happened AFTER a click:
search engine -> landing host/path -> engagement -> product use -> return -> action.
It does not replace Search Console/Bing Webmaster impressions/query/ranking data.

## CURRENT BLOCKERS
- GA4 property 551422989: readable.
- Direct Google Search Console connection: 0 properties exposed as of 14 OCT 2026.
- GSC Wizard: subscription/trial route unavailable and not required for the zero-cost stack.
- Bing Webmaster Tools: no current programmatic read path verified in this execution.
- Historical GA4 credential-bearing URL parameter data: requires GA Admin Data Deletion Request; current reporting connector is read-only.

## ACCEPTANCE
Search measurement is considered connected only when:
- the canonical property is verified;
- search impressions and queries can be read;
- landing pages can be joined back to GA4 behaviour without self-referral pollution;
- 7d vs prior 7d and 28d vs prior 28d are reportable;
- no founder/internal traffic is counted as external acquisition.
