# 4SAPIEN — UNIFIED PRODUCT CONTEXT FOR CLAUDE

**Production truth · architecture · product intent · design debt · zero-loss redesign context**  
Date: 2026-09-16  
Production base SHA: `3817a7916b369349081a7d2232bdb15d5ab743d1`

This document is context, not a task prompt. It describes the actual production state of 4SAPIEN, the product intent, the seams that already work, the areas that are incomplete, and why the next design pass concerns the whole product rather than another isolated surface. Claude should reason from this state and may propose the best coherent solution rather than follow a pre-written layout.

## 1. What 4SAPIEN is

4SAPIEN is one personal life-intelligence product. It is not a collection of separate mini-apps.

The current named surfaces are:

- **Front** — public entrance, product explanation and account entry.
- **Embla** — the shared intelligence / reasoning interface and runtime layer.
- **Food** — the first life-world / capability set.
- **Finance / Money** — the second life-world / capability set.

Embla is not intended to be a fourth disconnected app. Embla should be the intelligence that can understand and operate across the user's permitted worlds while preserving boundaries, provenance and user agency.

Core product law: **FACTS, NOT ADVICE.** 4SAPIEN should structure facts, options, evidence, unknowns, trade-offs and the user's own criteria. It should not silently make life decisions for the user.

Core architecture principle: **Separate worlds. Shared infrastructure. Controlled depth.**

The strategic product idea is simple: one identity, one coherent life system, one intelligence layer, multiple life-worlds. The user should not feel that they are jumping between unrelated applications.

## 2. Product model underneath the interface

The interface should respect the distinction between these layers:

- user identity and authentication
- conversations
- long-term memory
- structured personal truth / current state
- event history
- knowledge and provenance
- deterministic tools and calculations
- permissions between worlds
- model / reasoning layer

These are deliberately not collapsed into one generic AI memory blob.

Preferred runtime direction already established in the project:

- Supabase Auth / Postgres / RLS for identity and structured personal state
- selective vector retrieval for machine-readable memory / knowledge where useful
- 4SAPIEN BRAIN / Drive as canonical human-readable authoring and controlled knowledge source
- external LLMs as replaceable reasoning engines behind Embla, not the product itself
- deterministic calculations and actions as tools rather than LLM guesses

## 3. Current production truth

Canonical live repository: `odinskogen-dev/4Planet.05`  
Canonical production branch: `build/ask-embla-live-20260909`  
Production base for this handoff: `3817a7916b369349081a7d2232bdb15d5ab743d1`

Live product:

- `https://4sapien.com/` — public front
- `https://4sapien.com/app/food/` — Food + current Ask Embla surface
- `https://4sapien.com/app/money/` — Finance / Money
- `/app/` currently resolves toward Food
- `/finance` and `/finance/` are compatibility routes

Production is deployed through the existing GitHub → Cloudflare Worker chain. The current Worker service is `four-sapien-embla`.

The production gate verifies the materialised product, Supabase tables, authentication boundaries, auth providers, Cloudflare authority, isolated Worker candidate and the custom domain before release.

## 4. Front — what exists now

Primary source:

`products/4sapien/source/claude-front-20260915-v2.html`

Relevant build integration:

- `products/4sapien/build/apply_front_v2_release.py`
- `products/4sapien/build/apply_front_auth_guard.py`

Current positioning includes:

- **See your life clearly.**
- Food × Money together
- Plan my food until payday
- Method, privacy and account/auth entry

The front is visually strong and communicates the thesis, but today it behaves more like a marketing gateway / product demo than the natural outer shell of the same application the user enters after authentication.

A future coherent 4SAPIEN should make the transition from public front → signed-in product feel intentional rather than like switching products.

## 5. Food + Embla — what exists now

The current Food / Ask Embla donor is stored as compressed source parts:

`products/4sapien/source/part-00.b64` through `part-06.b64`

It materialises to `/app/food/index.html` and then receives existing runtime guards, including:

- provider / authenticated profile guard
- weekly meal-plan persistence guard
- product gateway guard
- shared auth callback behaviour
- shared theme behaviour

Important existing state and backend contracts include:

- `four_sapien_profiles`
- `four_sapien_list_items`
- `four_sapien_shops`
- `four_sapien_meal_plans`
- `four_sapien_product_cache`
- receipt storage under the existing `four-sapien-receipts` contract
- authenticated `embla-products` boundary
- authenticated `embla-core-preview` boundary

The browser must not bypass the product gateway with direct third-party product-data scraping. Partial product/price coverage is deliberately represented as partial coverage rather than fabricated certainty.

Meal-plan persistence has explicit hydrate/save failure states. Authentication callbacks return into the product rather than silently dropping the user back to the marketing root.

### Current product weakness

Ask Embla is currently experienced mainly inside the Food surface. Architecturally Embla is broader than Food. The UI does not yet fully express that.

The next coherent app should make Embla feel like shared contextual intelligence available across the user's permitted life-worlds, without turning every screen into a chat interface.

## 6. Finance / Money — what exists now

Primary donor source:

`products/4sapien/source/finance-part-00.b64` through `finance-part-03.b64`

Materialisation / build chain includes:

- `products/4sapien/build/apply_finance_route.py`
- `products/4sapien/build/apply_shared_theme_guard.py`
- `products/4sapien/build/apply_finance_typography_guard.py`
- `products/4sapien/build/apply_finance_twin_runtime_guard.py`
- `products/4sapien/build/apply_finance_claude_premium_guard.py`

The live Finance page currently combines the original React donor with a later visible `AXE_FINANCE_EXPERIENCE_V2` layer. This preserved work quickly, but it is now technical debt: two visible composition layers make typography, theme, spacing and future component changes harder to keep coherent.

The newest Claude Finance visual pass was useful because it stayed in the visible layer and did not replace the newer runtime. It improved the 2×2 economic twin, hierarchy, available-cash emphasis and premium spacing. The safe production merge therefore preserved the current runtime and applied the useful visual delta last.

### Canonical Finance runtime contract

Marker: `FOUR_SAPIEN_FINANCE_TWIN_RUNTIME_V1_1`  
Browser seam: `window.FourSapienFinanceRuntime`

Existing canonical operations include:

- `four_sapien_finance_twin`
- `four_sapien_finance_save_event`
- `four_sapien_finance_batch_save_events`
- `four_sapien_finance_soft_delete_event`
- `four_sapien_finance_save_account`
- `four_sapien_finance_soft_delete_account`
- `four_sapien_finance_restore_account`
- `four_sapien_plan_food_until_payday_context`
- `four_sapien_set_permission`

Core Finance tables include:

- `four_sapien_finance_accounts`
- `four_sapien_finance_events`
- `four_sapien_finance_budget`

### Finance truth laws that must survive any redesign

- Unknown or partial liquidity must not silently become zero.
- The interface must not invent false certainty such as a fake `99+ mnd` runway.
- Bank/cash liquidity is not the same thing as all assets or investments.
- Debt / loans / credit are liabilities, not negative cash masquerading as another category.
- Annual recurring expenses must be normalised correctly when monthly burn/runway is calculated.
- Registered facts, forecast and `scheduled_unconfirmed` are distinct truth states.
- Food × Money access is permission-gated.
- Writes should remain reversible where the current runtime provides soft delete / restore.
- Existing user data must not be rewritten merely to make a new UI easier to build.

## 7. Shared theme and visual foundation

The current shared theme is coordinated by:

`products/4sapien/build/apply_shared_theme_guard.py`

It creates the shared theme runtime and persists the user's light/dark choice.

Existing brand colours used across 4SAPIEN include:

- blue `#2E2EFF`
- green `#3AE86F`
- orange/red `#FF4D22`
- pink `#FF5ACD`

Current typography direction:

- **Instrument Sans** — display / headings
- **DM Sans** — UI / body
- **Fragment Mono** — data / machine-readable / value moments where appropriate

Finance intentionally uses blue as a major light-mode accent and green as a strong dark-mode accent after the latest visual reconciliation. World-specific accents are acceptable; world-specific design languages are not.

The important next step is to move from a shared palette plus build-time guards to a genuinely shared interaction and component grammar.

## 8. What is already strong

Several foundations should be treated as assets, not obstacles:

- The overall thesis: one life-intelligence system rather than separate vertical apps.
- A single 4PLANET ID / auth model.
- Email and Google authentication are live.
- Supabase-backed structured state.
- RLS-based personal-data boundaries.
- Food persistence and product gateway behaviour.
- Explicit partial-data semantics rather than fabricated product-price certainty.
- Finance Twin and fail-closed UNKNOWN semantics.
- Reversible Finance writes through the canonical runtime.
- Permission-gated Food × Money context.
- Shared light/dark theme state.
- The latest Finance hierarchy / premium visual direction.
- Existing production gates that make zero-loss iteration possible.

## 9. What currently feels poor or fragmented

The main product problem is now coherence, not the absence of screens.

### Interface fragmentation

The front, Food/Embla and Finance all have good elements, but the user still has to mentally reset when moving between them. Navigation, page shell, headers, account affordances, theme controls, spacing rules, cards, controls and interaction patterns are not yet one native system.

### Embla is under-expressed as the shared intelligence layer

Embla is currently strongly associated with Food in the visible product, even though the architecture is broader. A coherent product should make it obvious that the same intelligence understands the current world and can cross worlds only when permitted.

### Finance has duplicate visible composition

The React Finance donor plus `AXE_FINANCE_EXPERIENCE_V2` overlay is the largest current front-end debt. It has already caused typography/theme leakage and requires post-build guards. It should eventually converge into one native Finance surface, but only after full functional parity is mapped and proven. A big-bang deletion is not safe.

### The design system is currently partly enforced after the fact

Several visual invariants are applied through build-time guards. That has been an effective zero-loss bridge, but the long-term premium app should express shared tokens/components/state natively rather than repeatedly patching divergent surfaces after materialisation.

### Repeated controls

Auth/account behaviour, theme controls, headers, modal patterns, settings and navigation have grown separately. The coherent product should reduce duplicate representations of the same system action.

### Mobile and desktop need one intentional grammar

The product has improved mobile safe areas and desktop width, but some screens still inherit assumptions from their original isolated prototypes. The unified system should feel deliberately designed at both sizes, not stretched or compressed versions of different apps.

## 10. What the product still needs

The highest-value missing layer is a coherent product shell and interaction model around the already valuable runtime.

Important missing outcomes include:

- one signed-in 4SAPIEN shell and navigation grammar
- one component/token/state system shared by Food, Finance and Embla
- one account / auth / privacy / permissions experience
- one theme behaviour with deliberate light/dark parity
- contextual Embla access across worlds
- clearer Finance actual → now → forecast semantics across time
- further refinement of category defaults without rewriting old user data
- a complete Food × Money user journey using permitted, deterministic Finance context
- authenticated end-to-end mobile and desktop founder QA
- explicit two-user RLS isolation QA for personal financial data
- eventual removal of the duplicate Finance visible layer after parity is proven

## 11. What "one coherent premium app" should mean

This does **not** mean flattening Food and Finance into identical dashboards. Their information architecture can remain appropriate to the job.

It does mean that a user should feel continuously inside 4SAPIEN when moving between `/`, Food, Finance and Embla.

The app should share:

- shell
- navigation
- account identity
- theme
- typography
- spacing rhythm
- controls
- states and error patterns
- modal / drawer / sheet grammar
- cards and data hierarchy
- permission language
- Embla affordance
- responsive behaviour

Worlds can have their own content structures and accents while still being unmistakably one product.

The intended feeling is calm, direct, intelligent and premium — closer to manipulating a trustworthy personal system than operating a dense admin dashboard.

Useful qualities:

- direct manipulation where safe
- fewer unnecessary modals
- progressive disclosure
- strong information hierarchy
- generous but efficient whitespace
- clear fact / unknown / forecast state
- no decorative complexity that obscures truth
- dark mode designed, not merely inverted
- no serif/editorial typography drift inside the application
- no dashboard soup

## 12. How to reason about the redesign

This is deliberately not a prescribed solution.

The most important working assumptions are:

- Start with archaeology before invention. The live behaviour and current code are the truth; older handoff documents may be stale.
- Separate stable runtime/data contracts from replaceable visual composition.
- Think shared product system first, individual screens second.
- Converge duplicated UI only after mapping what each layer currently does.
- If a visible layer is removed, maintain a parity map for every action, state, error and edge case it carried.
- Embla should become more ambient/contextual, but the exact expression is open for design reasoning.
- A beautiful redesign that drops a current capability is a regression.
- A technically safe merge that preserves every old inconsistency is also not the final goal.

The ideal handback from the next design phase should make it easy to distinguish:

1. canonical shared system
2. world-specific Food composition
3. world-specific Finance composition
4. shared Embla experience
5. unchanged backend/runtime contracts
6. anything intentionally deprecated, with proven replacement parity

## 13. Zero-loss invariants

Any future redesign should preserve these unless there is an explicit, separately approved migration:

- existing Supabase Auth and identity behaviour
- existing Postgres/RLS truth model
- current user data
- existing table/storage/RPC contracts used by production
- `window.FourSapienFinanceRuntime` compatibility until consumers are migrated safely
- Food gateway behaviour
- meal-plan persistence
- partial-data / UNKNOWN semantics
- Finance fact vs forecast distinctions
- Food × Money permission boundary
- auth callback behaviour
- compatibility routes while users/builds still depend on them
- no private service secrets in browser code
- no new parallel database, memory system, AI brain or truth system
- no fake local/demo state replacing a working production seam

## 14. Code map inside this package

The handoff package contains both the source/build chain and materialised current production surfaces so the actual result can be compared with the machinery that creates it.

Expected package areas:

- `01_LIVE_FRONT/` — current materialised front
- `02_LIVE_FOOD_EMBLA/` — current materialised Food + Ask Embla
- `03_LIVE_FINANCE/` — current materialised Finance
- `04_SHARED_RUNTIME/` — generated shared runtime where present
- `05_SOURCE_BUILD/` — current `products/4sapien/source`, build scripts, Cloudflare config and worker configuration
- `06_BACKEND_RELEVANT/` — repository backend files discovered as relevant to 4SAPIEN / Embla / Food / Finance
- `07_PRODUCTION_GATES/` — the deployment/runtime gates relevant to the current product
- `MANIFEST.txt` — package inventory

## 15. Current strategic conclusion

The 4SAPIEN product is no longer primarily blocked by the lack of a beautiful Finance screen. The most valuable next design problem is **system coherence**.

The product already contains enough real functionality to justify treating Front, Embla, Food and Finance as one application now. The design work should expose that underlying unity without discarding the working runtime.

The biggest technical debt is the duplicate Finance visible layer.  
The biggest product gap is that the surfaces still feel separate despite shared infrastructure.  
The biggest opportunity is Embla as contextual intelligence spanning the user's permitted life-worlds.  
The central design challenge is therefore: **make the whole system feel inevitable, simple and premium while losing zero real function.**
