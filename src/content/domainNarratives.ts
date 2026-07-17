import type { DomainKey } from "@/types/content";

/** Locked V16 domain manifestos (brief §04). Neutral descriptors — no banned jargon. */
export const DOMAIN_NARRATIVE: Record<DomainKey, { descriptor: string; body: string[]; why: string }> = {
  "OCE4N_": {
    descriptor: "Ocean systems under pressure.",
    body: [
      "The ocean never stands still.",
      "Currents carry heat across continents. Whales move nutrients across thousands of kilometres. Coral reefs protect coastlines and hold extraordinary life. Tiny organisms help produce the oxygen we breathe.",
      "The ocean can appear endless. Its resilience is not.",
      "Marine systems are being reshaped by warming, waste, noise, extraction and habitat loss.",
      "OCE4N is where 4Planet develops Missions for some of the ocean's most important pressures — making marine systems easier to understand, support and follow.",
    ],
    why: "Because most of the living planet is ocean — and the systems that regulate our climate, feed billions and produce much of our oxygen begin beneath a surface most people never see.",
  },
  "E4RTH_": {
    descriptor: "Living landscapes under pressure.",
    body: [
      "A forest is never just trees.",
      "It is water. Soil. Fungi. Birds. Insects. Climate. Memory.",
      "Living landscapes hold human life together in ways most people rarely see.",
      "But forests, species, soils and degraded land are being pushed beyond balance.",
      "E4RTH is where 4Planet develops Missions for forests, biodiversity, climate resilience and land recovery — making terrestrial challenges easier to understand, support and follow.",
    ],
    why: "Because the land stores carbon, moves water, feeds pollinators and holds the biodiversity that keeps whole systems standing — and it recovers when given the chance.",
  },
  "S4PIENS_": {
    descriptor: "The systems we build.",
    body: [
      "The pressure on nature is not separate from human life.",
      "It is designed into our systems.",
      "Food. Energy. Cities. Materials. Fashion. Consumption.",
      "The way we live shapes the pressure placed on the living world.",
      "S4PIENS is where 4Planet explores the systems humans have built — and how they can be redesigned toward healthier, lower-impact and more durable forms of life.",
    ],
    why: "Because the fastest way to relieve pressure on nature is to redesign the human systems that create it — the way we eat, move, build and produce.",
  },
  "4CULTURE_": {
    descriptor: "Culture for action.",
    body: [
      "Culture shapes what people notice.",
      "What people notice, they learn to value.",
      "What people value, they are more likely to protect.",
      "4CULTURE is where ecological attention becomes music, film, image, design, gatherings and editorial work that can move through public life.",
      "It is not marketing around environmental work.",
      "It is part of how environmental work becomes culturally possible.",
    ],
    why: "Because facts alone rarely change behaviour. Stories, sound and image decide what a culture chooses to see — and defend.",
  },
};
