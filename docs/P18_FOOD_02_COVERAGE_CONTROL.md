# P18-FOOD-02 — multi-category coverage, relevance and demo control

Status: founder-authorised private implementation candidate  
Baseline: `agent/p18-food-vertical-slice` at `88ba3de8fc91e438010bbc89c14c78e3ee518cca`  
Continuation branch: `agent/p18-food-02`

## Scope

This branch extends the bounded FOOD lab route only. It does not authorise public navigation, catalogue-scale ingestion, accounts, retailer scraping, medical personalisation, paid ranking, checkout, another product category, merge or public launch.

## Functional comparison contract

Every product is classified from its own source taxonomy and product-name evidence. Search categories are discovery inputs only and are never inherited as candidate truth.

Controlled relationships are:

- direct substitute — same human-controlled functional subtype;
- adjacent product — same broad family, different subtype or unresolved subtype;
- unsuitable comparison — different controlled family;
- cannot compare fairly — unsupported or unreliable baseline.

A conflicted or malformed scanned product cannot produce an eligible comparison, even when source taxonomy and candidate count would otherwise permit ranking.

Missing data never improves ordering. No universal product score is created.

## Controlled first profiles

- plain, Greek-style plain, flavoured and protein/Skyr yoghurt;
- rolled oats, porridge, granola, muesli, corn flakes, pressed wheat biscuits and extruded breakfast cereals;
- potato chips and adjacent savoury snacks;
- carbonated soft drinks and energy drinks;
- frozen pizza.

## Coverage contract

The acceptance audit uses 10 real Norway-tagged GTINs in each of five categories, for 50 live product reads in total.

The audit attempts live category discovery first. Open Food Facts search can return transient HTML or source errors. A versioned registry of 50 previously audited GTIN identifiers may therefore be used only when live discovery fails to return a complete category set.

The identifier registry contains no ingredients, nutrition, product facts, retrieval timestamps or cached responses. Every product and alternative record must still be fetched live through the hosted source adapter. Every fallback use and discovery error is recorded in the coverage matrix.

## Acceptance boundaries

The product-card and comparison models may pass while an individual category remains AMEND. Machine taxonomy evidence does not replace physical shelf availability, package verification or human substitute-relevance testing.

A private user-testing prototype may proceed after the exact final SHA passes repository, local browser, hosted browser, source, product-card and comparison gates. Public integration remains a separate founder decision.
