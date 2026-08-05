# P17 Megasprint 04 — ORGANISATIONS_ Discovery and Scale Gate

## Controlled status

**PRIVATE PRODUCT CANDIDATE / STACKED BRANCH / NO MERGE / NO PUBLIC RELEASE**

This record documents the implementation and audit boundary for P17 Megasprint 04. It does not authorise merging, production deployment, search indexing, external profile review, outreach, partnership activation, payment collection or Impact Unit creation.

## Repository control

- Repository: `odinskogen-dev/4Planet.05`
- Protected four-product branch: `build/four-product-integrated-prototype`
- Locked four-product SHA: `de9e01a37482b7678104690056cc6146e9b286a3`
- Previous P17 branch: `build/p17-actor-atlas-private-beta`
- Previous P17 candidate SHA: `387e276dd09e6cfe9864928027d86939e79903ee`
- Megasprint 04 branch: `build/p17-organisations-discovery-scale-gate`
- Megasprint 04 base: exact previous P17 candidate SHA
- Final candidate: the head SHA of the Megasprint 04 draft pull request after the final CI gate
- `main`, PR #9 and PR #20 remain unmerged and unmodified by merge operations.

## Product result

Megasprint 04 moves P17 from a three-profile technical proof to a coherent ten-profile private product candidate.

Implemented:

1. A permanent `ORGANISATIONS_` entry in the public navigation, footer and homepage.
2. Editorial discovery at `/actors`, with a meaning-first introduction, curated collections, search, filters, active URL state, honest empty states and no universal score.
3. One shared premium profile template at `/actors/:slug`.
4. Ten flagship profiles represented through one data contract and one route/template system.
5. Fifty material source-mapped claims, preserving source statement, product context and 4PLANET assessment as separate states.
6. Global Fishing Watch as a data-only scaling proof, added without a new profile component, copied route, organisation-specific CSS or new truth model.
7. Native actor geography inside the existing ATLAS/MapLibre runtime at `/atlas?mode=actors`.
8. Source-, role-, precision- and sensitivity-aware actor geography semantics.
9. A secure-review client contract that fails closed when no authorised endpoint is configured and stores no requestor contact data in browser storage.
10. A staging-ready additive database migration for review requests, statuses, private audit history and access revocation. The migration is committed but not applied by this sprint.
11. Unique canonical metadata, Organisation structured data, Open Graph assets and `noindex,nofollow` private-beta controls.
12. 4PLANET-generated share graphics for the index and all ten profiles, using no organisation logos, photographs or unresolved media.
13. Dedicated contract, smoke, browser and visual-evidence gates.

## Ten flagship profiles

- IUCN
- Global Biodiversity Information Facility
- Wildlife Conservation Society
- Whale and Dolphin Conservation
- Coral Restoration Foundation
- Global Fishing Watch
- Panthera
- World Land Trust
- Rainforest Foundation Norway
- Climate TRACE

All ten remain independently indexed private-beta profiles. None is marked as a 4PLANET partner, verified organisation, endorsed organisation or active Impact provider.

## Discovery architecture

Implemented entry points:

- homepage editorial module
- global navigation
- footer
- direct `/actors` route
- direct canonical profile routes
- profile-to-ATLAS and ATLAS-to-profile continuity
- shared profile cards and generated Open Graph cards

Data-contract relationships are available for missions, species, places, issues, solutions and related actors. Broader contextual modules inside every surrounding product surface are not falsely claimed as complete; they remain reusable integration points for later controlled implementation.

## Native Actor Mode

Actor Mode extends the existing World/MapLibre system rather than creating a new map or globe.

Geography roles:

- `HEADQUARTERS_REFERENCE`
- `OPERATING_GEOGRAPHY`
- `PROGRAMME_GEOGRAPHY`
- `DOCUMENTED_PROJECT_SITE`
- `PARTNER_GEOGRAPHY`

Controls:

- headquarters is never treated as an operating area;
- country or regional presence is never automatically a project site;
- source state and precision travel with geography;
- restricted or sensitive geography is generalised or withheld;
- selected actor and geography remain represented in the canonical URL;
- the canonical profile remains the primary organisation record;
- the existing ATLAS runtime, camera and interaction system remain authoritative.

## Claim and correction security boundary

The client validates:

- request type;
- official email and organisation domain;
- requestor name and role;
- authorisation context;
- affected section;
- requested change;
- evidence and attachment references;
- privacy acknowledgement and consent.

The client cannot:

- mutate a profile;
- approve a claim;
- grant verification;
- grant partner status;
- expose an internal review queue;
- persist sensitive request data in browser storage.

Without `VITE_P17_REVIEW_ENDPOINT`, submission returns a staging-blocked receipt and transmits nothing.

The additive SQL candidate adds review states, retention/deletion fields, an internal status-transition audit trigger and revoked anonymous/authenticated table access. It must receive a separate database/security review before staging application or any external invitation.

## Truth, identity and rights audit

- Material claims retain source references or explicit limitations.
- Organisation statements remain distinguishable from 4PLANET interpretation.
- Public brand, legal identity and network structure are not deliberately collapsed.
- Partner-led and Indigenous-led agency remains explicit where relevant.
- Official support actions leave 4PLANET and do not become payments or Impact Units.
- No unresolved organisation logo, photograph, video, screenshot or brand graphic is used.
- Share assets are original 4PLANET-generated SVG compositions.
- Private profiles remain `noindex,nofollow`.
- Indexing never implies approval, verification, endorsement or partnership.

## Architecture audit

- One actor data model.
- One profile route and template.
- No organisation-specific profile component.
- No copied organisation route.
- No separate application.
- No separate design system.
- No separate globe or map engine.
- Existing 4PLANET, ATLAS, SPECIES and IMPACT routes remain in the same application.
- The review migration is additive and does not activate public access.

## Quality gate expectations

The final exact candidate SHA must pass:

- locked dependency installation;
- TypeScript typecheck;
- production build;
- existing smoke tests;
- P17 architecture/truth contracts;
- lint with zero errors;
- asset verification with zero missing references;
- dependency audit with zero critical vulnerabilities;
- eleven Playwright journeys covering discovery, profiles, secure review, native Actor Mode and visual evidence;
- stable component-level desktop and mobile screenshots.

## Known non-blocking and release-blocking findings

Private founder review is not blocked by:

- existing lint warnings where the lint command returns zero errors;
- the existing production bundle-size warning;
- an unapplied review migration, because external review remains disabled.

Public release or external fact-check activation remains blocked by:

1. Founder review and acceptance of the product/editorial direction.
2. Security and database review before applying the review migration.
3. A configured, authorised secure endpoint and internal reviewer access policy.
4. Review/remediation decision for the repository dependency audit findings.
5. Explicit release authority for merge, deployment and indexing.
6. Item-level founder approval before any organisation contact.

## Rollback and release control

The Megasprint 04 work is isolated on its own stacked branch. Rollback is achieved by closing or abandoning the stacked pull request; the previous P17 candidate remains at its locked SHA.

No merge, production deployment, indexing, external message, private preview, claim invitation, partnership status, payment or Impact Unit activation is part of this closeout.

## Recommendation

**READY FOR FOUNDER PRIVATE REVIEW** once the final exact branch head passes the complete CI and browser gate.

This recommendation does not mean ready for public beta or organisation outreach.