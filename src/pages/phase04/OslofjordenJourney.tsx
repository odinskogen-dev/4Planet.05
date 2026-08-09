import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ProvenanceBar } from "@/components/phase04/ProvenanceBar";
import { DataStatePanel } from "@/components/phase04/DataStatePanel";
import {
  ActionPathwayCard,
  ActorSolutionGrid,
  LifeEvidenceGrid,
  PressureEvidenceGrid,
  SignalTimeline,
} from "@/components/place/PlaceEvidence";
import { PlaceRelationEvidence, ScientificDatasetEvidence } from "@/components/place/ScientificDatasetEvidence";
import { OslofjordRelationshipDeepening } from "@/components/place/OslofjordRelationshipDeepening";
import {
  OSLOFJORD_ACTIONS,
  OSLOFJORD_ACTORS,
  OSLOFJORD_LIFE,
  OSLOFJORD_PLACE,
  OSLOFJORD_PRESSURES,
  OSLOFJORD_SIGNALS,
  OSLOFJORD_SOLUTIONS,
  oslofjordSourceById,
} from "@/data/oslofjordenProof";
import { OSLOFJORD_HERO_MEDIA } from "@/data/oslofjordenMedia";
import { OSLOFJORD_PLACE_RELATIONS } from "@/data/oslofjordenPlaces";
import { OSLOFJORD_SCIENTIFIC_DATASETS, VANNMILJO_LIFE_SOURCE } from "@/data/oslofjordenDatasets";
import { OSLOFJORD_PRIMARY_WATERBODY_ID } from "@/data/oslofjordenSpatial";
import { useFollows } from "@/planet/follow";

const label: CSSProperties = {
  fontFamily: "'Fragment Mono',ui-monospace,monospace",
  fontSize: 10.5,
  letterSpacing: ".1em",
  textTransform: "uppercase",
};
const title: CSSProperties = {
  fontFamily: "'Instrument Sans','DM Sans',sans-serif",
  fontWeight: 500,
  letterSpacing: "-.05em",
  lineHeight: .94,
};
const chapter: CSSProperties = { display: "grid", gridTemplateColumns: "120px minmax(0,1fr)", gap: "clamp(20px,4vw,56px)", padding: "clamp(70px,9vw,130px) 0", borderBottom: "1px solid rgba(10,10,10,.22)" };
const chapterNo: CSSProperties = { ...label, color: "rgba(10,10,10,.52)", paddingTop: 7 };
const body: CSSProperties = { maxWidth: 880, fontSize: "clamp(16px,1.5vw,20px)", lineHeight: 1.6, margin: "24px 0" };
const linkButton: CSSProperties = { display: "inline-flex", padding: "11px 14px", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", textDecoration: "none", fontSize: 13 };

function StateTag({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "red" | "green" | "dark" }) {
  const color = tone === "red" ? "#FF4D22" : tone === "green" ? "#0B7A39" : tone === "dark" ? "#0A0A0A" : "#2E2EFF";
  return <span style={{ ...label, color, border: `1px solid ${color}`, padding: "7px 9px", display: "inline-flex" }}>{children}</span>;
}

function SourceRegister() {
  const sources = useMemo(() => {
    const ids = new Set<string>();
    OSLOFJORD_LIFE.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_PRESSURES.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_SIGNALS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_ACTORS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_SOLUTIONS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    OSLOFJORD_ACTIONS.forEach((record) => record.sourceIds.forEach((id) => ids.add(id)));
    return [...ids].map(oslofjordSourceById);
  }, []);
  return (
    <div style={{ borderTop: "1px solid rgba(10,10,10,.24)" }}>
      {sources.map((source, i) => (
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer" style={{ display: "grid", gridTemplateColumns: "54px minmax(0,1fr) minmax(210px,.45fr)", gap: 18, padding: "14px 0", borderBottom: "1px solid rgba(10,10,10,.15)", color: "#0A0A0A", textDecoration: "none" }}>
          <span style={label}>{String(i + 1).padStart(2, "0")}</span>
          <span><span style={{ display: "block", fontWeight: 600 }}>{source.label}</span><span style={{ display: "block", fontSize: 12.5, marginTop: 4, color: "rgba(10,10,10,.6)" }}>{source.scope}</span></span>
          <span style={{ ...label, textAlign: "right", color: "#2E2EFF" }}>{source.publisher} ↗</span>
        </a>
      ))}
    </div>
  );
}

export default function OslofjordenJourney() {
  const place = OSLOFJORD_PLACE;
  const media = OSLOFJORD_HERO_MEDIA;
  const innerOslofjord = OSLOFJORD_PLACE_RELATIONS[0];
  const { following, toggle } = useFollows();
  const followed = following(place.id);
  const mainAction = OSLOFJORD_ACTIONS[0];
  const atlasUrl = "/atlas?m=OCE4N&journey=oslofjorden&z=6.40&c=10.62,59.67";
  const speciesUrl = `/species?place=${encodeURIComponent(place.id)}&journey=oslofjorden`;

  return (
    <PublicShell>
      <section style={{ minHeight: "88svh", position: "relative", background: "#0A0A0A", color: "#fff", overflow: "hidden" }}>
        <picture>
          {media.mobileAssetUrl && <source media="(max-width:760px)" srcSet={media.mobileAssetUrl} />}
          <img src={media.assetUrl} alt={media.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 52%" }} />
        </picture>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.16),rgba(0,0,0,.88))" }} />
        <div style={{ position: "relative", minHeight: "88svh", padding: "clamp(90px,12vw,170px) clamp(20px,5vw,72px) clamp(36px,6vw,72px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
            <div style={{ ...label, color: "#fff" }}>PLACE JOURNEY 01 / OSLOFJORDEN / SOURCE-GROUNDED CANDIDATE</div>
            <div style={{ ...label, color: "#3AE86F" }}>SPATIAL + LOCAL LIFE PROOF / HUMAN VALIDATION NOT RUN</div>
          </div>
          <div>
            <h1 style={{ ...title, fontSize: "clamp(68px,12vw,178px)", margin: 0 }}>OSLO<br />FJORDEN.</h1>
            <p style={{ maxWidth: 820, fontSize: "clamp(20px,2.4vw,31px)", lineHeight: 1.18, letterSpacing: "-.025em", margin: "24px 0 0" }}>A real place, viewed through real surveys, local source records, living relationships, pressures, decisions and the evidence needed to understand what changes next.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24, alignItems: "center" }}>
              <span style={{ ...label, color: "#3AE86F" }}>REAL OSLOFJORD PHOTO / 17 AUG 2022</span>
              <a href={media.sourcePage} target="_blank" rel="noreferrer" style={{ ...label, color: "rgba(255,255,255,.9)", textDecoration: "none" }}>{media.creator} / CC0 / SOURCE ↗</a>
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)" }}>
        <section style={chapter}>
          <div style={chapterNo}>01 / PLACE</div>
          <div>
            <StateTag>ROLE-SPECIFIC SPATIAL TRUTH</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>One identity. Different geometries for different questions.</h2>
            <p style={body}>Marine Regions MRGID 3379 remains the persistent identity for Oslofjorden. It is not promoted to a universal polygon. The candidate now also admits one official Vann-Nett coastal-waterbody polygon and one Vannmiljø WaterBodyID query contract for their declared jobs only.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", borderTop: "1px solid rgba(10,10,10,.24)", borderLeft: "1px solid rgba(10,10,10,.24)", margin: "26px 0 18px" }}>
              {[
                ["IDENTITY", `${place.sourceRecordId} · ${place.kind}`],
                ["IDENTITY SOURCE", place.source.publisher],
                ["REPRESENTATIVE POINT", `${place.representativePoint?.lat.toFixed(4)}, ${place.representativePoint?.lng.toFixed(4)}`],
                ["BIODIVERSITY QUERY", `VANNMILJØ / WATERBODY ${OSLOFJORD_PRIMARY_WATERBODY_ID}`],
                ["WATERBODY STATUS AREA", `VANN-NETT / ${OSLOFJORD_PRIMARY_WATERBODY_ID}`],
                ["DISPLAY AREA", "NOT SELECTED"],
                ["FISHING AREA", "SOURCE EXISTS / NOT INGESTED"],
              ].map(([k, v]) => <div key={k} style={{ borderRight: "1px solid rgba(10,10,10,.24)", borderBottom: "1px solid rgba(10,10,10,.24)", padding: 14 }}><div style={{ ...label, color: "rgba(10,10,10,.52)" }}>{k}</div><div style={{ fontSize: 13.5, lineHeight: 1.4, marginTop: 7 }}>{v}</div></div>)}
            </div>
            <ProvenanceBar value={{ state: "SOURCE", actor: place.source.publisher, source: place.source.url, time: `Checked ${place.source.checkedAt}`, limitation: place.identityLimitation }} />
            <PlaceRelationEvidence relation={innerOslofjord} />
            <div style={{ marginTop: 18 }}><DataStatePanel state="SOURCE AVAILABLE" title="A real source-area contract is now wired — without pretending it defines the whole fjord." detail={`Vann-Nett waterbody ${OSLOFJORD_PRIMARY_WATERBODY_ID} is used as a WATERBODY-STATUS area. Vannmiljø records can be requested by that source's own WaterBodyID attachment. Display, regulation and semantic identity remain separate.`} action={<Link to={atlasUrl} style={linkButton}>Open same place context in ATLAS →</Link>} /></div>
            <p style={{ ...body, fontSize: 13.5, color: "rgba(10,10,10,.62)" }}>ATLAS still opens its camera around the Marine Regions representative point. The shared Oslofjord context panel exposes the official waterbody role separately; it does not turn that polygon into a universal fjord outline.</p>
          </div>
        </section>

        <section style={chapter}>
          <div style={chapterNo}>02 / LIFE</div>
          <div style={{ minWidth: 0 }}>
            <StateTag tone="green">SURVEYS + DATASETS + LOCAL SOURCE RECORDS</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Life is no longer a placeholder — and it is not collapsed into one data type.</h2>
            <p style={body}>Bounded evidence now spans fish surveys, a research-trawl series, eelgrass context, microscopic-life datasets, exact historical GBIF records and a runtime Vannmiljø adapter. Each source keeps its own scope, time, rights state, precision and limitations.</p>
            <LifeEvidenceGrid records={OSLOFJORD_LIFE} sourceById={oslofjordSourceById} />
            <div style={{ marginTop: 28 }}>
              <div style={{ ...label, color: "#0B7A39", marginBottom: 10 }}>SOURCE-BOUNDED DATASETS + RUNTIME LOCAL EVIDENCE</div>
              <h3 style={{ ...title, fontSize: "clamp(32px,4vw,58px)", margin: "0 0 22px" }}>From microscopic archives to official local registrations.</h3>
              <ScientificDatasetEvidence records={OSLOFJORD_SCIENTIFIC_DATASETS} />
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}><Link to={speciesUrl} style={linkButton}>Open Oslofjord context in SPECIES →</Link><Link to={atlasUrl} style={{ ...linkButton, background: "#fff", color: "#0A0A0A" }}>Open Oslofjord context in ATLAS →</Link></div>
            <p style={{ ...body, fontSize: 13.5, color: "rgba(10,10,10,.62)" }}>The Vannmiljø runtime contract is source-bounded to official WaterBodyID membership. It does not mean every source record is current life, every local species is represented, or the returned count is abundance.</p>
            <DataStatePanel state="SOURCE AVAILABLE" title="Vannmiljø is now a real local source adapter, not a national-count placeholder." detail={`${VANNMILJO_LIFE_SOURCE.publisher} remains the source family. The product requests the official waterbody subset at runtime and preserves source record, sample time, source-linked location, rights state and issue flags. A failed source is shown as unavailable, never as zero life.`} />
          </div>
        </section>

        <section style={chapter}><div style={chapterNo}>03 / RELATIONSHIP</div><div style={{ minWidth: 0 }}><StateTag tone="green">TWO SOURCE-AWARE THREADS</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 20px" }}>Show how the fjord works — without turning a network into fake certainty.</h2><p style={body}>The first thread begins with microscopic life and the marine food web. The second connects habitat to pressure and response while preserving multi-causal qualifiers. THREAD remains the default; every chain carries its own source and limitation.</p><OslofjordRelationshipDeepening /></div></section>

        <section style={chapter}><div style={chapterNo}>04 / PRESSURE</div><div style={{ minWidth: 0 }}><StateTag>CURATED SOURCES + MODELLED EVIDENCE</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>There is no single cause of “the Oslofjord problem”.</h2><p style={body}>Nutrient loading, wastewater/agriculture, oxygen stress, fishing pressure and habitat degradation remain separate. Each item carries its own geographic scope, evidence grade and limitation.</p><PressureEvidenceGrid records={OSLOFJORD_PRESSURES} sourceById={oslofjordSourceById} /></div></section>

        <section style={chapter}><div style={chapterNo}>05 / SIGNAL</div><div style={{ minWidth: 0 }}><StateTag tone="green">REAL CHANGES TO FOLLOW</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Return when something consequential changes.</h2><p style={body}>Signals are dated source-grounded changes — a consultation, a regulation, a fish survey and nitrogen modelling — rather than a generic environmental-news feed.</p><SignalTimeline records={OSLOFJORD_SIGNALS} sourceById={oslofjordSourceById} /></div></section>

        <section style={chapter}><div style={chapterNo}>06 / ACTORS + RESPONSES</div><div style={{ minWidth: 0 }}><StateTag>ACTOR ≠ PARTNER</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 14px" }}>Who is doing what — without inventing partnerships or effectiveness.</h2><p style={body}>Public authorities, research institutions and implementation actors are mapped from documented roles. Their existence does not prove effectiveness or imply a 4PLANET relationship.</p><ActorSolutionGrid actors={OSLOFJORD_ACTORS} solutions={OSLOFJORD_SOLUTIONS} sourceById={oslofjordSourceById} /></div></section>

        <section style={chapter}>
          <div style={chapterNo}>07 / FOLLOW</div>
          <div>
            <StateTag>LOCAL-FIRST FOLLOW + SOURCE WATCH</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 0" }}>Follow the place — then compare what the source actually returns later.</h2>
            <p style={body}>Follow persists on this device. The new Watch contract can store a source snapshot and compare a later Vannmiljø response deterministically. The first check is only a baseline. A later changed response may create a Return Object; it is not automatically an ecological alert.</p>
            <button type="button" onClick={() => toggle({ id: place.id, type: "PLACE", label: place.name, sub: "FJORD · Marine Regions MRGID 3379" })} style={{ ...linkButton, cursor: "pointer" }}>{followed ? "✓ FOLLOWING OSLOFJORDEN ON THIS DEVICE" : "FOLLOW OSLOFJORDEN ON THIS DEVICE"}</button>
            <p style={{ ...body, fontSize: 13.5, color: "rgba(10,10,10,.62)" }}>Persistence and deterministic source comparison are real. Account sync, push/email delivery and a claim that an ecological change occurred are not built or claimed.</p>
          </div>
        </section>

        <section style={chapter}><div style={chapterNo}>08 / ACTION</div><div style={{ minWidth: 0 }}><StateTag tone="green">REAL PUBLIC PATHWAY</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 28px" }}>One credible action is better than ten generic buttons.</h2><ActionPathwayCard action={mainAction} sourceById={oslofjordSourceById} /><p style={{ ...body, marginTop: 22 }}>This is an official government consultation, not a 4PLANET campaign or delivery programme. No donation, membership, partnership or ecological result is implied.</p></div></section>

        <section style={chapter}>
          <div style={chapterNo}>09 / PROOF</div>
          <div>
            <StateTag>REAL EVIDENCE STATES</StateTag>
            <h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 24px" }}>Show what exists. Leave absent proof absent.</h2>
            <div style={{ display: "grid", gap: 14 }}><ProvenanceBar value={{ state: "SOURCE", actor: "Havforskningsinstituttet", source: oslofjordSourceById("hi-sprat-survey-2025").url, time: "Survey 2–11 Dec 2025 · published 4 Mar 2026", limitation: "Survey estimates belong to the defined survey design, period and uncertainty. They are not current live counts or population trend by themselves." }} /><ProvenanceBar value={{ state: "4PLANET CONTEXT", actor: "4PLANET", method: "Cross-source product synthesis", time: "Aug 2026 candidate", limitation: "4PLANET connects source records into a user journey but does not promote its synthesis to external scientific assessment." }} /></div>
            <div style={{ marginTop: 18 }}><DataStatePanel state="NOT YET IMPLEMENTED" title="No Oslofjorden Partner Report, Assessed Outcome or Verified Outcome is claimed." detail="Those proof states stay empty until a real delivery actor, method, evidence and outcome exist. Product polish cannot fill an evidence gap." /></div>
          </div>
        </section>

        <section style={chapter}><div style={chapterNo}>10 / SOURCES</div><div style={{ minWidth: 0 }}><StateTag>VISIBLE SOURCE REGISTER</StateTag><h2 style={{ ...title, fontSize: "clamp(40px,6vw,84px)", margin: "20px 0 26px" }}>The source is part of the product.</h2><SourceRegister /><div style={{ marginTop: 28, display: "grid", gap: 14 }}><ProvenanceBar value={{ state: "SOURCE", actor: media.creator, source: media.sourcePage, time: "Photographed 17 Aug 2022 · source checked Aug 2026", limitation: `${media.license}. ${media.limitation}` }} /><ProvenanceBar value={{ state: "SOURCE", actor: innerOslofjord.source.publisher, source: innerOslofjord.source.url, time: "Source checked Aug 2026", limitation: innerOslofjord.limitation }} />{OSLOFJORD_SCIENTIFIC_DATASETS.map((dataset) => <ProvenanceBar key={dataset.id} value={{ state: "SOURCE", actor: dataset.publisher, source: dataset.sourceUrl, time: `Published ${dataset.publishedAt} · checked ${dataset.checkedAt}`, limitation: `${dataset.license}. ${dataset.limitation}` }} />)}</div></div></section>
      </main>
      <style>{`@media(max-width:720px){#main-content>main>section{grid-template-columns:1fr!important}a[style*="grid-template-columns: 54px"]{grid-template-columns:40px 1fr!important}a[style*="grid-template-columns: 54px"]>span:last-child{grid-column:2;text-align:left!important}}`}</style>
    </PublicShell>
  );
}
