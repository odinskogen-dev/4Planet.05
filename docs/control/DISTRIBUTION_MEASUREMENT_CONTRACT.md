# 4PLANET DISTRIBUTION MEASUREMENT CONTRACT — v1.0

STATUS: TEST KING CONTROL / 14 OCTOBER 2026 / NO PRODUCTION RELEASE CLAIM

## PURPOSE
Measure whether real people discover, use, return to and act through 4PLANET without confusing internal testing, owned-domain navigation, reach, impressions, sessions or product actions.

## REPORTING WINDOWS
Every weekly report MUST show:
- last 7 complete days vs previous 7 complete days;
- last 28 complete days vs previous 28 complete days;
- absolute counts and percentage change;
- sample-size warning when users < 30;
- instrumentation changes that invalidate direct comparison.

Do not sum sessions across hostName rows. One GA4 session may touch several 4PLANET hosts.

## FUNNEL
DISCOVERABILITY -> REACH -> ACQUISITION -> ENGAGEMENT -> PRODUCT USE -> RETENTION -> ACTION -> ECONOMIC / ECOLOGICAL VALUE -> DISTRIBUTION LOOP

### Discoverability
Google Search Console: impressions, clicks, CTR, average position, queries, pages, search appearance.
Bing Webmaster Tools: impressions, clicks, CTR, average position, queries, pages, crawl/index state.
AI visibility: citations, cited pages, queries/prompts when directly measured; AI referral sessions separately in GA4.

### Reach
Per social network: followers, net follower growth, reach, impressions/views, published posts, post-level distribution.

### Acquisition
GA4: total users, new users, sessions, engaged sessions, source/medium, channel, landing product, landing path, country, device.
External acquisition excludes owned 4PLANET domains, auth/deployment infrastructure and founder/internal browsers.

### Engagement
GA4: engaged sessions, engagement rate, average engagement/session duration, scroll users, meaningful_use users.
Pageviews are diagnostic, not a North Star.

### Product use
ATLAS: unique users opening objects; unique objects opened; repeat use.
SPECIES: species_opened users; search landing pages; profile depth.
Magazine: article entry, reading/scroll depth, deeper exploration.
4SAPIEN: activation, value_reached, memory_written, return_value.
4BRANDS: company_analysis, company_brain_created.
IMPACT: evidence/profile exploration and verified external action-route click.
Market: verified product open; purchase only from commerce source-of-truth, never inferred from click.

### Retention
Returning active users, returning sessions, return_visit users, cohort return when sample supports it.

### Actions / key events
Recommended GA4 key-event candidates:
1. signup_completed
2. value_reached
3. product_completion
4. company_brain_created
5. share_referral
6. join_interest
7. verified form/contact submit when implemented
8. purchase only from verified commerce event

Do not mark page_view, scroll, atlas_object_opened or generic meaningful_use as key events merely to inflate conversions.

## INTERNAL-TRAFFIC LAW
Current runtime control: visit a production surface once with ?4p_internal=1 on each browser/origin used for founder/team testing. The flag is stored locally and the control parameter is removed from the visible URL. Use ?4p_internal=0 to restore normal analytics.
Internal browsers must not load/send analytics.
Owned-domain, Google Auth, workers.dev and pages.dev referrers are not external acquisition.

## PRIVACY / SECURITY
Never transmit:
- access, refresh or ID tokens;
- OAuth codes/state/auth identifiers;
- email/name;
- free-text user queries;
- precise coordinates;
- URL fragments or uncontrolled query strings.

Sensitive auth/OAuth navigation must fail closed before analytics loads.
Historical sensitive GA data must be removed through GA Admin Data Deletion Request.

## UTM STANDARD
UTMs are for EXTERNAL distribution only. Never add UTMs to links between owned 4PLANET domains.

utm_source:
instagram | facebook | linkedin | threads | bluesky | pinterest | youtube | newsletter | partner | creator | qr | other explicit external source

utm_medium:
organic_social | paid_social | email | partner | creator | referral | qr

utm_campaign:
lowercase stable campaign/object slug, e.g. species_orca_launch

utm_content:
stable post/asset/distribution-object id

utm_term:
only when a paid/search keyword is genuinely present.

## SEARCH MEASUREMENT — ZERO-SUBSCRIPTION STACK
1. Google Search Console — free source of Google impressions, clicks, CTR, position, queries and pages.
2. Search Console API — free of charge subject to quotas; preferred for scheduled machine reporting.
3. Looker Studio Search Console connector — free dashboard layer; combine with GA4.
4. Bing Webmaster Tools — Bing impressions/clicks/CTR/position/query/page/crawl/index state.
5. IndexNow — notification path for canonical changed URLs; not analytics and not proof of indexing.
6. GA4 — post-click behaviour and search-engine landing pages.
7. Optional Microsoft Clarity only after privacy review/consent design — behaviour UX and AI visibility; not a replacement for Search Console.

## SOCIAL DATA
Metricool is the primary cross-network read layer for Facebook, Instagram, Threads, Pinterest, YouTube and Bluesky.
Buffer/GitHub bridge is a verified read/write control plane for connected Buffer channels. Use read-only Buffer metrics particularly for LinkedIn where Metricool is not connected.
External publishing remains Founder-gated.

## WEEKLY EXECUTIVE TABLE
For each KPI show:
CURRENT | PREVIOUS | ABS DELTA | % DELTA | DATA QUALITY | INTERPRETATION

Minimum rows:
users; new users; external qualified sessions; organic-search sessions; organic-social sessions; engaged sessions; engagement rate; meaningful_use users; returning users; search impressions/clicks/CTR/position by engine; social reach/impressions/interactions/outbound clicks; key events; verified revenue/actions.

## TRUTH RULES
Session != unique person.
Pageview != value.
Follower != reach.
Impression != click.
Click != meaningful use.
Key event != revenue unless the event itself is verified economic truth.
IndexNow submission != indexing.
Ranking estimate != Search Console observation.
AI citation != referral session.
Owned-domain navigation != external referral.
