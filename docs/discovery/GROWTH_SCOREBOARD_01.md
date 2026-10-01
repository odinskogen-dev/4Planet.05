# 4PLANET GROWTH SCOREBOARD 01

Date: 2026-10-01
Status: WORKING MEASUREMENT CONTROL / BASELINE + IMPLEMENTED EVENT CONTRACT
GA4 property: 4Planet / Europe-Oslo / NOK
Truth rule: measured activity is not automatically a verified unknown human.

## 01 — BASELINE

Period: 2026-09-01 through 2026-10-01 inclusive.

Observed GA4 activity:
- Active users: 28
- New users: 24
- Sessions: 88
- Engaged sessions: 49
- Page views: 941
- GA4 key events: 0

Observed acquisition:
- 4planet.org / Direct: 38 sessions
- 4planet.org / Referral: 18 sessions
- 4planetatlas.com / Direct: 10 sessions
- 4planet.org / Organic Social: 7 sessions
- 4planet.org / Organic Search: 1 session
- Other public product/test hosts: low single-digit sessions

Observed product-use events:
- product_entry: 156 events / 16 users
- meaningful_use: 79 events / 15 users
- return_visit: 79 events / 9 users

CLASSIFICATION:
These are real measurement-system events, but the traffic is too small and too mixed with founder/team/test activity to treat the user counts as verified unknown external humans. Do not promote “28 users” into traction.

Current verified unknown-user milestone: NOT YET PROVEN FROM THIS DATASET.

## 02 — FUNNEL

DISCOVERY
→ OBJECT VIEW
→ MEANINGFUL INTERACTION
→ NEXT OBJECT
→ SHARE
→ FOLLOW / SAVE
→ ID / JOIN
→ RETURN
→ QUALIFIED INTEREST
→ PAYMENT

The funnel is product-led. A social impression is not activation.

## 03 — EVENT CONTRACT

Existing shared events retained:
- discovery_entry
- product_entry
- meaningful_use
- return_visit
- page_view
- source_opened
- place_opened

New first Useful Internet Object events:
- discovery_object_view
  - object_kind
  - object_slug
  - product_area
- discovery_object_explore
  - object_kind
  - object_slug
  - product_area
- discovery_object_share
  - object_kind
  - object_slug
  - product_area
- discovery_object_next
  - object_kind
  - object_slug
  - next_path

Future events only when the underlying product capability exists:
- object_follow
- object_save
- join_interest
- qualified_interest
- payment

Do not emit fake “conversion” events for UI intent that does not complete the corresponding state change.

## 04 — DISCOVERY CHANNELS

The shared analytics layer classifies first-session discovery as:
- AI_CHATGPT
- AI_PERPLEXITY
- SEARCH_GOOGLE
- SEARCH_BING
- SOCIAL_INSTAGRAM
- SOCIAL_FACEBOOK
- SOCIAL_LINKEDIN
- EMAIL
- DIRECT
- REFERRAL_OTHER

ChatGPT referral detection accepts the explicit utm_source=chatgpt.com signal as well as the referrer host.

## 05 — PRIVACY / AUTH HYGIENE

Current shared analytics deliberately sends only origin + pathname in page_location and pathname in page_path.

Query strings and URL fragments are excluded.

This is mandatory because OAuth callbacks and other routes can carry credentials or personal data in query/fragment state.

Historical GA4 records before this correction contained callback values in landing-page dimensions. Never reproduce those values in reports, docs or screenshots.

## 06 — HOST ATTRIBUTION

Public hosts currently allowed by the shared analytics layer include:
- 4planet.org
- 4planetatlas.com
- 4species.com
- 4sapien.com
- s4piens.com
- 4brands.org
- 4nation.org
- 4planetmagazine.com
- 4planetmarket.com
- other explicitly listed public product hosts

Internal/test hosts such as test.4planet.org and *.pages.dev are excluded from the allow-list used by the current candidate.

This sprint corrected explicit product attribution for:
- 4nation.org → 4nation
- 4species.com → species
- 4planetmagazine.com → magazine

## 07 — SCOREBOARD

### DISCOVERY
External-candidate sessions:
Report by SEARCH / AI / SOCIAL / REFERRAL / DIRECT, but do not call DIRECT external without corroboration.

Organic Search:
Baseline: 1 session on 4planet.org in the measured period.

AI referrals:
Baseline: no verified material traffic in the measured period.

### PRODUCT VALUE
Object opens:
Measure discovery_object_view per object.

Activation:
For the first ATLAS objects, initial activation = discovery_object_explore.
For Orca, use existing meaningful SPECIES/ATLAS interaction rather than page_view alone.

Activation rate:
activated object users / object viewers.

### SPREAD
Shares:
discovery_object_share / object viewers.

Earned links:
Measure in Search Console / external backlink tooling when available.

Embeds:
Add only when a first-party embed event exists.

### RETURN
return_visit exists in current analytics.
D7/D30 should be calculated only after cohort volume is large enough to be interpretable.

### ID / JOIN
Measure completed join_interest or authenticated state, not button clicks.

### COMMERCIAL
Qualified leads:
0 until a real qualified-interest state exists.

Payments:
0 until a verified purchase/payment event exists.

### TRUST
Source opens:
source_opened / object viewers.

Correction rate:
Public object corrections / published objects.

Claim failure:
Any unsupported public claim is P0 for the truth system.

## 08 — FIRST OBJECT SCOREBOARD

Objects to compare after release:
1. /species/orca
2. /atlas/earth
3. /atlas/fires
4. /atlas/whales
5. /living-systems/oslofjord

For each object report:
- views
- unique users
- discovery channel
- explore rate
- next-object rate
- source-open rate
- share rate
- return rate
- joins
- qualified interest
- known truth/UX failures

## 09 — UNKNOWN-USER PROOF STANDARD

Do not infer “unknown real user” from GA user counts alone.

Minimum acceptable evidence:
A. session originates from an external acquisition route that is not founder/team instrumentation;
B. it performs a product-value event;
C. no evidence indicates automated QA/test traffic.

Stronger proof:
- external search or referral landing;
- meaningful interaction;
- return on a later day;
- share/follow/join or other durable action.

Founder/team activity should be isolated through test-host exclusion, internal QA conventions and where technically available an explicit internal-traffic marker rather than invasive personal identification.

## 10 — DECISION RULES

Scale an object when:
- it attracts external discovery;
- people use it, not merely view it;
- source/truth failures stay at zero;
- at least one downstream action improves.

Iterate when:
- discovery exists but activation is weak.

Improve distribution when:
- activation is strong but discovery is weak.

Kill or park when:
- repeated distribution tests produce neither discovery nor meaningful use.

Do not buy scale into an unproven activation loop.
