# USEFUL INTERNET OBJECT STANDARD 01

Date: 2026-10-01
Status: WORKING DISCOVERY CONTRACT / IMPLEMENTED FIRST IN ATLAS OBJECTS

## PURPOSE

Turn one 4PLANET entity or signal into a permanent public object that can be:
- useful without prior brand knowledge;
- understood by humans;
- indexed by search engines;
- retrieved/cited by AI systems;
- shared without losing context;
- connected back into the same 4PLANET product graph.

This is not a license to mass-generate SEO pages.

FEWER, BETTER OBJECTS.

## CANONICAL OBJECT SHAPE

ENTITY
→ HUMAN EXPLANATION
→ WHY IT MATTERS
→ CURRENT / AVAILABLE DATA
→ SOURCES
→ DATE / FRESHNESS
→ LIMITATIONS
→ RELATED ENTITIES
→ EXPLORE IN ATLAS / PRIMARY PRODUCT
→ SHARE
→ NEXT JOURNEY

## MINIMUM DATA CONTRACT

Required:
- slug
- indexable
- title
- name
- eyebrow / object class
- description
- summary
- whyItMatters
- availableData[]
- freshness
- limitations[]
- sources[]
- related[]
- primary product deep link

Each source requires:
- human label
- authority/publisher
- exact URL
- checked date
- bounded use statement

## PUBLICATION THRESHOLD

indexable=true only when:
1. identity is stable enough for a permanent URL;
2. at least one authoritative or appropriate primary source supports the object;
3. key public claims are bounded to those sources;
4. freshness/time semantics are stated;
5. material limitations are stated;
6. the page gives real user value beyond a search snippet;
7. the primary product/deep link works;
8. duplicate/canonical ownership is resolved;
9. no sensitive-location or rights rule is violated;
10. the object passes the relevant build/contract gate.

If any material requirement is open:
- render noindex,follow if the route is needed for product development; or
- do not create the public route.

## SEARCH / AI CONTRACT

Every indexable object must provide:
- unique title;
- unique meta description;
- canonical URL;
- index,follow,max-image-preview:large;
- crawlable textual explanation;
- crawlable internal links;
- Open Graph;
- Twitter/social metadata;
- JSON-LD matching visible content;
- source/citation URLs where semantically appropriate;
- raw prerendered HTML for the current JS application;
- sitemap membership from the same canonical inventory.

No llms.txt or special “AI SEO” file is required for eligibility.
Crawler policy should follow official search/platform guidance, not third-party GEO folklore.

## PRODUCT CONTRACT

The object must not dead-end into content.

Minimum path:
OBJECT → PRIMARY PRODUCT ACTION → NEXT OBJECT / SOURCE / JOURNEY.

Examples:
- Orca → SPECIES → ATLAS whales
- Fires → ATLAS fire/event layers → Earth/Amazonia
- Oslofjord → Living Systems proof → ATLAS/place/NATION when ready

Login may not block the first value moment.

## TRUTH CONTRACT

Never collapse:
- source record;
- observation;
- signal;
- interpretation;
- live state;
- population;
- range;
- trend;
- outcome.

Examples:
- occurrence ≠ abundance;
- occurrence point ≠ current animal position;
- disconnected occurrence points ≠ migration route;
- thermal anomaly ≠ confirmed wildfire;
- open event feed status ≠ local emergency;
- no returned records ≠ ecological absence.

## MEASUREMENT CONTRACT

Minimum events:
- discovery_object_view
- discovery_object_explore
- discovery_object_share
- discovery_object_next
- source_opened

Never transmit:
- access tokens;
- raw query strings when they may contain credentials/personal data;
- URL fragments carrying auth state;
- raw referrer URLs unless explicitly privacy-reviewed.

## EXTENSION RULE

Use the same logical contract, not necessarily the same visual component, for:
- species;
- places;
- planetary signals;
- issues;
- solutions;
- missions.

Only extend to:
- companies when 4BRANDS public analysis is product-ready;
- public decisions when 4NATION decision objects are product-ready.

Do not create future-product SEO inventory ahead of real product value.

## CURRENT IMPLEMENTATION

Data-driven ATLAS implementation:
- src/data/atlasDiscovery.json
- src/pages/integrated/AtlasDiscoveryPage.tsx
- scripts/generate-sitemap.mjs
- scripts/prerender-discovery-seo.mjs
- scripts/discovery-seo-contract.test.mjs

First objects:
- Earth
- Global Fires
- Whales

Existing related object systems:
- discoveryInventory.json / SpeciesRoute
- Places
- Oslofjord Planet Proof

All future objects must preserve one shared product/source architecture.
