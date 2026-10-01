# 4PLANET DISTRIBUTION RESEARCH 01

Date: 2026-10-01
Status: INTERNAL RESEARCH / NO OUTREACH / NO PAID SPEND

Purpose: identify concrete discovery surfaces for the first Useful Internet Objects. This document records current opportunities and boundaries; it does not claim keyword volume, ranking or partner access.

## 01 — CURRENT SEARCH / AI DISCOVERY RULES

### Google Search + generative AI

Official Google guidance checked 2026-10-01:
- foundational SEO remains the basis for AI Overviews / AI Mode and other generative search features;
- pages must be crawlable and indexable;
- important content should exist in textual form;
- internal links should make important pages findable;
- structured data must match visible page content;
- unique, valuable, people-first content is preferred over commodity/scaled pages;
- Google explicitly warns against unnecessary “GEO/AEO hacks” and unnecessary AI text files;
- Search Console now has dedicated generative-AI visibility reporting.

References:
- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- https://developers.google.com/search/docs/essentials

Implication for 4PLANET:
Useful Internet Objects are the correct unit. Every object should contain real product value, human-readable source context and permanent crawlable text around the interactive experience.

### ChatGPT Search

Official OpenAI publisher guidance checked 2026-10-01:
- public websites can appear in ChatGPT search;
- OAI-SearchBot must not be blocked if the publisher wants content discoverable for summaries/snippets;
- ChatGPT search referrals carry `utm_source=chatgpt.com`;
- accessible ARIA-labelled interaction also helps browser-agent interpretation.

Reference:
- https://help.openai.com/en/articles/12627856-publishers-and-developers-faq

Current repo state already allows OAI-SearchBot on the public discovery surface and classifies ChatGPT referral traffic.

## 02 — ORCA SEARCH TERRITORY

Observed current web landscape:
- GBIF exposes a canonical Orcinus orca taxon and biodiversity records.
- OBIS exposes Orcinus orca occurrence datasets and a mapper.
- NOAA Fisheries provides species and population-specific context.
- Orca Behavior Institute publishes monthly/annual Salish Sea sightings maps using community-confirmed reports.
- Current community discussions repeatedly ask where to find recent Orca sightings or a centralised tracking resource.

References:
- https://www.gbif.org/species/2440483
- https://portal.obis.org/taxon/137102
- https://www.fisheries.noaa.gov/species/killer-whale
- https://www.orcabehaviorinstitute.org/sightings-maps
- Reddit qualitative examples: r/orcas threads on recent sightings and where-to-see-orca questions.

### Search-intent clusters to serve truthfully

A. SPECIES UNDERSTANDING
- orca
- killer whale
- Orcinus orca
- orca facts
- where do orcas live

Best object: /species/orca

B. OBSERVATION / MAP INTENT
- orca sightings map
- orca observations map
- killer whale sightings map
- whale observations map

Best object: /atlas/whales → Orca

Important wording:
The product can answer with reported occurrence/observation context.
It must explicitly correct the expectation when the query implies live tracking.

C. LIVE / TRACKER INTENT
- orca tracker
- live orca map
- where are orcas now
- orca migration map

Opportunity:
High-intent education entry, but not a claim match.

Correct response pattern:
“You can explore reported observations here. These are not live positions or a migration track.”

Do not title an object “Live Orca Tracker” for acquisition.

D. PLACE INTENT
- orcas Norway
- orcas Salish Sea
- orcas Alaska
- orcas Iceland
- orcas Pacific Northwest

Expansion rule:
Only create place-specific objects where a source pack supports that place/population relationship. Do not mass-generate place pages.

## 03 — WHALES OBJECT

Current gap:
The existing ATLAS has an OBIS Cetacea occurrence layer, but until this sprint it had no crawlable explanatory entry point.

Differentiator:
Not “more dots”.
The useful promise is:
reported whale/dolphin occurrences + source meaning + limitations + movement into species profiles.

Primary discovery angles:
- whale sightings map
- whale observations map
- cetacean observations
- whale species map
- explore whale records

Avoid:
- whale tracker
- live whales
unless the product later integrates a genuinely live or near-live source with the appropriate semantics.

## 04 — GLOBAL FIRES OBJECT

Current external reference product:
NASA FIRMS already provides an excellent specialist global active-fire / thermal-anomaly map with MODIS and VIIRS data.

NASA states:
- FIRMS distributes near-real-time active-fire data;
- global NRT data are generally available within about three hours of satellite observation;
- thermal anomalies may represent fire, hot smoke, agriculture or other hot sources;
- cloud cover can obscure detections;
- the service should not be used for preservation of life or property.

References:
- https://firms.modaps.eosdis.nasa.gov/
- https://firms.modaps.eosdis.nasa.gov/active_fire/
- https://firms.modaps.eosdis.nasa.gov/mapserver/wms-info/

4PLANET should not pretend to outperform FIRMS as the authoritative specialist fire service today.

4PLANET differentiation:
- human-first entry;
- fire signal alongside vegetation, forest loss, biodiversity and other planetary context;
- explicit source/meaning/limitation;
- movement from global signal → place → related living system.

Current object should therefore target:
- global fire satellite map
- active fire satellite data
- thermal anomalies map
- fires from space

Do not promise:
- emergency information;
- confirmed wildfire status for every thermal anomaly;
- incident management.

Next product-value upgrade:
Add record-level NASA FIRMS VIIRS/MODIS detections through the existing server/source architecture when credentials, performance and rights are closed. That would materially strengthen the object.

## 05 — EARTH / ATLAS OBJECT

Discovery territory:
- earth satellite map
- earth data map
- environmental data map
- biodiversity map
- planet data explorer
- climate and nature data map

Differentiator:
A single search intent should open into multiple authoritative data families without requiring GIS expertise.

Do not compete with Google Earth on generic basemap utility.

Own the territory:
“understand what the planetary layer means, where it came from, and what it does not establish.”

## 06 — OSLOFJORD OBJECT

Existing canonical proof:
- /living-systems/oslofjord

Discovery paths should be Norway-local and source-specific:
- Oslofjord nature
- Oslofjord species
- Oslofjord marine life
- Oslofjord environment
- Oslofjord data
- Oslofjord condition / pressures only where official sources support the exact claim

Use the existing proof object before creating a duplicate “SEO Oslofjord” page.

Primary distribution surfaces:
- Norwegian nature/science/environment communities;
- local Oslofjord media when the object passes release;
- research/institutional networks;
- relevant 4NATION contextual links once 4NATION product state is ready.

No political advocacy framing in the discovery object.

## 07 — COMMUNITY SIGNALS

Current r/orcas discussions show a recurring user need:
- people ask for websites tracking recent sightings;
- users often fall back to local Facebook groups, tour operators or regional networks;
- interest is strongly place- and time-specific;
- users care about ethical ways to observe Orcas.

This creates an opportunity for 4PLANET, but only if we preserve the distinction between:
A. historical/source-reported occurrence data;
B. recent community sightings;
C. verified research tracking;
D. live telemetry.

The current product only supports A at global scale.

Recommended community distribution after Founder release:
- r/orcas — only when a specific useful object answers a real question; no promotional drops;
- r/whales / marine-life communities where rules permit;
- science/data communities for the source-semantics angle;
- local communities only when a place-specific object is materially useful.

Community rule:
Answer the question first. Link the object only if it makes the answer better.

## 08 — EARNED MEDIA ANGLES

Highest-value first:
1. “The dots are not the whales” — how wildlife maps become misleading.
2. “What does a fire dot actually mean?” — satellite thermal anomaly vs confirmed wildfire.
3. “One planet, many public datasets” — why serious Earth data is still difficult for ordinary people to explore.
4. “Oslofjord as a public intelligence object” — after source and product gate.

These are stronger than “new environmental startup launches website”.

## 09 — DISTRIBUTION SURFACES BY OBJECT

ORCA:
- Google / Google AI search
- ChatGPT Search
- SPECIES internal navigation
- r/orcas / whale communities after release
- marine/science creators
- science/environment media
- short-form educational video

FIRES:
- Google / AI search
- Earth/weather/data communities
- satellite / geospatial creators
- newsroom reference potential if source boundaries are excellent
- embeds later

WHALES:
- Google / AI search
- whale communities
- species internal links
- partner/science reuse
- creator explainers

EARTH:
- Google / AI search
- broad visual social
- education
- tech/data media
- embeds

OSLOFJORD:
- Norwegian search
- local media
- institutional links
- 4NATION
- local science/nature communities

## 10 — FIRST EXPOSURE LOOP

First recommended launch object: ORCA.

Reason:
- emotionally strong;
- existing canonical product page;
- strong primary-source stack;
- ATLAS connection;
- globally understandable;
- clear evidence-boundary story;
- naturally visual;
- community interest already exists.

Loop:
SEARCH / AI / EARNED / SOCIAL
→ /species/orca
→ meaningful SPECIES interaction
→ /atlas/whales
→ source open / map exploration
→ next species or place
→ share
→ return
→ join only after value.

Launch package:
docs/discovery/ORCA_DISTRIBUTION_PACKAGE_01.md

No external release in this sprint without Founder approval.

## 11 — NEXT RESEARCH ONLY AFTER DATA

Do not widen the target universe yet.

After the first objects are live:
- use Search Console query data;
- use Google Generative AI performance report;
- use GA4 discovery_entry + object events;
- inspect real inbound ChatGPT referrals;
- compare object activation and share rates;
- then expand query families based on actual demand.

PRODUCT DISTRIBUTION > CONTENT VOLUME.
