import type { LabProject } from "./labsFreshProjection";
import { currentControlFor, withGoldMeta, type GoldLabProject, type ProjectControl } from "./labsGoldMeta";

const nonAdditive = "Shared 4PLANET/P00 capability. No standalone additive budget is approved for this view; costs belong to the owning Project(s) and remain UNKNOWN unless source-mapped.";
const noMoney = "No revenue, award, contract, cash or partnership is inferred from activity, lists, code or relationship inventory.";

function view(mainGoal: string, success: string, phase: string, nextGate: string, economicGoal: string, source: string): ProjectControl {
  return { classification: "SHARED SYSTEM VIEW", mainGoal, success, phase, nextGate, economicGoal, economics: nonAdditive, moneyTruth: noMoney, source, links: [], technical: [] };
}

const shared: Record<string, ProjectControl> = {
  "4planet/field-partners": view(
    "Build a trusted execution network that can turn bounded Mission plans into real field delivery without 4PLANET pretending to be the field operator.",
    "Qualified operators have explicit role, method, geography, economics, reporting and assurance evidence; at least one route reaches a financed/paid pilot.",
    "QUALIFICATION / FIRST DELIVERY PREP",
    "Prioritise the strongest first-delivery operator route and close method/economics/reporting evidence before any public delivery claim.",
    "Reduce delivery risk and make first financed pilots possible while keeping operator economics with the owning Mission.",
    "Founder Control · Field Partner system · 20 Aug 2026",
  ),
  "4planet/research": view(
    "Create a durable research/expert network that challenges 4PLANET evidence, improves source quality and exposes errors before scale.",
    "Relevant experts produce substantive challenge that changes or strengthens current product/Mission claims, methods and source packs.",
    "PREP NOW / EXTERNAL CHALLENGE NEXT",
    "Route the first accepted public proof into a bounded expert/scientific review cohort and write corrections back into BRAIN/Project Homes.",
    "Spend expert/research capacity only where it materially reduces truth risk or increases decision value.",
    "Founder Control · R&I / External Proof authority · 20 Aug 2026",
  ),
  "4planet/content": view(
    "Translate verified intelligence, proof and living-world stories into clear human understanding without creating a detached content factory.",
    "Source-grounded assets increase discovery, comprehension and useful action while preserving rights, provenance and claim boundaries.",
    "PROOF-LED EDITORIAL PRODUCTION",
    "Use the strongest current proof/story triggers for M4GAZINE and public surfaces; publish only through rights/source gates.",
    "Increase the value and reach of existing proof with low-frequency reusable assets rather than continuous content overhead.",
    "Founder Control · Content / M4GAZINE authority · 20 Aug 2026",
  ),
  "4planet/4mbassadors": view(
    "Build a small, credible ambassador network that expands trust, reach and participation around real 4PLANET proof.",
    "Qualified people explicitly opt in and create measurable useful reach, introductions, expertise, participation or support without false endorsement claims.",
    "QUALIFIED INVENTORY / ACTIVATION GATED",
    "Activate only the best-fit relationships after the public-proof gate under current outbound authority; never label a person ambassador before acceptance.",
    "Increase distribution and trust per Founder hour with low operational burden and no paid-influence assumption.",
    "Founder Control · 4MBASSADORS system · 20 Aug 2026",
  ),
  "4planet/oce4n": view(
    "Coordinate the first ocean Mission portfolio while keeping each Mission’s truth, operator, economics and delivery meaning distinct.",
    "WH4LES, COR4L, PL4STIC/CLE4N and RE:WILD MARINE can share infrastructure without merged claims or duplicated Project economics.",
    "DOMAIN PORTFOLIO",
    "Push WH4LES proof and the best first-delivery route; keep lower-readiness Missions monitored or gated.",
    "Concentrate shared ocean intelligence and capital where the next real proof/delivery dollar has highest value.",
    "Strategy v4 · OCE4N portfolio · 20 Aug 2026",
  ),
  "4planet/e4rth": view(
    "Coordinate terrestrial/climate/species/restoration Missions through one shared living-planet intelligence spine.",
    "SPECIES Gold, CLIM4TE decision proof, AM4ZONIA legitimacy and RE:WILD LAND delivery paths remain distinct but reusable across one domain system.",
    "DOMAIN PORTFOLIO",
    "Keep SPECIES as the active Gold reference; advance other Missions only when their real owner/legitimacy/operator gate justifies it.",
    "Use shared truth/product infrastructure to lower the cost of each new Earth Mission while avoiding speculative field spend.",
    "Strategy v4 · E4RTH portfolio · 20 Aug 2026",
  ),
  "4planet/s4piens": view(
    "Map major human systems as two-way Planet ↔ Humans relationships and turn that intelligence into better everyday and institutional choices.",
    "FOOD proves the transferable Human Systems grammar; later Energy, Circular City and Fashion reuse one Planet Model without a fifth product or second truth system.",
    "FOOD GOLD FIRST / DOMAIN EXPANSION GATED",
    "Finish FOOD user/expert proof and the Human Systems Gold transfer pattern before broad domain expansion.",
    "Prove one high-value human decision wedge before funding broad data/value-chain coverage; reuse ATLAS/SPECIES/Living Systems infrastructure.",
    "Strategy v4 · SAP-SAPIENS-01 · 20 Aug 2026",
  ),
  "4planet/4culture": view(
    "Turn verified living-planet truth and action into culture, story and participation without separating culture from real proof.",
    "M4GAZINE, 4FILM, 4RT and 4PLAY each produce bounded audience/participation/funding learning while rights and ecological claims remain explicit.",
    "DOMAIN PORTFOLIO / M4GAZINE ACTIVE",
    "Use current M4GAZINE/public proof as the strongest culture surface; keep Film/Art/Play gated by rights, funding and real leverage.",
    "Use culture as a multiplier for trust, users and funding while avoiding production burden that outruns proof/capital.",
    "Strategy v4 · 4CULTURE portfolio · 20 Aug 2026",
  ),
};

export function completeControlFor(project: LabProject): ProjectControl {
  return shared[project.slug] ?? currentControlFor(project);
}

export function withCompleteMeta(project: LabProject): GoldLabProject {
  const gold = withGoldMeta(project);
  const control = completeControlFor(project);
  return { ...gold, control, assets: control.links };
}
