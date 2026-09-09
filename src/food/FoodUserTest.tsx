import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import FoodIntelligence from "./FoodIntelligence";
import "./food-user-test.css";

type MatchState = "match" | "mismatch" | "not_checked";
type Severity = "none" | "p0" | "p1" | "p2";
type PrimaryValue = "health" | "allergens" | "economy" | "planet" | "other";
type DecisionEffect = "changed" | "clarified" | "confirmed" | "no_effect" | "not_recorded";

interface ScanRecord {
  id: string;
  recordedAt: string;
  decisionQuestion: string;
  decisionEffect: DecisionEffect;
  unknownRefusalComprehension: number;
  gtin: string;
  category: string;
  productName: string;
  identityAccurate: MatchState;
  ingredientsAccurate: MatchState;
  allergensAccurate: MatchState;
  nutritionAccurate: MatchState;
  alternativeRelevance: number;
  comprehensionSeconds: number | null;
  trust: number;
  usefulness: number;
  primaryValue: PrimaryValue;
  severity: Severity;
  notes: string;
}

interface FinalSurvey {
  repeatUse: "yes" | "maybe" | "no" | "";
  installIntent: "yes" | "maybe" | "no" | "";
  paymentIntent: "yes" | "maybe" | "no" | "";
  strongestValue: PrimaryValue | "";
  finalComment: string;
}

const STORAGE_KEY = "p18:food:user-validation:v1";
const createId = () => globalThis.crypto?.randomUUID?.() ?? `p18-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptySurvey: FinalSurvey = {
  repeatUse: "",
  installIntent: "",
  paymentIntent: "",
  strongestValue: "",
  finalComment: "",
};

const toCsvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function FoodUserTest() {
  const [participantCode] = useState(() => createId().slice(0, 12));
  const [consent, setConsent] = useState(false);
  const [records, setRecords] = useState<ScanRecord[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw).records ?? []) : [];
    } catch {
      return [];
    }
  });
  const [survey, setSurvey] = useState<FinalSurvey>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...emptySurvey, ...(JSON.parse(raw).survey ?? {}) } : emptySurvey;
    } catch {
      return emptySurvey;
    }
  });
  const [form, setForm] = useState({
    decisionQuestion: "",
    decisionEffect: "not_recorded" as DecisionEffect,
    unknownRefusalComprehension: 3,
    gtin: "",
    category: "",
    productName: "",
    identityAccurate: "not_checked" as MatchState,
    ingredientsAccurate: "not_checked" as MatchState,
    allergensAccurate: "not_checked" as MatchState,
    nutritionAccurate: "not_checked" as MatchState,
    alternativeRelevance: 3,
    comprehensionSeconds: "",
    trust: 3,
    usefulness: 3,
    primaryValue: "health" as PrimaryValue,
    severity: "none" as Severity,
    notes: "",
  });

  const summary = useMemo(() => {
    const count = records.length;
    const average = (key: "alternativeRelevance" | "trust" | "usefulness" | "unknownRefusalComprehension") =>
      count ? records.reduce((sum, item) => sum + Number(item[key] ?? 0), 0) / count : 0;
    const mismatches = records.filter((item) =>
      [item.identityAccurate, item.ingredientsAccurate, item.allergensAccurate, item.nutritionAccurate].includes("mismatch"),
    ).length;
    const decisionValue = records.filter((item) => ["changed", "clarified", "confirmed"].includes(item.decisionEffect)).length;
    return {
      count,
      relevance: average("alternativeRelevance"),
      trust: average("trust"),
      usefulness: average("usefulness"),
      unknownClarity: average("unknownRefusalComprehension"),
      decisionValue,
      mismatches,
      p0: records.filter((item) => item.severity === "p0").length,
      p1: records.filter((item) => item.severity === "p1").length,
      p2: records.filter((item) => item.severity === "p2").length,
    };
  }, [records]);

  const persist = (nextRecords: ScanRecord[], nextSurvey = survey) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: "p18-food-user-validation-v2",
      participantCode,
      updatedAt: new Date().toISOString(),
      proofBoundary: "Only an actual participant using a real decision and real product may count as Human Proof. Fixture or synthetic sessions are technical evidence only.",
      records: nextRecords,
      survey: nextSurvey,
    }));
  };

  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent) return;
    const record: ScanRecord = {
      id: createId(),
      recordedAt: new Date().toISOString(),
      decisionQuestion: form.decisionQuestion.trim(),
      decisionEffect: form.decisionEffect,
      unknownRefusalComprehension: form.unknownRefusalComprehension,
      gtin: form.gtin.replace(/\D/g, ""),
      category: form.category.trim(),
      productName: form.productName.trim(),
      identityAccurate: form.identityAccurate,
      ingredientsAccurate: form.ingredientsAccurate,
      allergensAccurate: form.allergensAccurate,
      nutritionAccurate: form.nutritionAccurate,
      alternativeRelevance: form.alternativeRelevance,
      comprehensionSeconds: form.comprehensionSeconds ? Number(form.comprehensionSeconds) : null,
      trust: form.trust,
      usefulness: form.usefulness,
      primaryValue: form.primaryValue,
      severity: form.severity,
      notes: form.notes.trim(),
    };
    const next = [...records, record];
    setRecords(next);
    persist(next);
    setForm((current) => ({
      ...current,
      decisionQuestion: "",
      decisionEffect: "not_recorded",
      unknownRefusalComprehension: 3,
      gtin: "",
      productName: "",
      identityAccurate: "not_checked",
      ingredientsAccurate: "not_checked",
      allergensAccurate: "not_checked",
      nutritionAccurate: "not_checked",
      alternativeRelevance: 3,
      comprehensionSeconds: "",
      trust: 3,
      usefulness: 3,
      severity: "none",
      notes: "",
    }));
  };

  const updateSurvey = <K extends keyof FinalSurvey>(key: K, value: FinalSurvey[K]) => {
    const next = { ...survey, [key]: value };
    setSurvey(next);
    persist(records, next);
  };

  const exportJson = () => download(
    `p18-food-user-test-${participantCode}.json`,
    JSON.stringify({
      version: "p18-food-user-validation-v2",
      participantCode,
      exportedAt: new Date().toISOString(),
      privacy: "Local-only test record. No name, email, account or medical profile collected.",
      proofBoundary: "Only an actual participant using a real decision and real product may count as Human Proof. Fixture or synthetic sessions are technical evidence only.",
      records,
      survey,
      summary,
    }, null, 2),
    "application/json",
  );

  const exportCsv = () => {
    const headers = [
      "participant_code", "recorded_at", "decision_question", "decision_effect", "unknown_refusal_comprehension_1_5", "gtin", "category", "product_name", "identity", "ingredients", "allergens", "nutrition",
      "alternative_relevance_1_5", "comprehension_seconds", "trust_1_5", "usefulness_1_5", "primary_value", "severity", "notes",
    ];
    const rows = records.map((item) => [
      participantCode, item.recordedAt, item.decisionQuestion, item.decisionEffect, item.unknownRefusalComprehension, item.gtin, item.category, item.productName, item.identityAccurate, item.ingredientsAccurate,
      item.allergensAccurate, item.nutritionAccurate, item.alternativeRelevance, item.comprehensionSeconds ?? "", item.trust,
      item.usefulness, item.primaryValue, item.severity, item.notes,
    ]);
    download(`p18-food-user-test-${participantCode}.csv`, [headers, ...rows].map((row) => row.map(toCsvCell).join(",")).join("\n"), "text/csv;charset=utf-8");
  };

  const clearLocalData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRecords([]);
    setSurvey(emptySurvey);
    setConsent(false);
  };

  return (
    <div className="food-user-test-page">
      <header className="food-user-test-header">
        <div>
          <span className="food-user-test-kicker">PROOF-H01 · PRIVATE HUMAN UTILITY VALIDATION</span>
          <h1>Test the decision—not the person.</h1>
          <p>This research mode records whether Embla changes, clarifies or confirms a real FOOD decision, while keeping product accuracy, comprehension and usefulness inspectable.</p>
        </div>
        <div className="food-user-test-header-actions">
          <Link to="/4sapien/food/choose?research=1">Open Embla research flow</Link>
          <span>Participant {participantCode}</span>
        </div>
      </header>

      <section className="food-user-test-consent" aria-labelledby="food-test-consent-title">
        <div>
          <span className="food-user-test-kicker">Consent-safe boundary</span>
          <h2 id="food-test-consent-title">Local, private and reversible.</h2>
          <p>Results stay in this browser until the participant deliberately exports a file. Do not enter names, contact details, diagnoses, medication or other sensitive information.</p>
        </div>
        <label>
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          I understand this is a private prototype test and I agree to record anonymous product-test observations on this device.
        </label>
      </section>

      <section className="food-user-test-protocol">
        <article><strong>01</strong><h3>Bring a real decision</h3><p>Choose a real FOOD purchase you would make now. Fixture or synthetic decisions do not count as Human Proof.</p></article>
        <article><strong>02</strong><h3>Use Embla first</h3><p>Open the research flow and state what matters. Notice when Embla compares, withholds or asks you to clarify.</p></article>
        <article><strong>03</strong><h3>Inspect the evidence</h3><p>Use a real product and compare package facts where possible. UNKNOWN and source failure must stay visible.</p></article>
        <article><strong>04</strong><h3>Record the effect</h3><p>Log whether the decision changed, became clearer, was confirmed or was not helped. A failure is valid evidence.</p></article>
      </section>

      <section id="food-user-test-scanner" className="food-user-test-scanner" aria-label="FOOD scanner prototype">
        <FoodIntelligence />
      </section>

      <section className="food-user-test-workspace" aria-labelledby="food-test-record-title">
        <div className="food-user-test-summary">
          <span className="food-user-test-kicker">Session evidence</span>
          <h2 id="food-test-record-title">Record each real decision attempt.</h2>
          <dl>
            <div><dt>Attempts</dt><dd>{summary.count}</dd></div>
            <div><dt>Decision value</dt><dd>{summary.decisionValue}</dd></div>
            <div><dt>Avg. usefulness</dt><dd>{summary.usefulness.toFixed(1)}</dd></div>
            <div><dt>Avg. trust</dt><dd>{summary.trust.toFixed(1)}</dd></div>
            <div><dt>UNKNOWN clarity</dt><dd>{summary.unknownClarity.toFixed(1)}</dd></div>
            <div><dt>Mismatches</dt><dd>{summary.mismatches}</dd></div>
            <div><dt>P0 / P1 / P2</dt><dd>{summary.p0} / {summary.p1} / {summary.p2}</dd></div>
          </dl>
        </div>

        <form className="food-user-test-form" onSubmit={saveRecord}>
          <fieldset disabled={!consent}>
            <legend>Decision observation</legend>
            <label>Decision you actually needed to make<input required value={form.decisionQuestion} onChange={(event) => setForm({ ...form, decisionQuestion: event.target.value })} placeholder="e.g. Which yoghurt should I buy today if lower sugar matters most?" /></label>
            <div className="food-user-test-grid">
              <label>Decision effect<select required value={form.decisionEffect} onChange={(event) => setForm({ ...form, decisionEffect: event.target.value as DecisionEffect })}><option value="not_recorded">Select</option><option value="changed">Changed my choice</option><option value="clarified">Clarified the decision</option><option value="confirmed">Confirmed my existing choice</option><option value="no_effect">Did not help the decision</option></select></label>
              <label>UNKNOWN / refusal clarity · {form.unknownRefusalComprehension}/5<input type="range" min="1" max="5" value={form.unknownRefusalComprehension} onChange={(event) => setForm({ ...form, unknownRefusalComprehension: Number(event.target.value) })} /></label>
              <label>Comprehension time · seconds<input min="0" type="number" value={form.comprehensionSeconds} onChange={(event) => setForm({ ...form, comprehensionSeconds: event.target.value })} /></label>
            </div>
            <div className="food-user-test-grid">
              <label>GTIN<input required inputMode="numeric" value={form.gtin} onChange={(event) => setForm({ ...form, gtin: event.target.value })} /></label>
              <label>Product name<input required value={form.productName} onChange={(event) => setForm({ ...form, productName: event.target.value })} /></label>
              <label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. plain yoghurt" /></label>
            </div>

            <div className="food-user-test-grid food-user-test-grid--checks">
              {(["identityAccurate", "ingredientsAccurate", "allergensAccurate", "nutritionAccurate"] as const).map((key) => (
                <label key={key}>{key.replace("Accurate", "").replace(/^./, (value) => value.toUpperCase())}
                  <select value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value as MatchState })}>
                    <option value="not_checked">Not checked</option><option value="match">Matches package</option><option value="mismatch">Mismatch</option>
                  </select>
                </label>
              ))}
            </div>

            <div className="food-user-test-grid">
              <label>Alternative relevance · {form.alternativeRelevance}/5<input type="range" min="1" max="5" value={form.alternativeRelevance} onChange={(event) => setForm({ ...form, alternativeRelevance: Number(event.target.value) })} /></label>
              <label>Trust · {form.trust}/5<input type="range" min="1" max="5" value={form.trust} onChange={(event) => setForm({ ...form, trust: Number(event.target.value) })} /></label>
              <label>Usefulness · {form.usefulness}/5<input type="range" min="1" max="5" value={form.usefulness} onChange={(event) => setForm({ ...form, usefulness: Number(event.target.value) })} /></label>
              <label>Primary value<select value={form.primaryValue} onChange={(event) => setForm({ ...form, primaryValue: event.target.value as PrimaryValue })}><option value="health">Health understanding</option><option value="allergens">Allergens</option><option value="economy">Economy</option><option value="planet">Planet</option><option value="other">Other</option></select></label>
              <label>Issue severity<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value as Severity })}><option value="none">None</option><option value="p0">P0 · dangerous or materially misleading</option><option value="p1">P1 · core journey broken</option><option value="p2">P2 · bounded defect</option></select></label>
            </div>
            <label>Observation notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="What changed, stayed unclear or was surprisingly useful? Do not enter personal health information." /></label>
            <button type="submit">Save anonymous decision record</button>
          </fieldset>
        </form>
      </section>

      <section className="food-user-test-final">
        <div><span className="food-user-test-kicker">Post-test interview</span><h2>Would you use this for another real decision?</h2></div>
        <div className="food-user-test-grid">
          <label>Use again<select value={survey.repeatUse} onChange={(event) => updateSurvey("repeatUse", event.target.value as FinalSurvey["repeatUse"])}><option value="">Select</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></label>
          <label>Install intent<select value={survey.installIntent} onChange={(event) => updateSurvey("installIntent", event.target.value as FinalSurvey["installIntent"])}><option value="">Select</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></label>
          <label>Payment intent<select value={survey.paymentIntent} onChange={(event) => updateSurvey("paymentIntent", event.target.value as FinalSurvey["paymentIntent"])}><option value="">Select</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select></label>
          <label>Strongest value<select value={survey.strongestValue} onChange={(event) => updateSurvey("strongestValue", event.target.value as FinalSurvey["strongestValue"])}><option value="">Select</option><option value="health">Health understanding</option><option value="allergens">Allergens</option><option value="economy">Economy</option><option value="planet">Planet</option><option value="other">Other</option></select></label>
        </div>
        <label>Final comment<textarea value={survey.finalComment} onChange={(event) => updateSurvey("finalComment", event.target.value)} /></label>
        <div className="food-user-test-export">
          <button type="button" disabled={!records.length} onClick={exportJson}>Export JSON evidence</button>
          <button type="button" disabled={!records.length} onClick={exportCsv}>Export CSV evidence</button>
          <button type="button" className="food-user-test-danger" onClick={clearLocalData}>Delete local test data</button>
        </div>
      </section>
    </div>
  );
}
