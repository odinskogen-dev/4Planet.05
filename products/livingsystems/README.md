# 4PLANET · Living Systems Intelligence

**Living Systems Intelligence** is the first public product layer of **4PLANET BRAIN**.

- **4PLANET BRAIN** — the internal intelligence architecture (the operating brain).
- **Living Systems Intelligence** — the public-facing product / interface.
- **Biological Intelligence** — a sub-layer focused on species, functions and living systems.

The product is now broader than Biological Intelligence: it maps how species,
ecosystems, ecological functions, services, human systems, threats, solutions,
claims and sources are connected — and begins to structure which solutions may
help and what decision-makers should weigh first.

## Layers
- **Dependency Engine** — what depends on what (`src/lib/graph.ts`): a unified
  SUPPORTS graph with `failureCascade()`, `directDependents()`, `dependsUpon()`,
  `primaryChain`, `whyItMattersGenerated`, plus ecosystem-level provision.
- **Trust Layer** — claims, sources, confidence, review status, data gaps
  (`src/lib/trust.ts`, `/sources`, `/trust`).
- **Solution Intelligence** — what can help (`src/data/solutionIntel.ts`,
  `src/lib/solutions.ts`): Threat → Solution → Services strengthened → Human
  systems supported.
- **Decision Intelligence** — structured reasoning about what to weigh first
  (`/decisions`). Not automated recommendation.
- **Impact Intelligence** — future action layer, not built yet.
- **4PLANET LENS** — future field interface, not built yet.

## Where things live
- `src/data/` — graph data (nodes, species, dependencies, claims, sources,
  solution pathways + decision signals, human systems, etc.).
- `src/lib/` — engines and helpers (graph, intelligence, trust, solutions).
- `src/components/` — UI (FailureCascade, EvidencePanel, SolutionIntelligence…).
- `src/app/` — routes (App Router).
- `docs/` — internal ontology / sub-layer documentation.
- `CONTINUATION.md` — full self-handoff log and current state.

## Flagship cases
- **Amazon Rainforest** — first deep Living System case
  (`/ecosystems/EC_AMAZON_RAINFOREST`).
- **Honey Bee → Pollination → Food System** — first species-to-human-system
  proof flow.

## Run locally
```
npm install
npm run build      # static export to ./out
npx serve out      # preview
```

## Deploy (Cloudflare Pages)
- Build command: `npx next build`
- Build output directory: `out`
- Env: `NODE_VERSION=20`
- Static export (`output: "export"`, images unoptimized) — no server runtime,
  no database. The Google-fonts build line ("Host not in allowlist") is harmless.

## Version status
**v1.4.2 — current.** 4PLANET Living Systems Intelligence is a live public proof
prototype with a Human Use Translation layer over the intelligence: Dependency
Intelligence, Trust Intelligence, Source Verification, Data Quality, Solution
Intelligence, a Decision Intelligence Foundation, and a Learning Intelligence
Foundation. Builds green; static export; Cloudflare-compatible.

v1.4 added: a Start Here route (`/start`); a question-based entry layer (7 entry
points); Human Use Translation components; Practical Interpretation blocks;
Guided Decision Pathways for the Amazon and Pollination cases; light role-based
use cases; clearer human explanations of trust, learning and decisions; and
mobile readability improvements where safe.

**Decision Engine status.** The system includes a Decision Intelligence
*Foundation* — structured reasoning, not automated advice. It does **not** yet
include a full automated Decision Engine. The Guided Decision Pathways are
hand-built proof pathways, not automatic graph inference.

## Human Use Translation (future direction)
Future versions must make the system easier for people to use in practice. The
system should eventually support students, educators, journalists, policymakers,
foundations, companies, citizens and 4PLANET mission operators by translating
living systems intelligence into clear questions, decisions and learning
pathways. Planned for v1.4 (Public UX / Simplicity Layer + Human Use Translation).

## Roadmap
- v1.4.2 — Functions Route / Link / Build Lock (current)
- v1.4.1 — Route / Link / Build Lock
- v1.4 — Public UX / Simplicity Layer + Human Use Translation
- v1.5 — Second Deep Case: Pollination / Food System
- v1.6 — Mobile Node Cards
- v1.7 — Place / Spatial Intelligence
- v1.8 — Actor / Solution Network
- v2.0 — Operational Living Systems Intelligence Beta
