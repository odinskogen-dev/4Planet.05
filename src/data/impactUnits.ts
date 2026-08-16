/**
 * IMPACT units — the four action worlds.
 *
 * TWO TRUTH REGISTERS, never blended (this is the whole safety model of IMPACT):
 *   • whyFacts  — ecological general knowledge, each carrying a SERIOUS source
 *                 (FAO, IPCC, IUCN, UNEP…). These are KNOWN / source-backed.
 *   • delivery  — our own operational promises (field partner, price, proof).
 *                 These are held at an honest status until verified: 4PLANET is
 *                 the mission owner / initiator; a field partner is who we choose
 *                 to carry it out. Nothing is presented as a settled promise.
 *
 * Images are REAL photographs from the bank, pixel-verified for content (never
 * trusted by filename). Where the bank has no truthful photo for a unit, the unit
 * declares the image as pending rather than mislabelling another photo.
 */

export type DeliveryStatus =
  | "PARTNER_PATHWAY_IN_DEVELOPMENT"
  | "PARTNER_VALIDATION_PENDING"
  | "PROOF_MODEL_PLANNED";

export interface WhyFact {
  /** short plain-language headline */
  head: string;
  /** one or two plain sentences a non-expert understands */
  body: string;
  /** the serious source this rests on */
  source: string;
  sourceUrl: string;
  checkedAt: string;
}

export interface ImpactUnit {
  slug: string;
  index: string;                 // "01" … "04"
  code: string;                  // mission code, e.g. "01_ CLIM4TE_"
  missionName: string;           // e.g. "CLIM4TE_"
  action: string;                // "PLANT TREES"
  unitLabel: string;             // "1 TREE" / "1 KG OCEAN PLASTIC"
  accent: string;                // 4PLANET accent for details/buttons on this unit
  /** hero image; if imagePending is true, no photo is shown (honest state) */
  image: string;
  imageMobile?: string;
  imageAlt: string;
  imagePending?: boolean;        // true → bank has no truthful photo yet
  imageCredit?: string;
  /** optional supporting photos for the article (real, verified) */
  detailImages?: { src: string; alt: string }[];
  /** one-line "what this is" */
  standfirst: string;
  /** the five WHYs, told plainly */
  whyPlant: string;              // why do this at all
  whyWeChose: string;            // why 4PLANET chose this mission
  whyEarth: string;              // why it helps Earth
  whyEcosystems: string;         // why it matters to ecosystems
  whyHumanity: string;           // why it matters to people
  /** source-backed ecological facts (KNOWN) */
  whyFacts: WhyFact[];
  /** our operational model — honest status, never a settled promise */
  delivery: {
    status: DeliveryStatus;
    fieldPartner: string;        // who would carry it out (or "TO BE SELECTED")
    where: string;               // region focus
    whyPartner: string;          // why this kind of partner / selection basis
    proof: string;               // what the user would get back — as a plan
  };
}

const CLIM4TE = "#3AE86F"; // E4RTH green — IMPACT main accent
const OCE4N = "#2E2EFF";

export const IMPACT_UNITS: ImpactUnit[] = [
  {
    slug: "plant-trees",
    index: "01",
    code: "01_ CLIM4TE_",
    missionName: "CLIM4TE_",
    action: "PLANT TREES",
    unitLabel: "1 TREE",
    accent: CLIM4TE,
    image: "/assets/missions/clim4te/hero.jpg",
    imageMobile: "/assets/missions/clim4te/hero-mobile.jpg",
    imageAlt: "Dense living rainforest canopy and understorey",
    standfirst: "Restore and protect trees where they do the most ecological work.",
    whyPlant:
      "A tree is not a carbon token. It is a living structure that cools the ground beneath it, holds soil in place, moves water through a landscape and gives hundreds of other species a home. Planting and protecting the right trees, in the right place, rebuilds all of that at once.",
    whyWeChose:
      "4PLANET chose trees as a first CLIM4TE_ pathway because forests are the highest-leverage terrestrial ecosystem we have: they carry the greatest climate-mitigation potential on land while also holding most of the world's land biodiversity. Few actions do this much, this measurably.",
    whyEarth:
      "Forests moderate climate by storing carbon in wood and soil, and reducing forest loss is the single largest land-based way to cut greenhouse-gas emissions this decade. Growing and protecting trees pulls in the same direction as the whole climate effort.",
    whyEcosystems:
      "Trees build the conditions other life depends on — shade, moisture, leaf litter, root networks and canopy structure. That micro-climate is a refuge for cold- and humidity-sensitive species as heatwaves become more frequent.",
    whyHumanity:
      "The same forests regulate rainfall and water availability, protect and build soil, support pollination and shelter crops — the services underneath food security and public health for millions of people.",
    whyFacts: [
      { head: "One-third of land, most of its life",
        body: "Forests and other wooded land cover only about a third of Earth's land surface, yet they hold more than two-thirds of the world's terrestrial biodiversity.",
        source: "FAO & UNEP, State of the World's Forests 2020", sourceUrl: "https://www.fao.org/state-of-forests/en/", checkedAt: "2026-08-11" },
      { head: "The greatest land-based climate lever",
        body: "Reducing deforestation has the largest potential to cut land-use greenhouse-gas emissions, followed by carbon storage in agriculture and restoration such as reforestation.",
        source: "IPCC, Sixth Assessment (WGIII) via UNFCCC", sourceUrl: "https://unfccc.int/topics/land-use/workstreams/land-use--land-use-change-and-forestry-lulucf", checkedAt: "2026-08-11" },
      { head: "Trees cool and shelter the ground",
        body: "Tree cover buffers the micro-climate near the ground, keeping it cooler and more humid — a measurable refuge for species as droughts and heatwaves intensify.",
        source: "Biogeosciences (Copernicus), 2022", sourceUrl: "https://bg.copernicus.org/articles/19/4227/2022/", checkedAt: "2026-08-11" },
      { head: "Trees underpin agriculture",
        body: "Forests and trees regulate temperature, rainfall and water availability, build soil fertility and support pollination — services that directly underpin farming.",
        source: "FAO, SEI, TNC & CI technical report, 2025", sourceUrl: "https://www.fao.org/family-farming/detail/en/c/1754952/", checkedAt: "2026-08-11" },
    ],
    delivery: {
      status: "PARTNER_VALIDATION_PENDING",
      fieldPartner: "TO BE SELECTED — verified restoration partner",
      where: "Priority: biodiverse, high-leverage restoration landscapes",
      whyPartner: "4PLANET owns and initiates the mission; delivery is carried out by a field partner selected for verified planting, survival monitoring and transparent reporting — native-species and right-place-first, not monoculture offset volume.",
      proof: "Planned: a per-contribution record linking to the partner's planting and survival evidence. No proof is issued until a partner and its evidence pipeline are confirmed.",
    },
  },
  {
    slug: "clean-ocean",
    index: "02",
    code: "01_ CLE4N_",
    missionName: "CLE4N_",
    action: "CLEAN OCEAN PLASTIC",
    unitLabel: "1 KG OCEAN PLASTIC",
    accent: OCE4N,
    image: "/assets/missions/pl4stic/hero.jpg",
    imageMobile: "/assets/missions/pl4stic/hero-mobile.jpg",
    imageAlt: "Recovered marine waste — plastic packaging tangled among fish pulled from the water",
    standfirst: "Recover measurable marine waste before it breaks down and spreads.",
    whyPlant:
      "Ocean plastic does not disappear — it fragments, travels through currents and food webs, and ends up inside marine life. Recovering it as measurable mass, close to where it leaks in, stops one kilogram from becoming millions of pieces.",
    whyWeChose:
      "4PLANET chose marine-waste recovery as a CLE4N_ pathway because it is one of the most visible, measurable and upstream-connected ocean pressures — a place where a defined unit (one kilogram) can be tied to a real delivery record.",
    whyEarth:
      "Marine plastic is a systems problem spanning production, consumption, leakage and cleanup. Removing waste as verified mass addresses the end of that chain while the mission points upstream at the source.",
    whyEcosystems:
      "Plastic entangles and is eaten by marine animals, and microplastics move through the entire food web. Removing waste reduces that direct harm to ocean life.",
    whyHumanity:
      "Coasts, fisheries and the communities that depend on them carry the cost of marine waste. Recovery protects livelihoods as much as wildlife.",
    whyFacts: [
      { head: "Plastic fragments, it doesn't vanish",
        body: "Larger plastic breaks into microplastics that spread through marine food webs — which is why recovering it early, as mass, matters.",
        source: "UNEP, From Pollution to Solution (2021)", sourceUrl: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution", checkedAt: "2026-08-11" },
      { head: "A large, growing input",
        body: "Millions of tonnes of plastic enter the ocean every year; without action the flow is projected to keep rising.",
        source: "UNEP marine-litter assessment (2021)", sourceUrl: "https://www.unep.org/resources/pollution-solution-global-assessment-marine-litter-and-plastic-pollution", checkedAt: "2026-08-11" },
    ],
    delivery: {
      status: "PARTNER_PATHWAY_IN_DEVELOPMENT",
      fieldPartner: "TO BE SELECTED — verified collection partner",
      where: "Priority: high-leakage coastlines and river mouths",
      whyPartner: "4PLANET owns the mission; a field partner carries out collection and weighing. Selection requires transparent chain-of-custody and mass verification, not unaudited totals.",
      proof: "Planned: a record tied to verified recovered mass. Not issued until the collection and verification pipeline is confirmed.",
    },
  },
  {
    slug: "restore-coral",
    index: "03",
    code: "03_ COR4L_",
    missionName: "COR4L_",
    action: "RESTORE CORAL",
    unitLabel: "1 CORAL FRAGMENT",
    accent: OCE4N,
    image: "/assets/impact/restore-coral/hero.jpg",
    imageMobile: "/assets/impact/restore-coral/hero-mobile.jpg",
    imageAlt: "A living coral reef — vivid soft corals lit by surface light",
    imageCredit: "Founder-supplied, rights-cleared",
    detailImages: [
      { src: "/assets/missions/cor4l/detail-coral-01.jpg", alt: "A table coral near the surface in clear water" },
      { src: "/assets/missions/cor4l/detail-coral-03.jpg", alt: "Pink soft corals and a reef fish lit by sun rays" },
      { src: "/assets/missions/cor4l/detail-coral-04.jpg", alt: "A dense, colourful reef community" },
    ],
    standfirst: "Support reef restoration where coral ecosystems are collapsing.",
    whyPlant:
      "Coral reefs are among the most alive places in the ocean — tiny animals building structures that shelter a quarter of all marine species. Restoration helps damaged reefs rebuild that structure where recovery is possible.",
    whyWeChose:
      "4PLANET chose reef restoration as a COR4L_ pathway because reefs concentrate extraordinary biodiversity and human value into a small area, and are among the ecosystems most acutely threatened by warming and acidification.",
    whyEarth:
      "Reefs are an early-warning system for ocean health. Supporting their recovery is both a biodiversity action and a signal about the state of a warming ocean.",
    whyEcosystems:
      "Around a quarter of marine species depend on reefs at some point in their lives. A living reef is habitat, nursery and food source for a vast web of ocean life.",
    whyHumanity:
      "Reefs protect coastlines from storms and waves and support fisheries and tourism that hundreds of millions of people rely on.",
    whyFacts: [
      { head: "A quarter of ocean life",
        body: "Coral reefs cover a tiny fraction of the ocean floor yet support roughly a quarter of all marine species at some stage of life.",
        source: "UNEP / ICRI reef assessments", sourceUrl: "https://www.unep.org/topics/ocean-seas-and-coasts/regional-seas-programme/coral-reefs", checkedAt: "2026-08-11" },
      { head: "Acutely threatened by warming",
        body: "Warming and marine heatwaves drive coral bleaching; large reef losses are projected even at moderate additional warming.",
        source: "IPCC Special Report on 1.5°C", sourceUrl: "https://www.ipcc.ch/sr15/", checkedAt: "2026-08-11" },
    ],
    delivery: {
      status: "PARTNER_PATHWAY_IN_DEVELOPMENT",
      fieldPartner: "TO BE SELECTED — reef-restoration partner",
      where: "Priority: reef systems with viable restoration science",
      whyPartner: "4PLANET owns the mission; a field partner carries out restoration. Selection requires published survival/outcome monitoring — restoration is not guaranteed and only supported where the science supports it.",
      proof: "Planned: a record tied to a partner's monitored restoration outcomes. Not issued until confirmed.",
    },
  },
  {
    slug: "rewild-nature",
    index: "04",
    code: "04_ RE:WILD_",
    missionName: "RE:WILD_",
    action: "REWILD NATURE",
    unitLabel: "1 M² HABITAT",
    accent: CLIM4TE,
    image: "/assets/missions/rewild/hero.jpg",
    imageMobile: "/assets/missions/rewild/hero-mobile.jpg",
    imageAlt: "Arid, degraded land with a single surviving tree",
    standfirst: "Give degraded land back to living systems, square metre by square metre.",
    whyPlant:
      "Rewilding is not planting a garden — it is removing the pressure and letting an ecosystem rebuild its own complexity: soil, plants, insects, birds and the relationships between them. One square metre restored is one square metre returned to life.",
    whyWeChose:
      "4PLANET chose habitat recovery as a RE:WILD_ pathway because restoring degraded land is, alongside cutting deforestation, one of the highest-potential natural climate and biodiversity actions available this decade.",
    whyEarth:
      "Restored ecosystems store carbon, stabilise soil and water, and rebuild resilience against extreme weather — recovery and mitigation in the same action.",
    whyEcosystems:
      "Degraded land is quiet land. Rewilding rebuilds the food webs and habitat structure that let native species return and persist.",
    whyHumanity:
      "Healthy land underpins water, soil and food security, and buffers communities against drought, flood and heat.",
    whyFacts: [
      { head: "Restoration is a top climate action",
        body: "Ecosystem restoration, including reforestation and land recovery, is among the largest near-term natural options for cutting net emissions.",
        source: "IPCC AR6 (WGIII) via UNFCCC", sourceUrl: "https://unfccc.int/topics/land-use/workstreams/land-use--land-use-change-and-forestry-lulucf", checkedAt: "2026-08-11" },
      { head: "A global decade of restoration",
        body: "The UN Decade on Ecosystem Restoration (2021–2030) frames restoration as essential to reversing biodiversity loss and climate change together.",
        source: "UN Decade on Ecosystem Restoration", sourceUrl: "https://www.decadeonrestoration.org/", checkedAt: "2026-08-11" },
    ],
    delivery: {
      status: "PARTNER_PATHWAY_IN_DEVELOPMENT",
      fieldPartner: "TO BE SELECTED — local restoration partner",
      where: "Priority: degraded land with local stewardship",
      whyPartner: "4PLANET owns the mission; a local field partner carries out recovery. Selection favours native-ecosystem recovery and community stewardship over cosmetic planting.",
      proof: "Planned: a record tied to monitored habitat recovery. Not issued until confirmed.",
    },
  },
];

export const findImpactUnit = (slug: string) => IMPACT_UNITS.find((u) => u.slug === slug);

export const DELIVERY_LABEL: Record<DeliveryStatus, string> = {
  PARTNER_PATHWAY_IN_DEVELOPMENT: "PARTNER PATHWAY IN DEVELOPMENT",
  PARTNER_VALIDATION_PENDING: "PARTNER VALIDATION PENDING",
  PROOF_MODEL_PLANNED: "PROOF MODEL PLANNED",
};
