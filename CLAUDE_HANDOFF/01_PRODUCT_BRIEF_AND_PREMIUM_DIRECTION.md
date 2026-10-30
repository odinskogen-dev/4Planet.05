# 4PLANET — FOUNDER PRODUCT THESIS / PREMIUM PRODUCT DIRECTOR BRIEF
**Version:** 2026-10-30 / handoff analysis. Design recommendations are not claims of implemented product.

## 1. THE CENTRAL IDEA
**4PLANET is a living-planet intelligence, participation and action ecosystem.**
Vision: bring nature back into balance so humanity and the rest of nature can thrive together.
Working brand thesis: **BETTER. FOR EVERYONE.** Value should be directly useful to the person, organisation, community or institution, with ecological benefit demonstrated separately rather than assumed.
Narrative principle: **Life is connected.**
Brand promise: **For a Living Planet.**
Operating rule: **TRUTH FIRST.**
The system should help someone go from not knowing to understanding, from understanding to better decisions, from decisions to people and projects actually doing something, and from claimed activities to measurable and independently assessable outcomes.

The ambition is not one NGO website, one donation catalogue or one cartographic dashboard. It is a durable, interoperable public information and utility infrastructure for living Earth and human systems.

## 2. REAL PRODUCT TODAY — SOURCE-BASED, NOT UNVERIFIED LIVE CLAIMS
The 30 October source includes:
- A large React/TypeScript/Vite application with editorial 4PLANET home, four Domains and Missions, common shell and multi-product routes.
- An ATLAS world experience, MapLibre-oriented spatial code, embed/context logic, planetary datasets and source connectors.
- SPECIES discovery and individual profiles, media registers and shared canonical identity integration.
- A guided LIVING SYSTEMS layer and a separately built `products/livingsystems` code area; the public website also has `/livingsystems/` routes. Preserve work rather than collapsing different interfaces without an inventory.
- IMPACT Living Action Network at `/impact`, `/impact/project/:slug`, `/impact/actors/:slug`, `/impact/issue/:slug` and `/impact/solution/:slug`. Separate `/impact/lab` test environment. The primary runtime graph is read from NATUREBRAIN public projections.
- Magazine/editorial, discovery and SEO generation, source provenance, asset and test systems.
- Code surfaces for 4SAPIEN, S4PIENS, 4NATION, 4BRANDS, culture, market and partners; their real product readiness must be assessed route by route, not inferred from code presence.
- 61+ MB of tracked public media under `public/` (measured at the frozen commit), including photography and visual assets.
- Scripts for route creation, build-time crawling representation, sitemap, source audits and contract tests.

These are code-presence observations. Deployed behaviour and complete user journeys still require testing. Do not mistake the presence of an endpoint, page component or dataset for a working production capability.

## 3. TARGET ECOSYSTEM — CONNECTED, NOT MONOLITHIC
**Discovery & Distribution:** SPECIES, ATLAS/PLACE, Living Systems, 4PLANET MAGAZINE, public knowledge objects and shareable source-grounded stories.
**Utility & Relationships:** IMPACT discovery, project/actor/solution intelligence, following, participation, personal use via 4SAPIEN, system insights via S4PIENS, organisational utility via 4BRANDS and 4NATION.
**Capital & Action:** credible partners, sponsorships, paid pilots, programmes, referrals and eventually transparent transactions when genuinely eligible.
All must share intelligence, identity and evidence concepts where appropriate, rather than maintaining conflicting claims.

Main public product identities remain coherent. ATLAS must be useful independently for free spatial exploration; LIVING SYSTEMS helps people understand relationships. SPECIES must show life before metadata. IMPACT connects problems, solutions, actors, projects, geography, evidence, actions, capital and independent outcomes without presenting all as already verified.
S4PIENS (plural) concerns human systems. 4SAPIEN (singular) concerns individual utility and decisions; **FACTS, NOT ADVICE** is the present design rule. 4NATION concerns nonpartisan public decisions and civic visibility; 4BRANDS concerns company intelligence and measurable value. These can be adjacent products or distinct branded routes/domains, not extra noisy controls in every main menu.
NATUREBRAIN/Planetary Intelligence = public planetary knowledge and provenance. 4PLANET BRAIN = internal organisational memory. Do not merge those authorities. ATLAS = shared spatial interface, not a second scientific truth database.

## 4. THE HUMAN-FIRST FIRST FIVE SECONDS
An unfamiliar visitor must understand: what this is, why it matters, what they can do NOW, and how to begin. Replace jargon-first intros with one clear human invitation. Primary routes are **Explore the planet**, **Discover life**, **Understand what is connected**, **Find people and projects taking action**. The navigation should not dump all domains, projects, abbreviations and back-office concepts at once.

Use a calm hero, one clear headline, a helpful one-sentence explanation, a single primary action and restrained secondary paths. A discovery object should answer:
1. What am I looking at?
2. Why does it matter?
3. Where and when?
4. What evidence supports it, and what remains unknown?
5. Which life, places and systems are connected?
6. What people, projects and solutions are relevant?
7. What can I actually do, save, explore or share next?

User-oriented pathways should work even if someone has no environmental science, GIS or funding expertise.

## 5. BRAND AND VISUAL OPERATING SYSTEM
**Desired quality:** NASA scientific trust × National Geographic documentary story × Apple compositional restraint × Patagonia grounded mission × Snøhetta spatial clarity. Take qualities, not imitational styling.
- White background / pure black primary ink; disciplined negative space.
- DM Sans for UI and reading. Use approved Instrument Sans for display and Fragment Mono for technical metadata ONLY when existing tokens and fonts support it; never improvise an unreviewed font mix.
- Canonical palette from earlier brand spec: white #FFFFFF, ink #0A0A0A, brand blue #2E2EFF; Domain-specific accents only when there is a meaningful Domain context. No rainbow chrome or multi-accent competition.
- Use authentic, rights-cleared high-quality documentary photography with purposeful crops, not generic stock image noise.
- Consistent typographic system: actual scale tokens, readable text, line length and hierarchy, no random font sizes or cramped microtext.
- Rounded and tactile controls where appropriate, stable 44px+ touch areas, clear affordances, no gratuitous glass effects or trendy gradients.
- Cinematic can coexist with functional, but function wins: no animation that hides content, no scroll traps, no huge empty hero followed by a hundred screens.
- Elegant grids but no endless interchangeably boxed card walls. Editorial composition + useful filters, search and purposeful detail.
- One global header/menu, one consistent navigation grammar, recognisable product context, predictable back/close, no n/n/n or stray metadata above the logo.
- Mobile-first interaction quality equal to desktop; 390px and 430px iPhone-sized viewports must be first-class.

## 6. PRODUCT-SPECIFIC PREMIUM GOALS
### 4PLANET HOME / DOMAINS / MISSIONS
Protect the strongest existing image-led homepage and full range of Domains. Reduce complexity through hierarchy and selection, not deleting. First-screen statement, four intelligible product pathways, strong mission signal and relevance, shorter hero-to-utility journey. Domain and Mission design should retain distinct visual character but share typographic and navigational tokens. Correct obsolete route names only via intentional redirects.

### IMPACT — THE NEAR-TERM PRIORITY
Be a public **Living Action Network**, not another campaign/donation wall. Make real ecological problems, who acts, where they act, what methods they use and what is known about evidence easy to browse. Premium indexes for projects and organisations must support meaningful filters, source-backed profiles, maps and related stories. A project card should immediately convey what/where/who/current source status, then reveal proof details. The action path can be 'visit official project', 'learn', 'follow', 'share', 'contact' — never a fictional donation or 4PLANET partnership.
Start with available quality and make each link a useful internet object with a stable indexable URL, canonical metadata, useful introduction, claims, citations, dates and related profiles.

### SPECIES
Life-first photography and powerful species introductions; coherent, structured gold profile template with identity, ecology, habitat, dependencies, pressures, conservation status (source-backed), media rights, ATLAS and IMPACT connections. Search/discovery should be beautiful, fast and indexed; profile count must come from published canonical source, not an old source array or remembered target. Preserve every existing published species before adding any.

### ATLAS / PLACE
A genuinely useful exploratory world map with plain-language layers, search, time controls and beautiful context drawers. Preserve MapLibre, globe/mercator, existing scientific layers and camera ownership. Source failure must not become 'zero'. No historical observation marketed as a live animal. Fix mobile sheet, pan/zoom and camera return. Make sharing one selected entity or place reliable. Short, human-readable explanations come before coordinates and record IDs.

### LIVING SYSTEMS
Source-grounded relational discovery across species, ecosystems, ecological services, human systems, threats, solutions, decision and learning. Fewer simultaneous controls, more meaningful guided journeys. No unearned certainty in inferred relationships. Preserve 1.4.2.1 donor/candidate work where it is better than current UI, after precise comparison; avoid introducing a parallel truth architecture.

### EARTH NOW / EVENTS
Turn technical feeds into a legible human experience: what happened, where, when, source/freshness, category, severity only if sourced, map and accessible category filters. Avoid an overload of timestamps, technical records and independent card grids. Test the live `/now` route; `/earth-now` redirects there in source.

### MAGAZINE / CULTURE
Editorial craftsmanship, clear story pages, human proof and robust attribution. Stories are a discovery and distribution engine, not a decorative blog. Shareable editorial objects should carry facts, links to related SPECIES, ATLAS, IMPACT and meaningful Open Graph images. Culture is part of the core brand, not an afterthought.

### 4BRANDS / 4NATION / S4PIENS / 4SAPIEN
Do not neglect these. Define a user job and first useful public object for each, while distinguishing prototype from production. They should inherit the premium design principles without pretending to be one monolithic page.

## 7. DISTRIBUTION AND BUSINESS VALUE
Each published page must be a useful, crawlable object and a credible reason for another person or organisation to share it. People and NGOs are distribution infrastructure when the content genuinely serves their mission and can be shared without overstated claims. Share cards, accessible canonical URLs, social metadata, project-owner links and relevant stories matter.
No fake traffic, false partner logos or unverified impact. Support future pilots, partners, sponsorship, membership and paid products on the strength of legitimate current utility and source-grounded proof, not premature sales widgets.
Prioritise converting useful public experiences into earned visits, saved objects, onward journeys, partner enquiries and carefully separated real-world outcomes.

## 8. GLOBAL NON-NEGOTIABLES
One source of truth; source-aware claims; rights and permissions; no ungrounded environmental numbers; no fabricated populations or current positions; no confidential tokens in client; no actual production payment/partner activation without a separate gate; no destructive data migration; no breaking canonical URLs; no deleting valuable existing assets; no replacing the home page or other approved premium work with generic templates; no scope collapse to Orca/Oslofjord alone; no unverified 'DONE'.
