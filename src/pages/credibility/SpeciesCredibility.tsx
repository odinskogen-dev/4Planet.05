import type { CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { SPECIES_PROFILES, speciesBySlug } from "@/data/species";
import { T } from "@/styles/tokens";
import { NotFound } from "@/pages/system";

export function SpeciesCredibilityIndex() {
  return (
    <PublicShell>
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(94px,12vw,164px) clamp(20px,5vw,72px) clamp(76px,9vw,126px)" }}>
        <div style={{ ...mono, color: T.blue }}>SPECIES / BEGIN WITH LIFE</div>
        <h1 style={{ ...display, margin: "22px 0 0", fontSize: "clamp(56px,9vw,128px)", maxWidth: 1100 }}>Every system begins with something alive.</h1>
        <p style={{ margin: "28px 0 0", maxWidth: 800, fontSize: "clamp(19px,2.2vw,29px)", lineHeight: 1.3, letterSpacing: "-.02em" }}>
          Start with a species, then move into the places, relationships, pressures and evidence around it.
        </p>

        <div className="species-cred-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", borderTop: `1px solid ${T.ink}`, borderLeft: `1px solid ${T.ink}`, marginTop: 54 }}>
          {SPECIES_PROFILES.map((profile) => (
            <Link key={profile.id} to={`/species/${profile.slug}`} style={{ minHeight: 330, padding: 26, borderRight: `1px solid ${T.ink}`, borderBottom: `1px solid ${T.ink}`, color: T.ink, textDecoration: "none", display: "flex", flexDirection: "column" }}>
              <div style={{ ...mono, color: T.blue }}>LIFE</div>
              <h2 style={{ ...display, margin: "46px 0 0", fontSize: "clamp(32px,4vw,52px)" }}>{profile.commonName}</h2>
              <p style={{ margin: "8px 0 0", fontStyle: "italic", fontSize: 15, color: T.dim }}>{profile.scientificName}</p>
              <p style={{ margin: "22px 0 0", fontSize: 14, lineHeight: 1.55, color: T.dim }}>
                Accepted taxon identity from GBIF. Ecological interpretation remains bounded by source, population and place.
              </p>
              <span style={{ ...mono, color: T.blue, marginTop: "auto", paddingTop: 28 }}>Explore →</span>
            </Link>
          ))}
        </div>
      </section>
      <style>{`@media(max-width:820px){.species-cred-grid{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

export function SpeciesCredibilityProfile() {
  const { slug } = useParams();
  const profile = speciesBySlug(slug);
  if (!profile) return <NotFound />;
  if (profile.slug === "orca") return null;

  return (
    <PublicShell>
      <section style={{ maxWidth: 1380, margin: "0 auto", padding: "clamp(94px,12vw,164px) clamp(20px,5vw,72px) clamp(76px,9vw,126px)" }}>
        <Link to="/species" style={{ ...mono, color: T.blue, textDecoration: "none" }}>← SPECIES</Link>
        <div style={{ ...mono, color: T.blue, marginTop: 52 }}>LIFE / SOURCE IDENTITY</div>
        <h1 style={{ ...display, margin: "20px 0 0", fontSize: "clamp(58px,10vw,136px)" }}>{profile.commonName}</h1>
        <p style={{ margin: "18px 0 0", fontSize: "clamp(20px,2.5vw,31px)", fontStyle: "italic" }}>{profile.scientificName}</p>
        <p style={{ margin: "34px 0 0", maxWidth: 820, fontSize: 18, lineHeight: 1.6 }}>{profile.context}</p>

        <div className="species-safe-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: T.line, marginTop: 50 }}>
          <div style={{ background: "#fff", padding: "clamp(22px,3vw,34px)" }}>
            <div style={{ ...mono, color: T.blue }}>SOURCE IDENTITY</div>
            <dl style={{ margin: "22px 0 0", display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px", fontSize: 14 }}>
              <dt>Scientific name</dt><dd>{profile.scientificName}</dd>
              <dt>Rank</dt><dd>{profile.rank}</dd>
              <dt>Status</dt><dd>{profile.taxonomicStatus}</dd>
              <dt>GBIF key</dt><dd>{profile.gbifKey}</dd>
            </dl>
            <a href={profile.taxonSourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, display: "inline-block", marginTop: 24, color: T.blue, textDecoration: "none" }}>Open GBIF taxon record ↗</a>
          </div>
          <div style={{ background: "#fff", padding: "clamp(22px,3vw,34px)" }}>
            <div style={{ ...mono, color: "#8A6500" }}>OCCURRENCE DATA</div>
            <h2 style={{ ...display, margin: "18px 0 0", fontSize: "clamp(28px,4vw,46px)" }}>Source records, not live tracking.</h2>
            <p style={{ margin: "16px 0 0", fontSize: 14.5, lineHeight: 1.6, color: T.dim }}>
              Occurrence records may report where and when a species was observed. They do not by themselves establish current location, range, abundance, population trend or ecological condition.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}>
          <Link to={`/atlas?entity=${encodeURIComponent(profile.id)}&journey=${profile.slug}`} style={primaryButton}>See this species in ATLAS →</Link>
          <Link to="/living-systems" style={secondaryButton}>Explore relationships</Link>
        </div>
      </section>
      <style>{`@media(max-width:720px){.species-safe-grid{grid-template-columns:1fr!important}}`}</style>
    </PublicShell>
  );
}

const display: CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.055em", lineHeight: .92 };
const mono: CSSProperties = { fontFamily: T.mono, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase" };
const primaryButton: CSSProperties = { display: "inline-flex", padding: "12px 16px", border: `1px solid ${T.ink}`, background: T.ink, color: "#fff", textDecoration: "none", fontSize: 13 };
const secondaryButton: CSSProperties = { ...primaryButton, background: "#fff", color: T.ink };
