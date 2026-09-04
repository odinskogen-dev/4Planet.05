export type MagazineStoryMode = "FAST" | "DEEP" | "EVERGREEN" | "VISUAL";
export type MagazineLane = "LIFE" | "PLANET" | "HUMAN" | "SOLUTIONS" | "PEOPLE" | "CULTURE";
export type MagazineTopicId =
  | "NATURE"
  | "OCEAN"
  | "CLIMATE"
  | "CITIES"
  | "FOOD"
  | "INNOVATION"
  | "TECHNOLOGY"
  | "DESIGN"
  | "SCIENCE"
  | "PEOPLE"
  | "FIELD"
  | "CULTURE"
  | "SOLUTIONS";

export const MAGAZINE_GOLD_BAR = {
  principle: "AWE GETS ATTENTION. TRUTH EARNS TRUST. HUMANS CREATE CONNECTION. TASTE CREATES MEMORY. UTILITY + STORIES CREATE RETURN. DISTRIBUTION CREATES REACH. DIRECT RELATIONSHIP CREATES RESILIENCE. BRAIN MAKES IT COMPOUND. ACTION + PROOF MAKES IT 4PLANET.",
  audienceBar: [
    "urban young adult",
    "cultural leader",
    "architect / urbanist",
    "product / industrial designer",
    "documentary photographer / filmmaker",
    "engineer / technologist",
    "scientist / field operator",
    "serious nature / food / culture reader",
  ],
  caseStudyBlend: [
    "National Geographic — awe, field authority, photography and cartography as journalism",
    "Vogue — taste, editing, visual confidence and culture as a product",
    "The Guardian — legibility, topic depth, recurring series and open public-interest reporting",
    "Monocle — design, cities, culture, business and a strong topic/format taxonomy",
    "WIRED — engineering, science, invention and the people building what comes next",
    "4PLANET — source-aware living-planet intelligence connecting stories to species, places, actors, solutions and action",
  ],
} as const;

export const MAGAZINE_TOPICS: Array<{
  id: MagazineTopicId;
  label: string;
  promise: string;
  color: string;
}> = [
  { id: "NATURE", label: "Nature", promise: "Wild lives, relationships and the systems that keep them alive.", color: "#42ef7c" },
  { id: "OCEAN", label: "Ocean", promise: "Marine life, currents, coasts, monitoring and a changing blue planet.", color: "#63dcff" },
  { id: "INNOVATION", label: "Innovation", promise: "Tools, methods and ideas being built to understand or repair living systems.", color: "#f1df52" },
  { id: "TECHNOLOGY", label: "Technology", promise: "Sensors, AI, data, robotics and infrastructure viewed through real planetary consequences.", color: "#6f86ff" },
  { id: "DESIGN", label: "Design", promise: "Architecture, materials and designed systems that change how people and nature meet.", color: "#ff7658" },
  { id: "SCIENCE", label: "Science", promise: "Evidence, discovery and the methods used to know what is changing.", color: "#a18cff" },
  { id: "FIELD", label: "Field", promise: "People doing the work in real places, with methods, constraints and evidence visible.", color: "#58d7bc" },
  { id: "PEOPLE", label: "People", promise: "Researchers, operators, makers, communities and organisations shaping what happens next.", color: "#ff669f" },
  { id: "SOLUTIONS", label: "Solutions", promise: "What is being tried, what seems to work and what is still unproven.", color: "#7bea72" },
  { id: "CLIMATE", label: "Climate", promise: "Heat, water, carbon and the living systems that translate planetary change into daily life.", color: "#ff925d" },
  { id: "CITIES", label: "Cities", promise: "Urban life, buildings, mobility, infrastructure and room for other species.", color: "#8bd8ff" },
  { id: "FOOD", label: "Food", promise: "Taste, farming, supply chains, health and the landscapes behind dinner.", color: "#d5e867" },
  { id: "CULTURE", label: "Culture", promise: "Photography, film, art, music and ideas that change what a society notices.", color: "#ff72bd" },
];

export const MAGAZINE_LANES: Array<{
  id: MagazineLane;
  promise: string;
  primaryPath: string;
}> = [
  { id: "LIFE", promise: "Species, behaviour, ecology and the relationships that keep life alive.", primaryPath: "/species" },
  { id: "PLANET", promise: "Places, ecosystems, climate signals, maps and the changing physical world.", primaryPath: "/atlas" },
  { id: "HUMAN", promise: "Food, energy, materials, cities and the systems people build.", primaryPath: "/domains/s4piens" },
  { id: "SOLUTIONS", promise: "What is being tried, what evidence exists and what remains uncertain.", primaryPath: "/living-systems" },
  { id: "PEOPLE", promise: "Field teams, researchers, organisations, makers and people doing the work.", primaryPath: "/actors" },
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
