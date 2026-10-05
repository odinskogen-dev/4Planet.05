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
import { taxonOccurrences } from "@/planet/connectors";
import type { Occurrence } from "@/planet/types";
import { useFollows } from "@/planet/follow";
import { contextHref } from "@/product/ProductNav";
import { NotFound } from "@/pages/system";
import { speciesMedia, hasShowableImage } from "@/data/speciesMedia";
import { withReturnTo, returnHrefFromSearch } from "@/product/productContext";
import { AtlasEmbed } from "@/earth/AtlasEmbed";
import { trackEvent } from "@/analytics/Analytics";
import "@/styles/human-first-public.css";

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
        <a href={claim.sourceUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("source_opened", { product_area: "species", source_kind: claim.sourceLabel ?? "claim_source" })} style={{ ...mono, marginTop: "auto", paddingTop: 24, color: T.blue }}>
          {claim.sourceLabel ?? "OPEN SOURCE"} ↗
        </a>
      )}
    </article>
  );
}

/** Life-first image plane: a rights-cleared photo, a self-owned illustration, or a designed no-image state. */
function LifeImage({ slug, name, sci, ratio = "4/3" }: { slug: string; name: string; sci: string; ratio?: string }) {
  const media = speciesMedia(slug);
  const show = hasShowableImage(slug);
  const illustration = media?.illustration;
  return (
    <figure style={{ margin: 0, position: "relative", aspectRatio: ratio, overflow: "hidden", background: "#05081b", border: `1px solid ${T.line}` }}>
      {show ? (
        <img src={media!.localPath} alt={`${name} — ${sci}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : illustration ? (
        <>
          <img src={illustration.localPath} alt={`${name} — illustration, not a photograph`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 10, left: 10, ...mono, background: "rgba(0,0,0,.72)", color: "#fff", padding: "4px 8px", fontSize: 9 }}>ILLUSTRATION · NOT A PHOTOGRAPH</div>
        </>
      ) : (
        <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 18,
          background: "repeating-linear-gradient(135deg,#0a0f26,#0a0f26 22px,#0c1230 22px,#0c1230 44px)" }}>
          <div style={{ ...mono, textAlign: "center", color: "rgba(255,255,255,.66)", lineHeight: 1.8, border: "1px dashed rgba(255,255,255,.28)", padding: "12px 16px", maxWidth: 420, fontSize: 9 }}>
            <strong style={{ display: "block", color: "#fff", marginBottom: 4, letterSpacing: ".14em" }}>NO CLEARED IMAGE</strong>
            {media?.assetBlocker ? media.assetBlocker : "Awaiting a verified media-rights record. No unverified photo is shown."}
          </div>
        </div>
      )}
      <figcaption style={{ position: "absolute", left: 12, bottom: 10, ...mono, color: "rgba(255,255,255,.7)" }}>{name.toUpperCase()} · {sci.toUpperCase()}</figcaption>
    </figure>
  );
}

/** Derive the plain-language key facts a person actually needs, from profile data.
 *  Works for ANY species: every field is optional and simply omitted if absent,
 *  so the same template scales across the catalogue. Never invents a value. */
function deriveKeyFacts(profile: SpeciesProfile): { k: string; v: string; note?: string }[] {
  const facts: { k: string; v: string; note?: string }[] = [];
  // IUCN status, pulled from a source-backed KNOWN/INTERPRETED claim if present.
  const iucn = (profile.publicClaims || []).find((c) => /IUCN|Red List|Least Concern|Endangered|Vulnerable|Near Threatened|Critically/i.test(c.text));
  if (iucn) {
    const m = iucn.text.match(/\b(Least Concern|Near Threatened|Vulnerable|Endangered|Critically Endangered|Data Deficient|Not Evaluated)\b/i);
    if (m) facts.push({ k: "CONSERVATION (IUCN)", v: m[1], note: `${iucn.state} · ${iucn.source}` });
  }
  if (profile.group) facts.push({ k: "GROUP", v: profile.group });
  if (profile.region) facts.push({ k: "REGION", v: profile.region });
  if (profile.habitat) facts.push({ k: "WHERE IT LIVES", v: profile.habitat, note: profile.descriptorSource ? `DESC · ${profile.descriptorSource.source}` : undefined });
  facts.push({ k: "TAXON", v: `${profile.kingdom} · ${profile.rank}`, note: `GBIF ${profile.gbifKey} · ${profile.taxonomicStatus}` });
  return facts.slice(0, 6);
}

/** Premium full-screen key-facts hero. Snøhetta-precision: whole viewport, tight
 *  grid, plain language, sharp hairlines. Life-first image (existing 4PLANET
 *  media, honestly labelled). The truth model stays intact below the fold. */
function SpeciesHero({
  profile, returnHref, actions,
}: { profile: SpeciesProfile; returnHref: string | null; actions: React.ReactNode }) {
  const facts = deriveKeyFacts(profile);
  const media = speciesMedia(profile.slug);
  const show = hasShowableImage(profile.slug);
  const illustration = media?.illustration;
  return (
    <div className="sp-hero">
      <figure className="sp-hero__media" style={{ margin: 0 }}>
        {show ? (
          <>
            <img src={media!.localPath} alt={`${profile.commonName} — ${profile.scientificName}`} />
            {media?.limitations && (
              <div style={{ position: "absolute", top: 12, left: 12, ...mono, background: "rgba(0,0,0,.72)", color: "#fff", padding: "4px 8px", fontSize: 9, maxWidth: 320, lineHeight: 1.5 }}>{media.limitations}</div>
            )}
            {media?.attribution && (
              <div style={{ position: "absolute", bottom: 34, right: 12, ...mono, background: "rgba(0,0,0,.6)", color: "rgba(255,255,255,.9)", padding: "3px 7px", fontSize: 8 }}>{media.attribution}{media.licence ? ` · ${media.licence}` : ""}</div>
            )}
          </>
        ) : illustration ? (
          <>
            <img src={illustration.localPath} alt={`${profile.commonName} — illustration, not a photograph`} />
            <div style={{ position: "absolute", top: 12, left: 12, ...mono, background: "rgba(0,0,0,.72)", color: "#fff", padding: "4px 8px", fontSize: 9 }}>ILLUSTRATION · NOT A PHOTOGRAPH</div>
          </>
        ) : (
          <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 18, background: "repeating-linear-gradient(135deg,#0a0f26,#0a0f26 22px,#0c1230 22px,#0c1230 44px)" }}>
            <div style={{ ...mono, textAlign: "center", color: "rgba(255,255,255,.66)", lineHeight: 1.8, border: "1px dashed rgba(255,255,255,.28)", padding: "12px 16px", maxWidth: 420, fontSize: 9 }}>
              <strong style={{ display: "block", color: "#fff", marginBottom: 4, letterSpacing: ".14em" }}>NO CLEARED IMAGE</strong>
              {media?.assetBlocker ?? "Awaiting a verified media-rights record. No unverified photo is shown."}
            </div>
          </div>
        )}
        <figcaption>{profile.commonName.toUpperCase()} · {profile.scientificName.toUpperCase()}</figcaption>
      </figure>
      <div className="sp-hero__body">
        <div>
          {returnHref && (
            <Link to={returnHref} data-testid="return-to-atlas" style={{ display: "inline-flex", alignItems: "center", gap: 8, ...mono, color: "#fff", background: T.blue, padding: "9px 13px", textDecoration: "none", marginBottom: 22 }}>
              ← BACK TO OBSERVATION IN ATLAS
            </Link>
          )}
          <div className="sp-hero__eyebrow">4PLANET SPECIES_ · {(profile.group || "LIFE").toUpperCase()}</div>
          <h1 className="sp-hero__name">{profile.commonName}</h1>
          <p className="sp-hero__sci">{profile.scientificName}</p>
          {profile.intro && <p className="sp-hero__intro">{profile.intro}</p>}
          <div className="sp-facts">
            {facts.map((f) => (
              <div className="sp-fact" key={f.k}>
                <div className="sp-fact__k">{f.k}</div>
                <div className="sp-fact__v">{f.v}</div>
                {f.note && <div className="sp-fact__note">{f.note}</div>}
              </div>
            ))}
          </div>
        </div>
        <div className="sp-hero__actions">{actions}</div>
      </div>
    </div>
  );
}

function SpeciesCard({ profile, search }: { profile: SpeciesProfile; search: string }) {
  return (
    <Link
      to={contextHref(`/species/${profile.slug}`, search, { entity: profile.id, journey: profile.atlasJourney ?? null })}
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
      {/* Full-screen life-first hero — MEET LIFE ON EARTH, with real search. */}
      <section style={{ position: "relative", height: "100svh", overflow: "hidden", background: "#05081b" }}>
        <img src="/assets/species/_index-hero.jpg" alt="A lone wild orca gliding through deep dark water, seen from above"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,8,27,.5) 0%, rgba(5,8,27,.05) 28%, rgba(5,8,27,.2) 60%, rgba(5,8,27,.92) 100%)" }} />
        <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(28px,5vw,88px)", maxWidth: 1100 }}>
          <div style={{ ...mono, color: "#fff", letterSpacing: ".18em", fontSize: 11, opacity: .9 }}>4PLANET SPECIES_</div>
          <h1 style={{ marginTop: 16, color: "#fff", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(34px,5vw,68px)", lineHeight: .98, letterSpacing: "-.035em", maxWidth: "16ch" }}>Meet life on Earth.</h1>
          <p style={{ marginTop: 16, maxWidth: "52ch", color: "rgba(255,255,255,.88)", fontSize: "clamp(15px,1.5vw,19px)", lineHeight: 1.5 }}>
            Explore species, their habitats and the relationships that shape life on Earth.
          </p>
          {/* Real species search — first-class, in the first viewport. */}
          <div style={{ marginTop: 26, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", maxWidth: 640 }}>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a species — common or scientific name…" aria-label="Search species"
              onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("species-results")?.scrollIntoView({ behavior: "smooth" }); }}
              style={{ flex: "1 1 320px", minWidth: 0, border: "1px solid rgba(255,255,255,.4)", padding: "14px 16px", fontSize: 15, fontFamily: T.sans, background: "rgba(5,8,27,.35)", color: "#fff" }} />
            <a href="#species-results" style={{ ...mono, fontSize: 12, letterSpacing: ".1em", background: "#fff", color: "#000", padding: "14px 18px", textDecoration: "none" }}>SEARCH →</a>
          </div>
          <div style={{ ...mono, marginTop: 18, color: "rgba(255,255,255,.6)", letterSpacing: ".2em", fontSize: 10 }}>{SPECIES_PROFILES.length} SPECIES · SCROLL ↓</div>
        </div>
      </section>
      <Section pad="clamp(56px,7vw,104px)">
        <span id="species-results" style={{ position: "relative", top: -80 }} aria-hidden />
        <div style={{ ...mono, color: T.blue }}>4PLANET SPECIES_</div>
        <h2 style={{ marginTop: 16, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(26px,3.2vw,44px)", lineHeight: 1.0, letterSpacing: "-.03em" }}>Meet life on Earth.</h2>
        <p style={{ marginTop: 18, maxWidth: 720, fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.55, color: T.dim }}>
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

function SpeciesEditorialProfile({
  profile,
  atlasHref,
  returnHref,
  occurrences,
  followed,
  onToggle,
  search,
}: {
  profile: SpeciesProfile;
  atlasHref: string;
  returnHref: string | null;
  occurrences: ObservationState;
  followed: boolean;
  onToggle: () => void;
  search: string;
}) {
  const media = speciesMedia(profile.slug);
  const show = hasShowableImage(profile.slug);
  const chapters = profile.narrativeChapters ?? [];
  const leadChapter = chapters[0];
  const supportingChapters = chapters.slice(1, 3);
  const sourceLinks = Array.from(new Map(
    [
      { label: profile.descriptorSource?.source ?? "GBIF taxon", url: profile.descriptorSource?.sourceUrl ?? profile.taxonSourceUrl },
      ...(profile.publicClaims ?? []).map((claim) => ({ label: claim.source, url: claim.sourceUrl })),
      ...chapters.flatMap((chapter) => chapter.claims.map((claim) => ({ label: claim.sourceLabel ?? "Source", url: claim.sourceUrl ?? "" }))),
      { label: `GBIF — ${profile.scientificName}`, url: profile.taxonSourceUrl },
    ].filter((source) => source.url).map((source) => [source.url, source]),
  ).values()).slice(0, 8);

  const heroBackground = show && media?.localPath
    ? undefined
    : "linear-gradient(145deg,#07101b 0%,#14293c 62%,#07101b 100%)";

  return (
    <PublicShell>
      <main className="species-editorial-page" style={{ background: "#FFFFFF", color: T.ink }}>
        <section
          data-species-section="hero"
          style={{ position: "relative", minHeight: "82svh", overflow: "hidden", background: heroBackground ?? "#07101b", borderBottom: `4px solid ${T.blue}` }}
        >
          {show && media?.localPath ? (
            <img
              src={media.localPath}
              alt={`${profile.commonName} — ${profile.scientificName}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 42%" }}
            />
          ) : null}
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(3,8,18,.12),rgba(3,8,18,.24) 40%,rgba(3,8,18,.84) 100%)" }} />
          <div style={{ position: "relative", zIndex: 1, minHeight: "82svh", display: "flex", alignItems: "flex-end", padding: "clamp(42px,8vw,104px) clamp(20px,6vw,86px)" }}>
            <div style={{ maxWidth: 980, color: "#FFFFFF" }}>
              {returnHref && <Link to={returnHref} style={{ ...mono, color: "#FFFFFF", display: "inline-block", marginBottom: 18 }}>← BACK TO ATLAS</Link>}
              <div style={{ ...mono, color: "#FFFFFF", opacity: .82 }}>4PLANET SPECIES_</div>
              <h1 style={{ margin: "16px 0 0", fontFamily: T.display, fontWeight: 520, fontSize: "clamp(64px,12vw,148px)", lineHeight: .82, letterSpacing: "-.07em" }}>{profile.commonName}</h1>
              <p style={{ margin: "18px 0 0", fontSize: "clamp(18px,2vw,25px)", fontStyle: "italic", opacity: .9 }}>{profile.scientificName}</p>
              {profile.intro && <p style={{ margin: "24px 0 0", maxWidth: 760, fontSize: "clamp(20px,2.5vw,30px)", lineHeight: 1.4 }}>{profile.intro}</p>}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 30 }}>
                <Link
                  to={atlasHref}
                  data-testid="species-to-atlas"
                  onClick={() => trackEvent("cross_product_navigation", { from_product: "species", to_product: "atlas", canonical_entity: profile.id })}
                  style={{ ...mono, minHeight: 50, display: "inline-flex", alignItems: "center", padding: "0 18px", background: T.blue, color: "#FFFFFF", textDecoration: "none" }}
                >{`EXPLORE ${profile.commonName.toUpperCase()} IN ATLAS →`}</Link>
                <button type="button" onClick={onToggle} className="editorial-secondary" style={{ minHeight: 50 }}>
                  {followed ? "WATCHING LOCALLY" : "ADD TO LOCAL WATCH"}
                </button>
                {profile.continuation && (
                  <Link
                    to={withReturnTo(profile.continuation.href, search)}
                    data-testid={profile.continuation.testId}
                    onClick={() => trackEvent("cross_product_navigation", { from_product: "species", to_product: profile.continuation!.toProduct, canonical_entity: profile.id })}
                    style={{ ...mono, minHeight: 50, display: "inline-flex", alignItems: "center", padding: "0 18px", background: "#FFFFFF", color: T.ink, textDecoration: "none" }}
                  >{profile.continuation.label}</Link>
                )}
                {profile.missionSlug && (
                  <Link
                    to={withReturnTo(`/missions/${profile.missionSlug}`, search)}
                    data-testid="species-to-mission"
                    style={{ ...mono, minHeight: 50, display: "inline-flex", alignItems: "center", padding: "0 18px", border: "1px solid rgba(255,255,255,.72)", color: "#FFFFFF", textDecoration: "none" }}
                  >{`${profile.missionSlug.toUpperCase()}_ MISSION →`}</Link>
                )}
              </div>
              <dl style={{ margin: "28px 0 0", display: "flex", gap: "18px 34px", flexWrap: "wrap", fontSize: 13 }}>
                <div><dt style={{ opacity: .62 }}>Taxon</dt><dd style={{ margin: "4px 0 0" }}>{profile.taxonomicStatus}</dd></div>
                {profile.region && <div><dt style={{ opacity: .62 }}>Region</dt><dd style={{ margin: "4px 0 0" }}>{profile.region}</dd></div>}
                <div><dt style={{ opacity: .62 }}>Source identity</dt><dd style={{ margin: "4px 0 0" }}>GBIF {profile.gbifKey}</dd></div>
              </dl>
            </div>
          </div>
          {media?.attribution && (
            <div style={{ position: "absolute", right: 14, bottom: 10, ...mono, color: "rgba(255,255,255,.72)", fontSize: 8 }}>
              {media.attribution}{media.licence ? ` · ${media.licence}` : ""}
            </div>
          )}
        </section>

        {profile.habitat && (
          <section data-species-section="habitat" style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(64px,9vw,118px) clamp(20px,5vw,64px)" }}>
            <div style={{ ...mono, color: T.blue }}>WHERE IT LIVES</div>
            <h2 style={{ margin: "14px 0 0", maxWidth: 900, fontFamily: T.display, fontSize: "clamp(42px,7vw,82px)", lineHeight: .96, letterSpacing: "-.05em", fontWeight: 520 }}>
              A species lives in systems, not pins on a map.
            </h2>
            <p style={{ margin: "26px 0 0", maxWidth: 780, fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.52 }}>{profile.habitat}</p>
            {profile.descriptorSource && (
              <p style={{ margin: "18px 0 0", maxWidth: 760, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>
                Source: <a href={profile.descriptorSource.sourceUrl} target="_blank" rel="noreferrer" style={{ color: T.blue }}>{profile.descriptorSource.source} ↗</a> · checked {profile.descriptorSource.checkedAt}. {profile.descriptorSource.note}
              </p>
            )}
          </section>
        )}

        {leadChapter && (
          <section data-species-section="lead-story" style={{ maxWidth: 980, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(64px,9vw,110px)" }}>
            <div style={{ ...mono, color: T.blue }}>{leadChapter.eyebrow.replace(/^[A-Z0-9_]+\s*·?\s*/i, "") || "LIFE"}</div>
            <h2 style={{ margin: "14px 0 0", maxWidth: 900, fontFamily: T.display, fontSize: "clamp(42px,7vw,82px)", lineHeight: .96, letterSpacing: "-.05em", fontWeight: 520 }}>
              {leadChapter.title}
            </h2>
            <p style={{ margin: "26px 0 0", maxWidth: 760, fontSize: "clamp(19px,2.4vw,25px)", lineHeight: 1.52 }}>{leadChapter.summary}</p>
          </section>
        )}

        {profile.fieldImages && profile.fieldImages.length > 0 && (
          <section data-species-section="field-media" style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(64px,9vw,110px)" }}>
            <div style={{ ...mono, color: T.blue, marginBottom: 18 }}>{profile.fieldEyebrow ?? "FROM THE FIELD"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,260px),1fr))", gap: 8 }}>
              {profile.fieldImages.map((image) => (
                <figure key={image.src} style={{ margin: 0, aspectRatio: "4/3", overflow: "hidden", background: "#07101b" }}>
                  <img src={image.src} alt={image.alt} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </figure>
              ))}
            </div>
            {profile.fieldNote && <p style={{ margin: "14px 0 0", maxWidth: 780, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{profile.fieldNote}</p>}
          </section>
        )}

        {supportingChapters.map((chapter) => (
          <section key={chapter.id} data-species-section="supporting-story" style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,64px)", borderTop: `1px solid ${T.line}` }}>
            <div style={{ ...mono, color: T.blue }}>{chapter.eyebrow.replace(/^[A-Z0-9_]+\s*·?\s*/i, "") || "EVIDENCE"}</div>
            <h2 style={{ margin: "14px 0 0", maxWidth: 900, fontFamily: T.display, fontSize: "clamp(36px,6vw,68px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 520 }}>{chapter.title}</h2>
            <p style={{ margin: "22px 0 0", maxWidth: 760, fontSize: "clamp(18px,2.2vw,24px)", lineHeight: 1.52 }}>{chapter.summary}</p>
          </section>
        ))}

        {profile.publicClaims && profile.publicClaims.length > 0 && (
          <section data-species-section="known" style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(56px,8vw,96px) clamp(20px,5vw,64px)", borderTop: `1px solid ${T.line}` }}>
            <div style={{ ...mono, color: T.blue }}>WHAT WE KNOW</div>
            <div style={{ marginTop: 22, display: "grid", gap: 0 }}>
              {profile.publicClaims.slice(0, 4).map((claim, index) => (
                <article key={`${claim.sourceUrl}-${index}`} style={{ padding: "20px 0", borderTop: `1px solid ${T.line}` }}>
                  <div style={{ ...mono, color: claim.state === "KNOWN" ? T.acid : claim.state === "INTERPRETED" ? T.blue : "#8A6500" }}>{claim.state}</div>
                  <p style={{ margin: "10px 0 0", maxWidth: 800, fontSize: 18, lineHeight: 1.55 }}>{claim.text}</p>
                  <p style={{ margin: "8px 0 0", maxWidth: 800, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{claim.limitation}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section data-species-section="atlas" style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(58px,8vw,100px) clamp(20px,5vw,64px)", borderTop: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: T.blue }}>WHERE RECORDED</div>
          <h2 style={{ margin: "14px 0 0", fontFamily: T.display, fontSize: "clamp(38px,6vw,72px)", lineHeight: .98, letterSpacing: "-.045em", fontWeight: 520 }}>Explore reported observations.</h2>
          {occurrences.status === "LIVE" ? (
            <p style={{ margin: "22px 0 0", maxWidth: 760, fontSize: "clamp(18px,2.2vw,24px)", lineHeight: 1.52 }}>
              GBIF currently reports {occurrences.total.toLocaleString()} occurrence records for {profile.commonName}. They show where observations have been reported — not where the species is right now, its abundance or its complete range.
            </p>
          ) : (
            <p style={{ margin: "22px 0 0", maxWidth: 760, fontSize: 18, lineHeight: 1.55 }}>Reported observation data is currently unavailable or returned no records. The species story and sources remain available.</p>
          )}
          <Link to={atlasHref} style={{ ...mono, display: "inline-block", marginTop: 24, color: T.blue, borderBottom: `1px solid ${T.blue}`, paddingBottom: 3 }}>OPEN OBSERVATIONS IN ATLAS →</Link>
          <div style={{ marginTop: 34 }}>
            <AtlasEmbed view={{
              kind: "SPECIES",
              title: profile.commonName + " — where recorded",
              entityId: profile.id,
              layers: ["bluemarble", "biodiv"],
              description: "Explore available source records for the same canonical taxon in full ATLAS.",
              limitation: "Historical occurrence records are not live animal positions, a verified distribution range, population abundance or a migration route.",
            }} />
          </div>
        </section>

        <section data-species-section="sources" style={{ maxWidth: 980, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(80px,10vw,128px)" }}>
          <details style={{ borderTop: `1px solid ${T.line}`, paddingTop: 26 }}>
            <summary style={{ ...mono, color: T.blue, cursor: "pointer", listStyle: "none" }}>SOURCES + NOTES</summary>
            <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
              {sourceLinks.map((source) => (
                <a key={source.url} href={source.url} target="_blank" rel="noreferrer" style={{ color: T.ink, textDecoration: "none", paddingBottom: 12, borderBottom: `1px solid ${T.line}` }}>
                  {source.label} ↗
                </a>
              ))}
            </div>
            {profile.truthBoundary && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.line}` }}>
                <strong>Truth boundary.</strong>
                <p style={{ margin: "10px 0 0", maxWidth: 780, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{profile.truthBoundary.text}</p>
                <p style={{ margin: "10px 0 0", maxWidth: 780, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>{profile.truthBoundary.disclosure}</p>
              </div>
            )}
            <p style={{ marginTop: 20, maxWidth: 760, color: T.dim, fontSize: 13.5, lineHeight: 1.55 }}>
              Public occurrence records are historical source records. They are not live positions, complete range maps, population counts, abundance estimates or migration routes.
            </p>
          </details>
        </section>
      </main>
    </PublicShell>
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
    trackEvent("species_opened", { product_area: "species", species_slug: profile.slug, canonical_entity: profile.id });
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
  const returnHref = returnHrefFromSearch(location.search);
  const atlasHref = returnHref ?? contextHref("/atlas", location.search, { entity: profile.id, journey: profile.atlasJourney ?? profile.slug });
  const followed = following(profile.id);

  return (
    <SpeciesEditorialProfile
      profile={profile}
      atlasHref={atlasHref}
      returnHref={returnHref}
      occurrences={occurrences}
      followed={followed}
      onToggle={() => toggle({ id: profile.id, type: "TAXON", label: profile.commonName, sub: profile.scientificName })}
      search={location.search}
    />
  );
}
