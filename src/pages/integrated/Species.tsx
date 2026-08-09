import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Section } from "@/components/ui";
import { T } from "@/styles/tokens";
import { img } from "@/content/imageRegistry";
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

const isWhale = (profile: SpeciesProfile) => profile.slug === "orca" || profile.slug === "humpback-whale";

function SpeciesCard({ profile, search }: { profile: SpeciesProfile; search: string }) {
  const whaleImage = isWhale(profile) ? img("wh4lesHero") : null;
  return (
    <Link
      to={contextHref(`/species/${profile.slug}`, search, { entity: profile.id, journey: profile.slug === "orca" ? "orca-gbif" : null })}
      style={{ display: "flex", minHeight: 330, flexDirection: "column", color: T.ink, textDecoration: "none", border: `1px solid ${T.line}`, overflow: "hidden", background: "#fff" }}
    >
      {whaleImage ? (
        <div style={{ height: 178, overflow: "hidden", background: T.ink }}>
          <img src={whaleImage.src} alt={whaleImage.alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: whaleImage.objectPosition ?? "50% 50%" }} />
        </div>
      ) : (
        <div style={{ height: 96, display: "flex", alignItems: "flex-end", padding: "18px 20px", background: "#f5f5f2" }}>
          <span style={{ ...mono, color: T.dim }}>IMAGE HELD UNTIL RIGHTS + IDENTITY MATCH</span>
        </div>
      )}
      <div style={{ padding: "clamp(20px,2.6vw,28px)", display: "flex", flex: 1, flexDirection: "column" }}>
        <div style={{ ...mono, color: T.blue }}>SPECIES PROFILE</div>
        <h2 style={{ marginTop: 12, fontFamily: T.display, fontSize: "clamp(30px,4vw,46px)", lineHeight: 1, letterSpacing: "-.035em" }}>{profile.commonName}</h2>
        <p style={{ marginTop: 7, fontStyle: "italic", color: T.dim }}>{profile.scientificName}</p>
        <p style={{ marginTop: 18, fontSize: 14, lineHeight: 1.55, color: T.dim }}>{profile.context}</p>
        <div style={{ marginTop: "auto", paddingTop: 22 }}><Status>MEET THIS SPECIES →</Status></div>
      </div>
    </Link>
  );
}

export function SpeciesIndex() {
  const location = useLocation();
  const contextProfile = speciesById(new URLSearchParams(location.search).get("entity") ?? undefined);
  return (
    <PublicShell>
      <Section pad="clamp(44px,7vw,92px)">
        <div style={{ ...mono, color: T.blue }}>SPECIES · LIFE FIRST</div>
        <h1 style={{ marginTop: 14, fontFamily: T.display, fontSize: "clamp(44px,7vw,90px)", lineHeight: .92, letterSpacing: "-.05em", maxWidth: 960 }}>Meet the lives behind the data.</h1>
        <p style={{ marginTop: 22, maxWidth: 720, fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.5 }}>
          Start with the animal. Then open the records, relationships, sources and limits behind what 4Planet can responsibly say.
        </p>
        {contextProfile && <div style={{ marginTop: 20 }}><Status color={T.acid}>CONTEXT CONTINUED · {contextProfile.commonName.toUpperCase()}</Status></div>}
        <div className="three" style={{ marginTop: 34 }}>
          {SPECIES_PROFILES.map((profile) => <SpeciesCard key={profile.id} profile={profile} search={location.search} />)}
        </div>
      </Section>
    </PublicShell>
  );
}

type ObservationState =
  | { status: "LOADING"; rows: Occurrence[]; total: number; retrievedAt?: string }
  | { status: "SOURCE_AVAILABLE"; rows: Occurrence[]; total: number; retrievedAt: string }
  | { status: "NO_RECORDS"; rows: Occurrence[]; total: number; retrievedAt: string }
  | { status: "SOURCE_UNAVAILABLE"; rows: Occurrence[]; total: number; retrievedAt?: string };

function OrcaPassport() {
  const hero = img("wh4lesHero");
  return (
    <div className="species-passport" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,.95fr)", border: `1px solid ${T.line}`, marginTop: 26, overflow: "hidden" }}>
      <div style={{ minHeight: "clamp(280px,48vw,590px)", background: T.ink, position: "relative" }}>
        <img src={hero.src} alt={hero.alt} loading="eager" decoding="async" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: hero.objectPosition ?? "50% 50%" }} />
        <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, ...mono, color: "rgba(255,255,255,.78)" }}>WH4LES_ DOCUMENTARY FRAME · NOT AN OBSERVATION PHOTO</div>
      </div>
      <div style={{ padding: "clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ ...mono, color: T.blue }}>SPECIES PASSPORT · SOURCE-BOUNDED</div>
        <h1 style={{ marginTop: 16, fontFamily: T.display, fontSize: "clamp(52px,8vw,104px)", lineHeight: .84, letterSpacing: "-.055em" }}>Orca</h1>
        <p style={{ marginTop: 18, fontSize: "clamp(19px,2.4vw,28px)", fontStyle: "italic" }}>Orcinus orca</p>
        <p style={{ marginTop: 24, maxWidth: 560, fontSize: 16, lineHeight: 1.62 }}>
          Orcas live through durable social relationships. Different populations can differ in diet, behaviour, calls and habitat use, so one species label never tells the whole story.
        </p>
        <div style={{ marginTop: 28, display: "grid", gap: 13 }}>
          <div><span style={{ ...mono, color: T.dim }}>LIFE</span><p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>Social groups can carry population-specific behaviour and traditions.</p></div>
          <div><span style={{ ...mono, color: T.dim }}>FOOD</span><p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>Different populations can specialise in different prey and hunting strategies.</p></div>
          <div><span style={{ ...mono, color: T.dim }}>PLACE</span><p style={{ marginTop: 4, fontSize: 14, lineHeight: 1.5 }}>Occurrence points show reported observations. They do not establish range, abundance, migration track or current location.</p></div>
        </div>
      </div>
      <style>{`@media(max-width:760px){.species-passport{grid-template-columns:1fr!important}.species-passport>div:first-child{min-height:42svh!important}.species-passport h1{font-size:clamp(52px,17vw,78px)!important}}`}</style>
    </div>
  );
}

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
      const retrievedAt = new Date().toISOString();
      if (!result.ok) setOccurrences({ status: "SOURCE_UNAVAILABLE", rows: [], total: 0, retrievedAt });
      else setOccurrences({ status: result.data.total > 0 ? "SOURCE_AVAILABLE" : "NO_RECORDS", rows: result.data.rows, total: result.data.total, retrievedAt });
    });
    return () => { alive = false; };
  }, [profile]);

  if (!profile) return <NotFound />;
  const isOrca = profile.slug === "orca";
  const atlasHref = contextHref("/atlas", location.search, { entity: profile.id, journey: isOrca ? "orca-gbif" : profile.slug });
  const livingSystemsHref = contextHref("/living-systems", location.search, { entity: profile.id, journey: isOrca ? "orca-gbif" : profile.slug });
  const followed = following(profile.id);
  const profileHero = isWhale(profile) ? img("wh4lesHero") : null;

  return (
    <PublicShell>
      <Section pad="clamp(38px,6vw,84px)">
        <Link to={contextHref("/species", location.search)} style={{ ...mono, color: T.blue }}>← SPECIES</Link>

        {isOrca ? <OrcaPassport /> : (
          <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: profileHero ? "minmax(0,1fr) minmax(0,1fr)" : "1fr", border: `1px solid ${T.line}` }}>
            {profileHero && <img src={profileHero.src} alt={profileHero.alt} style={{ width: "100%", minHeight: 300, height: "100%", objectFit: "cover" }} />}
            <div style={{ padding: "clamp(24px,4vw,48px)" }}>
              <div style={{ ...mono, color: T.blue }}>SPECIES PASSPORT</div>
              <h1 style={{ marginTop: 14, fontFamily: T.display, fontSize: "clamp(48px,8vw,92px)", lineHeight: .9, letterSpacing: "-.05em" }}>{profile.commonName}</h1>
              <p style={{ marginTop: 16, fontSize: "clamp(19px,2.4vw,28px)", fontStyle: "italic" }}>{profile.scientificName}</p>
              <p style={{ marginTop: 24, maxWidth: 620, lineHeight: 1.6 }}>{profile.context}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link to={atlasHref} style={{ ...mono, background: T.blue, color: "#fff", padding: "13px 15px", minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>SEE RECORDS IN ATLAS →</Link>
          <Link to={livingSystemsHref} style={{ ...mono, color: T.ink, border: `1px solid ${T.ink}`, padding: "12px 15px", minHeight: 44, display: "inline-flex", alignItems: "center", textDecoration: "none" }}>UNDERSTAND RELATIONSHIPS →</Link>
          <button onClick={() => toggle({ id: profile.id, type: "TAXON", label: profile.commonName, sub: profile.scientificName })}
            style={{ ...mono, minHeight: 44, background: "transparent", color: followed ? T.acid : T.ink, border: `1px solid ${followed ? T.acid : T.ink}`, padding: "11px 15px", cursor: "pointer" }}>
            {followed ? "WATCHING LOCALLY" : "ADD TO LOCAL WATCH"}
          </button>
        </div>

        <div style={{ marginTop: 46 }}>
          <div style={{ ...mono, color: T.blue }}>SOURCE + IDENTITY</div>
          <h2 style={{ marginTop: 12, fontFamily: T.display, fontSize: "clamp(30px,4vw,48px)", letterSpacing: "-.035em" }}>What the records actually establish.</h2>
        </div>
        <div className="tw" style={{ marginTop: 24 }}>
          <div style={panel}>
            <div style={{ ...mono, color: T.dim }}>TAXON AUTHORITY</div>
            <p style={{ marginTop: 16, fontSize: 15, lineHeight: 1.55 }}>GBIF resolves this profile to the accepted taxon identity used across SPECIES and ATLAS.</p>
            <dl style={{ marginTop: 18, display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 12.5 }}>
              <dt>Scientific name</dt><dd>{profile.scientificName}</dd>
              <dt>GBIF key</dt><dd>{profile.gbifKey}</dd>
              <dt>Canonical ID</dt><dd style={{ wordBreak: "break-all" }}>{profile.id}</dd>
            </dl>
            <a href={profile.taxonSourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 20, color: T.blue }}>OPEN GBIF TAXON RECORD ↗</a>
          </div>
          <div style={panel}>
            <div style={{ ...mono, color: T.dim }}>RECORDED OBSERVATIONS</div>
            <div style={{ marginTop: 16 }}>
              <Status color={occurrences.status === "SOURCE_AVAILABLE" ? T.acid : occurrences.status === "SOURCE_UNAVAILABLE" ? T.red : "#8A6500"}>
                {occurrences.status === "SOURCE_AVAILABLE" ? "SOURCE AVAILABLE" : occurrences.status.replace(/_/g, " ")}
              </Status>
            </div>
            {occurrences.status === "SOURCE_AVAILABLE" && <p style={{ marginTop: 16, fontSize: 15 }}>{occurrences.total.toLocaleString()} GBIF source records reported; {occurrences.rows.length} loaded in this view.</p>}
            {occurrences.retrievedAt && <p style={{ marginTop: 8, ...mono, color: T.dim }}>RETRIEVED THIS SESSION · {new Date(occurrences.retrievedAt).toISOString().slice(0, 16).replace("T", " ")} UTC</p>}
            <p style={{ marginTop: 14, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>Source availability is not live tracking. Each observation keeps its own recorded date where supplied.</p>
            {occurrences.rows.slice(0, 3).map((row) => (
              <a key={row.sourceRecordId} href={row.sourceUrl} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 12, color: T.ink, fontSize: 12 }}>
                OBSERVED {row.eventDate ?? "DATE NOT SUPPLIED"} · SOURCE RECORD ↗
              </a>
            ))}
          </div>
        </div>

        {isOrca && (
          <>
            <div style={{ ...panel, marginTop: 24, borderColor: T.blue }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ ...mono, color: T.blue }}>WHAT ONE SOURCE RECORD SHOWS · AND WHAT IT DOES NOT</div>
                <Status color="#8A6500">{ORCA_PRODUCT_CONTEXT.persistedBy.replace(/_/g, " ")}</Status>
              </div>
              <p style={{ marginTop: 18, maxWidth: 840, lineHeight: 1.55 }}>{ORCA_INTERPRETATION.text}</p>
              <div className="four" style={{ marginTop: 24 }}>
                {[["SOURCE RECORD", ORCA_SOURCE_RECORD.sourceRecordId], ["OBSERVATION", ORCA_OBSERVATION.id], ["SIGNAL", "NONE CREATED"], ["INTERPRETATION", ORCA_INTERPRETATION.reviewStatus]].map(([label, value]) => (
                  <div key={label} style={{ borderTop: `1px solid ${T.line}`, padding: "14px 0" }}><div style={{ ...mono, color: T.dim }}>{label}</div><div style={{ marginTop: 8, fontSize: 12, wordBreak: "break-all" }}>{value}</div></div>
                ))}
              </div>
              <p style={{ marginTop: 18, fontSize: 12.5, color: T.dim, lineHeight: 1.55 }}>{ORCA_PRODUCT_CONTEXT.disclosure}</p>
              <a href={ORCA_SOURCE_RECORD.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 14, color: T.blue }}>SOURCE RECORD + LICENCE ↗</a>
            </div>

            <section style={{ marginTop: 68 }} aria-labelledby="whales-evidence-title">
              <div style={{ ...mono, color: T.blue }}>WH4LES_ · FOUR EVIDENCE CHAPTERS</div>
              <h2 id="whales-evidence-title" style={{ marginTop: 14, maxWidth: 980, fontFamily: T.display, fontSize: "clamp(38px,6vw,72px)", lineHeight: .95, letterSpacing: "-.045em" }}>From one animal to the living relationships around it.</h2>
              <p style={{ marginTop: 22, maxWidth: 780, fontSize: 17, lineHeight: 1.6, color: T.dim }}>Every statement is labelled KNOWN, INTERPRETED or UNKNOWN. Species-level evidence is never silently converted into a claim about one population, pod or individual.</p>
              {profile.narrativeChapters?.map((chapter, index) => (
                <article key={chapter.id} style={{ marginTop: index === 0 ? 44 : 66 }}>
                  <div style={{ ...mono, color: T.blue }}>{chapter.eyebrow}</div>
                  <h3 style={{ marginTop: 14, maxWidth: 980, fontFamily: T.display, fontSize: "clamp(34px,5vw,60px)", lineHeight: .98, letterSpacing: "-.04em" }}>{chapter.title}</h3>
                  <p style={{ marginTop: 18, maxWidth: 820, fontSize: 17, lineHeight: 1.62 }}>{chapter.summary}</p>
                  <div className="tw" style={{ marginTop: 26 }}>{chapter.claims.map((claim) => <EvidenceClaimCard key={claim.id} claim={claim} />)}</div>
                </article>
              ))}
            </section>
          </>
        )}

        <div className="tw" style={{ marginTop: 68 }}>
          <div style={panel}><div style={{ ...mono, color: T.red }}>PRESSURE</div><h2 style={{ marginTop: 16, fontSize: 25 }}>{profile.issue.label}</h2><p style={{ marginTop: 12, color: T.dim, lineHeight: 1.55 }}>The public wording stays held back until the ecological source pack is audited.</p><div style={{ marginTop: 18 }}><Status color="#8A6500">SOURCE REVIEW PENDING</Status></div></div>
          <div style={panel}><div style={{ ...mono, color: T.acid }}>RESPONSE</div><h2 style={{ marginTop: 16, fontSize: 25 }}>{profile.solution.label}</h2><p style={{ marginTop: 12, color: T.dim, lineHeight: 1.55 }}>A connected prototype path — not a recommendation, efficacy claim or 4Planet delivery offer.</p><div style={{ marginTop: 18 }}><Status color="#8A6500">SOURCE REVIEW PENDING</Status></div></div>
        </div>
      </Section>
    </PublicShell>
  );
}
