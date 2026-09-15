# CLAUDE READ FIRST — 4SAPIEN LIVE SOURCE SNAPSHOT

This branch is a read-only handoff snapshot for Claude, created directly from the current 4SAPIEN production source state.

## WHAT THIS IS

Live product: https://4sapien.com

Production repository: `odinskogen-dev/4Planet.05`

Production source branch: `build/ask-embla-live-20260909`

Snapshot base commit: `e13e44ae8e5fa3e5fff0082965eb8105a5d3467a`

The handoff branch you are reading was created from that exact commit so you can inspect the full code without touching production.

## CLONE THIS SNAPSHOT

```bash
git clone --branch handoff/4sapien-live-to-claude-20260915-use-this --single-branch https://github.com/odinskogen-dev/4Planet.05.git
cd 4Planet.05
```

The complete 4SAPIEN source/deploy package is under:

`products/4sapien/`

## SOURCE MAP

### Public front `/`

Source donor:

`products/4sapien/source/claude-front-20260915-v2.html`

Production integration transform:

`products/4sapien/build/apply_front_v2_release.py`

This preserves the Claude visual donor while replacing demo routing with the real production routing/auth seams.

### Food / Ask Embla `/app/food/`

Base donor is stored compressed/split as:

`products/4sapien/source/part-00.b64` through `part-06.b64`

Production guards/integration are applied by:

- `products/4sapien/build/apply_provider_guard.py`
- `products/4sapien/build/apply_meal_plan_guard.py`
- `products/4sapien/build/apply_product_gateway_guard.py`

### Money / Finance `/app/money/`

Finance donor is stored as:

- `products/4sapien/source/finance-part-00.b64`
- `products/4sapien/source/finance-part-01.b64`
- `products/4sapien/source/finance-part-02.b64`
- `products/4sapien/source/finance-part-03.b64`

Production materialisation/integration:

- `products/4sapien/build/apply_finance_route.py`
- `products/4sapien/build/apply_finance_typography_guard.py`

`apply_finance_route.py` is especially important: it reconstructs the current Finance frontend and contains the wiring against the shared 4SAPIEN Supabase runtime.

### Supabase / backend seams

Under:

`products/4sapien/supabase/`

Including:

- schema/migrations
- Edge Function source under `products/4sapien/supabase/functions/`
- existing 4SAPIEN live SQL/state definitions

Do not create a second Supabase project, Auth system, Embla runtime, memory system or user database.

### Cloudflare production

Config:

`products/4sapien/wrangler.jsonc`

Cloudflare assets/config:

`products/4sapien/cloudflare/`

Production workflow:

`.github/workflows/ask-embla-production.yml`

This workflow materialises `/`, `/app/food/`, `/app/money/`, runs zero-loss/security QA, verifies Supabase/Auth/Embla boundaries, deploys the isolated Worker candidate and then attaches `4sapien.com` to the existing `four-sapien-embla` Cloudflare Worker service.

Do not replace this deployment line.

## IMPORTANT ARCHITECTURE RULE

GPT/AXE owns and preserves the working runtime/integration layer:

- shared Supabase Auth
- persistent user state
- Finance tables/events/accounts
- Food state and shopping-list/meal-plan/product gateway
- Embla runtime/tool boundaries
- permissions/security
- Cloudflare production gate

Claude should treat the visual/product layer as editable while preserving those runtime seams unless explicitly coordinating a change with GPT/AXE.

## CURRENT PRODUCT ROUTES

- `/` — public 4SAPIEN front
- `/app/food/` — Food / Ask Embla
- `/app/money/` — Money / Finance
- `/finance` and `/finance/` — compatibility Finance routes

## CURRENT FOUNDER BRAND RULE

4PLANET Brand Blue `#2E2EFF` is for `#FFFFFF` backgrounds only in masterbrand/general product contexts.

Do not use Brand Blue as a generic accent on dark/black surfaces.

Only explicit exception: authorised OCE4N_ domain contexts.

Dark 4SAPIEN should primarily use black/white/neutral hierarchy plus contextual colours where meaningful, e.g. Food green `#3AE86F`, Money/S4PIENS orange-red `#FF4D22`, Culture/human pink `#FF5ACD`.

## CURRENT FOUNDER REQUEST FOR FINANCE UX

When reviewing/merging the Finance product, preserve working data/runtime but improve the visible experience around:

1. Inline editing of existing posts/events: click directly on name/amount to edit; Enter save; Esc cancel; compact date/category/repeat editing.
2. A fast spreadsheet/budget-style entry mode as an additional input path, not a replacement for the current add modal. Tab/Enter should move efficiently down rows and support batch save.
3. A stronger Overview based on the digital twin of the user's economy.
4. One soft modern 2×2 economic-state card divided by an elegant thin cross with:
   - Inntekt | Utgift
   - Eiendeler | Gjeld
5. Live account-status overview based on entered account information and the existing liquidity calculation.
6. A Jan–Dec 2026 liquidity/cashflow view where each month is selectable; past periods represent entered actual history where data exists, present is current state, future is forecast/modelled. Never claim accounting precision when coverage is incomplete.
7. Preserve truth states: UNKNOWN must remain UNKNOWN. Do not infer `0` from missing data.
8. Review current category/default behaviour: user screenshots show some events apparently carrying implausible categories. Do not silently rewrite user data; fix defaults/mapping and surface review where needed.

Product feel target: a calm, symmetric, premium 'digital twin of your economy' — almost a small understandable game, not a dense finance SaaS dashboard.

## FIRST FILES TO READ

1. `.github/workflows/ask-embla-production.yml`
2. `products/4sapien/build/apply_finance_route.py`
3. `products/4sapien/build/apply_front_v2_release.py`
4. `products/4sapien/source/claude-front-20260915-v2.html`
5. `products/4sapien/supabase/`

Then inspect all of `products/4sapien/` before proposing a merge.

## DO NOT

- Do not create a parallel 4SAPIEN repo.
- Do not replace the current Cloudflare production path.
- Do not create a second backend/Auth/Embla.
- Do not expose secrets in browser code.
- Do not replace working Finance/Food functionality merely for cleaner visuals.
- Do not fabricate personal financial/food data.

The goal is to merge Claude's strongest visible product/UX work with the current working GPT/AXE live runtime and integration state.
