# CLAUDE EXECUTION DECISIONS — 2026-10-07
## Answers from AXE / Project Lead to pre-execution questions

These decisions supplement the full master execution pack. They are not a new product architecture.

### 1. SEO ownership

**Decision: 4planetatlas.com is the canonical Google host for ATLAS and ATLAS-owned Place discovery.**

Canonical ownership for this closure:
- `https://4planetatlas.com/` — canonical ATLAS root.
- `https://4planetatlas.com/places` — canonical Place index.
- `https://4planetatlas.com/place/*` — canonical Place Portrait / place discovery pages.
- `https://4planetatlas.com/atlas/*` — canonical ATLAS data/object discovery pages where those routes remain.
- `/now` may be canonical on the ATLAS domain when it is the ATLAS Earth Now experience.

Do **not** move SPECIES or LIVING SYSTEMS SEO ownership inside this ATLAS release.
Current product architecture keeps them separate public product surfaces. Until their own current production authority is separately reconciled:
- leave `/species/*` under its existing SPECIES authority;
- leave `/living-systems/*` under its existing LIVING SYSTEMS / 4PLANET authority.

The repo is shared, but the ATLAS deployment is now isolated. `4planetatlas.com` and `4planet.org` are **not the same Pages production artifact**.

For the standalone domain, canonical root is **`/`**, not `/atlas`.
Preferred end-state:
- `4planetatlas.com/` renders ATLAS;
- `4planetatlas.com/atlas` redirects permanently to `/` or otherwise cannot create a second indexable canonical;
- old/shared `4planet.org/atlas` should ultimately canonicalise/redirect to the standalone ATLAS domain, but do not broaden R1 into unrelated 4PLANET route redesign.

Because one repository serves multiple public products, do **not** solve SEO with one blunt global origin for every route. Implement explicit route/product ownership:
- ATLAS/Place prerender canonicals → `4planetatlas.com`;
- SPECIES remains on SPECIES authority;
- LIVING SYSTEMS remains on its current authority;
- shared 4PLANET routes remain on `4planet.org`.

The dedicated ATLAS build should emit an ATLAS-specific sitemap/robots surface rather than a sitemap containing the whole 4PLANET application.

**Environment truth:** the current dedicated LIVE ATLAS artifact was built in GitHub Actions and then uploaded to Cloudflare Pages. That build workflow did not set `PUBLIC_SITE_ORIGIN` or `VITE_PUBLIC_SITE_ORIGIN`. Therefore the current static prerender fell back to `https://4planet.org`. Cloudflare Pages environment variables, even if present, could not change the already-built `dist` uploaded by that workflow.

**Search Console truth:** AXE's connected Search Console integration currently returns zero connected properties. Therefore verification of `4planetatlas.com` and sitemap submission are **UNPROVEN**, not assumed. R1 must generate the correct sitemap/robots/canonical output. AXE owns Search Console verification/submission after deployment.

### 2. LIVE identity / SHA

LIVE is **not** literally `king/test@5dc63fe`.

The current dedicated ATLAS production deployment metadata is:

`f4914a469ccc032b5d7b0063817a83aa7b4fa48e`

The later `king/test` head `5dc63fe8ddd1daea32d62d102066705d3c7efbfe` is three commits ahead, but the only changed file between those two points is:

`.github/workflows/atlas-dedicated-transfer-fast-20261007.yml`

Therefore:
- exact deployed artifact identity = `f4914a469ccc032b5d7b0063817a83aa7b4fa48e`;
- application source/runtime code is materially equivalent to current `king/test@5dc63fe`;
- do not claim the public artifact SHA is 5dc63fe.

If Claude's sandbox cannot browser-open LIVE, use the exact current source and local renders for implementation, and return the screenshots/evidence. AXE owns final public-domain browser verification.

### 3. Authority / sandbox

Do **not** mutate the handoff branch. It is context only.

Claude has read-only remote access, so Claude's implementation is a **non-authoritative donor artifact** based on the exact parent:
`5dc63fe8ddd1daea32d62d102066705d3c7efbfe`

Claude should record that exact parent in every delivery.

AXE owns:
- lawful SANDBOX/HEIR registration reconciliation;
- application of Claude's donor diff into the authorised ATLAS line;
- Founder-visible preview;
- promotion / release;
- rollback.

No Claude-created local or handoff branch acquires product authority merely by name.

### 4. Delivery

Choose **(a) versioned zip + GPT_PROJECT_LEAD_HANDOFF.md**.

For each release package include:
- exact base SHA;
- release name R1/R2/R3;
- complete changed-file list;
- unified diff/patch if practical;
- source files only — no node_modules;
- test commands + outputs;
- screenshots at 390×844 and 1440×900; 430×932 where relevant;
- known blockers;
- regression risks;
- explicit do-not-lose proof;
- instructions to apply cleanly to the exact parent.

AXE applies the package into the lawful ATLAS authority line, runs independent verification, deploys and verifies LIVE.

### 5. Scope / releases

**Accepted: three releases.**

#### R1 — PUBLIC / HUMAN GOLD
- canonical / sitemap / robots ownership fix;
- standalone root `/`;
- Earth-dominant resting state;
- Brand OS visual convergence;
- Place Portrait;
- random-coordinate “Here” experience;
- mobile Search;
- Layers sheet;
- removal of obvious black technical-first context;
- panel/viewport/touch regressions;
- first public accessibility/SEO pass.

R1 is the highest priority. Do not move to R2 while R1 remains visibly broken.

#### R2 — CURRENT / PERSONAL
- Weather;
- local time / day-night;
- NOW;
- My Atlas presentation;
- only bounded ID-adjacent UI changes that do not rewrite auth.

#### R3 — CHANGE
- coherent TIME semantics and interaction;
- Compare;
- associated evidence/limitations.

The master pack's ordering still governs within each release. The three-release packaging is accepted because it reduces regression risk and gives exact human review gates.

### 6. Structure / atlasPolish.css / sidecars

**Agreed, with one constraint: migrate, do not big-bang rewrite.**

Claude may:
- move durable styling from `atlasPolish.css` into the owning components / canonical style sheets / existing shared Brand tokens;
- remove `!important` overrides when ownership is made explicit;
- retire DOM-patching sidecars when the same behaviour is integrated directly into React/product state;
- simplify duplicate selectors and patch layers.

Do not:
- create a new design system;
- create a parallel Context engine;
- delete a sidecar merely because it looks inelegant if it protects a real cross-product/runtime contract.

Tests that assert stale class names or text may change **only when** the same or stronger user-facing invariant is covered by the replacement test.

Prefer behavioural contracts over implementation-string contracts.

### 7. Weather

**Accepted: same-repo Cloudflare Pages Function proxy.**

Use the existing server seam under `functions/api/`; do not create a new service.

Recommended shape:
`functions/api/atlas-weather.ts`

Responsibilities:
- server-side request to MET Norway;
- identifying User-Agent configured from existing/public 4PLANET contact identity;
- cache according to upstream freshness/cache semantics;
- validate lat/lon;
- bounded response shaped for ATLAS;
- source timestamp / forecast validity retained;
- graceful upstream failure;
- no secrets in client;
- no global polling.

Because the browser calls the same-origin Pages Function, the browser does not need MET Norway added to `connect-src` merely for that proxy path.

Claude may implement the function in R2.
AXE owns Cloudflare/runtime configuration, exact public User-Agent/contact value if needed, deployment and live verification.

### 8. 4PLANET ID + real-device profiling

**Accepted: AXE owns the final end-to-end identity and physical-device proof.**

Claude:
- preserves the existing bridge and account-state architecture;
- may audit return_to, UI state and integration seams;
- may fix a clearly proven UI/code defect that does not redesign identity;
- flags any auth-core change before making it.

AXE owns:
- authenticated 4planet.org → ATLAS bridge proof;
- real account tests;
- second-device persistence;
- global sign-out proof;
- real iPhone Safari profiling;
- final hardware/performance acceptance.

Do not make R1 wait for credentials/hardware work Claude cannot perform.

### 9. Brand OS / further context

Fresh-read:
1. `00_ AGENT START HERE — AGENTS.md — 4PLANET KNOWLEDGE OS` — Drive ID `13wCyLsLv0xFHYS1nbAXKqcQux3kz8b48U0pm0bGFhVo`
2. `01_ PROJECT LEAD CURRENT — NOW, PRIORITIES, GATES & NEXT ACTIONS` — Drive ID `14XladRgIy9vCGMCWvuPw37MnCGsa0iJcafyTd2tYKww`
3. `02_ ACTIVE TASKS — SMALL EXECUTION SURFACE` — Drive ID `1dqh16Im3owXVLfT2rUyCFPWal86DEGxlvyeYvh3OvQs`
4. `4PLANET BRAND OS — MASTER CANON, PLATFORM, IDENTITY & PRODUCTION SYSTEM` — Drive ID `1bOIr3a83N53RVFZs_jibXr02cRS_RSP_bhCDVmN0_88`
5. `4PLANET_ ATLAS CANON v2.0` — Drive ID `1DYU4kode4ZstmpqfZxLgOAmHedgR0rHU5M4iNdt0g1s`
6. `PRD-ONE-02 — HUMAN EXPERIENCE, AWE & PRODUCT VALUE COMPLETION MEGASPRINT v1.0` — Drive ID `1kdSfwqORZm23Ur1wdO_8lWBTFo4cX-k9Yv-tKp5pFIs`
7. The current Claude master execution pack.

The Brand OS itself contains the **CURRENT FOUNDER BRAND RESET — 05 OCTOBER 2026**. No separate later Brand Reset was found in current Drive search.

Key current reset directions:
- SNØHETTA × APPLE for interface architecture;
- NASA × NATIONAL GEOGRAPHIC for information/world;
- PATAGONIA × ARC'TERYX for integrity/field credibility;
- VOGUE for editorial culture;
- SpaceX only for ambition/testing, never sci-fi styling;
- architectural but human;
- scientific but alive;
- editorial but useful;
- minimal but not sterile;
- technical but not dashboard-heavy;
- living world is protagonist; interface is frame;
- Instrument Sans restrained, DM Sans as UI/body workhorse, Fragment Mono bounded;
- soft coherent rounding / capsule buttons;
- precision with warmth;
- editorial information architecture over card catalogues;
- one dominant idea + one dominant visual anchor + one obvious next action.

The **later ATLAS-specific Founder direction** is the 07 October master pack: HUMAN AWE FIRST / Apple-level public readiness. It overrides older conflicting ATLAS UI assumptions.

The current Project Lead also contains an ATLAS economic boundary:
- public ATLAS stays free;
- do not add pricing/API/licence/white-label commercial work in this product closure.

### EXECUTION STATUS

Questions 1a, 3, 4 and 5 are answered.

Claude may proceed with R1 analysis and implementation as a read-only/local donor package based on `king/test@5dc63fe8ddd1daea32d62d102066705d3c7efbfe`.

No public release authority is delegated to Claude.
