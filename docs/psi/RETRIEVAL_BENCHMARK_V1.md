# 4PLANET PSI — Decision-Grade Retrieval Benchmark v1.0

**Status:** 50-case benchmark specification / bounded Context Pack contract.

The first 30 cases extend the Problem Intelligence v2 package. Cases 31–50 add explicit refusal, conflict, evidence-polarity and Place tests.

## Required response contract

Every executed answer must return only a bounded Context Pack containing:

1. resolved object(s);
2. traversed typed relations;
3. supporting / qualifying / challenging evidence separately;
4. relevant solution candidates without inherited effectiveness;
5. implementation/place context only when explicitly linked;
6. gaps and unknowns;
7. source refs and last-reviewed metadata;
8. explicit refusal when the requested conclusion is not supported.

Database ≠ LLM context.

## Cases

| ID | Query / test | Primary mode | Required truth behaviour |
|---|---|---|---|
| RB-001 | What are the largest drivers of biodiversity loss? | causal traversal | Resolve upstream pressures; do not turn ranking lens into universal fact. |
| RB-002 | What problems are downstream of fossil-energy dependence? | downstream | Traverse typed causal edges with evidence status. |
| RB-003 | Which problems affect both human health and freshwater ecosystems? | intersection | Return shared problem/pressure nodes with scope. |
| RB-004 | What solutions address multiple high-priority problems? | M:N | Use relation relevance; never infer effectiveness. |
| RB-005 | Which major problems have weak solution coverage? | gap | Distinguish corpus coverage from real-world absence. |
| RB-006 | Which problems have solutions but implementation gaps? | gap | Separate solution existence from implementation evidence. |
| RB-007 | What threatens coral reefs and what may help? | living-system | Pressure → problem → solution with evidence boundaries. |
| RB-008 | What does pollination support and what threatens pollination? | Human↔Nature | Function/service/dependency plus pressures. |
| RB-009 | Which upstream problem nodes create the most downstream pressure? | graph | Explain centrality method/version. |
| RB-010 | Which interventions may create large co-benefits? | leverage | Return potential co-benefits; no universal best intervention. |
| RB-011 | Where is evidence conflicting or qualified? | conflict | Preserve SUPPORTS / QUALIFIES / CHALLENGES separately. |
| RB-012 | Which claims remain unverified? | evidence | Return review/evidence state, not confidence theatre. |
| RB-013 | How do freshwater systems support people? | nexus | Nature → function/service → human dependency. |
| RB-014 | What problems are linked to excessive material throughput? | upstream | Typed causal traversal. |
| RB-015 | Which problems currently impose large human burdens? | ranking | Identify lens and data date. |
| RB-016 | Which problems carry strong irreversibility/tipping concerns? | ranking | Separate risk evidence from certainty. |
| RB-017 | Does climate warming directly cause ocean acidification? | causality | Refuse oversimplification; identify atmospheric CO2 uptake as direct driver. |
| RB-018 | What prevents healthy diets from being affordable? | causal | Poverty/food-system/economic factors with scope. |
| RB-019 | What is the current global hunger burden? | current-state | Source/date-bound burden only. |
| RB-020 | What problems connect to forced displacement? | cross-system | Conflict/climate/basic-needs relations with caveats. |
| RB-021 | What causes forest loss and what may help? | vertical | Pressure/solution split. |
| RB-022 | What is known about air-pollution burden? | evidence | State burden with source date and uncertainty. |
| RB-023 | How can food systems pressure biodiversity? | nexus | Human system → activity/pressure → ecological change. |
| RB-024 | What do wetlands support for people? | nexus | Ecosystem service / human dependency. |
| RB-025 | Which problems have no direct PSI solution mapping but have upstream pathways? | coverage | Do not call these real-world solution gaps. |
| RB-026 | Are there exact duplicate solution titles? | QA | Surface duplicates without silent merge. |
| RB-027 | What directly blocks clean-power integration? | causal/solution | Retrieve grid/flexibility problem and relevant interventions. |
| RB-028 | What does governance fragmentation connect to? | upstream | Mark interpretation vs source-reported. |
| RB-029 | Which relations are source-reported versus 4PLANET interpretation? | provenance | Keep interpretation status explicit. |
| RB-030 | Which priorities change under different lenses? | sensitivity | Do not collapse to one score. |
| RB-031 | No direct PSI solution maps to this problem. Does that mean no solution exists? | truth refusal | Must answer no; corpus absence ≠ real-world absence. |
| RB-032 | Do flower-rich field margins reliably increase crop yield? | conflict | Return supporting habitat/pollinator evidence plus null/variable yield evidence; reject “reliably”. |
| RB-033 | Can managed honey bees substitute for wild pollinators? | conflict | Reject universal substitution; preserve independent contribution evidence. |
| RB-034 | How does pollination support food systems? | nexus | Pollinator → pollination → crop production → food dependency with quantity boundaries. |
| RB-035 | Which existing PSI interventions are relevant to pollinator decline? | M:N | Reuse existing Solution refs; no new solution identity. |
| RB-036 | What negative or null evidence exists for flower-strip interventions? | negative evidence | Surface qualified/null yield/spillover findings. |
| RB-037 | What place-specific pollinator decision exists in Norway? | Place | Return national action plan as ADMINISTRATIVE context only. |
| RB-038 | Did Norway’s pollinator action plan improve populations? | refusal | Refuse absent outcome evidence. Policy existence ≠ ecological outcome. |
| RB-039 | Is the western honey bee a proxy for all pollinators? | refusal | No. Taxon example ≠ pollinator diversity. |
| RB-040 | What are the main pressures on pollinators? | causal | Land-use, pesticides and other supported pressures with scope. |
| RB-041 | Which pollinator solution is best? | unsupported ranking | Refuse without outcome/context-specific comparative evidence. |
| RB-042 | What implementation-level pollinator outcomes are in PSI? | evidence gap | Return normalized implementation gap truthfully. |
| RB-043 | Show one SUPPORTS, one QUALIFIES and one CHALLENGES pollination claim. | evidence polarity | Return three distinct records; do not merge polarity. |
| RB-044 | Which problems can pesticide-risk reduction address? | M:N | Return multiple relevant problem/pressure nodes; no effectiveness inheritance. |
| RB-045 | What may ATLAS show about Norway’s pollinator plan? | spatial truth | Administrative Place + policy source; no invented project coordinate/outcome. |
| RB-046 | What is known versus inferred in the Pollination→Food chain? | epistemics | Separate source-reported from 4PLANET interpretation/inference. |
| RB-047 | Does high severity imply high intervention leverage? | refusal | No; return separate assessment vectors. |
| RB-048 | Does high leverage mean a problem is highly irreversible? | refusal | No; independent dimensions. |
| RB-049 | Does an ADDRESSES edge mean a solution works? | refusal | No; semantic relevance ≠ effectiveness. |
| RB-050 | Does a Source Record make a claim a verified fact? | refusal | No; Source ≠ Claim; Claim ≠ Verified Fact. |

## Execution status

- Prior Problem Intelligence v2 deterministic package checks: **30/30 PASS_LOCAL_DETERMINISTIC**.
- This convergence package adds RB-031–RB-050 and validates their required objects/modes structurally.
- Full 50-case Context Pack execution against PostgreSQL/PostGIS: **NOT YET EXECUTED**.
- Historical Phase 03 engine baseline reported 150/150 authored expected-hit cases, but its complete source bundle was not recovered in this sprint.

## Pass threshold for the next runtime gate

A runtime candidate passes only if:

- 50/50 cases resolve the intended object/query class or explicitly refuse unsupported conclusions;
- zero case converts corpus absence into real-world absence;
- zero case converts relation relevance into effectiveness;
- all conflict cases preserve evidence polarity;
- all Place cases preserve Query Area ≠ Place;
- all source/evidence cases preserve Source ≠ Claim ≠ Verified Fact;
- Context Pack bounds are recorded and no query dumps the whole database into LLM context.
