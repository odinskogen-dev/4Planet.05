import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { SpeciesSourceEnvelope } from "@/data/speciesSourceEnvelope";
import { fetchSpeciesIntelligence, type SpeciesIntelligenceBundle } from "@/data/speciesIntelligence";
import { T } from "@/styles/tokens";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".12em",
  textTransform: "uppercase",
};

const stateColor = (state: string) => {
  if (state === "KNOWN") return T.acid;
  if (state === "INTERPRETED") return T.blue;
  return "#8A6500";
};

const refreshColor = (state: string) => {
  if (state === "UNCHANGED") return T.acid;
  if (state === "CHANGED") return T.blue;
  return "#8A6500";
};

const publicRefreshStatus = (refresh: { status: string; verification: string; truthEffect: string }) => {
  if (refresh.status === "UNCHANGED") return "Checked — no source change";
  if (refresh.status === "UNAVAILABLE") return "Source temporarily unavailable";
  if (refresh.status === "CONFLICT") return "Conflicting source information — under review";
  if (refresh.status === "CHANGED" && refresh.verification !== "VERIFIED") return "Source changed — under review";
  if (refresh.status === "CHANGED" && refresh.truthEffect === "UPDATE") return "Source update verified";
  return "Source checked — review required";
};

const publicRefreshMeaning = (refresh: { status: string; verification: string; truthEffect: string }) => {
  if (refresh.status === "UNCHANGED") return "We checked the source and found no verified source-version change. The existing evidence remains in place.";
  if (refresh.status === "UNAVAILABLE") return "We could not verify the source during the latest check. Existing evidence is preserved rather than guessed, deleted or silently replaced.";
  if (refresh.status === "CONFLICT") return "The source state conflicts with what we already hold. We preserve both the conflict and the existing public evidence until it is resolved.";
  if (refresh.status === "CHANGED" && refresh.verification !== "VERIFIED") return "Something changed at the source, but that does not automatically mean the real-world fact changed. Existing public evidence stays unchanged while the difference is reviewed.";
  if (refresh.status === "CHANGED" && refresh.truthEffect === "UPDATE") return "A source metadata change was verified and may update this evidence record. Factual claims still require their own evidence review.";
  return "This source needs review before it can affect public evidence.";
};

export function SpeciesEvidenceSeam({ envelope }: { envelope?: SpeciesSourceEnvelope }) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [liveIntel, setLiveIntel] = useState<SpeciesIntelligenceBundle | null>(null);
  const [liveIntelState, setLiveIntelState] = useState<"IDLE" | "LOADING" | "READY" | "PARTIAL" | "UNAVAILABLE">("IDLE");

  useEffect(() => {
    setTarget(document.getElementById("main-content"));
  }, []);

  useEffect(() => {
    if (!envelope?.scientificName) {
      setLiveIntel(null);
      setLiveIntelState("IDLE");
      return;
    }
    const controller = new AbortController();
    setLiveIntel(null);
    setLiveIntelState("LOADING");
    void fetchSpeciesIntelligence(envelope.scientificName, new Date().toISOString(), {
      signal: controller.signal,
      researchLimit: 5,
      interactionLimit: 8,
    }).then((bundle) => {
      if (controller.signal.aborted) return;
      setLiveIntel(bundle);
      const researchAvailable = bundle.research.snapshot.available;
      const interactionsAvailable = bundle.interactions.snapshot.available;
      setLiveIntelState(
        researchAvailable && interactionsAvailable ? "READY"
          : researchAvailable || interactionsAvailable ? "PARTIAL"
            : "UNAVAILABLE",
      );
    }).catch(() => {
      if (!controller.signal.aborted) setLiveIntelState("UNAVAILABLE");
    });
    return () => controller.abort();
  }, [envelope?.scientificName]);

  if (!envelope || !target) return null;

  const checkedDates = envelope.records
    .map((record) => record.checkedAt)
    .filter(Boolean)
    .sort();
  const latestChecked = checkedDates.length ? checkedDates[checkedDates.length - 1] : "UNKNOWN";
  const refreshRecords = envelope.records.filter((record) => record.lastRefresh);

  return createPortal(
    <section
      data-testid="species-source-evidence-seam"
      aria-labelledby="species-source-evidence-title"
      style={{
        borderTop: `1px solid ${T.line}`,
        background: "#fff",
        color: T.ink,
        padding: "clamp(48px,7vw,104px) clamp(20px,5vw,72px)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ ...mono, color: T.blue }}>HOW DO WE KNOW?</div>
        <h2
          id="species-source-evidence-title"
          style={{
            marginTop: 14,
            maxWidth: 800,
            fontFamily: T.display,
            fontWeight: 500,
            fontSize: "clamp(32px,5vw,64px)",
            lineHeight: .98,
            letterSpacing: "-.04em",
          }}
        >
          The evidence travels with the species.
        </h2>
        <p style={{ marginTop: 20, maxWidth: 760, color: T.dim, fontSize: 16, lineHeight: 1.6 }}>
          {envelope.scientificName} keeps its sources, provenance, uncertainty and update rules attached to one shared species object. We show the simple meaning first. Open any source for the deeper evidence, limits and original record. Missing evidence stays unknown.
        </p>

        <div style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>{envelope.records.length} SOURCES</span>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>LAST CHECKED {latestChecked}</span>
          <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>LIMITS ATTACHED</span>
          {refreshRecords.length > 0 && (
            <span style={{ ...mono, border: `1px solid ${T.lineStrong}`, padding: "7px 9px" }}>{refreshRecords.length} RECENT SOURCE CHECK</span>
          )}
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 30 }}>
          {envelope.records.map((record) => {
            const color = stateColor(record.evidenceState);
            const refresh = record.lastRefresh;
            return (
              <details key={record.id} style={{ border: `1px solid ${T.line}`, borderLeft: `3px solid ${color}`, padding: "0 16px" }}>
                <summary style={{ cursor: "pointer", listStyle: "none", padding: "16px 0", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  <span>
                    <strong style={{ fontFamily: T.display, fontSize: 18, fontWeight: 600 }}>{record.label}</strong>
                    <span style={{ ...mono, display: "block", marginTop: 5, color: T.dim }}>{record.purpose} · {record.sourceFamily}</span>
                    {refresh && (
                      <span style={{ display: "block", marginTop: 7, fontSize: 13, color: refreshColor(refresh.status) }}>
                        {publicRefreshStatus(refresh)}
                      </span>
                    )}
                  </span>
                  <span style={{ ...mono, color }}>{record.evidenceState}</span>
                </summary>
                <div style={{ borderTop: `1px solid ${T.line}`, padding: "16px 0 20px", display: "grid", gap: 14 }}>
                  {refresh && (
                    <div
                      data-testid={`source-refresh-${record.id}`}
                      style={{ borderBottom: `1px solid ${T.line}`, paddingBottom: 14 }}
                    >
                      <div style={{ ...mono, color: refreshColor(refresh.status) }}>WHAT THIS MEANS</div>
                      <p style={{ marginTop: 6, maxWidth: 760, lineHeight: 1.55 }}>{publicRefreshMeaning(refresh)}</p>
                      <details style={{ marginTop: 10 }}>
                        <summary style={{ ...mono, cursor: "pointer", color: T.dim }}>TECHNICAL SOURCE REFRESH CHECK</summary>
                        <div style={{ marginTop: 9, color: T.dim, lineHeight: 1.55 }}>
                          <div style={mono}>STATUS {refresh.status} · VERIFICATION {refresh.verification}</div>
                          <p style={{ marginTop: 6 }}>{refresh.note}</p>
                          <div style={{ ...mono, marginTop: 8 }}>
                            CHECKED {refresh.checkedAt} · TRUTH EFFECT {refresh.truthEffect}
                            {refresh.sourceVersion ? ` · VERSION ${refresh.sourceVersion}` : ""}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                  <div>
                    <div style={{ ...mono, color: T.dim }}>PROVENANCE</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.provenance}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: "#8A6500" }}>UNCERTAINTY / LIMIT</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.uncertainty}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: T.dim }}>RIGHTS / TERMS</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.rightsOrTerms}</p>
                  </div>
                  <div>
                    <div style={{ ...mono, color: T.dim }}>UPDATE RULE</div>
                    <p style={{ marginTop: 6, lineHeight: 1.55 }}>{record.updateSemantics}</p>
                  </div>
                  <a href={record.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, width: "fit-content", color: T.blue }}>
                    OPEN ORIGINAL SOURCE ↗
                  </a>
                </div>
              </details>
            );
          })}
        </div>

        <section data-testid="species-live-intelligence" data-source-layer="OPENALEX_GLOBI_DISCOVERY_01" aria-labelledby="species-live-intelligence-title" style={{ marginTop: 34, borderTop: `1px solid ${T.line}`, paddingTop: 30 }}>
          <div style={{ ...mono, color: T.blue }}>LIVE DISCOVERY · SOURCE-BOUNDED</div>
          <h3 id="species-live-intelligence-title" style={{ marginTop: 10, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(26px,3.4vw,42px)", letterSpacing: "-.035em" }}>
            Research and documented relationships.
          </h3>
          <p style={{ marginTop: 12, maxWidth: 760, color: T.dim, lineHeight: 1.6 }}>
            This is a live discovery layer around the canonical species object. OpenAlex metadata helps find relevant research; GloBI exposes interaction records contributed by underlying datasets. Neither source automatically changes canonical 4PLANET claims.
          </p>

          {liveIntelState === "LOADING" && <p role="status" style={{ marginTop: 18, color: T.dim }}>Checking current research metadata and interaction records…</p>}
          {liveIntelState === "UNAVAILABLE" && <p role="status" style={{ marginTop: 18, color: "#8A6500" }}>Live discovery sources are unavailable right now. Existing species evidence remains unchanged.</p>}
          {liveIntel && (liveIntelState === "READY" || liveIntelState === "PARTIAL") && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 22 }}>
              <article style={{ border: `1px solid ${T.line}`, padding: 18 }}>
                <div style={{ ...mono, color: T.dim }}>OPENALEX · RESEARCH DISCOVERY</div>
                <strong style={{ display: "block", marginTop: 8, fontFamily: T.display, fontSize: 22 }}>
                  {liveIntel.research.works.length} current metadata result{liveIntel.research.works.length === 1 ? "" : "s"}
                </strong>
                <p style={{ marginTop: 8, color: T.dim, fontSize: 13, lineHeight: 1.55 }}>Search results are not findings or endorsements. Article text is not copied into this surface.</p>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {liveIntel.research.works.slice(0, 5).map((work) => (
                    <a key={work.openAlexId} href={work.doi ?? work.openAlexId} target="_blank" rel="noreferrer" style={{ color: T.ink, textDecoration: "none", borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
                      <strong style={{ display: "block", fontSize: 14, lineHeight: 1.4 }}>{work.title}</strong>
                      <span style={{ ...mono, display: "block", marginTop: 5, color: T.dim }}>{work.publicationYear ?? "YEAR UNKNOWN"}{work.sourceName ? ` · ${work.sourceName}` : ""}</span>
                    </a>
                  ))}
                  {liveIntel.research.works.length === 0 && <span style={{ color: T.dim, fontSize: 13 }}>No bounded results returned. That is not evidence that no research exists.</span>}
                </div>
              </article>

              <article style={{ border: `1px solid ${T.line}`, padding: 18 }}>
                <div style={{ ...mono, color: "#8A6500" }}>GLOBI · INTERACTION RECORDS · REVIEW REQUIRED</div>
                <strong style={{ display: "block", marginTop: 8, fontFamily: T.display, fontSize: 22 }}>
                  {liveIntel.interactions.interactions.length} source-linked record{liveIntel.interactions.interactions.length === 1 ? "" : "s"}
                </strong>
                <p style={{ marginTop: 8, color: T.dim, fontSize: 13, lineHeight: 1.55 }}>An indexed interaction is not universal behaviour, local presence or current ecological state. Original study and dataset provenance remain required.</p>
                <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                  {liveIntel.interactions.interactions.slice(0, 6).map((interaction, index) => (
                    <div key={`${interaction.sourceTaxonName}-${interaction.interactionType}-${interaction.targetTaxonName}-${index}`} style={{ borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
                      <strong style={{ display: "block", fontSize: 14 }}>{interaction.sourceTaxonName} → {interaction.interactionType} → {interaction.targetTaxonName}</strong>
                      <span style={{ display: "block", marginTop: 5, color: T.dim, fontSize: 12, lineHeight: 1.45 }}>{interaction.studyCitation || interaction.studySourceCitation || "Underlying citation not returned in this bounded record."}</span>
                    </div>
                  ))}
                  {liveIntel.interactions.interactions.length === 0 && <span style={{ color: T.dim, fontSize: 13 }}>No bounded records returned. That is not evidence that no ecological interactions exist.</span>}
                </div>
              </article>
            </div>
          )}
        </section>

        <details style={{ marginTop: 18, border: `1px solid ${T.line}`, padding: "0 16px" }}>
          <summary style={{ ...mono, cursor: "pointer", padding: "16px 0", color: "#8A6500" }}>WHAT WE DO NOT CLAIM</summary>
          <ul style={{ margin: 0, padding: "0 0 20px 20px", display: "grid", gap: 8, color: T.dim, lineHeight: 1.5 }}>
            {envelope.forbiddenInferences.map((boundary) => <li key={boundary}>{boundary}</li>)}
          </ul>
        </details>
      </div>
    </section>,
    target,
  );
}

export default SpeciesEvidenceSeam;
