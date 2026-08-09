import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";

const STORAGE_KEY = "4planet.oslofjorden.validation.v1";

type Answers = Record<string, string>;

type ValidationRecord = {
  version: "OSLOFJORDEN_VALIDATION_V1";
  participantId: string;
  startedAt: string;
  updatedAt: string;
  consent: boolean;
  priorAwareness: string;
  answers: Answers;
};

const emptyRecord = (): ValidationRecord => ({
  version: "OSLOFJORDEN_VALIDATION_V1",
  participantId: `P-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
  startedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  consent: false,
  priorAwareness: "",
  answers: {},
});

const mono: CSSProperties = { fontFamily: "'Fragment Mono',ui-monospace,monospace", fontSize: 10.5, letterSpacing: ".09em", textTransform: "uppercase" };
const display: CSSProperties = { fontFamily: "'Instrument Sans','DM Sans',sans-serif", fontWeight: 500, letterSpacing: "-.05em", lineHeight: .95 };
const input: CSSProperties = { width: "100%", border: "1px solid #0A0A0A", background: "#fff", color: "#0A0A0A", padding: 12, font: "inherit", fontSize: 15, boxSizing: "border-box" };
const button: CSSProperties = { display: "inline-flex", border: "1px solid #0A0A0A", background: "#0A0A0A", color: "#fff", padding: "11px 14px", textDecoration: "none", cursor: "pointer", fontSize: 13 };

const prompts = [
  ["fiveWhat", "After the five-second exposure: What do you think 4PLANET is?"],
  ["fiveDo", "What do you think you can do with it?"],
  ["fiveRemember", "What do you remember seeing?"],
  ["category", "What does it feel most like: public-interest product/platform, NGO, media, consultancy, scientific dashboard, action marketplace, or something else? Why?"],
  ["jobs", "After normal exploration: What are ATLAS, SPECIES, Living Systems and IMPACT each for?"],
  ["oslofjord", "What does 4PLANET currently know about Oslofjorden, and what is explicitly still unknown or unfinished?"],
  ["relationship", "In your own words, what is Relationship Reveal showing? Which mode is easiest to understand?"],
  ["proof", "Does PARTNER REPORT mean 4PLANET independently verified an ecological result? Explain."],
  ["trust", "What increased or reduced your trust in the experience?"],
  ["next", "What would you click or explore next?"],
  ["return", "What would make you return to 4PLANET next week?"],
  ["different", "What, if anything, felt different from other environmental websites or products?"],
] as const;

export default function OslofjordenValidation() {
  const [record, setRecord] = useState<ValidationRecord>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : emptyRecord();
    } catch {
      return emptyRecord();
    }
  });
  const [exposure, setExposure] = useState<"IDLE" | "RUNNING" | "DONE">("IDLE");
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...record, updatedAt: new Date().toISOString() }));
  }, [record]);

  useEffect(() => {
    if (exposure !== "RUNNING") return;
    setSeconds(5);
    const end = window.setTimeout(() => setExposure("DONE"), 5000);
    const tick = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => { window.clearTimeout(end); window.clearInterval(tick); };
  }, [exposure]);

  const completion = useMemo(() => prompts.filter(([key]) => record.answers[key]?.trim()).length, [record.answers]);
  const answer = (key: string, value: string) => setRecord((current) => ({ ...current, answers: { ...current.answers, [key]: value } }));

  const exportJson = () => {
    const payload = { ...record, updatedAt: new Date().toISOString(), humanResultsStatus: "UNREVIEWED PARTICIPANT EXPORT" };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${record.participantId}-oslofjorden-validation.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const erase = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecord(emptyRecord());
    setExposure("IDLE");
  };

  return (
    <PublicShell>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(80px,10vw,145px) clamp(20px,5vw,72px) 50px" }}>
        <div style={{ ...mono, color: "#FF4D22" }}>PRIVATE TEST TOOL / HUMAN RESULTS NOT RUN BY 4PLANET</div>
        <h1 style={{ ...display, fontSize: "clamp(55px,8vw,112px)", margin: "28px 0 0" }}>Does the product explain itself?</h1>
        <p style={{ maxWidth: 800, fontSize: "clamp(18px,2vw,26px)", lineHeight: 1.35, margin: "24px 0 0" }}>This route is a ready-to-run qualitative test. It stores answers only in this browser until the participant deliberately exports them. It does not create an account or send results to 4PLANET.</p>
        <div style={{ marginTop: 28, padding: 18, border: "1px solid #0A0A0A" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, lineHeight: 1.5 }}><input type="checkbox" checked={record.consent} onChange={(e) => setRecord((r) => ({ ...r, consent: e.target.checked }))} /> I understand this is a private prototype test. My answers stay on this device unless I choose to export and share them.</label>
          <label style={{ display: "block", marginTop: 18 }}><span style={mono}>PRIOR 4PLANET AWARENESS</span><select value={record.priorAwareness} onChange={(e) => setRecord((r) => ({ ...r, priorAwareness: e.target.value }))} style={{ ...input, marginTop: 7 }}><option value="">Choose…</option><option value="NONE">Never seen it</option><option value="LOW">Seen the name / little context</option><option value="FAMILIAR">Already familiar</option></select></label>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "30px clamp(20px,5vw,72px) 70px" }}>
        <div style={mono}>01 / FIVE-SECOND EXPOSURE</div>
        <p style={{ maxWidth: 760, lineHeight: 1.5 }}>Only start when the participant is ready. The stimulus disappears after five seconds. Do not explain 4PLANET beforehand.</p>
        {exposure === "IDLE" && <button type="button" disabled={!record.consent} onClick={() => setExposure("RUNNING")} style={{ ...button, opacity: record.consent ? 1 : .35 }}>START FIVE SECONDS</button>}
        {exposure === "RUNNING" && <div aria-live="polite" style={{ minHeight: 520, marginTop: 18, background: "#0A0A0A", color: "#fff", padding: "clamp(25px,5vw,62px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}><div style={{ ...mono, color: "#3AE86F" }}>4PLANET_ / OSLOFJORDEN / {seconds}</div><div><h2 style={{ ...display, fontSize: "clamp(58px,9vw,118px)", margin: 0 }}>What is<br />happening here?</h2><p style={{ fontSize: 22, maxWidth: 620, lineHeight: 1.3 }}>A living place, seen through life, relationships, changing evidence and the decisions around it.</p></div><div style={{ ...mono, color: "rgba(255,255,255,.65)" }}>SEE / DISCOVER / UNDERSTAND / ACT + PROVE</div></div>}
        {exposure === "DONE" && <div style={{ padding: "32px 0", borderTop: "1px solid #0A0A0A", borderBottom: "1px solid #0A0A0A", marginTop: 18 }}><div style={{ ...mono, color: "#FF4D22" }}>STIMULUS HIDDEN</div><p>Answer the first three questions from memory before opening the product.</p></div>}
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "20px clamp(20px,5vw,72px) 80px" }}>
        <div style={mono}>02 / OPEN-ENDED QUESTIONS</div>
        <div style={{ display: "grid", gap: 28, marginTop: 22 }}>
          {prompts.map(([key, text], i) => <label key={key} style={{ display: "block" }}><span style={{ ...mono, color: i < 3 ? "#FF4D22" : "#2E2EFF" }}>{String(i + 1).padStart(2, "0")} / {text}</span><textarea value={record.answers[key] ?? ""} onChange={(e) => answer(key, e.target.value)} rows={4} style={{ ...input, marginTop: 9, resize: "vertical" }} /></label>)}
        </div>
      </section>

      <section style={{ background: "#F4F4F0", padding: "clamp(55px,8vw,95px) clamp(20px,5vw,72px)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={mono}>03 / CONTROLLED EXPLORATION</div>
          <h2 style={{ ...display, fontSize: "clamp(38px,5vw,68px)", margin: "18px 0 0" }}>Open the real candidate in a new tab.</h2>
          <p style={{ maxWidth: 780, lineHeight: 1.55 }}>Give the participant up to a few minutes. Ask them to find what 4PLANET knows, what it does not know, one pressure, one Signal, one source and one real action. Do not coach navigation unless they are blocked.</p>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 22 }}><Link to="/place/oslofjorden" target="_blank" rel="noreferrer" style={button}>OPEN OSLOFJORDEN ↗</Link><Link to="/living-systems" target="_blank" rel="noreferrer" style={{ ...button, background: "#fff", color: "#0A0A0A" }}>OPEN RELATIONSHIP REVEAL ↗</Link></div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(55px,8vw,95px) clamp(20px,5vw,72px)" }}>
        <div style={mono}>04 / EXPORT</div>
        <h2 style={{ ...display, fontSize: "clamp(38px,5vw,68px)", margin: "18px 0 0" }}>{completion}/{prompts.length} questions answered.</h2>
        <p style={{ maxWidth: 760, lineHeight: 1.5 }}>An exported file is participant evidence only. It must be reviewed and coded separately from AI/design judgement before any “tested on humans” claim is made.</p>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 22 }}><button type="button" disabled={!record.consent} onClick={exportJson} style={{ ...button, opacity: record.consent ? 1 : .35 }}>EXPORT JSON</button><button type="button" onClick={erase} style={{ ...button, background: "#fff", color: "#0A0A0A" }}>DELETE LOCAL TEST DATA</button></div>
        <div style={{ ...mono, marginTop: 26, color: "rgba(10,10,10,.5)" }}>PARTICIPANT / {record.participantId} · STORAGE / LOCAL BROWSER ONLY</div>
      </section>
    </PublicShell>
  );
}
