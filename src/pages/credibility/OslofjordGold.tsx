import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import {
  ActionPathwayCard,
  ActorSolutionGrid,
  LifeEvidenceGrid,
  PressureEvidenceGrid,
  SignalTimeline,
} from "@/components/place/PlaceEvidence";
import {
  OSLOFJORD_ACTIONS,
  OSLOFJORD_ACTORS,
  OSLOFJORD_LIFE,
  OSLOFJORD_PRESSURES,
  OSLOFJORD_SIGNALS,
  OSLOFJORD_SOLUTIONS,
  oslofjordSourceById,
} from "@/data/oslofjordenProof";
import { OSLOFJORD_HERO_MEDIA } from "@/data/oslofjordenMedia";
import { T } from "@/styles/tokens";

export default function OslofjordGold() {
  const media = OSLOFJORD_HERO_MEDIA;
  const life = OSLOFJORD_LIFE.slice(0, 4);
  const pressures = OSLOFJORD_PRESSURES.slice(0, 3);
  const signals = OSLOFJORD_SIGNALS.slice(0, 3);
  const actors = OSLOFJORD_ACTORS.slice(0, 3);
  const solutions = OSLOFJORD_SOLUTIONS.slice(0, 3);
  const action = OSLOFJORD_ACTIONS[0];

  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", position: "relative", overflow: "hidden", background: T.ink, color: "#fff" }}>
        <picture>
          {media.mobileAssetUrl && <source media="(max-width:760px)" srcSet={media.mobileAssetUrl} />}
          <img src={media.assetUrl} alt={media.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 52%" }} />
        </picture>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.14),rgba(0,0,0,.88))" }} />
        <div style={{ position: "relative", minHeight: "88svh", padding: "clamp(94px,12vw,166px) clamp(20px,5vw,72px) clamp(38px,6vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 48 }}>
          <div style={{ ...mono, color: "#fff" }}>PLACE / NORWAY</div>
          <div>
            <h1 style={{ ...display, fontSize: "clamp(70px,12vw,176px)", margin: 0 }}>OSLO<br />FJORDEN.</h1>
            <p style={{ margin: "24px 0 0", maxWidth: 850, fontSize: "clamp(21px,2.5vw,33px)", lineHeight: 1.18, letterSpacing: "-.028em" }}>
              A fjord is not one score. It is many living systems changing across different places, times and pressures.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 25, alignItems: "center" }}>
              <span style={{ ...mono, color: T.acid }}>REAL OSLOFJORD PHOTO · 17 AUG 2022</span>
              <a href={media.sourcePage} target="_blank" rel="noreferrer" style={{ ...mono, color: "#fff", textDecoration: "none" }}>{media.creator} · CC0 · SOURCE ↗</a>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={chapter}>
          <div style={number}>01 / WHAT WE KNOW</div>
          <div>
            <div style={{ ...mono, color: T.blue }}>LIFE / SOURCE-BOUNDED EVIDENCE</div>
            <h2 style={heading}>Start with the life that has actually been measured.</h2>
            <p style={body}>
              Surveys and source records give partial views of the fjord. Each result keeps its period, geographic scope and limitation visible; none is treated as a complete picture of Oslofjorden.
            </p>
            <LifeEvidenceGrid records={life} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={number}>02 / PRESSURES</div>
          <div>
            <div style={{ ...mono, color: T.red }}>MULTIPLE PRESSURES / DIFFERENT EVIDENCE</div>
            <h2 style={heading}>There is no single cause of “the Oslofjord problem”.</h2>
            <p style={body}>
              Nutrient inputs, oxygen stress, fishing pressure, habitat degradation and coastal development belong to different evidence layers. A model, a measurement and an ecological observation are not the same thing.
            </p>
            <PressureEvidenceGrid records={pressures} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={number}>03 / CHANGE</div>
          <div>
            <div style={{ ...mono, color: T.blue }}>WHAT IS CHANGING NOW</div>
            <h2 style={heading}>Follow decisions and new evidence without confusing them with ecological outcomes.</h2>
            <p style={body}>
              Public plans, monitoring updates and new measurements can change what we know or what institutions intend to do. They do not prove that the fjord has recovered.
            </p>
            <SignalTimeline records={signals} sourceById={oslofjordSourceById} />
          </div>
        </section>

        <section style={chapter}>
          <div style={number}>04 / RESPONSES</div>
          <div>
            <div style={{ ...mono, color: T.acid }}>ACTORS + RESPONSES</div>
            <h2 style={heading}>Connect pressures to people and responses — without calling actors partners or assuming effect.</h2>
            <p style={body}>
              These are relevant institutions and response categories in the evidence base. Their presence here is context, not an affiliation, endorsement or 4PLANET partnership.
            </p>
            <ActorSolutionGrid actors={actors} solutions={solutions} sourceById={oslofjordSourceById} />
          </div>
        </section>

        {action && (
          <section style={chapter}>
            <div style={number}>05 / DO SOMETHING</div>
            <div>
              <div style={{ ...mono, color: T.acid }}>OFFICIAL PUBLIC PROCESS</div>
              <h2 style={heading}>When a real public action exists, link to the responsible actor.</h2>
              <p style={body}>
                4PLANET does not count opening an official process, consultation or information route as ecological impact. It is simply a clear next action where one exists.
              </p>
              <ActionPathwayCard action={action} sourceById={oslofjordSourceById} />
            </div>
          </section>
        )}

        <section style={{ ...chapter, borderBottom: 0 }}>
          <div style={number}>06 / GO DEEPER</div>
          <div>
            <div style={{ ...mono, color: T.blue }}>SAME PLACE / MORE CONTEXT</div>
            <h2 style={heading}>Open the map when spatial context becomes useful.</h2>
            <p style={body}>
              ATLAS keeps waterbody, representative point, source-area and other geometries separate instead of inventing one universal Oslofjord boundary.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link to="/atlas?m=OCE4N&journey=oslofjorden&z=6.40&c=10.62,59.67" style={primaryButton}>Open Oslofjorden in ATLAS →</Link>
              <Link to="/species?journey=oslofjorden" style={secondaryButton}>Explore species</Link>
            </div>
          </div>
        </section>
      </main>

      <style>{`@media(max-width:720px){.cred-oslo-chapter{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const chapter: CSSProperties = { display: "grid", gridTemplateColumns: "110px minmax(0,1fr)", gap: "clamp(20px,4vw,56px)", padding: "clamp(72px,9vw,128px) 0", borderBottom: `1px solid ${T.line}` };
const number: CSSProperties = { ...mono, color: T.dim, paddingTop: 7 };
const heading: CSSProperties = { ...display, fontSize: "clamp(40px,6vw,82px)", margin: "18px 0 0", maxWidth: 1080 };
const body: CSSProperties = { maxWidth: 870, margin: "24px 0 32px", fontSize: "clamp(16px,1.6vw,20px)", lineHeight: 1.62 };
const primaryButton: CSSProperties = { display: "inline-flex", padding: "12px 16px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: CSSProperties = { ...primaryButton, background: "#fff", color: T.ink };
