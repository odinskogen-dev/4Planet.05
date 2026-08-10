import { Link, useLocation } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label } from "@/components/ui";
import { speciesBySlug, type EvidenceState } from "@/data/species";
import { returnHrefFromSearch } from "@/product/productContext";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em" };
const ACCENT = T.blue; // OCE4N_ journey — blue is the OCE4N domain accent

const evidenceColor = (s: EvidenceState) => (s === "KNOWN" ? T.acid : s === "INTERPRETED" ? T.blue : "#8A6500");

/**
 * ORCA-06 — internal Living Systems Orca journey.
 * A guided, source-aware path on the shared product: Orca -> habitat & prey ->
 * sourced pressures -> possible responses -> WH4LES_ -> Follow. No external
 * Living Systems deployment; relationships are drawn only where the preserved
 * KNOWN/INTERPRETED/UNKNOWN evidence layer supports them.
 */
type Scene = { eyebrow: string; title: string; body: string; note?: string };

const ORCA_SCENES: Scene[] = [
  {
    eyebrow: "DISCOVER",
    title: "Start with the animal, not the metric.",
    body: "The orca is the largest member of the dolphin family — a fast, social predator found in every ocean. Different populations carry different prey, behaviour and calls, so a species label never describes every group.",
  },
  {
    eyebrow: "UNDERSTAND · HABITAT & PREY",
    title: "A whale is never only a whale.",
    body: "Orcas live through durable social relationships and depend on the prey and habitat of their particular population. Coastal groups follow prey along shelves and fjords; others range across open water.",
    note: "Relationship shown because the preserved evidence layer marks it KNOWN / INTERPRETED with population boundaries — not a generic claim.",
  },
  {
    eyebrow: "CONNECT · PRESSURES",
    title: "Pressure is specific, not general.",
    body: "Reduced prey availability, underwater noise, vessel interaction and persistent pollutants affect some populations. Responsible action begins by identifying the population, the place, the evidence and a competent actor.",
    note: "Each pressure stays a reviewed claim with its boundary — never transferred from one population to another without evidence.",
  },
  {
    eyebrow: "RESPOND",
    title: "No single universal fix.",
    body: "The prototype does not claim that one intervention protects all orcas. A response path requires population-specific science, responsible institutions and an evidence-backed implementation partner.",
  },
];

function SceneRow({ s, i }: { s: Scene; i: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(16px,3vw,40px)", padding: "clamp(28px,4vw,48px) 0", borderTop: `1px solid ${T.line}` }}>
      <div style={{ ...mono, color: ACCENT }}>0{i + 1}</div>
      <div>
        <div style={{ ...mono, color: ACCENT, marginBottom: 12 }}>{s.eyebrow}</div>
        <h2 style={{ fontFamily: T.display, fontSize: "clamp(26px,3.2vw,40px)", lineHeight: 1.02, letterSpacing: "-.03em", maxWidth: 620 }}>{s.title}</h2>
        <p style={{ marginTop: 16, fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.6, maxWidth: 640, color: T.ink }}>{s.body}</p>
        {s.note && <p style={{ marginTop: 12, ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.7, maxWidth: 640 }}>{s.note}</p>}
      </div>
    </div>
  );
}

export function LivingSystems() {
  const orca = speciesBySlug("orca");
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  // Forward the captured ATLAS return context onto the next hop so the whole
  // journey can still return to the exact prior ATLAS state.
  const fwd = (href: string) => (returnHref ? `${href}${href.includes("?") ? "&" : "?"}returnTo=${new URLSearchParams(location.search).get("returnTo")}` : href);
  const handoffs: [string, string, string][] = [
    ["OPEN ORCA IN SPECIES", "The full profile, identity and records.", fwd("/species/orca?entity=taxon:gbif:2440483")],
    ["EXPLORE FREELY IN ATLAS", "Leave the guided path and inspect the data yourself.", returnHref ?? "/atlas?entity=taxon:gbif:2440483"],
    ["WH4LES_ MISSION", "What this connects to, and how to take part.", fwd("/missions/wh4les")],
    ["FOLLOW & PARTICIPATE", "Follow the animal and its mission.", fwd("/join")],
  ];
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        {returnHref && (
          <Link to={returnHref} data-testid="return-to-atlas" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: ACCENT, padding: "10px 14px", textDecoration: "none", marginBottom: 20 }}>
            ← BACK TO OBSERVATION IN ATLAS
          </Link>
        )}
        <Label color={ACCENT} style={{ marginBottom: 16 }}>4PLANET_ LIVING SYSTEMS_</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(32px,3.4vw,48px)", letterSpacing: "-.035em", lineHeight: 1.04, maxWidth: 820 }}>
          Making the relationships that make life possible visible.
        </h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", color: T.ink, marginTop: 18, maxWidth: 660, lineHeight: 1.6 }}>
          Living Systems is a guided way to read the shared planet — the same species, records and sources as ATLAS,
          arranged as relationships. It runs inside 4Planet; it is not a separate app.
        </p>

        <div style={{ ...mono, color: ACCENT, marginTop: 44 }}>GUIDED JOURNEY · 01</div>
        <h2 style={{ fontFamily: T.display, fontSize: "clamp(30px,4.5vw,56px)", letterSpacing: "-.04em", lineHeight: .96, marginTop: 10 }}>The Orca, followed honestly.</h2>
        <p style={{ marginTop: 16, fontSize: "clamp(15px,1.5vw,18px)", color: T.dim, maxWidth: 640, lineHeight: 1.6 }}>
          From the living animal to its pressures and possible responses — every step labelled by what is known,
          interpreted or unknown.
        </p>

        <div style={{ marginTop: 20 }}>
          {ORCA_SCENES.map((s, i) => <SceneRow key={s.eyebrow} s={s} i={i} />)}
        </div>

        {orca?.narrativeChapters && orca.narrativeChapters.length > 0 && (
          <div style={{ marginTop: 40, borderTop: `1px solid ${T.line}`, paddingTop: 32 }}>
            <div style={{ ...mono, color: ACCENT }}>EVIDENCE BEHIND THIS JOURNEY</div>
            <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
              {orca.narrativeChapters.flatMap((ch) => ch.claims).slice(0, 4).map((c) => (
                <div key={c.id} style={{ border: `1px solid ${T.line}`, borderLeft: `3px solid ${evidenceColor(c.state)}`, padding: "14px 16px" }}>
                  <div style={{ ...mono, color: evidenceColor(c.state) }}>{c.state} · CHECKED {c.checkedAt}</div>
                  <p style={{ margin: "8px 0 0", fontSize: 14.5, lineHeight: 1.5 }}>{c.text}</p>
                  {c.limitation && <p style={{ margin: "6px 0 0", ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.6 }}>BOUNDARY · {c.limitation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tw" style={{ marginTop: 40, border: `1px solid ${T.line}` }}>
          {handoffs.map(([label, desc, to], i) => (
            <Link key={label} to={to} data-testid={`ls-handoff-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} style={{ display: "block", padding: "clamp(22px,3vw,32px)", textDecoration: "none", color: T.ink, borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
              <div style={{ fontWeight: 600, fontSize: "clamp(16px,1.8vw,20px)" }}>{label} →</div>
              <p style={{ marginTop: 8, fontSize: 14, color: T.dim, lineHeight: 1.5 }}>{desc}</p>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: 28, ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.7, maxWidth: 680 }}>
          MORE JOURNEYS — AMAZONIA AND OSLOFJORD — ARE DEFERRED TO A LATER GATE BY ORDER. THIS BUILD COMPLETES THE ORCA JOURNEY ONLY.
        </p>
      </Section>
    </PublicShell>
  );
}
