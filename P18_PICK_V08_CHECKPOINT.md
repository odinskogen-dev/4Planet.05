# P18 PICK_ v0.8 — PRIVATE CONVERGENCE CHECKPOINT

Status: PRIVATE REVIEW CANDIDATE. NO PRODUCTION MERGE.

Base checkpoint: `e3b0ebb4bd891cec667877fd218106636b3a33a5` (`agent/p18-pick-v1`).
Active branch: `agent/p18-pick-v2`.

## Material iterations

### I05 — HEALTH + FAIR ALTERNATIVES
- Evidence engine remains separate from canonical product facts.
- Category/pattern evidence is distinguished from product composition.
- Processed meat, wholegrain/refined bread/pasta, yoghurt, cereals, soft drinks, snacks and pizza have bounded first rules.
- No generic UPF or E-number fear score.
- Refined bread/pasta → wholegrain equivalent is a controlled functional upgrade.
- Missing comparison fields can never manufacture a winner.

### I06 — WALLET
- Read-only Open Prices adapter with GTIN, NOK observations, date, proof and location context.
- Unit price calculated only where pack quantity and price unit permit.
- Stale/other-store observations remain visibly limited.
- Basket cost is only the sum of stored observations, never described as guaranteed checkout price.

### I07 — PLANET
- NNR + AGRIBALYSE category context.
- Every current environmental result is explicitly `CATEGORY PROXY`.
- `exactSkuFootprint` remains false.
- No brand/SKU planet winner is allowed from generic LCA averages.

### I08 — REAL SHOP SURFACE
- Barcode camera integrated directly into PICK_.
- Manual GTIN fallback retained.
- Decision surface remains HEALTH / WALLET / PLANET, never one score.
- Fair alternatives, evidence ledger, basket, household/shop mode and local correction path retained.
- Mobile-first Brand OS direction preserved.

## Truth invariant

`SOURCE → RECORD → FACT → EVIDENCE → INTERPRETATION → DECISION`

Product facts, health evidence, price observations and environmental proxies remain separate objects. Missing or stale data cannot improve rank.

## Required exact-head gate

- PICK v1 truth contracts
- PICK v2 adversarial truth contracts
- TypeScript
- production build
- existing FOOD contracts
- repository smoke
- lint
- asset verification
- Chromium route preview
- baseline FOOD browser tests
- PICK v0.8 browser tests
- Cloudflare branch preview

A candidate is not complete until the exact PR head is green.
