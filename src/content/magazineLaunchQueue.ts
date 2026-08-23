export type LaunchStoryState = "SOURCE_PACK" | "REPORTING_REQUIRED" | "RIGHTS_REQUIRED" | "EDITORIAL_REVIEW" | "READY_FOR_RELEASE";

export interface MagazineLaunchStory {
  id: string;
  workingTitle: string;
  job: string;
  mode: "DEEP" | "EVERGREEN" | "VISUAL";
  state: LaunchStoryState;
  sourceRequirements: string[];
  rightsRequirements: string[];
  relevantPaths: Array<{ label: string; to: string }>;
  successSignal: string;
  truthBoundary: string;
}

/**
 * First five Gold source packs chosen to test five different 4PLANET loops.
 * Working titles are internal. Nothing here is a publication claim.
 */
export const MAGAZINE_LAUNCH_QUEUE: MagazineLaunchStory[] = [
  {
    id: "bay-of-biscay-orca",
    workingTitle: "The living highway through the Bay of Biscay",
    job: "Use one real monitoring route to connect whales, place, field work, Actor context and a bounded future support/proof pathway.",
    mode: "DEEP",
    state: "SOURCE_PACK",
    sourceRequirements: [
      "ORCA-provided survey method / route context or permission-cleared transcript evidence",
      "credible species and Bay of Biscay ecological sources",
      "survey-effort semantics: route geometry, hours/distance and limitations",
      "independent context for shipping/noise/fishing/climate pressures where used",
    ],
    rightsRequirements: ["ORCA asset permission or separately licensed/public-domain imagery", "map/data reuse terms"],
    relevantPaths: [
      { label: "Bay of Biscay", to: "/atlas" },
      { label: "WH4LES", to: "/missions/wh4les" },
    ],
    successSignal: "Reader moves from story to Bay/WH4LES/Actor context; ORCA/field audience corrects, shares or reuses the object.",
    truthBoundary: "ORCA profile/coverage does not imply endorsement or partnership beyond verified relationship state. Survey effort is output/evidence, not whale abundance or ecological outcome.",
  },
  {
    id: "jaguar-amazonia",
    workingTitle: "One animal as a doorway into the Amazon",
    job: "Use Jaguar to make species → relationships → ecosystem → pressure → place legible through documentary storytelling.",
    mode: "VISUAL",
    state: "SOURCE_PACK",
    sourceRequirements: [
      "credible Panthera onca distribution/ecology sources",
      "Amazon ecosystem/place sources",
      "explicit provenance for any dependency/relationship claim",
      "source-aware map layers where embedded",
    ],
    rightsRequirements: ["Jaguar hero/detail asset rights", "map/data reuse terms"],
    relevantPaths: [
      { label: "SPECIES", to: "/species" },
      { label: "AM4ZONIA", to: "/missions/am4zonia" },
    ],
    successSignal: "Reader continues from narrative into Species/Atlas/Ecosystem and remembers 4PLANET as the place where relationships are visible.",
    truthBoundary: "Visual proximity or story sequence must not imply causal strength, population trend or ecological outcome without evidence.",
  },
  {
    id: "food-choice-dinner",
    workingTitle: "What should we actually buy for dinner?",
    job: "Turn a repeated everyday food decision into a clear, sourced and practical S4PIENS/CHOICE entry without synthetic green scoring.",
    mode: "EVERGREEN",
    state: "REPORTING_REQUIRED",
    sourceRequirements: [
      "bounded food/product/category data",
      "health evidence appropriate to the claim",
      "ecological-pressure evidence with geography/time/uncertainty",
      "price/availability evidence if a specific retailer is named",
    ],
    rightsRequirements: ["product/retailer imagery only when licensed or supplied", "no scraped private/proprietary data"],
    relevantPaths: [
      { label: "S4PIENS", to: "/domains/s4piens" },
      { label: "FOOD", to: "/missions/food" },
    ],
    successSignal: "Reader uses the result in a real shopping decision and later returns to CHOICE/FOOD.",
    truthBoundary: "HEALTH / WALLET / PLANET stay separate; no medical advice, hidden composite score or unsupported product superiority claim.",
  },
  {
    id: "oslo-mussels",
    workingTitle: "Can mussels clean the water beneath Oslo?",
    job: "Use a small local physical intervention to teach the difference between installation, measured filtering, ecological outcome and attribution.",
    mode: "DEEP",
    state: "REPORTING_REQUIRED",
    sourceRequirements: [
      "verified installation/location/ownership evidence for the mussel socks",
      "credible mussel filtration literature",
      "local Oslofjord water-quality context",
      "measurement plan or explicit statement that outcome is not yet measured",
    ],
    rightsRequirements: ["original or permission-cleared installation photography", "location/privacy check"],
    relevantPaths: [
      { label: "Living Systems", to: "/living-systems" },
      { label: "Impact", to: "/impact" },
    ],
    successSignal: "Reader understands delivery vs outcome and explores the local system or evidence method rather than taking a headline claim on trust.",
    truthBoundary: "Installed mussel socks = verified delivery only. Filtration rate/outcome/attribution require separate evidence and must not be inferred from installation.",
  },
  {
    id: "plastic-money-proof",
    workingTitle: "Where does your money actually go when you pay to remove plastic?",
    job: "Explain the money → actor → delivery → evidence chain behind a plastic action pathway and expose every unresolved seam.",
    mode: "EVERGREEN",
    state: "SOURCE_PACK",
    sourceRequirements: [
      "verified partner/cost/capacity route before any live offer is described",
      "delivery evidence grammar and chain-of-custody method",
      "source-backed context for plastic leakage/removal where used",
      "economics and fee split only from controlled current records",
    ],
    rightsRequirements: ["partner/field imagery rights", "no partner logo/status use beyond verified permission/state"],
    relevantPaths: [
      { label: "CLE4N", to: "/missions/cle4n" },
      { label: "Impact", to: "/impact" },
    ],
    successSignal: "Reader can follow exactly what money funds and later inspect verified delivery/proof without double counting or outcome inflation.",
    truthBoundary: "Money received, work commissioned, material removed, verified delivery and ecological outcome are separate states.",
  },
];
