import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ORCA_INTERPRETATION, ORCA_OBSERVATION, ORCA_SOURCE_RECORD } from "@/data/truthSpine";
import { speciesBySlug } from "@/data/species";
import { T } from "@/styles/tokens";

const orca = speciesBySlug("orca")!;
const sourcePayload = ORCA_SOURCE_RECORD.payload as Record<string, unknown>;
const chapters = orca.narrativeChapters ?? [];

export default function OrcaGold() {
  return (
    <PublicShell>
      <section style={{ background: T.ink, color: "#fff", minHeight: "86svh", padding: "clamp(92px,12vw,166px) clamp(20px,5vw,72px) clamp(54px,7vw,94px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 54 }}>
        <div>
          <div style={{ ...mono, color: T.acid }}>LIFE / ORCA</div>
          <h1 style={{ ...display, margin: "clamp(44px,7vw,94px) 0 0", fontSize: "clamp(76px,14vw,210px)" }}>ORCA.</h1>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(280px,.7fr)", gap: "clamp(34px,7vw,100px)", alignItems: "end" }}>
          <div>
            <p style={{ margin: 0, maxWidth: 840, fontSize: "clamp(22px,2.8vw,37px)", lineHeight: 1.15, letterSpacing: "-.03em" }}>
              One animal can open a whole ocean: family, sound, prey, place and the pressures around them.
            </p>
            <p style={{ margin: "22px 0 0", maxWidth: 760, fontSize: 15.5, lineHeight: 1.6, color: "rgba(255,255,255,.68)" }}>
              This candidate starts with a real source-reported Orca record, then keeps observation, ecological context and interpretation separate.
            </p>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.28)", paddingTop: 16 }}>
            <div style={{ ...mono, color: "rgba(255,255,255,.58)" }}>DOCUMENTARY IMAGE</div>
            <p style={{ margin: "9px 0 0", fontSize: 13.5, lineHeight: 1.5, color: "rgba(255,255,255,.76)" }}>
              Held back from this candidate until one exact Orca asset has creator, licence, attribution and reuse conditions locked at asset level.
            </p>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={chapterStyle}>
          <div style={numberStyle}>01 / RECORD</div>
          <div>
            <div style={{ ...mono, color: T.blue }}>ONE REPORTED OBSERVATION</div>
            <h2 style={chapterTitle}>A point on a map is evidence of a reported observation — not a live whale.</h2>
            <p style={bodyStyle}>{ORCA_INTERPRETATION.text}</p>
            <div className="orca-record-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${T.ink}`, borderLeft: `1px solid ${T.ink}`, marginTop: 30 }}>
              {[
                ["OBSERVED", ORCA_OBSERVATION.occurredAt ?? "DATE NOT SUPPLIED"],
                ["PLACE", `${String(sourcePayload.locality ?? "SOURCE LOCALITY")} · ${String(sourcePayload.stateProvince ?? "")}`],
                ["COORDINATES", `${ORCA_OBSERVATION.latitude.toFixed(5)}, ${ORCA_OBSERVATION.longitude.toFixed(5)}`],
                ["RETRIEVED", ORCA_SOURCE_RECORD.retrievedAt.slice(0, 10)],
              ].map(([k, v]) => (
                <div key={k} style={{ minHeight: 150, padding: 18, borderRight: `1px solid ${T.ink}`, borderBottom: `1px solid ${T.ink}` }}>
                  <div style={{ ...mono, color: T.dim }}>{k}</div>
                  <div style={{ marginTop: 18, fontSize: 18, lineHeight: 1.35 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 20, border: `1px solid ${T.line}` }}>
              <div style={{ ...mono, color: T.blue }}>SOURCE + RIGHTS</div>
              <p style={{ margin: "12px 0 0", lineHeight: 1.55, fontSize: 14 }}>
                GBIF occurrence {ORCA_SOURCE_RECORD.sourceRecordId}. Attribution: {ORCA_SOURCE_RECORD.attribution}. Data licence: {ORCA_SOURCE_RECORD.licence}. Source flags include coordinate rounding.
              </p>
              <a href={ORCA_SOURCE_RECORD.sourceUrl} target="_blank" rel="noreferrer" style={sourceLink}>Open the exact source record ↗</a>
            </div>
          </div>
        </section>

        <section style={chapterStyle}>
          <div style={numberStyle}>02 / RELATIONSHIPS</div>
          <div>
            <div style={{ ...mono, color: T.blue }}>FROM ANIMAL TO SYSTEM</div>
            <h2 style={chapterTitle}>The observation is small. The relationships around the animal are not.</h2>
            <div style={{ marginTop: 34, display: "grid", gap: 18 }}>
              {chapters.slice(0, 3).map((chapter, index) => (
                <article key={chapter.id} style={{ padding: "28px 0", borderTop: `1px solid ${T.line}` }}>
                  <div style={{ ...mono, color: T.blue }}>0{index + 1} / {chapter.eyebrow.replace(/^WH4LES_ \d+ · /, "")}</div>
                  <h3 style={{ ...display, fontSize: "clamp(32px,4.8vw,62px)", margin: "16px 0 0" }}>{chapter.title}</h3>
                  <p style={{ ...bodyStyle, marginTop: 18 }}>{chapter.summary}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 22 }}>
                    {chapter.claims.map((claim) => (
                      <div key={claim.id} style={{ padding: 18, border: `1px solid ${T.line}` }}>
                        <div style={{ ...mono, color: claim.state === "KNOWN" ? "#0B7A39" : claim.state === "UNKNOWN" ? "#8A6500" : T.blue }}>{claim.state}</div>
                        <strong style={{ display: "block", marginTop: 10, fontSize: 17 }}>{claim.label}</strong>
                        <p style={{ margin: "9px 0 0", fontSize: 13.5, lineHeight: 1.55 }}>{claim.text}</p>
                        {claim.limitation && <p style={{ margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.5, color: T.dim }}>{claim.limitation}</p>}
                        {claim.sourceUrl && <a href={claim.sourceUrl} target="_blank" rel="noreferrer" style={{ ...sourceLink, marginTop: 13 }}>{claim.sourceLabel ?? "Open source"} ↗</a>}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={chapterStyle}>
          <div style={numberStyle}>03 / PRESSURE</div>
          <div>
            <div style={{ ...mono, color: T.red }}>CONTEXT, NOT DIAGNOSIS</div>
            <h2 style={chapterTitle}>Threats are real. Their relevance depends on the population and place.</h2>
            <p style={bodyStyle}>{chapters[3]?.summary}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12, marginTop: 26 }}>
              {chapters[3]?.claims.map((claim) => (
                <div key={claim.id} style={{ padding: 20, border: `1px solid ${T.line}` }}>
                  <div style={{ ...mono, color: claim.state === "KNOWN" ? "#0B7A39" : "#8A6500" }}>{claim.state}</div>
                  <h3 style={{ margin: "12px 0 0", fontSize: 22 }}>{claim.label}</h3>
                  <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55 }}>{claim.text}</p>
                  {claim.sourceUrl && <a href={claim.sourceUrl} target="_blank" rel="noreferrer" style={sourceLink}>{claim.sourceLabel ?? "Open source"} ↗</a>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ ...chapterStyle, borderBottom: 0 }}>
          <div style={numberStyle}>04 / RESPONSE</div>
          <div>
            <div style={{ ...mono, color: T.acid }}>WHAT COMES NEXT</div>
            <h2 style={chapterTitle}>A credible response starts by knowing which animal, population, place and pressure the evidence actually supports.</h2>
            <p style={bodyStyle}>
              4PLANET does not currently claim a universal Orca intervention or an operational Orca Impact pathway. The next credible step is to connect population- and place-specific evidence to responsible actors and bounded responses.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
              <Link to="/atlas?entity=taxon:gbif:2440483&journey=orca-gbif" style={primaryButton}>See the same entity in ATLAS →</Link>
              <Link to="/impact" style={secondaryButton}>See Impact pathways in development</Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`@media(max-width:820px){.orca-record-grid{grid-template-columns:1fr 1fr!important}}@media(max-width:620px){.orca-record-grid{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const chapterStyle: CSSProperties = { display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "clamp(20px,4vw,56px)", padding: "clamp(70px,9vw,128px) 0", borderBottom: `1px solid ${T.line}` };
const numberStyle: CSSProperties = { ...mono, color: T.dim, paddingTop: 7 };
const chapterTitle: CSSProperties = { ...display, fontSize: "clamp(40px,6vw,82px)", margin: "18px 0 0", maxWidth: 1060 };
const bodyStyle: CSSProperties = { margin: "24px 0 0", maxWidth: 860, fontSize: "clamp(16px,1.6vw,20px)", lineHeight: 1.62 };
const sourceLink: CSSProperties = { ...mono, display: "inline-block", marginTop: 16, color: T.blue, textDecoration: "none" };
const primaryButton: CSSProperties = { display: "inline-flex", padding: "12px 16px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: CSSProperties = { ...primaryButton, background: "#fff", color: T.ink };
