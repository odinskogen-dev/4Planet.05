import type { LabProject } from "./labsFreshProjection";
import type { ProjectControl } from "./labsGoldMeta";

const UNKNOWN_ECONOMICS = "No separate approved build budget is projected. Actual cost and commitment remain UNKNOWN until source-mapped evidence exists.";
const NO_MONEY = "No project-specific revenue, award, contract or cash is verified on this public-safe projection.";

const current: Record<string, Partial<ProjectControl>> = {
  "4planet/product": {
    goalId: "SYS-P00-PRODUCT-G01",
    phase: "FOUNDER VISUAL JUDGE READY",
    nextGate: "Founder visually judges the exact PR #92 immutable preview. If accepted, only that same artifact may move through controlled release; production remains unchanged until then.",
    economicGoal: "Turn accepted public proof into observed users, external challenge and first-money conversion before expensive breadth.",
    economics: "Non-additive P00 Product component. Shared Product economics must be allocated once; current exact incremental cost remains UNKNOWN until source-mapped.",
    moneyTruth: NO_MONEY,
    source: "Founder Control · SYS-P00-PRODUCT · WBS PROD-1..4 · 21 Aug 2026 readback",
    links: [
      { label: "OPEN CURRENT PUBLIC CANDIDATE", href: "https://e32a35e9.4planet-05.pages.dev", kind: "PREVIEW" },
      { label: "OPEN PR #92", href: "https://github.com/odinskogen-dev/4Planet.05/pull/92", kind: "REPO" },
      { label: "OPEN PRODUCTION", href: "https://4planet.org", kind: "WEB" },
    ],
    technical: [
      "PR #92 · OPEN / DRAFT / UNMERGED",
      "Exact PR #92 candidate passed Convergence Gate #548 and immutable Cloudflare preview identity was verified in Founder Control.",
      "Production remains unchanged; Founder visual acceptance is still open.",
    ],
  },
  "4planet/product/one-interface": {
    goalId: "SYS-P00-PRODUCT-G01",
    phase: "FOUNDER VISUAL JUDGE READY",
    nextGate: "Open the current immutable PR #92 preview and make one bounded visual decision: ACCEPT / EDIT / HOLD. No GitHub archaeology or SHA copying is required.",
    economicGoal: "Convert product quality into real users, qualified relationships and first-money evidence without inventing standalone Product revenue.",
    economics: "Non-additive child of shared Product/P00. Actual Product cost remains UNKNOWN until source-mapped.",
    moneyTruth: "No product-specific revenue or cash is verified.",
    source: "Founder Control · SYS-P00-PRODUCT · PR #92 · 21 Aug 2026 readback",
    links: [
      { label: "OPEN CURRENT PREVIEW", href: "https://e32a35e9.4planet-05.pages.dev", kind: "PREVIEW" },
      { label: "OPEN PR #92", href: "https://github.com/odinskogen-dev/4Planet.05/pull/92", kind: "REPO" },
      { label: "OPEN 4PLANET.ORG", href: "https://4planet.org", kind: "WEB" },
    ],
    technical: [
      "PR #92 is the current Founder-review correction candidate.",
      "Exact candidate passed full technical/browser/rights/source/security convergence.",
      "Immutable preview verified; production unchanged; Founder visual JUDGE remains.",
    ],
  },
  "4planet/e4rth/species": {
    phase: "ACTIVE GOLD / SHARED TRANSFER",
    nextGate: "Keep the accepted shared-context baseline as reference, then exact-head gate the newer PR #79 premium Jaguar + Orca transfer line before any Gold or production promotion.",
    economicGoal: "Use the reusable Species World core to lower adaptation cost per species while keeping species-specific media/data costs explicit.",
    economics: "Planning model: NOK 700k minimum / NOK 1.8m base. Founder-paid 4species.com cost exists in source economics; company-booked treatment remains separate and is not projected here as company cash spend.",
    moneyTruth: "Funding received 0 · awarded 0 · contracted 0. Actual project spend remains source-partial; no revenue or ecological delivery is inferred from product progress.",
    source: "Founder Control · EAR-SPECIES-01 · WBS SPEC-1..4 · PR #79 · 21 Aug 2026 readback",
    links: [
      { label: "OPEN SPECIES PRODUCT", href: "https://4planet.org/species", kind: "WEB" },
      { label: "OPEN ACCEPTED JAGUAR BASELINE", href: "https://756dff8b.4planet-05.pages.dev/journey/jaguar/", kind: "PREVIEW" },
      { label: "OPEN CURRENT JOURNEY PR #79", href: "https://github.com/odinskogen-dev/4Planet.05/pull/79", kind: "REPO" },
      { label: "OPEN SPECIES MISSION", href: "https://4planet.org/missions/species", kind: "WEB" },
    ],
    technical: [
      "Accepted internal shared-context baseline completed Convergence #546 with immutable preview.",
      "PR #79 has continued beyond that accepted baseline; newer exact-head work remains draft until the current exact candidate is re-gated.",
      "Production remains unchanged; unresolved Orca photographs remain fail-closed.",
    ],
  },
  "4planet/economy": {
    goalId: "SYS-P00-ECONOMY-G01",
    phase: "V0.1 / SOURCE RECONCILIATION NEXT",
    nextGate: "Map one bounded real source period, preserve SHARED / UNALLOCATED, apply only valid eliminations and prove a 100% reconciliation before broader source integration.",
    economicGoal: "Make every material economic event traceable to the lowest meaningful owner and correct financial state without becoming a statutory ledger.",
    economics: UNKNOWN_ECONOMICS,
    moneyTruth: "Project-specific funding / award / contract / cash = 0 verified. Prototype values are DEMO / NOT LIVE; no bank or accounting source is connected.",
    source: "Founder Control · SYS-P00-ECONOMY · 13_ECONOMICS · 21 Aug 2026 readback",
    links: [],
    technical: [
      "Founder Control records an Economy v0.1 code object, but the previously projected public GitHub PR URL returned 404 in LABS browser QA.",
      "The broken URL is withheld from Founder-facing actions until a verified digital home is recovered.",
      "No bank/accounting adapter or live finance claim is inferred.",
    ],
  },
  "4planet/labs-system": {
    goalId: "SYS-P00-LABS-G01",
    phase: "V6 FOUNDER UTILITY ITERATION",
    nextGate: "Close the current Project Detail / projection / link-health pass on exact head, then verify the review preview before any Founder release decision.",
    economicGoal: "Increase Founder decision quality and reduce project-recovery time without creating a second project/status/economic database.",
    economics: "Internal shared development surface. No standalone approved LABS budget is inferred; actual AI/tool cost stays source-mapped or UNKNOWN.",
    moneyTruth: "LABS activity is not revenue, award, contract, delivery or impact.",
    source: "Founder Control · SYS-P00-LABS · PR #54 · 21 Aug 2026 readback",
    links: [
      { label: "OPEN LABS PR #54", href: "https://github.com/odinskogen-dev/4Planet.05/pull/54", kind: "REPO" },
    ],
    technical: [
      "LABS remains a read-only projection over BRAIN / Founder Control.",
      "Current work is a bounded usability and projection-adapter pass; no production release is implied.",
    ],
  },
  "4planet/sonic": {
    classification: "PROJECT HOME / SHARED SONIC SYSTEM",
    goalId: "SYS-SONIC-01-G01",
    mainGoal: "Make sound a first-class 4PLANET layer for species, place, learning, acoustic evidence, immersion and culture through one shared rights-aware system.",
    success: "Orca Sonic Gold works with source/rights-safe audio, transfers to an unlike species, and one real creator/rightsholder permission + value event is proven without unnecessary rights loss.",
    phase: "P1 ACTIVE / BOUNDED BUILD",
    nextGate: "AudioAsset + CreatorPermissionGrant v0.1 → Orca Sonic Gold → unlike-species transfer → one real creator permission/value event.",
    economicGoal: "Prove reusable sonic/creator value before modelling a dedicated build budget or external capital ask.",
    economics: UNKNOWN_ECONOMICS,
    moneyTruth: NO_MONEY,
    source: "Founder Control · SYS-SONIC-01 · Project Pack · 20/21 Aug 2026 readback",
    links: [],
    technical: [
      "No coded SONIC primitive or verified public prototype is projected yet.",
      "Rights/licensing implementation remains open; procedural/presentation audio must never be labelled field evidence.",
    ],
  },
  "4planet/labs-system/creator-engine": {
    classification: "LABS PROJECT / CREATOR ENGINE",
    goalId: "LAB-CREATOR-01-G01",
    mainGoal: "Build and test a holistic creator operating layer that reduces administrative and economic friction while preserving agency, ownership and private-economy boundaries.",
    success: "A complete creator loop produces real value: opportunity / sale / licence → payment → admin/economy control → safer decision → measurable creator benefit.",
    phase: "CRE4TORS_ V0.3 TECHNICAL PASS",
    nextGate: "Founder visual judgement → dedicated cre4tors.com binding verification → two private creator tests → one real complete rights-safe creator-value loop.",
    economicGoal: "Prove real creator time/value/income benefit before any marketplace, SaaS or spinout economics are promoted.",
    economics: "No dedicated budget yet; protected LABS/portfolio capacity only. Actual spend remains UNKNOWN unless source-mapped.",
    moneyTruth: "No live creator economy, connector, sale, licence, job, income or 4PLANET revenue is verified by the demo.",
    source: "Founder Control · LAB-CREATOR-01 · PR #95 · 21 Aug 2026 readback",
    links: [
      { label: "OPEN CRE4TORS_ V0.3", href: "https://e8c3e7d9.4planet-05.pages.dev/cre4tors", kind: "PREVIEW" },
      { label: "OPEN CREATOR ENGINE PR #95", href: "https://github.com/odinskogen-dev/4Planet.05/pull/95", kind: "REPO" },
    ],
    technical: [
      "Exact validated Creator Engine v0.3 candidate is recorded in Founder Control with Convergence PASS.",
      "Custom-domain binding to cre4tors.com is not yet claimed live.",
      "Production 4planet.org remains unchanged.",
    ],
  },
};

export function reconcileCurrentControl(project: LabProject, base: ProjectControl): ProjectControl {
  const override = current[project.slug];
  if (!override) return base;
  return {
    ...base,
    ...override,
    links: override.links ?? base.links,
    technical: override.technical ?? base.technical,
  } as ProjectControl;
}
