export type MagazineStoryMode = "FAST" | "DEEP" | "EVERGREEN" | "VISUAL";
export type MagazineLane = "LIFE" | "PLANET" | "HUMAN" | "SOLUTIONS" | "PEOPLE" | "CULTURE";

export const MAGAZINE_GOLD_BAR = {
  principle: "AWE GETS ATTENTION. TRUTH EARNS TRUST. HUMANS CREATE CONNECTION. TASTE CREATES MEMORY. UTILITY + STORIES CREATE RETURN. DISTRIBUTION CREATES REACH. DIRECT RELATIONSHIP CREATES RESILIENCE. BRAIN MAKES IT COMPOUND. ACTION + PROOF MAKES IT 4PLANET.",
  audienceBar: [
    "world-class architect",
    "world-class product designer",
    "documentary photographer",
    "artist / musician / cultural maker",
    "serious food / culture reader",
    "policymaker",
    "economist",
    "engineer / scientist",
  ],
  caseStudyBlend: [
    "National Geographic — awe, field authority, photography and cartography as journalism",
    "BBC — trust, verification and visible how-we-know discipline",
    "VICE — human access and platform-native storytelling without fragile expansion economics",
    "Vogue — taste, editing and curation as a product",
    "TIME — memorable recurring editorial franchises and tentpoles",
    "The Guardian — open reach that converts into direct reader relationships",
    "4PLANET — one source-aware entity graph connecting intelligence, actors, action and proof",
  ],
} as const;

export const MAGAZINE_LANES: Array<{
  id: MagazineLane;
  promise: string;
  primaryPath: string;
}> = [
  { id: "LIFE", promise: "Species, behaviour, ecology and the relationships that keep life alive.", primaryPath: "/species" },
  { id: "PLANET", promise: "Places, ecosystems, climate signals, maps and the changing physical world.", primaryPath: "/atlas" },
  { id: "HUMAN", promise: "Food, energy, materials, cities and the systems people build.", primaryPath: "/domains/s4piens" },
  { id: "SOLUTIONS", promise: "What is being tried, what evidence exists and what remains uncertain.", primaryPath: "/living-systems" },
  { id: "PEOPLE", promise: "Field teams, researchers, organisations, makers and people doing the work.", primaryPath: "/partners" },
  { id: "CULTURE", promise: "Photography, film, art, design, food, music and cultural ways into a living planet.", primaryPath: "/domains/4culture" },
];

export const MAGAZINE_STORY_MODES: Record<MagazineStoryMode, { label: string; job: string }> = {
  FAST: { label: "NOW", job: "A fast, sourced answer to what changed and why it matters." },
  DEEP: { label: "FIELD", job: "Reported features, interviews, investigations and human access." },
  EVERGREEN: { label: "INTELLIGENCE", job: "Durable species, ecosystem, solution and systems explainers." },
  VISUAL: { label: "VISUAL", job: "Photography, maps, data, film and visual essays where the image carries real information." },
};

/** Working editorial IP to test, not locked public naming. */
export const MAGAZINE_FRANCHISE_HYPOTHESES = [
  { id: "from-the-field", label: "FROM THE FIELD", job: "Original observations and people doing real work in real places." },
  { id: "living-world", label: "THE LIVING WORLD", job: "Species and ecosystem stories with documentary visual authority." },
  { id: "planet-explained", label: "PLANET EXPLAINED", job: "Source-aware explainers that make complex systems legible." },
  { id: "what-works", label: "WHAT WORKS", job: "Solutions and innovations with explicit evidence levels and limitations." },
  { id: "choice", label: "CHOICE", job: "Practical everyday decisions where health, wallet and planet stay distinct." },
  { id: "visual-signal", label: "IMAGE / MAP OF THE DAY", job: "A low-friction recurring visual habit built from a real source object." },
] as const;

export const MAGAZINE_SUCCESS_CHAIN = [
  "DISCOVERY",
  "ENGAGED READ",
  "RELEVANT SECOND OBJECT",
  "RETURN / DIRECT RELATIONSHIP",
  "MARKET CONTACT",
  "4PLANET HANDOFF",
  "DOWNSTREAM ACTION / MONEY / PROOF",
] as const;
