> **Scope note (added v1.1.1).** This document defines the **Biological
> Intelligence sub-layer** of the broader **4PLANET BRAIN / Living Systems
> Intelligence** architecture. It is **not** the full public product architecture.
>
> - Current public product: **Living Systems Intelligence**.
> - Current internal architecture: **4PLANET BRAIN**.
> - Biological Intelligence remains important, but it is now **one layer** inside
>   a broader system that also includes Dependency Intelligence, Trust
>   Intelligence, Solution Intelligence, Decision Intelligence and future
>   Learning / Impact Intelligence.

# BIOLOGICAL INTELLIGENCE — ONTOLOGY v1

The asset is not the website. The asset is the **Nature Knowledge Graph**. This
document defines how that graph is structured so it stays coherent as it grows
from 3 species to 3,000, and from one intelligence layer to many.

---

## 1. Core principles

1. **Everything important becomes a node.** Functions, services, recipients,
   threats, drivers, solutions, ecosystems and missions are first-class nodes
   with stable, unique IDs — never free text inside a species.
2. **Everything meaningful becomes a relationship.** Value lives in the edges
   between nodes, not in isolated facts.
3. **Species are entry points, not the center.** A species is one way into the
   graph. The graph is about how living systems function.
4. **Relationships are the core asset.** Two species pointing at the same node
   is the point, not a coincidence to be flattened.
5. **The dominant chain is** `Species → Function → Service → Recipient`.
6. **The threat chain is** `Driver → Threat → Solution`.
7. **Context lives on the link, not the node.** Severity, importance,
   dependency, per-species explanation and confidence belong on the species'
   link to a shared node — never on the shared node itself.
8. **Cautious scientific language only.** supports / contributes to /
   associated with / linked to. Never absolute causal claims.
9. **`sourceKeys` only.** No fabricated citations. Confidence may be stated.

---

## 2. Node types

| Node | Role | Intrinsic edges |
|---|---|---|
| Species | Entry point | `PERFORMS` → Function; `DEPENDS_ON` → Ecosystem |
| Function | Ecological role | `SUPPORTS` → Service |
| Service | Ecosystem service | `BENEFITS` → Recipient |
| Recipient | Beneficiary | (terminal) |
| Threat | Pressure | `CAUSED_BY` → Driver |
| Driver | Underlying force | (root) |
| Solution | Response | `ADDRESSES` → Threat |
| Ecosystem | Habitat / biome | (placeholder view) |
| Mission | 4PLANET program | bridge to 4PLANET OS |

---

## 3. The two canonical chains

**System support** (why a species matters to life and people):

```
Species --PERFORMS--> Function --SUPPORTS--> Service --BENEFITS--> Recipient
```

**Threat response** (what pressures life and how we answer):

```
Driver --CAUSED_BY-- Threat --ADDRESSED_BY--> Solution
```

These two chains are the spine. Every new species, threat or solution attaches
to them rather than inventing parallel structures.

---

## 4. Shared-node rule

Before adding a node, check the registry. If "Predation" already exists, the new
species references the existing `FN_PREDATION`. A node is added only when it is
genuinely distinct. This is what turns a pile of profiles into a graph.

Worked example (v0.2): the African Savanna Elephant's "agricultural expansion"
driver reuses the existing `DR_AGRICULTURE` node rather than minting a duplicate
`DR_AGRICULTURAL_EXPANSION`.

---

## 5. Known tension — context-dependent drivers (v0.3 candidate)

A few threats have different drivers depending on the species. Human–Wildlife
Conflict is driven by ranching for the jaguar and by crop-farming/settlement for
the elephant. v0.2 resolves this by setting the shared threat node's driver to
the **broadest accurate** force (`DR_HUMAN_SETTLEMENT`) and carrying the
species-specific nuance in the link's `explanation`. A future version may move
`driver` onto the species link for multi-driver threats.

---

## 6. Confidence & trust

Contextual links may carry `confidence: High | Medium | Low | Uncertain` and
their own `sourceKeys`. The aim is a system that is honest about what is
well-established versus uncertain — trust is a feature, not decoration.

---

## 7. Forward path

The same ontology is intended to support, without redesign: Biological,
Ecosystem, Threat, Solution, Climate, Ocean, Food and Impact Intelligence.
Optimize for ontology, relationships, trust and scalability — not content volume.
