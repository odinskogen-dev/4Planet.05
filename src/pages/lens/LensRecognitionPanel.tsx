import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { CaptureLocation, CapturePayload } from "@/capture/CaptureExperience";
import { canonicalSpeciesPath } from "@/species/slug";

interface RecognitionCandidate {
  scientificName: string;
  commonName?: string;
  probability: number;
  scientificNameId?: string;
  groupName?: string;
  infoUrl?: string;
  redListCategory?: string;
  invasiveCategory?: string;
}

type State = "IDLE" | "REQUESTING" | "READY" | "NOT_CONFIGURED" | "ERROR";

type RecognitionResponse = {
  ok: boolean;
  configured?: boolean;
  provider?: string;
  providerModel?: string;
  candidates?: RecognitionCandidate[];
  verificationState?: string;
  truthBoundary?: string;
  error?: string;
};

const mono: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 9,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

function percent(value: number) {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

export function LensRecognitionPanel({
  capture,
  location,
}: {
  capture: CapturePayload;
  location: CaptureLocation | null;
}) {
  const [state, setState] = useState<State>("IDLE");
  const [response, setResponse] = useState<RecognitionResponse | null>(null);
  const [selected, setSelected] = useState<RecognitionCandidate | "UNKNOWN" | null>(null);

  useEffect(() => {
    setState("IDLE");
    setResponse(null);
    setSelected(null);
  }, [capture]);

  async function identify() {
    setState("REQUESTING");
    setResponse(null);
    setSelected(null);

    const form = new FormData();
    const extension = capture.mimeType.includes("png") ? "png" : "jpg";
    form.append("image", new File([capture.blob], `4planet-lens.${extension}`, { type: capture.mimeType }));
    if (location) {
      form.append("latitude", String(location.latitude));
      form.append("longitude", String(location.longitude));
    }

    try {
      const res = await fetch("/api/species-identify", { method: "POST", body: form });
      const data = await res.json() as RecognitionResponse;
      setResponse(data);
      if (data.configured === false || data.error === "PROVIDER_NOT_CONFIGURED") {
        setState("NOT_CONFIGURED");
        return;
      }
      if (!res.ok || !data.ok) {
        setState("ERROR");
        return;
      }
      setState("READY");
    } catch {
      setResponse({ ok: false, error: "RECOGNITION_NETWORK_ERROR", truthBoundary: "No recognition claim was created." });
      setState("ERROR");
    }
  }

  const candidates = response?.candidates ?? [];

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 24 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ ...mono, color: "rgba(255,255,255,.5)" }}>NEXT · SPECIES RECOGNITION</div>
          <h3 style={{ marginTop: 8, fontSize: "clamp(24px,4vw,42px)", lineHeight: 1, letterSpacing: "-.035em", fontWeight: 520 }}>
            What did you see?
          </h3>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,.66)", lineHeight: 1.55 }}>
            The recognition provider may suggest taxa. A model score is not verification, and no Observation is created until a later explicit submit step.
          </p>
        </div>

        {(state === "IDLE" || state === "ERROR" || state === "NOT_CONFIGURED") && (
          <button type="button" className="capture-action is-primary" onClick={identify}>
            IDENTIFY SPECIES →
          </button>
        )}
        {state === "REQUESTING" && <button type="button" className="capture-action" disabled>IDENTIFYING…</button>}
      </div>

      {state === "NOT_CONFIGURED" && (
        <div style={{ marginTop: 20, border: "1px solid rgba(255,255,255,.18)", padding: 18 }}>
          <div style={{ ...mono, color: "#ffb98b" }}>PROVIDER NOT CONFIGURED · NO CLAIM CREATED</div>
          <p style={{ marginTop: 9, color: "rgba(255,255,255,.65)", lineHeight: 1.5 }}>
            The Artsorakel Norway adapter is installed server-side, but this TEST deployment has no API token yet. Capture remains local evidence only.
          </p>
        </div>
      )}

      {state === "ERROR" && (
        <div style={{ marginTop: 20, border: "1px solid rgba(255,255,255,.18)", padding: 18 }}>
          <div style={{ ...mono, color: "#ffb98b" }}>RECOGNITION UNAVAILABLE · NO CLAIM CREATED</div>
          <p style={{ marginTop: 9, color: "rgba(255,255,255,.65)" }}>{response?.error ?? "Provider request failed."}</p>
        </div>
      )}

      {state === "READY" && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span style={{ ...mono, border: "1px solid rgba(255,255,255,.18)", padding: "7px 9px", color: "#8f8fff" }}>
              AI SUGGESTED
            </span>
            <span style={{ ...mono, color: "rgba(255,255,255,.42)" }}>
              {(response?.provider ?? "recognition provider").replace(/-/g, " ")} · {response?.providerModel ?? "model not reported"}
            </span>
          </div>

          {candidates.length > 0 ? (
            <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
              {candidates.map((candidate) => {
                const active = selected !== "UNKNOWN" && selected?.scientificName === candidate.scientificName;
                return (
                  <button
                    type="button"
                    key={`${candidate.scientificName}-${candidate.scientificNameId ?? "no-id"}`}
                    onClick={() => setSelected(candidate)}
                    style={{
                      width: "100%",
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) auto",
                      gap: 18,
                      alignItems: "center",
                      textAlign: "left",
                      padding: "16px 18px",
                      border: active ? "1px solid #7d7dff" : "1px solid rgba(255,255,255,.16)",
                      background: active ? "rgba(46,46,255,.12)" : "transparent",
                      color: "#fff",
                    }}
                  >
                    <span>
                      <strong style={{ display: "block", fontSize: 17, fontWeight: 560 }}>{candidate.commonName || candidate.scientificName}</strong>
                      {candidate.commonName && <span style={{ display: "block", marginTop: 4, fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,.52)" }}>{candidate.scientificName}</span>}
                      {candidate.groupName && <span style={{ ...mono, display: "block", marginTop: 8, color: "rgba(255,255,255,.42)" }}>{candidate.groupName}</span>}
                    </span>
                    <span style={{ textAlign: "right" }}>
                      <strong style={{ display: "block", fontSize: 24, fontWeight: 520 }}>{percent(candidate.probability)}</strong>
                      <span style={{ ...mono, color: "rgba(255,255,255,.42)" }}>MODEL SCORE</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p style={{ marginTop: 16, color: "rgba(255,255,255,.62)" }}>The provider returned no candidate taxa.</p>
          )}

          <button
            type="button"
            onClick={() => setSelected("UNKNOWN")}
            style={{ marginTop: 10, border: "1px solid rgba(255,255,255,.16)", padding: "12px 14px", color: "rgba(255,255,255,.7)", width: "100%", textAlign: "left" }}
          >
            <span style={mono}>NOT SURE / UNKNOWN</span>
          </button>

          {selected && (
            <div style={{ marginTop: 18, borderTop: "1px solid rgba(255,255,255,.18)", paddingTop: 18, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ ...mono, color: selected === "UNKNOWN" ? "#ffb98b" : "#8f8fff" }}>
                  {selected === "UNKNOWN" ? "USER CHOSE UNKNOWN · NO TAXON CLAIM" : "USER CONFIRMED · LOCAL ONLY · NOT AN OBSERVATION"}
                </div>
                <p style={{ marginTop: 7, color: "rgba(255,255,255,.65)" }}>
                  {selected === "UNKNOWN" ? "Keep the capture without forcing a species identification." : `${selected.commonName || selected.scientificName} · ${selected.scientificName}`}
                </p>
              </div>
              {selected !== "UNKNOWN" && (
                <Link to={canonicalSpeciesPath(selected.scientificName)} className="capture-action is-primary">
                  OPEN SPECIES PROFILE →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LensRecognitionPanel;
