import type { DomainKey } from "@/types/content";

export interface FieldNote { domain: DomainKey; kind: string; label: string; title: string; dek: string; body: string[]; }

export const FIELD_NOTES: Record<DomainKey, FieldNote> = {
  "OCE4N_": { domain: "OCE4N_", kind: "Domain Note", label: "DOMAIN NOTE",
    title: "Reading the ocean as a system, not a surface.",
    dek: "Why marine recovery begins with understanding pressure, not just observing loss.",
    body: ["Most people meet the ocean at its surface. The systems that decide whether it stays productive — currents, temperature, food webs, the quiet work of plankton and kelp — sit out of view.",
           "OCE4N_ begins there: making the forces reshaping marine life legible, so that protection, recovery and public participation can be built on understanding rather than alarm."] },
  "E4RTH_": { domain: "E4RTH_", kind: "Domain Note", label: "DOMAIN NOTE",
    title: "Land remembers how to heal.",
    dek: "Restoration is less about planting and more about removing what stops a system from recovering.",
    body: ["A degraded landscape is rarely dead. More often it is interrupted — its water, soil and species cycles broken at a few key points.",
           "E4RTH_ organises missions around those points: forests, biodiversity and the long, patient work of returning damaged land to ecological function."] },
  "S4PIENS_": { domain: "S4PIENS_", kind: "Domain Note", label: "DOMAIN NOTE",
    title: "The pressure is designed. So is the way out.",
    dek: "Food, energy, cities and materials are human systems — which means they can be rebuilt.",
    body: ["The strain on the living world is not an accident of nature. It is the output of systems people designed: how we grow food, move energy, build cities and handle materials.",
           "S4PIENS_ makes those systems visible, then explores how they can be redesigned toward lower-impact, more durable forms of life."] },
  "4CULTURE_": { domain: "4CULTURE_", kind: "Domain Note", label: "DOMAIN NOTE",
    title: "Attention is the first resource.",
    dek: "Nothing gets protected that the public never learns to see.",
    body: ["Ecological understanding rarely fails on facts. It fails on attention — on whether a living system ever becomes visible, desirable and worth defending in public life.",
           "4CULTURE_ is the distribution layer: editorial, film, sound and image that turn ecological intelligence into participation."] },
};
export const fieldNote = (k: DomainKey): FieldNote => FIELD_NOTES[k];
