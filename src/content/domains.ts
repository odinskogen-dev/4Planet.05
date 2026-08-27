import type { DomainKey } from "@/types";
import { DOMAIN_ACCENT, DOMAIN_BASE, DOMAIN_DESC } from "@/styles/tokens";

export interface DomainContent {
  key: DomainKey; code: string; descriptor: string; line: string; mode: string; mood: string;
  manifesto: string; intro: string; status: string; livingSystemsBridge: string;
  worldCTA: string; partnerCTA: string; accent: string; base: string; techLanguage: string[];
}

const mk = (d: Omit<DomainContent, "accent" | "base" | "descriptor">): DomainContent =>
  ({ ...d, accent: DOMAIN_ACCENT[d.key], base: DOMAIN_BASE[d.key], descriptor: DOMAIN_DESC[d.key] });

export const DOMAIN_CONTENT: Record<DomainKey, DomainContent> = {
  "OCE4N_": mk({
    key: "OCE4N_", code: "DOMAIN / 01", line: "Marine systems · ocean resilience", mode: "DEEP OCEAN INTELLIGENCE",
    mood: "Massive, ancient, intelligent and emotional.",
    manifesto: "The protection of marine life — coral systems, migratory species and the integrity of coastal water.",
    intro: "OCE4N_ is 4Planet's marine domain: a place to understand the systems that make oceans productive and resilient, and to build credible pathways for protection, recovery and public participation.",
    status: "Four mission pathways. Public support opens only where a partner, unit model, evidence requirements and reporting structure are confirmed.",
    livingSystemsBridge: "Explore ocean ecosystems, marine species, ecological functions, threats and solutions in Living Systems.",
    worldCTA: "ENTER DOMAIN", partnerCTA: "PARTNER WITH THIS DOMAIN",
    techLanguage: ["DEPTH", "TIDE", "CURRENT", "PRESSURE", "SONAR", "HORIZON"],
  }),
  "E4RTH_": mk({
    key: "E4RTH_", code: "DOMAIN / 02", line: "Land · biodiversity · climate · restoration", mode: "BIOSPHERE INTELLIGENCE",
    mood: "Alive, intelligent and planetary.",
    manifesto: "Forests, biodiversity and the integrity of terrestrial life — strengthened through stewardship and field-based restoration.",
    intro: "E4RTH_ is 4Planet's land-systems domain: forests, climate, species and the long work of returning damaged landscapes to ecological function.",
    status: "Four mission pathways. CLIM4TE_ contains the first operational proof path: Tree Unit. Public support remains closed until launch requirements are complete.",
    livingSystemsBridge: "Explore forest systems, biodiversity, ecological functions, threats and solutions in Living Systems.",
    worldCTA: "ENTER DOMAIN", partnerCTA: "PARTNER WITH THIS DOMAIN",
    techLanguage: ["TERRAIN", "STRATA", "ROOT SYSTEMS", "CANOPY", "HABITAT", "WATERSHED"],
  }),
  "S4PIENS_": mk({
    key: "S4PIENS_", code: "DOMAIN / 03", line: "Human systems · food · energy · cities · materials", mode: "HUMAN SYSTEMS",
    mood: "Architectural, clear and design-led.",
    manifesto: "The systems humans live inside — food, energy, cities and materials — shape the pressure placed on the living world.",
    intro: "S4PIENS_ makes the human systems behind ecological pressure visible, then explores how those systems can be redesigned toward lower-impact, healthier and more durable forms of life.",
    status: "Four mission pathways. No public impact units are open.",
    livingSystemsBridge: "Explore the links between ecological functions, ecosystem services and human systems in Living Systems.",
    worldCTA: "ENTER DOMAIN", partnerCTA: "PARTNER WITH THIS DOMAIN",
    techLanguage: ["FLOWS", "SYSTEMS", "CITIES", "MATERIALS", "FOOD", "ENERGY"],
  }),
  "4CULTURE_": mk({
    key: "4CULTURE_", code: "DOMAIN / 04", line: "Culture · media · narrative · influence", mode: "CULTURAL TRANSMISSION",
    mood: "Editorial, cinematic and culturally precise.",
    manifesto: "Culture is ecological infrastructure when it makes living systems visible, desirable and easier to protect.",
    intro: "4CULTURE_ is the distribution layer of 4Planet: editorial, film, art, exhibitions and gatherings that carry ecological intelligence into public life.",
    status: "Four cultural pathways. These are not separate brands competing with 4Planet; they are distinct public domains running on shared infrastructure.",
    livingSystemsBridge: "Culture translates ecological understanding into attention, participation and durable public relevance.",
    worldCTA: "ENTER DOMAIN", partnerCTA: "BUILD CULTURE WITH 4PLANET_",
    techLanguage: ["SIGNAL", "IMAGE", "FILM", "PUBLISHING", "SOUND", "PARTICIPATION"],
  }),
};
