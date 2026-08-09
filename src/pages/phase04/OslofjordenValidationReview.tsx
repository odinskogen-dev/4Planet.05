import { useMemo, useState } from "react";
import type { CSSProperties, ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";

const STORAGE_KEY = "4planet.oslofjorden.validation.review.v1";
const mono: CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10, letterSpacing: ".09em", textTransform: "uppercase" };
const display: CSSProperties = { fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, letterSpacing: "-.045em", lineHeight: .98 };
const panel: CSSProperties = { border: "1px solid rgba(10,10,10,.25)", padding: "clamp(18px,2.5vw,28px)" };
const btn: CSSProperties = { display: "inline-flex", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", padding: "10px 13px", textDecoration: "none", cursor: "pointer", fontSize: 12 };

const expectedPrompts = ["fiveWhat", "fiveDo", "fiveRemember", "category", "jobs", "oslofjord", "relationship", "proof", "sourceBoundary", "trust", "next", "return", "different"] as const;
const scoreAxes = [
  ["comprehension", "UNDERSTANDS WHAT 4PLANET IS"],
  ["productJobs", "UNDERSTANDS CORE PRODUCT JOBS"],
  ["truthBoundary", "UNDERSTANDS SOURCE / PROOF BOUNDARIES"],
  ["returnValue", "HAS A CONCRETE REASON TO RETURN"],
  ["distinctiveness", "CAN NAME WHAT FEELS DISTINCTIVE"],
] as const;

type ParticipantExport = {
  version: string;
  participantId: string;
  startedAt?: string;
  updatedAt?: string;
  consent?: boolean;
  priorAwareness?: string;
  answers?: Record<string, string>;
  humanResultsStatus?: string;
  stimulus?: string;
};

type Review = {
  scores: Record<string, 0 | 1 | 2 | null>;
  notes: string;
};

type ReviewStore = Record<string, Review>;

function blankReview(): Review {
  return { scores: Object.fromEntries(scoreAxes.map(([key]) => [key, null])), notes: "" };
}

function readReviews(): ReviewStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function OslofjordenValidationReview() {
  const [participants, setParticipants] = useState<ParticipantExport[]>([]);
  const [reviews, setReviews] = useState<ReviewStore>(() => readReviews());
  const [importError, setImportError] = useState("");

  const persist = (next: ReviewStore) => {
    setReviews(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* local-only workflow degrades safely */ }
  };

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const next: ParticipantExport[] = [];
    const errors: string[] = [];
    for (const file of files) {
      try {
        const parsed = JSON.parse(await file.text()) as ParticipantExport;
        if (!parsed?.participantId || parsed.version !== "OSLOFJORDEN_VALIDATION_V1" || !parsed.answers) throw new Error("Not a recognised Oslofjorden participant export");
        next.push(parsed);
      } catch (error: any) {
        errors.push(`${file.name}: ${error?.message ?? "invalid JSON"}`);
      }
    }
    const deduped = new Map<string, ParticipantExport>();
    [...participants, ...next].forEach((row) => deduped.set(row.participantId, row));
    setParticipants([...deduped.values()]);
    setImportError(errors.join(" · "));
    event.target.value = "";
  };

  const setScore = (participantId: string, key: string, value: 0 | 1 | 2) => {
    const current = reviews[participantId] ?? blankReview();
    persist({ ...reviews, [participantId]: { ...current, scores: { ...current.scores, [key]: value } } });
  };
  const setNotes = (participantId: string, notes: string) => {
    const current = reviews[participantId] ?? blankReview();
    persist({ ...reviews, [participantId]: { ...current, notes } });
  };

  const synthesis = useMemo(() => {
    const reviewed = participants.filter((p) => scoreAxes.every(([key]) => reviews[p.participantId]?.scores?.[key] != null));
    const axis = Object.fromEntries(scoreAxes.map(([key, label]) => {
      const values = reviewed.map((p) => reviews[p.participantId].scores[key] as number);
      const average = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
      return [key, { label, average, n: values.length }];
    }));
    return { imported: participants.length, fullyReviewed: reviewed.length, axis };
  }, [participants, reviews]);

  const exportSynthesis = () => {
    const payload = {
      version: "OSLOFJORDEN_HUMAN_SYNTHESIS_V1",
      generatedAt: new Date().toISOString(),
      evidenceClass: "HUMAN PARTICIPANT EXPORTS — REVIEWER CODED",
      claimBoundary: "Importing or scoring files does not establish representativeness, statistical validity or release approval.",
      synthesis,
      participants: participants.map((p) => ({
        participantId: p.participantId,
        priorAwareness: p.priorAwareness ?? "UNKNOWN",
        answered: expectedPrompts.filter((key) => p.answers?.[key]?.trim()).length,
        review: reviews[p.participantId] ?? blankReview(),
        rawAnswers: p.answers,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oslofjorden-human-synthesis-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PublicShell>
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(88px,10vw,140px) clamp(20px,5vw,72px) 100px" }}>
        <div style={{ ...mono, color: "#FF4D22" }}>PRIVATE HUMAN-EVIDENCE REVIEW / NO RESULTS UNTIL REAL PARTICIPANT FILES ARE IMPORTED</div>
        <h1 style={{ ...display, fontSize: "clamp(52px,8vw,108px)", margin: "24px 0 0" }}>From raw answers to a reviewable evidence pack.</h1>
        <p style={{ maxWidth: 850, fontSize: 18, lineHeight: 1.55 }}>This tool imports the JSON files produced by the participant route. It never invents respondents, never sends data anywhere, and keeps raw participant answers separate from reviewer coding.</p>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 22 }}>
          <Link to="/labs/oslofjorden-validation" style={btn}>OPEN PARTICIPANT TEST →</Link>
          <label style={{ ...btn, background: "#fff", color: "#0A0A0A" }}>IMPORT PARTICIPANT JSON<input type="file" accept="application/json,.json" multiple onChange={importFiles} style={{ display: "none" }} /></label>
          <button type="button" disabled={!participants.length} onClick={exportSynthesis} style={{ ...btn, opacity: participants.length ? 1 : .35 }}>EXPORT SYNTHESIS JSON</button>
        </div>
        {importError && <p role="alert" style={{ color: "#FF4D22", fontSize: 13 }}>{importError}</p>}

        <section style={{ marginTop: 50, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
          <div style={panel}><div style={mono}>IMPORTED</div><div style={{ ...display, fontSize: 48, marginTop: 10 }}>{synthesis.imported}</div></div>
          <div style={panel}><div style={mono}>FULLY REVIEWED</div><div style={{ ...display, fontSize: 48, marginTop: 10 }}>{synthesis.fullyReviewed}</div></div>
          {Object.values(synthesis.axis).map((axis: any) => <div key={axis.label} style={panel}><div style={mono}>{axis.label}</div><div style={{ ...display, fontSize: 34, marginTop: 10 }}>{axis.average == null ? "—" : `${axis.average.toFixed(2)} / 2`}</div><div style={{ ...mono, color: "rgba(10,10,10,.5)", marginTop: 7 }}>N={axis.n}</div></div>)}
        </section>

        {!participants.length && (
          <section style={{ ...panel, marginTop: 34, borderColor: "#FF4D22" }}>
            <div style={{ ...mono, color: "#FF4D22" }}>HUMAN VALIDATION STATUS / NOT RUN</div>
            <p style={{ margin: "12px 0 0", lineHeight: 1.55 }}>No participant exports are loaded. Automated/browser/founder review is not substituted for human evidence.</p>
          </section>
        )}

        <div style={{ display: "grid", gap: 24, marginTop: 34 }}>
          {participants.map((participant) => {
            const review = reviews[participant.participantId] ?? blankReview();
            const answered = expectedPrompts.filter((key) => participant.answers?.[key]?.trim()).length;
            return (
              <article key={participant.participantId} style={panel}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div style={{ ...mono, color: "#2E2EFF" }}>{participant.participantId} / HUMAN RAW EXPORT</div><div style={mono}>{answered}/{expectedPrompts.length} ANSWERED · PRIOR {participant.priorAwareness ?? "UNKNOWN"}</div></div>
                <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
                  {expectedPrompts.map((key) => participant.answers?.[key]?.trim() ? <details key={key} style={{ borderTop: "1px solid rgba(10,10,10,.2)", paddingTop: 9 }}><summary style={{ ...mono, cursor: "pointer" }}>{key}</summary><p style={{ whiteSpace: "pre-wrap", lineHeight: 1.55 }}>{participant.answers?.[key]}</p></details> : null)}
                </div>
                <div style={{ marginTop: 26, borderTop: "3px solid #2E2EFF", paddingTop: 18 }}>
                  <div style={{ ...mono, color: "#2E2EFF" }}>REVIEWER CODING / 0 NO · 1 PARTIAL · 2 CLEAR</div>
                  <div style={{ display: "grid", gap: 13, marginTop: 16 }}>
                    {scoreAxes.map(([key, axisLabel]) => <div key={key} style={{ display: "grid", gridTemplateColumns: "minmax(220px,1fr) auto", gap: 12, alignItems: "center" }}><span style={mono}>{axisLabel}</span><div style={{ display: "flex", gap: 5 }}>{([0,1,2] as const).map((value) => <button key={value} type="button" onClick={() => setScore(participant.participantId, key, value)} aria-pressed={review.scores[key] === value} style={{ border: "1px solid #0A0A0A", background: review.scores[key] === value ? "#0A0A0A" : "#fff", color: review.scores[key] === value ? "#fff" : "#0A0A0A", width: 34, height: 32, cursor: "pointer" }}>{value}</button>)}</div></div>)}
                  </div>
                  <label style={{ display: "block", marginTop: 18 }}><span style={mono}>REVIEWER NOTES / CONFUSIONS / QUOTES TO REVISIT</span><textarea value={review.notes} onChange={(e) => setNotes(participant.participantId, e.target.value)} rows={4} style={{ display: "block", width: "100%", boxSizing: "border-box", marginTop: 7, border: "1px solid #0A0A0A", padding: 11, font: "inherit" }} /></label>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </PublicShell>
  );
}
