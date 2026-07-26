import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { SPECIES_PROFILES, speciesById, speciesBySlug, type SpeciesProfile } from "@/data/species";
import { ORCA_INTERPRETATION, ORCA_OBSERVATION, ORCA_PRODUCT_CONTEXT, ORCA_SOURCE_RECORD } from "@/data/truthSpine";
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { useFollows } from "@/planet/follow";
import { contextHref } from "@/product/ProductNav";
import { NotFound } from "@/pages/system";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const panel: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(20px,3vw,32px)", minWidth: 0 };

function Status({ children, color = T.blue }: { children: React.ReactNode; color?: string }) {
  return <span style={{ ...mono, display: "inline-flex", border: `1px solid ${color}`, color, padding: "4px 7px" }}>{children}</span>;
}

function SpeciesCard({ profile, search }: { profile: SpeciesProfile; search: string }) {
  return (
    <Link
      to={contextHref(`/species/${profile.slug}`, search, { entity: profile.id, journey: profile.slug === "orca" ? "orca-gbif" : null })}
      style={{ ...panel, display: "flex", minHeight: 260, flexDirection: "column", color: T.ink, textDecoration: "none" }}
    >
      <div style={{ ...mono, color: T.blue }}>{profile.id}</div>
      <h2 style={{ marginTop: 28, fontFamily: T.display, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1, letterSpacing: "-.035em" }}>{profile.commonName}</h2>
      <p style={{ marginTop: 8, fontStyle: "italic", color: T.dim }}>{profile.scientificName}</p>
      <p style={{ marginTop: 22, fontSize: 14, lineHeight: 1.55, color: T.dim }}>{profile.context}</p>
      <div style={{ marginTop: "auto", paddingTop: 24 }}><Status>OPEN SOURCE-AWARE PROFILE →</Status></div>
    </Link>
  );
}

export function SpeciesIndex() {
  const location = useLocation();
  const contextProfile = speciesById(new URLSearchParams(location.search).get("entity") ?? undefined);
  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <div style={{ ...mono, color: T.blue }}>4PLANET SPECIES_ · UNDERSTAND LIFE</div>
        <h1 style={{ marginTop: 20, fontFamily: T.display, fontSize: "clamp(48px,8vw,112px)", lineHeight: .92, letterSpacing: "-.05em" }}>Life, without invented certainty.</h1>
        <p style={{ marginTop: 28, maxWidth: 760, fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.5 }}>
          Each profile begins with the living animal and its place, then opens into what it depends on and what is
          reported about it. Occurrence records show where people have looked — not range, abundance or population.
        </p>
        {contextProfile && (
          <div style={{ marginTop: 24 }}>
            <Status color={T.acid}>CONTEXT CONTINUED · {contextProfile.commonName.toUpperCase()}</Status>
          </div>
        )}
        <div className="three" style={{ marginTop: 48 }}>
          {SPECIES_PROFILES.map((profile) => <SpeciesCard key={profile.id} profile={profile} search={location.search} />)}
        </div>
      </Section>
    </PublicShell>
  );
}

type ObservationState =
  | { status: "LOADING"; rows: Occurrence[]; total: number }
  | { status: "LIVE"; rows: Occurrence[]; total: number }
  | { status: "NO_RECORDS"; rows: Occurrence[]; total: number }
  | { status: "SOURCE_UNAVAILABLE"; rows: Occurrence[]; total: number };

export function SpeciesProfilePage() {
  const { slug } = useParams();
  const profile = speciesBySlug(slug);
  const location = useLocation();
  const { following, toggle } = useFollows();
  const [occurrences, setOccurrences] = useState<ObservationState>({ status: "LOADING", rows: [], total: 0 });

  useEffect(() => {
    if (!profile) return;
    let alive = true;
    setOccurrences({ status: "LOADING", rows: [], total: 0 });
    taxonOccurrences(profile.gbifKey, 24).then((result) => {
      if (!alive) return;
      if (!result.ok) setOccurrences({ status: "SOURCE_UNAVAILABLE", rows: [], total: 0 });
      else setOccurrences({ status: result.data.total > 0 ? "LIVE" : "NO_RECORDS", rows: result.data.rows, total: result.data.total });
    });
    return () => { alive = false; };
  }, [profile]);

  if (!profile) return <NotFound />;
  const isOrca = profile.slug === "orca";
  const atlasHref = contextHref("/atlas", location.search, { entity: profile.id, journey: isOrca ? "orca-gbif" : profile.slug });
  const followed = following(profile.id);

  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <Link to={contextHref("/species", location.search)} style={{ ...mono, color: T.blue }}>← SPECIES INDEX</Link>
        <div style={{ marginTop: 38, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Status>GBIF TAXON · ACCEPTED</Status>
          <Status color={T.acid}>IDENTITY PRESERVED</Status>
          <Status color="#8A6500">ECOLOGICAL SOURCE REVIEW PENDING</Status>
        </div>
        <h1 style={{ marginTop: 24, fontFamily: T.display, fontSize: "clamp(52px,9vw,124px)", lineHeight: .86, letterSpacing: "-.055em" }}>{profile.commonName}</h1>
        <p style={{ marginTop: 20, fontSize: "clamp(20px,2.6vw,30px)", fontStyle: "italic" }}>{profile.scientificName}</p>
        <div style={{ marginTop: 38, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to={atlasHref} style={{ ...mono, background: T.blue, color: "#fff", padding: "12px 15px", textDecoration: "none" }}>OPEN SAME ENTITY IN ATLAS →</Link>
          <button
            onClick={() => toggle({ id: profile.id, type: "TAXON", label: profile.commonName, sub: profile.scientificName })}
            style={{ ...mono, background: "transparent", color: followed ? T.acid : T.ink, border: `1px solid ${followed ? T.acid : T.ink}`, padding: "11px 15px", cursor: "pointer" }}
          >{followed ? "WATCHING LOCALLY" : "ADD TO LOCAL WATCH"}</button>
        </div>

        <div className="tw" style={{ marginTop: 52 }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.dim }}>TAXON IDENTITY</div>
            <dl style={{ marginTop: 20, display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 18px", fontSize: 14 }}>
              <dt>Canonical ID</dt><dd style={{ wordBreak: "break-all" }}>{profile.id}</dd>
              <dt>GBIF key</dt><dd>{profile.gbifKey}</dd>
              <dt>Rank</dt><dd>{profile.rank}</dd>
              <dt>Status</dt><dd>{profile.taxonomicStatus}</dd>
              <dt>Kingdom</dt><dd>{profile.kingdom}</dd>
            </dl>
            <a href={profile.taxonSourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 22, color: T.blue }}>OPEN GBIF TAXON RECORD ↗</a>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.dim }}>LIVE OCCURRENCE READ</div>
            <div style={{ marginTop: 18 }}><Status color={occurrences.status === "LIVE" ? T.acid : occurrences.status === "SOURCE_UNAVAILABLE" ? T.red : "#8A6500"}>{occurrences.status.replace(/_/g, " ")}</Status></div>
            {occurrences.status === "LIVE" && <p style={{ marginTop: 18, fontSize: 15 }}>{occurrences.total.toLocaleString()} records reported by GBIF; {occurrences.rows.length} loaded in this view.</p>}
            <p style={{ marginTop: 14, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>Records show reporting activity. They do not establish range, abundance, population trend or live tracking.</p>
            {occurrences.rows.slice(0, 3).map((row) => (
              <a key={row.sourceRecordId} href={row.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 12, color: T.ink, fontSize: 12 }}>
                {row.eventDate ?? "DATE NOT SUPPLIED"} · {row.lat.toFixed(3)}, {row.lng.toFixed(3)} ↗
              </a>
            ))}
          </div>
        </div>

        {isOrca && (
          <div style={{ ...panel, marginTop: 24, borderColor: T.blue }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ ...mono, color: T.blue }}>WHAT THIS RECORD SHOWS · AND WHAT IT DOES NOT</div>
              <Status color="#8A6500">{ORCA_PRODUCT_CONTEXT.persistedBy.replace(/_/g, " ")}</Status>
            </div>
            <p style={{ marginTop: 18, maxWidth: 840, lineHeight: 1.55 }}>{ORCA_INTERPRETATION.text}</p>
            <div className="four" style={{ marginTop: 24 }}>
              {[
                ["SOURCE RECORD", ORCA_SOURCE_RECORD.sourceRecordId],
                ["OBSERVATION", ORCA_OBSERVATION.id],
                ["SIGNAL", "NONE CREATED"],
                ["INTERPRETATION", ORCA_INTERPRETATION.reviewStatus],
              ].map(([label, value]) => <div key={label} style={{ borderTop: `1px solid ${T.line}`, padding: "14px 0" }}><div style={{ ...mono, color: T.dim }}>{label}</div><div style={{ marginTop: 8, fontSize: 12, wordBreak: "break-all" }}>{value}</div></div>)}
            </div>
            <p style={{ marginTop: 18, fontSize: 12.5, color: T.dim, lineHeight: 1.55 }}>{ORCA_PRODUCT_CONTEXT.disclosure}</p>
            <a href={ORCA_SOURCE_RECORD.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 14, color: T.blue }}>SOURCE RECORD + LICENCE ↗</a>
          </div>
        )}

        <div className="tw" style={{ marginTop: 24 }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.red }}>PRESSURE</div>
            <h2 style={{ marginTop: 16, fontSize: 25 }}>{profile.issue.label}</h2>
            <p style={{ marginTop: 12, color: T.dim, lineHeight: 1.55 }}>The connection to this species exists. The public wording is held back until its ecological source pack is audited — no unsourced claim is shown.</p>
            <div style={{ marginTop: 18 }}><Status color="#8A6500">SOURCE REVIEW PENDING</Status></div>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.acid }}>RESPONSE</div>
            <h2 style={{ marginTop: 16, fontSize: 25 }}>{profile.solution.label}</h2>
            <p style={{ marginTop: 12, color: T.dim, lineHeight: 1.55 }}>A connected prototype path — not a recommendation, an efficacy claim or a 4PLANET delivery offer.</p>
            <div style={{ marginTop: 18 }}><Status color="#8A6500">SOURCE REVIEW PENDING</Status></div>
          </div>
        </div>

        <div style={{ ...panel, marginTop: 24 }}>
          <div style={{ ...mono, color: T.blue }}>PRODUCT NOTE</div>
          <p style={{ marginTop: 16, fontSize: 18, lineHeight: 1.5 }}>{profile.commonName} now retains the same canonical identity across SPECIES, ATLAS and local WATCH.</p>
          <p style={{ marginTop: 10, color: T.dim, fontSize: 13 }}>Published by 4PLANET · 22 July 2026 · Product change, not a planetary signal.</p>
        </div>
      </Section>
    </PublicShell>
  );
}
