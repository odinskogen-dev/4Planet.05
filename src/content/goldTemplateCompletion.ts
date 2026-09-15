import type { GoldObjectProof } from "@/content/goldTemplateSystem";

/**
 * Completion objects for GOLD TEMPLATE SYSTEM 01.
 * These are controlled TEST projections only. They extend the existing Gold object grammar
 * without creating a second truth system or CMS.
 */
export const GOLD_COMPLETION_OBJECTS: GoldObjectProof[] = [
  {
    slug: "oslofjord-living-system",
    kind: "LIVING_SYSTEM",
    title: "Oslofjord coastal living system",
    eyebrow: "LIVING SYSTEM GOLD · RELATIONSHIPS BEFORE LABELS",
    standfirst: "A fjord is not one habitat and not one problem. Water exchange, nutrients, oxygen, shallow habitats, species, fisheries and human land use interact across space and time. This object makes those dependencies explicit without pretending the system is simpler than the evidence allows.",
    status: "TEST PROOF · RELATIONSHIP-BOUNDED",
    accent: "#24b9ff",
    visual: "FJORD",
    facts: [
      { label: "SYSTEM", value: "Coastal marine ecosystem", note: "Oslofjord", state: "KNOWN" },
      { label: "MAJOR PRESSURES", value: "Wastewater · agriculture runoff · fisheries", note: "Norwegian Government", state: "KNOWN" },
      { label: "HABITATS", value: "Eelgrass · soft bottom · macroalgae · kelp", note: "Restoration guidance", state: "KNOWN" },
      { label: "RECOVERY", value: "Pressure reduction + time", note: "Measures do not imply immediate ecological recovery", state: "KNOWN" },
      { label: "ONE CAUSE", value: "UNKNOWN / NOT DEFENSIBLE", note: "Multiple pressures interact", state: "UNKNOWN" },
      { label: "LIVE STATE", value: "Source- and date-dependent", note: "Do not flatten monitoring into a timeless score", state: "INTERPRETED" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "SYSTEM",
        title: "The fjord works through relationships.",
        body: [
          "Oslofjord connects land, freshwater, coastal habitats and the open sea. Nutrients and particles arrive through catchments and wastewater systems; fisheries alter biological communities; shallow habitats provide structure and nursery functions.",
          "A Living System object therefore starts with dependencies and pressures rather than a decorative ecosystem label. Each relationship can carry its own source, time and confidence state.",
        ],
      },
      {
        index: "02",
        eyebrow: "CHANGE",
        title: "Pressure, ecological state and response are different layers.",
        body: [
          "Norwegian authorities describe the environmental condition in Oslofjord as very serious and identify several long-running pressures. That does not mean every location has the same condition or that a single pressure explains every observed change.",
          "The Gold grammar keeps pressure evidence, observed ecological state, policy decisions and measured outcomes separate so the user can see where knowledge is strong and where it is still open.",
        ],
        callout: "PRESSURE ≠ STATE ≠ DECISION ≠ DELIVERY ≠ OUTCOME",
      },
      {
        index: "03",
        eyebrow: "RESPONSE",
        title: "Restoration is one intervention inside a larger system.",
        body: [
          "Current Norwegian guidance includes local restoration of eelgrass and other marine habitats, while also stressing the need to reduce the pressures that caused degradation.",
          "That makes Oslofjord a useful template proof: solutions can be connected to the system without being promoted as universal fixes or credited with outcomes before monitoring supports the claim.",
        ],
      },
    ],
    relationships: [
      { kind: "PLACE", label: "Oslofjord", relation: "The geographic container for this living-system view.", state: "KNOWN", href: "/sandbox/gold/place/oslofjord" },
      { kind: "PRESSURE", label: "Nutrient and particle loading", relation: "Wastewater and agricultural runoff are among the documented pressures.", state: "KNOWN" },
      { kind: "SOLUTION", label: "Eelgrass restoration", relation: "A local habitat-restoration pathway that depends on site suitability and pressure reduction.", state: "KNOWN", href: "/sandbox/gold/solution/eelgrass-restoration" },
      { kind: "SIGNAL", label: "Oslofjord plan 2026–2030 consultation", relation: "A current public decision signal connected to the system, not an ecological outcome.", state: "KNOWN", href: "/sandbox/gold/signal/oslofjord-plan-2026" },
      { kind: "PROOF", label: "Eelgrass restoration proof record", relation: "A bounded example of separating method evidence from measured ecological outcome.", state: "INTERPRETED", href: "/sandbox/gold/proof/eelgrass-proof-record" },
    ],
    sources: [
      {
        label: "Oslofjorden",
        publisher: "Klima- og miljødepartementet",
        url: "https://www.regjeringen.no/no/tema/klima-og-miljo/naturmangfold/innsiktsartikler-naturmangfold/oslofjorden/id3139220/",
        checkedAt: "2026-09-15",
        note: "Government overview used for environmental condition and major pressure classes.",
      },
      {
        label: "Naturrestaurering i Oslofjorden",
        publisher: "Miljødirektoratet",
        url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/",
        checkedAt: "2026-09-15",
        note: "Guidance used for habitat and restoration context, including the priority of pressure reduction.",
      },
    ],
    truthBoundary: "This TEST object is a relationship model, not a complete ecological assessment of Oslofjord. It does not assign site-level causality, current abundance, legal status or ecological outcome where those have not been separately verified.",
    donorNote: "Existing Living Systems and Oslofjord Planet Proof work are capability donors. The page tests a reusable system grammar, not a parallel ecosystem database.",
    nextObjects: [
      { label: "Open Oslofjord Place Gold", href: "/sandbox/gold/place/oslofjord", kind: "PLACE" },
      { label: "Open eelgrass Solution Gold", href: "/sandbox/gold/solution/eelgrass-restoration", kind: "SOLUTION" },
      { label: "Explore ATLAS", href: "/atlas", kind: "ATLAS" },
    ],
  },
  {
    slug: "oslofjord-plan-2026",
    kind: "SIGNAL",
    title: "Oslofjord plan 2026–2030 enters consultation",
    eyebrow: "SIGNAL GOLD · WHAT CHANGED, WHEN, AND WHO SAID SO",
    standfirst: "In June 2026 the Norwegian Government sent a proposed new Oslofjord action plan for 2026–2030 to consultation. The signal is the decision event itself — not implementation, funding, delivery or ecological recovery.",
    status: "TEST PROOF · TIME-BOUNDED PUBLIC SIGNAL",
    accent: "#ffcf28",
    visual: "FJORD",
    facts: [
      { label: "EVENT", value: "Government proposal sent to consultation", note: "Norwegian Government", state: "KNOWN" },
      { label: "PLAN PERIOD", value: "2026–2030", note: "Proposal scope", state: "KNOWN" },
      { label: "STATE", value: "Consultation / proposal", note: "Not equivalent to final implementation", state: "KNOWN" },
      { label: "PLACE", value: "Oslofjord", note: "National and local action context", state: "KNOWN" },
      { label: "DELIVERY", value: "Not inferred", note: "Must be verified measure by measure", state: "UNKNOWN" },
      { label: "ECOLOGICAL OUTCOME", value: "Not yet attributable", note: "Requires later evidence", state: "UNKNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "WHAT HAPPENED",
        title: "A new public decision window opened.",
        body: [
          "The Norwegian Government published a proposed new Oslofjord action plan for 2026–2030 and opened it for consultation in June 2026.",
          "That event matters because it changes the decision environment around the fjord. It does not, by itself, show that any measure has been funded, delivered or produced an ecological result.",
        ],
      },
      {
        index: "02",
        eyebrow: "WHY IT MATTERS",
        title: "Signals tell the rest of the graph what deserves attention now.",
        body: [
          "A Signal object is temporal. It can connect a current event to the relevant Place, Living System, Actors, Decisions, Solutions and later Proof without turning news into permanent truth.",
          "When the state changes — consultation closes, a decision is adopted, a measure is funded or implementation starts — the signal should be superseded or linked to the next event rather than silently rewritten.",
        ],
        callout: "OBSERVED EVENT → VERIFIED STATE → NEXT EVENT. NEVER NEWS → OUTCOME CLAIM.",
      },
    ],
    relationships: [
      { kind: "PLACE", label: "Oslofjord", relation: "The signal concerns the current public response to conditions in the fjord.", state: "KNOWN", href: "/sandbox/gold/place/oslofjord" },
      { kind: "LIVING_SYSTEM", label: "Oslofjord coastal living system", relation: "The plan responds to a multi-pressure marine system.", state: "KNOWN", href: "/sandbox/gold/living-system/oslofjord-living-system" },
      { kind: "DECISION", label: "Proposed Oslofjord plan 2026–2030", relation: "The signal records consultation state, not final policy delivery.", state: "KNOWN", boundary: "Proposal ≠ adopted measure." },
      { kind: "PROOF", label: "Future measure proof", relation: "Any later delivery or ecological result needs separate evidence objects.", state: "UNKNOWN" },
    ],
    sources: [
      {
        label: "Høring av regjeringens forslag til ny Oslofjordplan",
        publisher: "Klima- og miljødepartementet",
        url: "https://www.regjeringen.no/no/dokumenter/horing-av-regjeringens-forslag-til-ny-oslofjordplan/id3166019/",
        checkedAt: "2026-09-15",
        note: "Primary public source for consultation state, plan period and decision context.",
      },
    ],
    truthBoundary: "This TEST Signal records a public decision event. It makes no claim that the proposal is final, funded, implemented or ecologically effective.",
    donorNote: "NOW/WATCH temporal logic and existing evidence-state rules are the donors. The signal remains an event object, not a second news database.",
    nextObjects: [
      { label: "Open Oslofjord Place Gold", href: "/sandbox/gold/place/oslofjord", kind: "PLACE" },
      { label: "Open Living System Gold", href: "/sandbox/gold/living-system/oslofjord-living-system", kind: "LIVING SYSTEM" },
      { label: "Open Proof Gold", href: "/sandbox/gold/proof/eelgrass-proof-record", kind: "PROOF" },
    ],
  },
  {
    slug: "eelgrass-proof-record",
    kind: "PROOF",
    title: "Eelgrass restoration — proof record",
    eyebrow: "PROOF GOLD · CLAIM ONLY WHAT THE EVIDENCE CAN CARRY",
    standfirst: "A restoration method can be documented before ecological recovery is known. This proof object shows the separation between intervention design, delivery evidence, monitoring and outcome — with the outcome deliberately left open until data exists.",
    status: "TEST PROOF · OUTCOME OPEN",
    accent: "#b7ff2a",
    visual: "MEADOW",
    facts: [
      { label: "METHOD EVIDENCE", value: "Available", note: "Norwegian restoration guidance", state: "KNOWN" },
      { label: "SITE SUITABILITY", value: "Must be assessed", note: "Project-specific", state: "UNKNOWN" },
      { label: "DELIVERY", value: "Must be recorded", note: "Planting/action evidence", state: "UNKNOWN" },
      { label: "MONITORING", value: "Required for outcome claim", note: "Before/after and appropriate comparison where feasible", state: "INTERPRETED" },
      { label: "ECOLOGICAL OUTCOME", value: "UNKNOWN", note: "No recovery claim in this template proof", state: "UNKNOWN" },
      { label: "CLAIM STATE", value: "Method supported · outcome unverified", note: "Fail closed", state: "KNOWN" },
    ],
    sections: [
      {
        index: "01",
        eyebrow: "CLAIM",
        title: "The method exists. The result does not exist by default.",
        body: [
          "Norwegian guidance documents practical approaches for restoring eelgrass, including site selection, active re-establishment and monitoring. That supports a method claim.",
          "It does not support a claim that a particular intervention succeeded until the site, delivery and follow-up evidence for that intervention has been assembled and evaluated.",
        ],
      },
      {
        index: "02",
        eyebrow: "EVIDENCE CHAIN",
        title: "Baseline → action → observation → outcome → confidence.",
        body: [
          "Proof Gold keeps each link inspectable. A delivery photograph can support that work occurred; it cannot by itself prove habitat recovery. Monitoring can show change; attribution may still require a stronger comparison and knowledge of other pressures.",
          "The object is designed to remain useful even when the answer is UNKNOWN. That is a feature, not a blank to be filled with marketing language.",
        ],
        callout: "ACTIVITY IS NOT IMPACT. OBSERVATION IS NOT ATTRIBUTION. UNKNOWN STAYS UNKNOWN.",
      },
      {
        index: "03",
        eyebrow: "ACCEPTANCE",
        title: "A proof object earns stronger language only when the chain closes.",
        body: [
          "A future real record can attach a dated baseline, intervention contract, delivery evidence, monitoring observations, source provenance, assessor judgement and confidence level.",
          "Until then, this template deliberately shows the outcome gate as open rather than manufacturing a success story.",
        ],
      },
    ],
    relationships: [
      { kind: "SOLUTION", label: "Eelgrass restoration", relation: "The intervention class whose method evidence is being separated from outcome evidence.", state: "KNOWN", href: "/sandbox/gold/solution/eelgrass-restoration" },
      { kind: "PLACE", label: "Oslofjord", relation: "A relevant restoration context; this template does not claim a specific site intervention occurred.", state: "KNOWN", href: "/sandbox/gold/place/oslofjord", boundary: "Context ≠ project site." },
      { kind: "DATA", label: "Baseline and monitoring observations", relation: "Required to support a measured outcome claim.", state: "UNKNOWN" },
      { kind: "ACTOR", label: "Responsible delivery / verifier", relation: "Must be identified in a real Proof Passport before authority can be assigned.", state: "UNKNOWN" },
    ],
    sources: [
      {
        label: "Naturrestaurering i Oslofjorden",
        publisher: "Miljødirektoratet",
        url: "https://www.miljodirektoratet.no/ansvarsomrader/vann-hav-og-kyst/naturrestaurering-i-oslofjorden/",
        checkedAt: "2026-09-15",
        note: "Primary public guidance for restoration principles and the need to address underlying pressures.",
      },
      {
        label: "Practical guidance for restoration of eelgrass meadows",
        publisher: "NIVA / Oslo municipality context",
        url: "https://www.niva.no/en/news/practical-guide-for-restoration-of-eelgrass-meadows",
        checkedAt: "2026-09-15",
        note: "Method context for site selection, planting and monitoring. A real proof record would attach the exact project evidence separately.",
      },
    ],
    truthBoundary: "This is a template proof record, not evidence that 4PLANET or another actor has restored a specific eelgrass meadow. No delivery, survival, habitat recovery, biodiversity gain or causal outcome is claimed.",
    donorNote: "Existing CELL / Proof Passport semantics are the donor: action, evidence, claim, confidence and outcome remain separate objects until verified.",
    nextObjects: [
      { label: "Open Solution Gold", href: "/sandbox/gold/solution/eelgrass-restoration", kind: "SOLUTION" },
      { label: "Open Oslofjord Place Gold", href: "/sandbox/gold/place/oslofjord", kind: "PLACE" },
      { label: "Open current IMPACT proof surface", href: "/impact", kind: "IMPACT" },
    ],
  },
];

export function goldCompletionObjectBySlug(slug?: string) {
  return GOLD_COMPLETION_OBJECTS.find((object) => object.slug === slug);
}
