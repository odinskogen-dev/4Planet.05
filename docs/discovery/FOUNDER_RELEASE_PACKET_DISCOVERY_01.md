# FOUNDER RELEASE PACKET — DISCOVERY + USEFUL INTERNET OBJECTS 01

Date: 2026-10-01
Status: FOUNDER GATE / INTERNAL CANDIDATE / NOTHING EXTERNALLY RELEASED
PR: #356
Branch: axe/discovery-exposure-sprint-01-20261001
Base: king/test

## ONE-LINE DECISION

HOLD LIVE until the current PR finishes exact-SHA QA cleanly. The marketing/discovery candidate itself is materially built; the remaining gate is verification + controlled promotion, not more strategy.

## WHAT IS BUILT

### Existing strong objects preserved
- ORCA: /species/orca
- OSLOFJORD: /living-systems/oslofjord

### New first-party ATLAS discovery objects
- /atlas/earth
- /atlas/fires
- /atlas/whales

Each new object contains:
- human explanation;
- why it matters;
- current/available data;
- primary source links;
- date/freshness semantics;
- explicit limitations;
- live ATLAS deep link;
- share action;
- related/next journeys;
- canonical metadata;
- Open Graph/Twitter metadata through shared SEO;
- JSON-LD;
- raw HTML prerender;
- sitemap inclusion;
- discovery analytics.

No second map, source database or truth system was created.

## SEARCH / AI FOUNDATION

Already present on king/test and preserved:
- OAI-SearchBot allowed;
- Googlebot and Bingbot allowed;
- internal/private surfaces disallowed;
- non-production hosts fail to noindex;
- structured/canonical SEO component;
- raw HTML prerender for discovery routes;
- sitemap generation;
- release-gated IndexNow support.

Fixed in this candidate:
- IndexNow verification key file contained literal backslash-n characters; corrected to the exact key.
- added the three ATLAS discovery objects to sitemap and prerender.
- 4NATION, 4SPECIES and MAGAZINE public-host attribution repaired in shared analytics.

## SEARCH REALITY CHECK

Current external search audit on 2026-10-01 returned no indexed results for:
- site:4planet.org
- site:4planet.org/species
- site:4planet.org/atlas
- site:4planetatlas.com
- site:4species.com
- site:s4piens.com
- site:4nation.org

This is not evidence that indexing is impossible. It is evidence that 4PLANET currently has effectively no observable search footprint in the queried search backend.

Brand searches are also noisy; “4BRANDS” is already used by unrelated organisations. Do not treat branded search alone as a defensible discovery strategy.

## ANALYTICS

Baseline 2026-09-01 through 2026-10-01:
- 28 active users
- 24 new users
- 88 sessions
- 49 engaged sessions
- 941 page views
- 0 GA4 key events
- 1 measured 4planet.org Organic Search session

Product-use events already exist, but cannot yet be promoted to verified unknown-human traction because founder/team/test activity is mixed into the small dataset.

New object events:
- discovery_object_view
- discovery_object_explore
- discovery_object_share
- discovery_object_next

Privacy boundary:
query strings and URL fragments are deliberately excluded from analytics.

## FIRST DISTRIBUTION PACKAGE

Ready internally:
docs/discovery/ORCA_DISTRIBUTION_PACKAGE_01.md

Includes:
- source pack
- claim map
- master story
- factual brief
- social master copy
- five short-form video concepts
- carousel
- ten image/text cuts
- newsletter
- LinkedIn
- X/Threads
- press angle
- creator reuse angle
- SEO variants
- OG copy
- release checklist

Nothing published or sent.

## DISTRIBUTION RESEARCH

Ready internally:
docs/discovery/DISTRIBUTION_RESEARCH_01.md

Core conclusion:
ORCA is the best first exposure object.
The correct acquisition territory is “reported observations / source-grounded map”, not “live Orca tracker”.

Global Fires is strategically useful but must remain clearly downstream of NASA FIRMS as the specialist active-fire authority until 4PLANET has record-level FIRMS data and a stronger operational layer.

## GROWTH SCOREBOARD

Ready internally:
docs/discovery/GROWTH_SCOREBOARD_01.md

It explicitly separates:
- measured activity;
- candidate external traffic;
- verified unknown humans;
- activation;
- spread;
- return;
- identity/join;
- commercial;
- trust.

## QA STATUS

First PR head passed:
- exact checkout
- control-of-control
- authority context
- operating doctrine
- GOLD authority contract
- npm ci
- typecheck
- production build

Discovery-specific contract results:
- new ATLAS objects: PASS
- discovery routes/sitemap/prerender: PASS
- universal Species noindex threshold: PASS
- crawler policy: PASS
- host attribution: PASS

First discovery test exposed and this candidate fixed:
- malformed IndexNow key file.

The overall Convergence Gate also exposed an unrelated inherited 4SAPIEN FOOD contract failure (“food_value_signal” missing from a pantry file). That failure is outside this discovery delta and prevents claiming the entire convergence suite GREEN until the upstream product branch is reconciled.

No live/browser verification of the new routes has yet passed.

## EXTERNAL RELEASE GATES

Still NOT authorised:
- merge/promotion to king/test or production;
- live deploy;
- IndexNow submission;
- social publication;
- newsletter send;
- press outreach;
- creator/community outreach;
- paid spend.

## PROPOSED RELEASE SEQUENCE AFTER GREEN QA

1. Promote exact audited discovery candidate into the authorised public release source.
2. Deploy public routes.
3. Physically verify desktop/mobile:
   - /species/orca
   - /atlas/earth
   - /atlas/fires
   - /atlas/whales
   - /living-systems/oslofjord
4. Verify robots, sitemap, canonical, OG, JSON-LD and analytics on live.
5. Search Console URL inspection / recrawl.
6. Founder decision on IndexNow submission.
7. Founder decision on ORCA external distribution package.
8. Measure first unknown-user loop.
9. Iterate from evidence.

## FOUNDER DECISION WHEN QA IS GREEN

A. RELEASE DISCOVERY OBJECTS
B. RELEASE ORCA DISTRIBUTION PACKAGE
C. INDEXNOW SUBMISSION
D. HOLD / CHANGE

Do not bundle B or C automatically into A.
