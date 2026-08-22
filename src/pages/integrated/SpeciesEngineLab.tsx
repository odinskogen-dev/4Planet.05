import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { T } from "@/styles/tokens";
import {
  materializeUniversalTaxonProfile,
  NORWAY_FIELD_PROOF_TAXA,
  type UniversalTaxonProfile,
} from "@/species/engine";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".13em",
  textTransform: "uppercase",
};

const border = `1px solid ${T.line}`;

function SourceBadge({ source, state }: { source: string; state: string }) {
  const available = state === "AVAILABLE";
  return (
    <span
      style={{
        ...mono,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        border,
        padding: "7px 9px",
        color: available ? T.ink : T.dim,
        background: "#fff",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: available ? T.acid : T.line,
        }}
      />
      {source} · {state}
    </span>
  );
}

function UniversalProfileView({ profile }: { profile: UniversalTaxonProfile }) {
  const displayName = profile.commonName || profile.canonicalName;
  return (
    <section style={{ borderTop: border, marginTop: 48 }} data-testid="species-engine-profile">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1.2fr) minmax(280px,.8fr)",
          minHeight: "68vh",
        }}
        className="stack-clean"
      >
        <div style={{ padding: "clamp(28px,5vw,72px)", borderRight: border }}>
          <div style={{ ...mono, color: T.blue }}>SPECIES ENGINE 01 · UNIVERSAL PROFILE</div>
          <h1
            style={{
              marginTop: 22,
              fontFamily: T.display,
              fontSize: "clamp(44px,7vw,104px)",
              lineHeight: .9,
              letterSpacing: "-.055em",
              fontWeight: 500,
            }}
          >
            {displayName}
          </h1>
          {profile.commonName && (
            <p style={{ marginTop: 13, fontSize: 18, fontStyle: "italic", color: T.dim }}>
              {profile.canonicalName}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
            <span style={{ ...mono, border, padding: "7px 9px" }}>{profile.rank}</span>
            {profile.kingdom && <span style={{ ...mono, border, padding: "7px 9px" }}>{profile.kingdom}</span>}
            {profile.status && <span style={{ ...mono, border, padding: "7px 9px" }}>{profile.status}</span>}
            <span style={{ ...mono, border, padding: "7px 9px", color: "#8A6500" }}>
              {profile.identityState}
            </span>
          </div>

          <div style={{ marginTop: 48, maxWidth: 760 }}>
            <div style={{ ...mono, color: T.dim }}>Taxonomy</div>
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
              {profile.classification.length ? (
                profile.classification.map((node, index) => (
                  <span key={`${node.key ?? node.name}-${index}`} style={{ fontSize: 13.5 }}>
                    {node.name}
                    {index < profile.classification.length - 1 ? " →" : ""}
                  </span>
                ))
              ) : (
                <span style={{ color: T.dim }}>No classification returned by source.</span>
              )}
            </div>
          </div>

          <div style={{ marginTop: 48 }}>
            <div style={{ ...mono, color: T.dim }}>External identity crosswalk</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 1, background: T.line, marginTop: 14, border }}>
              <div style={{ padding: 18, background: "#fff" }}>
                <div style={{ ...mono, color: T.dim }}>4PLANET</div>
                <div style={{ marginTop: 8, fontSize: 12, overflowWrap: "anywhere" }}>{profile.id}</div>
              </div>
              <div style={{ padding: 18, background: "#fff" }}>
                <div style={{ ...mono, color: T.dim }}>COL XR</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>{profile.externalIds.colXr ?? "—"}</div>
              </div>
              <div style={{ padding: 18, background: "#fff" }}>
                <div style={{ ...mono, color: T.dim }}>Artsdatabanken Taxon</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>{profile.externalIds.artsdatabankenTaxonId ?? "—"}</div>
              </div>
              <div style={{ padding: 18, background: "#fff" }}>
                <div style={{ ...mono, color: T.dim }}>ScientificNameId</div>
                <div style={{ marginTop: 8, fontSize: 14 }}>{profile.externalIds.artsdatabankenScientificNameId ?? "—"}</div>
              </div>
            </div>
          </div>
        </div>

        <aside style={{ padding: "clamp(28px,4vw,52px)", background: T.mist }}>
          <div style={{ ...mono, color: T.dim }}>Norway context</div>
          <div style={{ marginTop: 15, fontFamily: T.display, fontSize: 30, lineHeight: 1 }}>
            {profile.norwegianContext?.existsInCountry === true
              ? "Recorded in Norway"
              : profile.norwegianContext?.existsInCountry === false
                ? "Not marked as present"
                : "Source state unknown"}
          </div>
          {profile.norwegianContext?.taxonGroup && (
            <p style={{ marginTop: 10, color: T.dim }}>Artsdatabanken group: {profile.norwegianContext.taxonGroup}</p>
          )}

          <div style={{ marginTop: 40, paddingTop: 26, borderTop: border }}>
            <div style={{ ...mono, color: T.dim }}>Norway occurrence records</div>
            <div style={{ marginTop: 10, fontFamily: T.display, fontSize: 56, lineHeight: 1 }}>
              {profile.occurrences ? profile.occurrences.total.toLocaleString("en-GB") : "—"}
            </div>
            <p style={{ marginTop: 10, fontSize: 12.5, lineHeight: 1.55, color: T.dim }}>
              Reported GBIF records using COL XR taxonomy. This is not range, abundance, population trend or live location.
            </p>
          </div>

          <div style={{ marginTop: 40, paddingTop: 26, borderTop: border }}>
            <div style={{ ...mono, color: T.dim }}>Live sources</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 13 }}>
              {profile.sources.map((source, index) => (
                <SourceBadge key={`${source.source}-${index}`} source={source.source} state={source.state} />
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div style={{ padding: "clamp(28px,5vw,64px)", borderTop: border }}>
        <div style={{ ...mono, color: T.dim }}>Truth boundaries</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 1, background: T.line, marginTop: 16, border }}>
          {profile.limitations.map((limitation) => (
            <div key={limitation} style={{ background: "#fff", padding: 20, fontSize: 13, lineHeight: 1.55 }}>
              {limitation}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpeciesEngineLab() {
  const [query, setQuery] = useState("Picea abies");
  const [rank, setRank] = useState("species");
  const [profile, setProfile] = useState<UniversalTaxonProfile | null>(null);
  const [status, setStatus] = useState<"IDLE" | "LOADING" | "ERROR" | "READY">("IDLE");
  const [error, setError] = useState<string | null>(null);

  const quickTaxa = useMemo(() => NORWAY_FIELD_PROOF_TAXA, []);

  async function run(name = query, nextRank = rank) {
    const scientificName = name.trim();
    if (!scientificName) return;
    setStatus("LOADING");
    setError(null);
    setProfile(null);
    const result = await materializeUniversalTaxonProfile(scientificName, {
      rank: nextRank,
      norway: true,
    });
    if (!result.ok) {
      setStatus("ERROR");
      setError(result.error);
      return;
    }
    setProfile(result.data);
    setStatus("READY");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void run();
  }

  return (
    <PublicShell>
      <main style={{ background: "#fff", minHeight: "100vh", color: T.ink }}>
        <header style={{ padding: "clamp(28px,5vw,72px)", borderBottom: border }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ ...mono, color: T.blue }}>4PLANET SPECIES_ · ENGINE LAB 01</div>
            <Link to="/species" style={{ ...mono, color: T.dim }}>← SPECIES</Link>
          </div>
          <div style={{ maxWidth: 980, marginTop: 48 }}>
            <h1 style={{ fontFamily: T.display, fontSize: "clamp(42px,7vw,94px)", lineHeight: .92, letterSpacing: "-.055em", fontWeight: 500 }}>
              One profile engine.<br />Life at planetary scale.
            </h1>
            <p style={{ marginTop: 24, maxWidth: 700, fontSize: "clamp(16px,2vw,21px)", lineHeight: 1.5, color: T.dim }}>
              Resolve a real taxon against Catalogue of Life XR, enrich it with Norwegian source context, and materialise a source-aware 4PLANET Universal Profile on demand.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ marginTop: 42, display: "grid", gridTemplateColumns: "minmax(0,1fr) 150px auto", maxWidth: 980, border }} className="stack-clean">
            <label style={{ display: "block", padding: 14, borderRight: border }}>
              <span style={{ ...mono, color: T.dim }}>Scientific name</span>
              <input
                aria-label="Scientific name"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Picea abies"
                style={{ display: "block", width: "100%", border: 0, outline: 0, marginTop: 7, fontSize: 18, background: "transparent" }}
              />
            </label>
            <label style={{ display: "block", padding: 14, borderRight: border }}>
              <span style={{ ...mono, color: T.dim }}>Rank</span>
              <select
                aria-label="Taxon rank"
                value={rank}
                onChange={(event) => setRank(event.target.value)}
                style={{ display: "block", width: "100%", border: 0, outline: 0, marginTop: 7, fontSize: 16, background: "transparent" }}
              >
                <option value="species">Species</option>
                <option value="genus">Genus</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={status === "LOADING"}
              style={{ padding: "0 28px", minHeight: 68, background: T.blue, color: "#fff", fontSize: 13, fontWeight: 600 }}
            >
              {status === "LOADING" ? "RESOLVING…" : "BUILD PROFILE →"}
            </button>
          </form>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {quickTaxa.map((taxon) => (
              <button
                type="button"
                key={taxon.scientificName}
                onClick={() => {
                  setQuery(taxon.scientificName);
                  setRank(taxon.rank);
                  void run(taxon.scientificName, taxon.rank);
                }}
                style={{ ...mono, border, padding: "8px 10px", background: "#fff" }}
              >
                {taxon.label} · {taxon.scientificName}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, ...mono, color: status === "ERROR" ? "#9f2a1d" : T.dim }} role="status">
            {status === "IDLE" && "READY · NO PROFILE MATERIALISED YET"}
            {status === "LOADING" && "QUERYING LIVE SOURCES…"}
            {status === "ERROR" && `SOURCE RESOLUTION FAILED · ${error}`}
            {status === "READY" && "LIVE SOURCES RESOLVED · UNIVERSAL PROFILE MATERIALISED"}
          </div>
        </header>

        {profile && <UniversalProfileView profile={profile} />}
      </main>
    </PublicShell>
  );
}
