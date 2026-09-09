/**
 * Blocker 5 — Prints for Planet (4RT_) minimum product model.
 *
 * This is a prototype catalogue. Nothing here is for sale: there is no active
 * store, no completed sale and no transferred Impact funds. Each print states its
 * work, artist, edition, rights, availability/development state, a transparent
 * share split, and the mission / Impact-pathway it would route to — as a
 * *planned* model, never a delivered outcome.
 */
export type PrintAvailability = "IN DEVELOPMENT" | "PLANNED EDITION" | "CONCEPT";

export interface PrintWork {
  id: string;
  title: string;
  artist: string;
  artistNote: string;
  medium: string;
  edition: string;        // e.g. "Planned edition of 50"
  rights: string;         // rights/ownership state
  availability: PrintAvailability;
  /** transparent split — must sum to 100 */
  share: { artist: number; production: number; fourPlanet: number };
  /** which mission or Impact pathway a contribution would route to (planned) */
  pathway: string;
  pathwayState: string;   // honest state of that pathway
}

export const PRINTS: PrintWork[] = [
  {
    id: "print:tideline-01",
    title: "Tideline I",
    artist: "P4NTHER",
    artistNote: "Founder studio work — an abstract of a recovering coastline.",
    medium: "Giclée print on cotton rag",
    edition: "Planned edition of 50 + 5 artist proofs",
    rights: "PROPOSED: artwork would remain © the artist; no print-licence agreement exists yet. FOUNDER APPROVAL REQUIRED before any release.",
    availability: "IN DEVELOPMENT",
    share: { artist: 50, production: 20, fourPlanet: 30 },
    pathway: "RE:WILD_ Marine",
    pathwayState: "Pathway in development — no partner, delivery or transferred funds yet.",
  },
  {
    id: "print:canopy-02",
    title: "Canopy Study",
    artist: "P4NTHER",
    artistNote: "A layered study of forest light for the Amazonia mission.",
    medium: "Giclée print on cotton rag",
    edition: "Planned edition of 40",
    rights: "PROPOSED: artwork would remain © the artist; no licence agreement exists yet. FOUNDER APPROVAL REQUIRED.",
    availability: "PLANNED EDITION",
    share: { artist: 50, production: 20, fourPlanet: 30 },
    pathway: "AM4ZONIA_",
    pathwayState: "Pathway in development — support closed until an approved delivery model exists.",
  },
  {
    id: "print:pollinator-03",
    title: "Pollinator Field",
    artist: "Open call (unassigned)",
    artistNote: "A slot reserved for a contributing illustrator via the Join → creative-work path.",
    medium: "To be confirmed with the artist",
    edition: "Concept — edition not yet set",
    rights: "To be agreed with the artist before any release; nothing published without a full rights record.",
    availability: "CONCEPT",
    share: { artist: 50, production: 20, fourPlanet: 30 },
    pathway: "FOOD_ / pollination",
    pathwayState: "Concept only — no artist, no edition, no pathway commitment yet.",
  },
];
