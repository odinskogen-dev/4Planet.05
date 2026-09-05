import { Link, useLocation, useParams } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label } from "@/components/ui";
import { LivingSystemsIntelligencePanel } from "@/components/living/LivingSystemsIntelligencePanel";
import { returnHrefFromSearch } from "@/product/productContext";
import { LIVING_SYSTEM_ANCHORS, findAnchor, EVIDENCE_COLOR, type LivingSystemAnchor, type RelationshipStep } from "@/data/livingSystems";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em" };

/* Forward captured ATLAS returnTo onto the next hop so the journey can return. */
function forwarder(search: string) {
  const returnHref = returnHrefFromSearch(search);
  const token = new URLSearchParams(search).get("returnTo");
  return (href: string) => (returnHref && token ? `${href}${href.includes("?") ? "&" : "?"}returnTo=${token}` : href);
}

/* ── Progressive relationship reveal — the reusable core ── */
function RelationshipStepBlock({ step, i, accent }: { step: RelationshipStep; i: number; accent: string }) {
  return (
    <div style={{ borderTop: `1px solid ${T.line}`, padding: "clamp(26px,3.6vw,44px) 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "clamp(14px,3vw,36px)" }}>
        <div style={{ ...mono, color: accent }}>0{i + 1}</div>
        <div>
          <div style={{ ...mono, color: accent, marginBottom: 10 }}>{step.stage}</div>
          <h3 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(22px,2.6vw,34px)", lineHeight: 1.04, letterSpacing: "-.03em", maxWidth: 640 }}>{step.intro}</h3>
          <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {step.relationships.map((r) => {
              const col = EVIDENCE_COLOR[r.state];
              return (
                <div key={r.to.id} style={{ border: `1px solid ${T.line}`, borderLeft: `3px solid ${col}`, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 500, fontSize: "clamp(15px,1.5vw,18px)", letterSpacing: "-.01em" }}>
                      <span style={{ ...mono, color: T.dim, fontSize: 9.5, marginRight: 8 }}>{r.to.kind}</span>{r.to.label}
                    </div>
                    <div style={{ ...mono, color: col, fontSize: 9.5 }}>{r.state}</div>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: T.ink }}>{r.relation}</p>
                  <p style={{ margin: "8px 0 0", ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.6 }}>BOUNDARY · {r.boundary}</p>
                  {r.source && (
                    r.sourceUrl
                      ? <a href={r.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, color: accent, display: "inline-block", marginTop: 8 }}>{r.source} ↗</a>
                      : <div style={{ ...mono, color: accent, marginTop: 8 }}>{r.source}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Decision utility — reusable, source-preserving, and deliberately non-prescriptive. ──
   This converts the relationship graph into a practical reading sequence without
   inventing a recommendation. It only reflects the evidence states and boundaries
   already present in the anchor. */
function RelationshipDecisionUtility({ a }: { a: LivingSystemAnchor }) {
  const dependency = a.steps.find((step) => step.stage === "DEPENDS ON");
  const pressure = a.steps.find((step) => step.stage === "UNDER PRESSURE");
  const response = a.steps.find((step) => step.stage === "RESPONSE");
  const unresolved = a.steps.flatMap((step) => step.relationships).filter((r) => r.state !== "KNOWN");

  return (
    <section data-testid="ls-decision-utility" aria-label="Decision utility" style={{ marginTop: "clamp(12px,2vw,24px)", border: `1px solid ${T.line}`, padding: "clamp(20px,3vw,30px)" }}>
      <div style={{ ...mono, color: a.accent }}>USE THE SYSTEM · BEFORE ACTING</div>
      <h3 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(22px,2.4vw,32px)", lineHeight: 1.08, letterSpacing: "-.025em", marginTop: 10, maxWidth: 720 }}>
        Do not jump from a species or place straight to a solution.
      </h3>
      <p style={{ marginTop: 12, color: T.dim, fontSize: 14.5, lineHeight: 1.6, maxWidth: 720 }}>
        Read the chain in order: identify the exact system, check what it depends on, verify the pressure in that context, then test whether a response actually fits. Unknown or interpreted links stay visible and lower decision confidence rather than being treated as facts.
      </p>
      <div className="tw" style={{ marginTop: 22, borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>01 · DEPENDENCY CHECK</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {dependency ? `${dependency.relationships.length} bounded relationship${dependency.relationships.length === 1 ? "" : "s"} describe what this system depends on.` : "Dependency evidence is not yet mapped."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>02 · PRESSURE CHECK</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {pressure ? `${pressure.relationships.length} pressure relationship${pressure.relationships.length === 1 ? "" : "s"} are mapped; their evidence state and boundary remain attached.` : "Pressure evidence is not yet mapped."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>03 · RESPONSE GATE</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {response ? `${response.relationships.length} response path${response.relationships.length === 1 ? "" : "s"} are shown, but the product does not convert them into a universal recommendation.` : "No response path is established yet."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: unresolved.length ? "#8A6500" : T.acid }}>04 · CONFIDENCE</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {unresolved.length ? `${unresolved.length} relationship${unresolved.length === 1 ? " is" : "s are"} INTERPRETED or UNKNOWN. Treat the chain as decision support, not certainty.` : "All mapped links in this bounded view are KNOWN; scope boundaries still apply."}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── The reusable anchor journey (used inline for Orca + standalone per anchor) ── */
function AnchorJourney({ a, search, showReturn }: { a: LivingSystemAnchor; search: string; showReturn: boolean }) {
  const fwd = forwarder(search);
  const returnHref = returnHrefFromSearch(search);
  return (
    <div>
      <div style={{ ...mono, color: a.accent }}>{a.eyebrow}</div>
      {/* EXACT title text preserved for the live Orca journey (E2E + human continuity). */}
      <h2 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.035em", lineHeight: 1.0, marginTop: 10 }}>{a.journeyTitle}</h2>
      <p style={{ marginTop: 16, fontSize: "clamp(15px,1.5vw,18px)", color: T.dim, maxWidth: 660, lineHeight: 1.6 }}>{a.standfirst}</p>

      <div style={{ marginTop: 24 }}>
        {a.steps.map((s, i) => <RelationshipStepBlock key={s.stage} step={s} i={i} accent={a.accent} />)}
      </div>

      <RelationshipDecisionUtility a={a} />

      {/* Recovered LSI depth is progressive disclosure under the clean journey.
          Only anchors with recovered intelligence (Amazonia + Pollination/Food)
          render this panel; Orca/Oslofjord remain unchanged until their donor
          intelligence is explicitly recovered and source-bounded. */}
      <LivingSystemsIntelligencePanel anchorSlug={a.slug} accent={a.accent} />

      <div className="tw" style={{ marginTop: 36, border: `1px solid ${T.line}` }}>
        {a.handoffs.map((h, i) => (
          <Link key={h.label}
            to={fwd(h.to)}
            data-testid={h.testid ?? `ls-handoff-${h.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
            style={{ display: "block", padding: "clamp(20px,3vw,30px)", textDecoration: "none", color: T.ink, borderLeft: i % 2 ? `1px solid ${T.line}` : "none", borderTop: i >= 2 ? `1px solid ${T.line}` : "none" }}>
            <div style={{ fontWeight: 500, fontSize: "clamp(15px,1.6vw,19px)" }}>{h.label} →</div>
            <p style={{ marginTop: 8, fontSize: 14, color: T.dim, lineHeight: 1.5 }}>{h.desc}</p>
          </Link>
        ))}
      </div>
      {showReturn && returnHref && (
        <div style={{ marginTop: 24 }}>
          <Link to={returnHref} style={{ ...mono, color: a.accent }}>← BACK TO OBSERVATION IN ATLAS</Link>
        </div>
      )}
    </div>
  );
}

/* ── LIVING SYSTEMS home — features the live Orca journey inline + anchor index ── */
export function LivingSystems() {
  const location = useLocation();
  const returnHref = returnHrefFromSearch(location.search);
  const orca = findAnchor("orca")!;
  const fwd = forwarder(location.search);
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        {returnHref && (
          <Link to={returnHref} data-testid="return-to-atlas" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: T.blue, padding: "10px 14px", textDecoration: "none", marginBottom: 20 }}>
            ← BACK TO OBSERVATION IN ATLAS
          </Link>
        )}
        <Label color={T.blue} style={{ marginBottom: 16 }}>4PLANET_ LIVING SYSTEMS_</Label>
        <h1 style={{ fontWeight: 500, color: T.ink, fontSize: "clamp(30px,3.4vw,46px)", letterSpacing: "-.035em", lineHeight: 1.05, maxWidth: 860 }}>
          Understand how life, places and human systems depend on one another.
        </h1>
        <p style={{ fontSize: "clamp(15px,1.6vw,18px)", color: T.dim, marginTop: 18, maxWidth: 680, lineHeight: 1.6 }}>
          ATLAS shows what is here, where and when. Living Systems reads the same shared planet as relationships —
          revealed step by step, each one labelled by what is known, interpreted or unknown. Start from a species, a
          place or a system.
        </p>

        {/* Anchor index — proves the reusable model across four starting points. */}
        <div className="ls-anchors" style={{ marginTop: "clamp(32px,4vw,52px)", borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
          {LIVING_SYSTEM_ANCHORS.map((a) => (
            <Link key={a.slug} to={fwd(`/living-systems/${a.slug}`)} className="ls-anchor" style={{ display: "block", padding: "clamp(20px,2.6vw,32px)", textDecoration: "none", color: T.ink, borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ ...mono, color: a.accent }}>{a.index} · {a.kind} ANCHOR</span>
                <span style={{ ...mono, color: a.status === "LIVE" ? T.acid : "#8A6500", fontSize: 9 }}>{a.status === "LIVE" ? "LIVE" : "IN DEVELOPMENT"}</span>
              </div>
              <div style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(20px,2vw,26px)", letterSpacing: "-.02em", marginTop: 12 }}>{a.anchorLabel}</div>
              <p style={{ fontSize: 13.5, color: T.dim, marginTop: 8, lineHeight: 1.5, maxWidth: 340 }}>{a.standfirst.split(" — ")[0]}.</p>
            </Link>
          ))}
        </div>

        {/* The live journey, inline (Orca) — keeps journey contracts + human continuity. */}
        <div style={{ ...mono, color: T.blue, marginTop: "clamp(44px,6vw,72px)" }}>GUIDED JOURNEY · 01 · LIVE</div>
        <div style={{ marginTop: 10 }}>
          <AnchorJourney a={orca} search={location.search} showReturn={false} />
        </div>

        <p style={{ marginTop: 32, ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.7, maxWidth: 700 }}>
          THE ORCA JOURNEY IS LIVE AND EVIDENCE-BACKED. AMAZONIA, OSLOFJORDEN AND BEE → POLLINATION → FOOD USE THE SAME
          REUSABLE MODEL AND ARE IN DEVELOPMENT — OPEN THEM ABOVE TO SEE THE STRUCTURE.
        </p>
      </Section>
    </PublicShell>
  );
}

/* ── Standalone anchor journey page ── */
export function LivingSystemJourney() {
  const { slug } = useParams();
  const location = useLocation();
  const a = slug ? findAnchor(slug) : undefined;
  if (!a) return <NotFound />;
  const returnHref = returnHrefFromSearch(location.search);
  const fwd = forwarder(location.search);
  return (
    <PublicShell>
      <Section pad="clamp(48px,7vw,96px)">
        {returnHref && (
          <Link to={returnHref} data-testid="return-to-atlas" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 11, letterSpacing: ".12em", color: "#fff", background: a.accent, padding: "10px 14px", textDecoration: "none", marginBottom: 20 }}>
            ← BACK TO OBSERVATION IN ATLAS
          </Link>
        )}
        <Link to={fwd("/living-systems")} style={{ ...mono, color: a.accent }}>← LIVING SYSTEMS</Link>
        {a.status !== "LIVE" && (
          <div style={{ marginTop: 16 }}>
            <span style={{ ...mono, color: "#000", background: "#8A6500", padding: "5px 9px", fontSize: 10 }}>IN DEVELOPMENT · STRUCTURE PREVIEW</span>
            <p style={{ margin: "12px 0 0", ...mono, color: T.dim, letterSpacing: ".04em", lineHeight: 1.6, maxWidth: 640 }}>
              This anchor uses the same reusable relationship model as the live Orca journey. Its relationships are shown
              at honest evidence states; the journey is still being built out.
            </p>
          </div>
        )}
        <div style={{ marginTop: 24 }}>
          <AnchorJourney a={a} search={location.search} showReturn />
        </div>
      </Section>
    </PublicShell>
  );
}
