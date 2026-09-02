import { Link, useLocation, useParams } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section, Label } from "@/components/ui";
import { LivingSystemsIntelligencePanel } from "@/components/living/LivingSystemsIntelligencePanel";
import { returnHrefFromSearch } from "@/product/productContext";
import { LIVING_SYSTEM_ANCHORS, findAnchor, EVIDENCE_COLOR, type LivingSystemAnchor, type RelationshipStep } from "@/data/livingSystems";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".12em" };

function forwarder(search: string) {
  const returnHref = returnHrefFromSearch(search);
  const token = new URLSearchParams(search).get("returnTo");
  return (href: string) => (returnHref && token ? `${href}${href.includes("?") ? "&" : "?"}returnTo=${token}` : href);
}

function evidenceLabel(state: string) {
  if (state === "KNOWN") return "SUPPORTED";
  if (state === "INTERPRETED") return "INTERPRETED";
  return "NOT YET KNOWN";
}

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
                    <div style={{ ...mono, color: col, fontSize: 9.5 }}>{evidenceLabel(r.state)}</div>
                  </div>
                  <p style={{ margin: "10px 0 0", fontSize: 14.5, lineHeight: 1.55, color: T.ink }}>{r.relation}</p>
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ ...mono, color: T.dim, cursor: "pointer", letterSpacing: ".04em" }}>WHAT THIS DOES NOT PROVE</summary>
                    <p style={{ margin: "8px 0 0", color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{r.boundary}</p>
                  </details>
                  {r.source && (
                    r.sourceUrl
                      ? <a href={r.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, color: accent, display: "inline-block", marginTop: 10 }}>VIEW SOURCE ↗</a>
                      : <div style={{ ...mono, color: accent, marginTop: 10 }}>SOURCE · {r.source}</div>
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

function RelationshipDecisionUtility({ a }: { a: LivingSystemAnchor }) {
  const dependency = a.steps.find((step) => step.stage === "DEPENDS ON");
  const pressure = a.steps.find((step) => step.stage === "UNDER PRESSURE");
  const response = a.steps.find((step) => step.stage === "RESPONSE");
  const unresolved = a.steps.flatMap((step) => step.relationships).filter((r) => r.state !== "KNOWN");

  return (
    <section data-testid="ls-decision-utility" aria-label="Before you act" style={{ marginTop: "clamp(12px,2vw,24px)", border: `1px solid ${T.line}`, padding: "clamp(20px,3vw,30px)" }}>
      <div style={{ ...mono, color: a.accent }}>BEFORE YOU ACT</div>
      <h3 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(22px,2.4vw,32px)", lineHeight: 1.08, letterSpacing: "-.025em", marginTop: 10, maxWidth: 720 }}>
        See what depends on what before choosing what to do.
      </h3>
      <p style={{ marginTop: 12, color: T.dim, fontSize: 14.5, lineHeight: 1.6, maxWidth: 720 }}>
        A useful response depends on context. Start with the system, see what it relies on, check the pressure in that place, then look at what could help. Where the evidence is incomplete, we say so.
      </p>
      <div className="tw" style={{ marginTop: 22, borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>01 · WHAT IT DEPENDS ON</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {dependency ? `${dependency.relationships.length} relationship${dependency.relationships.length === 1 ? "" : "s"} help explain what keeps this system working.` : "We have not mapped the key dependencies yet."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>02 · WHAT IS CHANGING</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {pressure ? `${pressure.relationships.length} pressure relationship${pressure.relationships.length === 1 ? "" : "s"} are mapped here, each with its evidence and limits attached.` : "We have not mapped the relevant pressures yet."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: a.accent }}>03 · WHAT COULD HELP</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {response ? `${response.relationships.length} possible response path${response.relationships.length === 1 ? " is" : "s are"} shown. None is presented as a universal answer.` : "No response path is established yet."}
          </p>
        </div>
        <div style={{ padding: "18px", borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: unresolved.length ? "#8A6500" : T.acid }}>04 · WHAT WE STILL DON'T KNOW</div>
          <p style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5, color: T.ink }}>
            {unresolved.length ? `${unresolved.length} relationship${unresolved.length === 1 ? " still needs" : "s still need"} stronger evidence. They remain visible rather than being treated as fact.` : "The relationships in this bounded view are supported; the limits of the view still apply."}
          </p>
        </div>
      </div>
    </section>
  );
}

function AnchorJourney({ a, search, showReturn }: { a: LivingSystemAnchor; search: string; showReturn: boolean }) {
  const fwd = forwarder(search);
  const returnHref = returnHrefFromSearch(search);
  return (
    <div>
      <div style={{ ...mono, color: a.accent }}>{a.eyebrow}</div>
      <h2 style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(28px,3.6vw,46px)", letterSpacing: "-.035em", lineHeight: 1.0, marginTop: 10 }}>{a.journeyTitle}</h2>
      <p style={{ marginTop: 16, fontSize: "clamp(15px,1.5vw,18px)", color: T.dim, maxWidth: 660, lineHeight: 1.6 }}>{a.standfirst}</p>

      <div style={{ marginTop: 24 }}>
        {a.steps.map((s, i) => <RelationshipStepBlock key={s.stage} step={s} i={i} accent={a.accent} />)}
      </div>

      <RelationshipDecisionUtility a={a} />
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
          See how life depends on life.
        </h1>
        <p style={{ fontSize: "clamp(15px,1.6vw,18px)", color: T.dim, marginTop: 18, maxWidth: 680, lineHeight: 1.6 }}>
          A whale depends on prey, currents and healthy ocean habitat. A forest depends on water, soil, species and climate. Living Systems lets you follow those connections one by one — including what we know, what we are still interpreting and what remains uncertain.
        </p>

        <div className="ls-anchors" style={{ marginTop: "clamp(32px,4vw,52px)", borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
          {LIVING_SYSTEM_ANCHORS.map((a) => (
            <Link key={a.slug} to={fwd(`/living-systems/${a.slug}`)} className="ls-anchor" style={{ display: "block", padding: "clamp(20px,2.6vw,32px)", textDecoration: "none", color: T.ink, borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <span style={{ ...mono, color: a.accent }}>{a.index} · {a.kind}</span>
                <span style={{ ...mono, color: a.status === "LIVE" ? T.acid : "#8A6500", fontSize: 9 }}>{a.status === "LIVE" ? "REFERENCE JOURNEY" : "IN DEVELOPMENT"}</span>
              </div>
              <div style={{ fontFamily: T.display, fontWeight: 500, fontSize: "clamp(20px,2vw,26px)", letterSpacing: "-.02em", marginTop: 12 }}>{a.anchorLabel}</div>
              <p style={{ fontSize: 13.5, color: T.dim, marginTop: 8, lineHeight: 1.5, maxWidth: 340 }}>{a.standfirst.split(" — ")[0]}.</p>
            </Link>
          ))}
        </div>

        <div style={{ ...mono, color: T.blue, marginTop: "clamp(44px,6vw,72px)" }}>START WITH ORCA · REFERENCE JOURNEY</div>
        <div style={{ marginTop: 10 }}>
          <AnchorJourney a={orca} search={location.search} showReturn={false} />
        </div>

        <p style={{ marginTop: 32, color: T.dim, fontSize: 13.5, lineHeight: 1.65, maxWidth: 700 }}>
          Orca is the current reference journey. Amazonia, Oslofjorden and bee → pollination → food use the same relationship model and are still being developed. Their status remains visible on each journey.
        </p>
      </Section>
    </PublicShell>
  );
}

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
            <span style={{ ...mono, color: "#000", background: "#8A6500", padding: "5px 9px", fontSize: 10 }}>IN DEVELOPMENT</span>
            <p style={{ margin: "12px 0 0", color: T.dim, fontSize: 13.5, lineHeight: 1.6, maxWidth: 640 }}>
              This journey uses the same relationship model as Orca, but its evidence and depth are still being built out. Nothing unfinished is presented as complete.
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
