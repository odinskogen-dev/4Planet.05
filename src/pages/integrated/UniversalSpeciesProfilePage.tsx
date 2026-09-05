import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { ResolvedSpeciesMediaGallery } from "@/components/species/ResolvedSpeciesMediaGallery";
import { materializeUniversalTaxonProfile, type UniversalTaxonProfile } from "@/species/engine";
import { fetchResolvedSpeciesImages, type ResolvedSpeciesImage } from "@/species/media";
import { canonicalSpeciesPath, scientificNameFromCanonicalSlug } from "@/species/slug";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".13em",
  textTransform: "uppercase",
};

const border = `1px solid ${T.line}`;

type LoadState = "LOADING" | "READY" | "ERROR";
type MediaState = "IDLE" | "LOADING" | "READY" | "ERROR";

export function UniversalSpeciesProfilePage() {
  const { slug = "" } = useParams();
  const scientificName = scientificNameFromCanonicalSlug(slug);
  const [state, setState] = useState<LoadState>("LOADING");
  const [profile, setProfile] = useState<UniversalTaxonProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<ResolvedSpeciesImage[]>([]);
  const [mediaState, setMediaState] = useState<MediaState>("IDLE");
  const [mediaNote, setMediaNote] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!scientificName) {
        setError("INVALID_CANONICAL_SLUG");
        setState("ERROR");
        return;
      }

      setState("LOADING");
      setError(null);
      setProfile(null);
      setMedia([]);
      setMediaState("IDLE");

      const profileResult = await materializeUniversalTaxonProfile(scientificName, { norway: true });
      if (cancelled) return;
      if (!profileResult.ok) {
        setError(profileResult.error);
        setState("ERROR");
        return;
      }

      const nextProfile = profileResult.data;
      setProfile(nextProfile);
      setState("READY");

      const canonicalPath = canonicalSpeciesPath(nextProfile.canonicalName);
      if (canonicalPath !== `/species/${slug}` && window.history?.replaceState) {
        window.history.replaceState(null, "", canonicalPath);
      }

      const colXr = nextProfile.externalIds.colXr;
      if (!colXr) {
        setMediaState("READY");
        setMediaNote("No COL XR identity was available, so no source image query was attempted.");
        return;
      }

      setMediaState("LOADING");
      const mediaResult = await fetchResolvedSpeciesImages(colXr, { countryFirst: "NO", limit: 8 });
      if (cancelled) return;
      if (!mediaResult.ok) {
        setMediaState("ERROR");
        setMediaError(mediaResult.error);
        setMediaNote(mediaResult.note ?? null);
        return;
      }
      setMedia(mediaResult.data);
      setMediaNote(mediaResult.note);
      setMediaState("READY");
    }

    void load();
    return () => { cancelled = true; };
  }, [scientificName, slug]);

  if (state === "LOADING") {
    return (
      <PublicShell>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff", color: T.ink }}>
          <div style={{ ...mono, color: T.dim }}>SPECIES ENGINE · MATERIALISING LIVE PROFILE…</div>
        </main>
      </PublicShell>
    );
  }

  if (state === "ERROR" || !profile) {
    return (
      <PublicShell>
        <main style={{ minHeight: "100vh", padding: "clamp(32px,6vw,80px)", background: "#fff", color: T.ink }}>
          <div style={{ ...mono, color: "#9f2a1d" }}>SPECIES ENGINE · SOURCE RESOLUTION FAILED</div>
          <h1 style={{ marginTop: 22, fontFamily: T.display, fontSize: "clamp(42px,7vw,90px)", lineHeight: .92, letterSpacing: "-.055em", fontWeight: 500 }}>
            No profile resolved.
          </h1>
          <p style={{ marginTop: 20, color: T.dim }}>{error}</p>
          <Link to="/species" style={{ ...mono, display: "inline-block", marginTop: 28, color: T.blue }}>← SPECIES</Link>
        </main>
      </PublicShell>
    );
  }

  const displayName = profile.commonName || profile.canonicalName;

  return (
    <PublicShell>
      <main style={{ minHeight: "100vh", background: "#fff", color: T.ink }}>
        <header style={{ padding: "clamp(28px,5vw,72px)", borderBottom: border }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ ...mono, color: T.blue }}>4PLANET SPECIES_ · UNIVERSAL PROFILE</div>
            <Link to="/species" style={{ ...mono, color: T.dim }}>← SPECIES</Link>
          </div>

          <div style={{ marginTop: 50, display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)", gap: 1, background: T.line, border }} className="stack-clean">
            <section style={{ background: "#fff", padding: "clamp(28px,5vw,64px)" }}>
              <div style={{ ...mono, color: T.dim }}>{profile.rank} · {profile.kingdom ?? "LIFE"}</div>
              <h1 style={{ marginTop: 18, fontFamily: T.display, fontSize: "clamp(52px,8vw,116px)", lineHeight: .88, letterSpacing: "-.06em", fontWeight: 500 }}>
                {displayName}
              </h1>
              {profile.commonName && (
                <p style={{ marginTop: 14, fontSize: 20, color: T.dim, fontStyle: "italic" }}>{profile.canonicalName}</p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 26 }}>
                <span style={{ ...mono, border, padding: "7px 9px" }}>{profile.status ?? "STATUS UNKNOWN"}</span>
                <span style={{ ...mono, border, padding: "7px 9px", color: "#8A6500" }}>{profile.identityState}</span>
              </div>

              <ResolvedSpeciesMediaGallery
                scientificName={profile.canonicalName}
                images={media}
                note={mediaNote}
                status={mediaState}
                error={mediaError}
              />
            </section>

            <aside style={{ background: "#F5F5F4", padding: "clamp(28px,4vw,52px)" }}>
              <div style={{ ...mono, color: T.dim }}>Canonical 4PLANET home</div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, overflowWrap: "anywhere" }}>
                {canonicalSpeciesPath(profile.canonicalName)}
              </div>

              <div style={{ marginTop: 34, paddingTop: 24, borderTop: border }}>
                <div style={{ ...mono, color: T.dim }}>4PLANET identity</div>
                <div style={{ marginTop: 8, fontSize: 12, lineHeight: 1.5, overflowWrap: "anywhere" }}>{profile.id}</div>
                <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>
                  TEST registry persistence is browser-local until shared BRAIN storage is connected.
                </p>
              </div>

              <div style={{ marginTop: 34, paddingTop: 24, borderTop: border }}>
                <div style={{ ...mono, color: T.dim }}>Norway occurrence evidence</div>
                <div style={{ marginTop: 10, fontFamily: T.display, fontSize: 58, lineHeight: 1 }}>
                  {profile.occurrences ? profile.occurrences.total.toLocaleString("en-GB") : "—"}
                </div>
                <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>
                  Reported GBIF occurrence records. Not range, abundance, trend or live location.
                </p>
              </div>

              <div style={{ marginTop: 34, paddingTop: 24, borderTop: border }}>
                <div style={{ ...mono, color: T.dim }}>Journey readiness</div>
                <strong style={{ display: "block", marginTop: 10, fontFamily: T.display, fontSize: 28, fontWeight: 500 }}>UNIVERSAL · NOT GOLD</strong>
                <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>
                  Ecosystem relationships and premium Journey Engine output are separate curated layers and are not fabricated here.
                </p>
              </div>
            </aside>
          </div>
        </header>

        <section style={{ padding: "clamp(28px,5vw,64px)" }}>
          <div style={{ ...mono, color: T.dim }}>Taxonomy</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", marginTop: 16, fontSize: 14 }}>
            {profile.classification.map((node, index) => (
              <span key={`${node.key ?? node.name}-${index}`}>
                {node.name}{index < profile.classification.length - 1 ? " →" : ""}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 42, ...mono, color: T.dim }}>Source crosswalk</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 1, background: T.line, border }}>
            <div style={{ padding: 18, background: "#fff" }}><div style={{ ...mono, color: T.dim }}>COL XR</div><div style={{ marginTop: 8 }}>{profile.externalIds.colXr ?? "—"}</div></div>
            <div style={{ padding: 18, background: "#fff" }}><div style={{ ...mono, color: T.dim }}>Artsdatabanken Taxon</div><div style={{ marginTop: 8 }}>{profile.externalIds.artsdatabankenTaxonId ?? "—"}</div></div>
            <div style={{ padding: 18, background: "#fff" }}><div style={{ ...mono, color: T.dim }}>ScientificNameId</div><div style={{ marginTop: 8 }}>{profile.externalIds.artsdatabankenScientificNameId ?? "—"}</div></div>
          </div>

          <div style={{ marginTop: 42, ...mono, color: T.dim }}>Truth boundaries</div>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 1, background: T.line, border }}>
            {profile.limitations.map((limitation) => (
              <div key={limitation} style={{ padding: 20, background: "#fff", fontSize: 13, lineHeight: 1.55 }}>{limitation}</div>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export default UniversalSpeciesProfilePage;
