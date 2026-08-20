import type { LabProject } from "./labsFreshProjection";

const currentState: Record<string, string> = {
  "4planet/oce4n/wh4les": "WH4LES has a strong internal Orca proof path. External scientific challenge and a credible protection/operator route are still open. No delivery or ecological outcome is claimed yet.",
  "4planet/oce4n/cor4l": "COR4L is a prepared portfolio concept, not an active restoration programme. Authoritative reef heat-stress intelligence can be used now, but no current qualified delivery partner or field proof is verified.",
  "4planet/oce4n/plastic-clean": "PL4STIC is the current first-delivery preparation candidate because the operator/economics chain is comparatively testable. No operator is contracted and no delivery has happened. The PL4STIC / CLE4N naming conflict remains open.",
  "4planet/oce4n/rewild-marine": "RE:WILD MARINE is prepared for later development. Site, science-gap, operator, permit and delivery economics are not yet closed, so no field programme is implied.",
  "4planet/e4rth/clim4te": "CLIM4TE has a bounded Decision Intelligence architecture, but no completed external human validation. It remains a decision-owner proof project rather than a generic climate dashboard.",
  "4planet/e4rth/am4zonia": "AM4ZONIA is on HOLD until a genuinely authorised Indigenous/local route, consent protocol and representation rights exist. No public action or Impact Unit should be inferred before that legitimacy gate closes.",
  "4planet/e4rth/species": "SPECIES is active. Jaguar Habitat World is live and Jaguar/Orca remain the flagship reference pair. The current Jaguar Journey exact candidate is not accepted yet because its latest full gate failed on the Nature XR flat-browser runtime after the main Jaguar browser tests had passed.",
  "4planet/e4rth/rewild-land": "RE:WILD LAND has prepared restoration hypotheses but no contracted operator, site economics or delivery. It remains held until operator/site evidence or an unusually strong funder route justifies activation.",
  "4planet/s4piens/food": "FOOD is the first bounded S4PIENS decision proof. PICK v0.8 passed its dedicated private prototype gate. Real user and expert validation remain open, and HEALTH, WALLET and PLANET are deliberately kept as separate evidence dimensions.",
  "4planet/s4piens/energy": "EN3RGY / EN4RGY is on monitor with no external pilot proof. The naming conflict remains explicit; LABS does not silently choose a winner.",
  "4planet/s4piens/circular-city": "CIRCULAR CITY is a bounded pilot concept. No current external action is underway. The next useful step is choosing one real material flow and decision/municipal owner before expanding scope or budget.",
  "4planet/s4piens/f4shion": "F4SHION is a later S4PIENS transfer case. No current partner or external pilot is verified. FOOD should first prove the shared decision/evidence method that Fashion can reuse.",
  "4planet/4culture/m4gazine": "M4GAZINE has a materially stronger premium editorial candidate inside the current public-experience line. Publication, funding and rights remain separately gated; editorial work stays downstream of real proof and source packs.",
  "4planet/4culture/4film": "4FILM has active funding/evidence preparation, while producer, rights and production gates remain open. Deeper production should only move when financing and rights are genuinely closed.",
  "4planet/4culture/4rt": "4RT is prepared for funding and model development. The underlying Impact route, artist/rights structure and economics must close before sales can be connected to any ecological outcome claim.",
  "4planet/4culture/4play": "4PLAY remains on HOLD. It should activate only when a real proof/brand/capital opportunity makes one music or live-culture activation unusually high leverage.",
  "4planet/tree-of-life": "TREE OF LIFE is an isolated interactive architecture prototype over the same 4PLANET system. It helps explain how intelligence, Missions, actors, solutions, capital, Impact and culture connect; it is not a fifth product or a new truth system.",
  "4planet/choice-lab": "CHOICE remains a private Innovation × Capital decision-intelligence sandbox. A prior truth defect around unsupported maturity labels remains fail-closed until demo/hypothesis/unknown semantics are evidence-bound and exact-head QA passes.",
  "4planet/product/atlas-data-lab": "ATLAS DATA LAB remains an isolated source-expansion sandbox inside canonical ATLAS. Its current-head acceptance is unresolved and no layer should be promoted only because an older candidate once passed.",
  "4planet/product/nature-xr": "NATURE XR has a verified browser-first Jaguar prototype candidate. Physical headset comfort/comprehension is still unverified and must be tested separately before any headset-quality claim.",
  "4planet/product/jaguar-journey": "JAGUAR JOURNEY has materially advanced its cinematic browser/3D interaction, but the latest exact candidate is not accepted: the Nature XR flat-browser runtime failed after the core Jaguar Chromium/WebKit tests passed.",
  "4planet/s4piens/food-gold-lab": "S4PIENS / FOOD GOLD is the current Homo sapiens × FOOD Human Systems Atlas proof. The Gold story candidate and the separate host/domain surface remain draft development lines; the dedicated-domain routing gate is still unresolved.",
  "4planet/s4piens/food/pick": "PICK_ is a private child prototype under FOOD / CHOICE, not a separate Project Home. Its dedicated v0.8 prototype gate passed; real-user and expert proof is the next evidence gate.",
  "4planet/naturebrain/planetary-map": "PLANETARY MAP is the permanent world-description layer beneath Missions, with a bounded incubating build project. It is shared infrastructure, not another public map product or second ontology.",
  "4planet/product/organisations": "ORGANISATIONS_ is a private-beta actor/source discovery track. It indexes and connects organisations/knowledge institutions through canonical actor intelligence; indexing does not imply partnership, endorsement or verified effectiveness.",
  "4planet/product/oslofjorden": "OSLOFJORDEN is a real-place reference build that has passed its internal product proof but has not completed real human validation. Remaining rights/source/security release boundaries stay open.",
  "4planet/naturebrain/decision-intelligence": "DECISION INTELLIGENCE has reached technical internal closure in its current lineage, while independent user/expert proof remains open. It must keep evidence, uncertainty, judgement and observed outcomes separate.",
  "4planet/economy": "ECONOMY_ v0.1 is a draft Founder-control prototype. All prototype numbers remain DEMO / NOT LIVE; no bank or accounting adapter is connected yet. The next real proof is one bounded source period reconciled to 100%.",
  "4planet/digital-pitch": "DIGITAL PITCH has a working Patagonia Gold reference preview. It is a recipient-experience prototype, not evidence of a Patagonia relationship, and should only be used on a qualified route under current release/outreach authority.",
  "4planet/labs-system": "LABS is an open draft development surface and read-only BRAIN projection. This Gold pass is fixing project coverage, goals, economics, links and human usability; it remains separate from production and canonical operational truth.",
};

export function humanStateFor(project: LabProject) {
  return currentState[project.slug] ?? project.now;
}
