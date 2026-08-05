import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import {
  SPECIES_PROFILES,
  speciesById,
  speciesBySlug,
  type EvidenceClaim,
  type EvidenceState,
  type SpeciesProfile,
} from "@/data/species";
import { ORCA_INTERPRETATION, ORCA_OBSERVATION, ORCA_PRODUCT_CONTEXT, ORCA_SOURCE_RECORD } from "@/data/truthSpine";
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { useFollows } from "@/planet/follow";
import { contextHref } from "@/product/ProductNav";
import { NotFound } from "@/pages/system";
import { speciesMedia, hasShowableImage } from "@/data/speciesMedia";

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };
const panel: React.CSSProperties = { border: `1px solid ${T.line}`, padding: "clamp(20px,3vw,32px)", minWidth: 0 };

function Status({ children, color = T.blue }: { children: React.ReactNode; color?: string }) {
  return <span style={{ ...mono, display: "inline-flex", border: `1px solid ${color}`, color, padding: "4px 7px" }}>{children}</span>;
}

const evidenceColor = (state: EvidenceState) => {
  if (state === "KNOWN") return T.acid;
  if (state === "INTERPRETED") return T.blue;
  return "#8A6500";
};

function EvidenceClaimCard({ claim }: { claim: EvidenceClaim }) {
  const color = evidenceColor(claim.state);
  return (
    <article style={{ ...panel, display: "flex", minHeight: 290, flexDirection: "column", borderColor: color }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <Status color={color}>{claim.state}</Status>
        <span style={{ ...mono, color: T.dim }}>CHECKED {claim.checkedAt}</span>
      </div>
      <h3 style={{ marginTop: 22, fontFamily: T.display, fontSize: "clamp(25px,3vw,36px)", lineHeight: 1.02, letterSpacing: "-.025em" }}>{claim.label}</h3>
      <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.6 }}>{claim.text}</p>
      {claim.limitation && <p style={{ marginTop: 16, color: T.dim, fontSize: 12.5, lineHeight: 1.55 }}><strong>BOUNDARY:</strong> {claim.limitation}</p>}
      {claim.sourceUrl && (
        <a href={claim.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, marginTop: "auto", paddingTop: 24, color: T.blue }}>
          {claim.sourceLabel ?? "OPEN SOURCE"} ↗
        </a>
      )}
    </article>
  );
}

/** Life-first image plane: a rights-cleared photo, or a designed no-image state. */
function LifeImage({ slug, name, sci, ratio = "4/3" }: { slug: string; name: string; sci: string; ratio?: string }) {
  const media = speciesMedia(slug);
  const show = hasShowableImage(slug);
  return (
    <figure style={{ margin: 0, position: "relative", aspectRatio: ratio, overflow: "hidden", background: "#05081b", border: `1px solid ${T.line}` }}>
      {show ? (
        <img src={media!.localPath} alt={`${name} — ${sci}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 18,
          background: "repeating-linear-gradient(135deg,#0a0f26,#0a0f26 22px,#0c1230 22px,#0c1230 44px)" }}>
          <div style={{ ...mono, textAlign: "center", color: "rgba(255,255,255,.66)", lineHeight: 1.8, border: "1px dashed rgba(255,255,255,.28)", padding: "12px 16px", maxWidth: 300 }}>
            <strong style={{ display: "block", color: "#fff", marginBottom: 4, letterSpacing: ".14em" }}>NO CLEARED IMAGE</strong>
            Awaiting a verified media-rights record. No unverified photo is shown.
          </div>
        </div>
      )}
      <figcaption style={{ position: "absolute", left: 12, bottom: 10, ...mono, color: "rgba(255,255,255,.7)" }}>{name.toUpperCase()} · {sci.toUpperCase()}</figcaption>
    </figure>
  );
}

function SpeciesCard({ profile, search }: { profile: SpeciesProfile; search: string }) {
  return (
    <Link
      to={contextHref(`/species/${profile.slug}`, search, { entity: profile.id, journey: profile.slug === "orca" ? "orca-gbif" : null })}
      style={{ display: "flex", flexDirection: "column", color: T.ink, textDecoration: "none", minWidth: 0, border: `1px solid ${T.line}` }}
    >
      <LifeImage slug={profile.slug} name={profile.commonName} sci={profile.scientificName} ratio="4/3" />
      <div style={{ padding: "18px 20px 22px", display: "flex", flexDirection: "column", flex: 1 }}>
        {profile.group && <div style={{ ...mono, color: T.dim }}>{profile.group.toUpperCase()}{profile.region ? ` · ${profile.region.toUpperCase()}` : ""}</div>}
        <h2 style={{ marginTop: 10, fontFamily: T.display, fontSize: "clamp(22px,2.6vw,32px)", lineHeight: 1, letterSpacing: "-.03em" }}>{profile.commonName}</h2>
        <p style={{ marginTop: 6, fontStyle: "italic", color: T.dim, fontSize: 14 }}>{profile.scientificName}</p>
        {profile.intro && <p style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.5, color: T.dim, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{profile.intro}</p>}
        <div style={{ marginTop: "auto", paddingTop: 18, ...mono, color: T.blue }}>OPEN PROFILE →</div>
      </div>
    </Link>
  );
}

export function SpeciesIndex() {
  const location = useLocation();
  const contextProfile = speciesById(new URLSearchParams(location.search).get("entity") ?? undefined);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("ALL");
  const groups = ["ALL", ...Array.from(new Set(SPECIES_PROFILES.map((p) => p.group).filter(Boolean)))] as string[];
  const q = query.trim().toLowerCase();
  const filtered = SPECIES_PROFILES.filter((p) => {
    if (group !== "ALL" && p.group !== group) return false;
    if (!q) return true;
    return p.commonName.toLowerCase().includes(q) || p.scientificName.toLowerCase().includes(q) || (p.group ?? "").toLowerCase().includes(q) || (p.region ?? "").toLowerCase().includes(q);
  });
  return (
    <PublicShell>
      <Section pad="clamp(88px,10vw,138px)">
        <div style={{ ...mono, color: T.blue }}>4PLANET SPECIES_ · UNDERSTAND LIFE</div>
        <h1 style={{ marginTop: 20, fontFamily: T.display, fontSize: "clamp(44px,7.5vw,104px)", lineHeight: .92, letterSpacing: "-.05em" }}>Life, without invented certainty.</h1>
        <p style={{ marginTop: 28, maxWidth: 760, fontSize: "clamp(17px,2vw,22px)", lineHeight: 1.5 }}>
          Each profile begins with the living animal and its place, then opens into what it depends on and what is
          reported about it. Occurrence records show where people have looked — not range, abundance or population.
        </p>
        {contextProfile && (
          <div style={{ marginTop: 24 }}>
            <Status color={T.acid}>CONTEXT CONTINUED · {contextProfile.commonName.toUpperCase()}</Status>
          </div>
        )}
        <div style={{ marginTop: 44, display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search species…" aria-label="Search species"
            style={{ flex: "1 1 240px", minWidth: 0, border: `1px solid ${T.line}`, padding: "12px 14px", fontSize: 15, fontFamily: T.sans, background: "transparent", color: T.ink }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {groups.map((g) => (
              <button key={g} onClick={() => setGroup(g)} style={{ ...mono, padding: "8px 12px", cursor: "pointer", background: group === g ? T.ink : "transparent", color: group === g ? "#fff" : T.dim, border: `1px solid ${group === g ? T.ink : T.line}` }}>
                {g === "ALL" ? "ALL" : g.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...mono, color: T.dim, marginTop: 16 }}>{filtered.length} PROFILE{filtered.length === 1 ? "" : "S"}</div>
        <div className="three" style={{ marginTop: 28 }}>
          {filtered.map((profile) => <SpeciesCard key={profile.id} profile={profile} search={location.search} />)}
        </div>
        {filtered.length === 0 && <p style={{ marginTop: 40, color: T.dim }}>No species match that search yet.</p>}
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
          <Status color="#8A6500">POPULATION-SPECIFIC CLAIMS CONTROLLED</Status>
        </div>
        <div style={{ marginTop: 28 }}>
          <LifeImage slug={profile.slug} name={profile.commonName} sci={profile.scientificName} ratio="16/9" />
        </div>
        <h1 style={{ marginTop: 30, fontFamily: T.display, fontSize: "clamp(52px,9vw,124px)", lineHeight: .86, letterSpacing: "-.055em" }}>{profile.commonName}</h1>
        <p style={{ marginTop: 20, fontSize: "clamp(20px,2.6vw,30px)", fontStyle: "italic" }}>{profile.scientificName}</p>
        {profile.intro && <p style={{ marginTop: 22, maxWidth: 760, fontSize: "clamp(16px,1.6vw,19px)", lineHeight: 1.55 }}>{profile.intro}</p>}
        {profile.habitat && (
          <div style={{ ...panel, marginTop: 24, maxWidth: 760 }}>
            <div style={{ ...mono, color: T.blue }}>WHERE IT LIVES</div>
            <p style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55 }}>{profile.habitat}</p>
          </div>
        )}
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
            <div style={{ ...mono, color: T.dim }}>OCCURRENCE RECORDS</div>
            <div style={{ marginTop: 18 }}><Status color={occurrences.status === "LIVE" ? T.acid : occurrences.status === "SOURCE_UNAVAILABLE" ? T.red : "#8A6500"}>{occurrences.status === "LIVE" ? "RECORDS RETRIEVED" : occurrences.status.replace(/_/g, " ")}</Status></div>
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
          <>
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

            <section style={{ marginTop: 72 }} aria-labelledby="whales-evidence-title">
              <div style={{ ...mono, color: T.blue }}>WH4LES_ · FOUR EVIDENCE CHAPTERS</div>
              <h2 id="whales-evidence-title" style={{ marginTop: 16, maxWidth: 980, fontFamily: T.display, fontSize: "clamp(38px,6vw,78px)", lineHeight: .95, letterSpacing: "-.045em" }}>
                From one animal to the living relationships around it.
              </h2>
              <p style={{ marginTop: 24, maxWidth: 780, fontSize: 17, lineHeight: 1.6, color: T.dim }}>
                Every statement is labelled KNOWN, INTERPRETED or UNKNOWN. Species-level evidence is never silently converted into a claim about one population, pod or individual.
              </p>
              {profile.narrativeChapters?.map((chapter, index) => (
                <article key={chapter.id} style={{ marginTop: index === 0 ? 48 : 72 }}>
                  <div style={{ ...mono, color: T.blue }}>{chapter.eyebrow}</div>
                  <h3 style={{ marginTop: 14, maxWidth: 980, fontFamily: T.display, fontSize: "clamp(34px,5vw,64px)", lineHeight: .98, letterSpacing: "-.04em" }}>{chapter.title}</h3>
                  <p style={{ marginTop: 20, maxWidth: 820, fontSize: 17, lineHeight: 1.62 }}>{chapter.summary}</p>
                  <div className="tw" style={{ marginTop: 28 }}>
                    {chapter.claims.map((claim) => <EvidenceClaimCard key={claim.id} claim={claim} />)}
                  </div>
                </article>
              ))}
            </section>
          </>
        )}

        <div className="tw" style={{ marginTop: 72 }}>
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
          <p style={{ marginTop: 16, fontSize: 18, lineHeight: 1.5 }}>{profile.commonName} retains the same canonical identity across SPECIES, ATLAS and local WATCH.</p>
          <p style={{ marginTop: 10, color: T.dim, fontSize: 13 }}>Working prototype · evidence layer checked 3 August 2026 · not a population assessment, live tracker or ecological outcome claim.</p>
        </div>
      </Section>
    </PublicShell>
  );
}
