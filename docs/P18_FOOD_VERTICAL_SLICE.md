# P18-FOOD-01 — controlled vertical slice

Status: founder-authorised implementation candidate  
Base SHA: `de9e01a37482b7678104690056cc6146e9b286a3`  
Branch: `agent/p18-food-vertical-slice`

## Scope

This branch implements one bounded, non-public lab route:

`/labs/food-intelligence`

The route is not added to the public product switcher or main navigation. It is not a fifth top-level 4PLANET product.

## Vertical slice

1. GTIN validation.
2. One server-side Open Food Facts v3 product request.
3. One bounded Open Food Facts v2 same-category, Norway-tagged alternative request.
4. Immutable append-only local preservation of the returned source envelope, keyed by a canonical SHA-256 hash.
5. Versioned canonical FOOD product normalisation.
6. Source-backed product card with explicit missing/conflicting states.
7. Local user priorities.
8. Deterministic comparison of three to five eligible products where source coverage permits.
9. Inspectable reasons, source, confidence and limitations.

No catalogue ingestion, account, cloud profile, medical advice, universal score, retailer scraping, payment or other product category is included.

## Source contract

Primary source: Open Food Facts.

The Cloudflare Pages Function `/api/food`:

- validates the requested GTIN;
- sends an identifying User-Agent;
- retains the full bounded response envelope in the client record;
- distinguishes found, not found, malformed and source-error states;
- does not infer missing facts;
- does not fall back to retailer scraping;
- treats alternatives as Norway-tagged source candidates, not verified shelf availability.

Open Food Facts database, contents and image rights are recorded separately in the response metadata. Product images are not treated as covered by the database licence.

## Comparison contract

The model version is `p18-food-comparison-0.1.0`.

- mandatory allergen constraints are applied before ordering;
- missing allergen data excludes a candidate when an allergen rule is active;
- candidates must share the controlled comparison category;
- malformed and conflicting candidates are excluded;
- nutrition preferences compare values only when both products contain the metric;
- missing values earn no favourable result;
- data confidence is a tie-breaker, not a health or sustainability judgement;
- no universal product score is generated or displayed.

## Required deterministic states

The branch includes isolated fixtures for:

1. a well-covered Norwegian test product;
2. an incomplete product;
3. an unknown barcode;
4. a malformed/conflicting record;
5. a network/source failure.

Fixture products are labelled `TEST RECORD` and must never be presented as live product claims.

## Validation

- `npm run test:food` — pure data, provenance and comparison contracts.
- `npm run test:smoke` — includes the FOOD contracts.
- `tests/e2e/food-vertical-slice.spec.ts` — browser checks for the five deterministic states and both UI gates.
- `npm run typecheck`, `npm run lint`, `npm run build` — repository integrity.

## Stop condition

Stop after the product-card and comparison gates have been evaluated. Do not begin bulk catalogue ingestion on this branch.
