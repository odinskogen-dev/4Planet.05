import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  canonicalJson,
  normalizeGtin,
  normaliseSourceEnvelope,
  rankAlternatives,
  type CanonicalFoodProduct,
  type FoodPreferences,
  type RankedAlternative,
} from "./core.js";
import { FOOD_FIXTURES } from "./fixtures.js";
import "./food.css";
import "./food-02.css";

type ResultState = "idle" | "loading" | "found" | "not_found" | "source_error" | "malformed";

interface SourceMeta {
  id?: string;
  apiVersion?: string;
  schemaVersion?: number | null;
  adapterVersion?: string;
  licence?: Record<string, unknown>;
}

interface NormalisedResult {
  state: ResultState;
  source?: SourceMeta;
  product?: CanonicalFoodProduct;
  alternatives?: CanonicalFoodProduct[];
  alternativeState?: string;
  alternativeMessage?: string;
  alternativeAttempts?: Array<Record<string, unknown>>;
  marketScope?: string;
  comparisonCategory?: string | null;
  sourceSearchCategory?: string | null;
  message?: string;
  rawEnvelope?: Record<string, unknown>;
}

interface RawRecordState {
  hash: string;
  storageKey: string;
  persisted: boolean;
  retrievedAt: string;
  fixture: boolean;
}

interface BarcodeDetectorResult {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
}

interface BarcodeDetectorConstructor {
  new (options: { formats: string[] }): BarcodeDetectorInstance;
}

const DEFAULT_BARCODE = "7038010055652";
const RAW_PREFIX = "p18:food:raw:v1";
const PREFS_KEY = "p18:food:preferences:v1";

const initialPreferences: Required<FoodPreferences> = {
  avoidAllergens: [],
  lowerSugar: true,
  lowerSalt: false,
  higherProtein: false,
};

function formatNumber(value: number | null, unit = "g"): string {
  return value === null ? "Not available" : `${value.toLocaleString("nb-NO", { maximumFractionDigits: 1 })} ${unit}`;
}

function categoryLabel(category: string | null | undefined): string {
  return category ? category.replace(/^..:/, "").replaceAll("-", " ").replaceAll("_", " ") : "Not classified";
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function preserveRawEnvelope(envelope: Record<string, unknown>): Promise<RawRecordState> {
  const serialised = canonicalJson(envelope);
  const hash = await sha256(serialised);
  const barcode = String((envelope.request as { barcode?: unknown } | undefined)?.barcode ?? "unknown");
  const storageKey = `${RAW_PREFIX}:${barcode}:${hash}`;
  let persisted: boolean;
  try {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, serialised);
    persisted = localStorage.getItem(storageKey) === serialised;
  } catch {
    persisted = false;
  }
  return {
    hash,
    storageKey,
    persisted,
    retrievedAt: String(envelope.retrievedAt ?? ""),
    fixture: envelope.fixture === true,
  };
}

function StatusPanel({ state, message }: { state: ResultState; message?: string }) {
  if (state === "idle" || state === "found") return null;
  const copy: Record<Exclude<ResultState, "idle" | "found">, { title: string; body: string }> = {
    loading: { title: "Reading source", body: "Fetching one product and a bounded same-category candidate set." },
    not_found: { title: "Barcode not found", body: "Open Food Facts did not return a product. No product facts have been inferred." },
    source_error: { title: "Source unavailable", body: message || "The source request failed. The previous result has not been silently reused." },
    malformed: { title: "Record cannot be trusted", body: message || "The source envelope or product identity is malformed or conflicting." },
  };
  return (
    <section className={`food-state food-state--${state}`} aria-live="polite">
      <span className="food-kicker">{state.replaceAll("_", " ")}</span>
      <h2>{copy[state].title}</h2>
      <p>{copy[state].body}</p>
    </section>
  );
}

function QualityBadge({ product }: { product: CanonicalFoodProduct }) {
  const percent = Math.round(product.dataQuality.completeness * 100);
  return (
    <div className="food-quality" data-state={product.dataQuality.state}>
      <span>{product.dataQuality.confidence} confidence</span>
      <strong>{percent}% field coverage</strong>
    </div>
  );
}

function ProductCard({ product }: { product: CanonicalFoodProduct }) {
  const sourceDate = product.sourceModifiedAt ? new Date(product.sourceModifiedAt * 1000).toLocaleDateString("nb-NO") : "Unknown";
  return (
    <section className="food-card food-product-card" aria-labelledby="food-product-title">
      <div className="food-product-identity">
        <div className="food-image-frame">
          {product.imageUrl && !product.imageUrl.startsWith("fixture:") ? <img src={product.imageUrl} alt="" /> : <span>Image not available</span>}
        </div>
        <div>
          <span className="food-kicker">GTIN {product.gtin || "unknown"}</span>
          <h2 id="food-product-title">{product.name || "Unnamed product"}</h2>
          <p className="food-product-meta">{product.brand || "Brand not available"} · {product.quantity || "Quantity not available"}</p>
          <div className="food-category-stack">
            <span className="food-relation-pill" data-relation={product.categoryControl.status === "controlled" ? "direct" : "unknown"}>{product.categoryControl.label}</span>
            <span>Controlled group: {categoryLabel(product.comparisonCategory)}</span>
            <span>Source taxonomy: {categoryLabel(product.sourceComparisonCategory)}</span>
          </div>
        </div>
        <QualityBadge product={product} />
      </div>

      {(product.categoryControl.limitations.length > 0 || product.dataQuality.missingFields.length > 0 || product.dataQuality.conflicts.length > 0) && (
        <div className="food-warning-grid">
          {product.categoryControl.limitations.length > 0 && (
            <div><span className="food-kicker">Comparison limitation</span><p>{product.categoryControl.limitations.join(" · ")}</p></div>
          )}
          {product.dataQuality.missingFields.length > 0 && (
            <div><span className="food-kicker">Missing</span><p>{product.dataQuality.missingFields.join(", ")}</p></div>
          )}
          {product.dataQuality.conflicts.length > 0 && (
            <div><span className="food-kicker">Conflicts</span><p>{product.dataQuality.conflicts.join(", ")}</p></div>
          )}
        </div>
      )}

      <div className="food-detail-grid">
        <article>
          <span className="food-kicker">Ingredients</span>
          <p>{product.ingredientsText || "Ingredient statement not available."}</p>
        </article>
        <article>
          <span className="food-kicker">Declared allergens</span>
          <p>{product.allergenDataPresent ? (product.allergenTags.length ? product.allergenTags.join(", ") : "No allergens listed in the source record.") : "Allergen data not available. Check the physical label."}</p>
          {product.traceTags.length > 0 && <small>Traces: {product.traceTags.join(", ")}</small>}
        </article>
        <article>
          <span className="food-kicker">Source revision</span>
          <p>{product.sourceRevision ?? "Unknown"}</p>
          <small>Source last modified: {sourceDate}</small>
        </article>
      </div>

      <div className="food-nutrition" aria-label="Nutrition per 100 grams or millilitres">
        <span className="food-kicker food-nutrition-heading">Nutrition · per 100 g/ml</span>
        <dl>
          <div><dt>Energy</dt><dd>{product.nutrients.energyKcal === null ? "Not available" : formatNumber(product.nutrients.energyKcal, "kcal")}</dd></div>
          <div><dt>Sugar</dt><dd>{formatNumber(product.nutrients.sugars)}</dd></div>
          <div><dt>Salt</dt><dd>{formatNumber(product.nutrients.salt)}</dd></div>
          <div><dt>Protein</dt><dd>{formatNumber(product.nutrients.protein)}</dd></div>
          <div><dt>Fat</dt><dd>{formatNumber(product.nutrients.fat)}</dd></div>
          <div><dt>Fibre</dt><dd>{formatNumber(product.nutrients.fibre)}</dd></div>
        </dl>
      </div>
    </section>
  );
}

function AlternativeCard({ item, index }: { item: RankedAlternative; index: number }) {
  const product = item.product;
  return (
    <article className="food-alternative">
      <div className="food-alt-rank">{String(index + 1).padStart(2, "0")}</div>
      <div className="food-alt-body">
        <div className="food-alt-kicker-row">
          <span className="food-relation-pill" data-relation={item.relation.kind}>{item.relation.label}</span>
          <span className="food-kicker">{product.brand || "Brand unavailable"} · {product.quantity || "Quantity unavailable"}</span>
        </div>
        <h3>{product.name}</h3>
        <p className="food-relation-reason">{item.relation.reason}</p>
        <ul>{item.explanations.slice(1).map((explanation) => <li key={explanation}>{explanation}</li>)}</ul>
        <div className="food-alt-footer">
          <span>{product.dataQuality.confidence} confidence</span>
          <span>GTIN {product.gtin}</span>
        </div>
      </div>
    </article>
  );
}

function CandidateInspection({ title, items }: { title: string; items: RankedAlternative[] }) {
  if (items.length === 0) return null;
  return (
    <details className="food-excluded">
      <summary>{title} · {items.length}</summary>
      {items.map((item) => (
        <div key={`${title}-${item.product.gtin}`}>
          <strong>{item.product.name || item.product.gtin}</strong>
          <span>{item.exclusions.join(" · ")}</span>
        </div>
      ))}
    </details>
  );
}

export default function FoodIntelligence() {
  const [barcode, setBarcode] = useState(DEFAULT_BARCODE);
  const [state, setState] = useState<ResultState>("idle");
  const [result, setResult] = useState<NormalisedResult | null>(null);
  const [rawRecord, setRawRecord] = useState<RawRecordState | null>(null);
  const [message, setMessage] = useState("");
  const [cameraState, setCameraState] = useState<"closed" | "opening" | "active" | "unsupported" | "error">("closed");
  const [preferences, setPreferences] = useState<Required<FoodPreferences>>(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? { ...initialPreferences, ...JSON.parse(stored) } : initialPreferences;
    } catch {
      return initialPreferences;
    }
  });
  const [allergenText, setAllergenText] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const applyEnvelope = async (envelope: Record<string, unknown>) => {
    const preserved = await preserveRawEnvelope(envelope);
    const normalised = normaliseSourceEnvelope(envelope) as NormalisedResult;
    setRawRecord(preserved);
    setResult(normalised);
    setMessage(normalised.message ?? "");
    setState(normalised.state);
  };

  const fetchBarcode = async (value = barcode) => {
    const gtin = normalizeGtin(value);
    if (!gtin.ok) {
      setState("malformed");
      setMessage(gtin.error === "invalid_check_digit" ? "The barcode check digit is invalid." : "Use an 8, 12, 13 or 14 digit GTIN.");
      setResult(null);
      return;
    }
    setBarcode(gtin.normalized);
    setState("loading");
    setMessage("");
    try {
      const response = await fetch(`/api/food?barcode=${encodeURIComponent(gtin.normalized)}`, { headers: { accept: "application/json" } });
      const envelope = await response.json() as Record<string, unknown>;
      await applyEnvelope(envelope);
    } catch (error) {
      const envelope = {
        request: { barcode: gtin.normalized },
        retrievedAt: new Date().toISOString(),
        source: { id: "open_food_facts", apiVersion: "v3.6" },
        product: {
          kind: "source_error",
          httpStatus: 0,
          endpoint: "/api/food",
          message: error instanceof Error ? error.message : "Network request failed",
        },
        alternatives: { kind: "not_run", raw: { products: [] } },
      };
      await applyEnvelope(envelope);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void fetchBarcode();
  };

  const applyFixture = (fixtureId: string) => {
    const fixture = FOOD_FIXTURES[fixtureId];
    if (fixture) void applyEnvelope(fixture.envelope);
  };

  const stopCamera = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraState("closed");
  };

  const startCamera = async () => {
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector || !navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      return;
    }
    setCameraState("opening");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera surface unavailable");
      video.srcObject = stream;
      await video.play();
      const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
      setCameraState("active");
      const scan = async () => {
        try {
          const matches = await detector.detect(video);
          const value = matches.find((match) => normalizeGtin(match.rawValue).ok)?.rawValue;
          if (value) {
            stopCamera();
            setBarcode(value);
            void fetchBarcode(value);
            return;
          }
        } catch {
          // A transient detection error must not close the camera or invent a result.
        }
        frameRef.current = requestAnimationFrame(() => void scan());
      };
      frameRef.current = requestAnimationFrame(() => void scan());
    } catch {
      stopCamera();
      setCameraState("error");
    }
  };

  const preferencesWithText = useMemo<Required<FoodPreferences>>(() => ({
    ...preferences,
    avoidAllergens: allergenText.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean),
  }), [preferences, allergenText]);

  const ranked = useMemo(() => {
    if (!result?.product || !result.alternatives) return null;
    return rankAlternatives(result.product, result.alternatives, preferencesWithText);
  }, [result, preferencesWithText]);

  const productGatePass = Boolean(
    result?.product
    && result.product.gtin
    && result.product.name
    && result.product.sourceRef?.sourceId
    && !["malformed", "conflicted"].includes(result.product.dataQuality.state),
  );
  const comparisonGatePass = Boolean(
    ranked?.fairComparison
    && ranked.eligible.length >= 3
    && ranked.eligible.every((item) => item.relation.kind === "direct" && item.explanations.length > 0),
  );

  return (
    <div className="food-app">
      <a className="food-skip" href="#food-barcode">Skip to product lookup</a>
      <header className="food-header">
        <Link to="/" className="food-wordmark">4PLANET_</Link>
        <div>
          <span className="food-kicker">P18 · multi-category controlled prototype</span>
          <strong>FOOD INTELLIGENCE</strong>
        </div>
        <Link to="/missions/food" className="food-back">FOOD_ mission ↗</Link>
      </header>

      <main id="main-content" className="food-main">
        <section className="food-hero">
          <div>
            <span className="food-kicker">Scan → understand → compare</span>
            <h1>See the product.<br />See the evidence.</h1>
          </div>
          <p>A source-aware decision surface for real Norwegian products. Direct substitutes are separated from adjacent products. No universal score. Missing data stays visible.</p>
        </section>

        <section className="food-input-panel">
          <form onSubmit={submit} className="food-barcode-form">
            <label htmlFor="food-barcode">Barcode / GTIN</label>
            <div>
              <input id="food-barcode" inputMode="numeric" autoComplete="off" value={barcode} onChange={(event: ChangeEvent<HTMLInputElement>) => setBarcode(event.target.value)} aria-describedby="food-barcode-help" />
              <button type="submit" disabled={state === "loading"}>{state === "loading" ? "Reading…" : "Read source"}</button>
            </div>
            <small id="food-barcode-help">Manual entry is the guaranteed fallback. Always verify allergens and formulation against the physical pack.</small>
          </form>
          <div className="food-camera-control">
            <button type="button" onClick={cameraState === "active" ? stopCamera : () => void startCamera()}>{cameraState === "active" ? "Close camera" : "Scan with camera"}</button>
            <span>{cameraState === "unsupported" ? "Camera barcode detection is not supported in this browser; enter the code manually." : cameraState === "error" ? "Camera access failed; enter the code manually." : "Camera support is progressive and never required."}</span>
          </div>
          <div className={`food-camera ${cameraState === "active" || cameraState === "opening" ? "is-open" : ""}`}>
            <video ref={videoRef} muted playsInline aria-label="Barcode camera preview" />
            <div className="food-camera-target" aria-hidden="true" />
          </div>
        </section>

        <section className="food-fixtures" aria-label="Required deterministic test states">
          <div><span className="food-kicker">Required fixtures</span><p>Test records are isolated from live product claims.</p></div>
          <div className="food-fixture-buttons">
            {Object.values(FOOD_FIXTURES).map((fixture) => (
              <button key={fixture.id} type="button" onClick={() => applyFixture(fixture.id)}>{fixture.label}</button>
            ))}
          </div>
        </section>

        <StatusPanel state={state} message={message} />

        {state === "found" && result?.product && (
          <>
            <div className="food-record-strip">
              <div><span className="food-kicker">Record</span><strong>{rawRecord?.fixture ? "TEST FIXTURE" : "LIVE SOURCE READ"}</strong></div>
              <div><span className="food-kicker">Immutable hash</span><code>{rawRecord?.hash ? `${rawRecord.hash.slice(0, 16)}…` : "Pending"}</code></div>
              <div><span className="food-kicker">Local preservation</span><strong>{rawRecord?.persisted ? "APPEND-ONLY COPY SAVED" : "NOT PERSISTED"}</strong></div>
              <div><span className="food-kicker">Retrieved</span><strong>{rawRecord?.retrievedAt ? new Date(rawRecord.retrievedAt).toLocaleString("nb-NO") : "Unknown"}</strong></div>
            </div>

            <ProductCard product={result.product} />

            <section className="food-card food-priorities">
              <div>
                <span className="food-kicker">Your priorities</span>
                <h2>Change the ordering—not the evidence.</h2>
                <p>Mandatory allergen constraints are applied before ordering. Nutrition preferences only compare values present for both products. These are decision aids, not medical or universal health claims.</p>
              </div>
              <div className="food-preference-controls">
                <label><input type="checkbox" checked={preferences.lowerSugar} onChange={(event: ChangeEvent<HTMLInputElement>) => setPreferences((current) => ({ ...current, lowerSugar: event.target.checked }))} /> Lower sugar</label>
                <label><input type="checkbox" checked={preferences.lowerSalt} onChange={(event: ChangeEvent<HTMLInputElement>) => setPreferences((current) => ({ ...current, lowerSalt: event.target.checked }))} /> Lower salt</label>
                <label><input type="checkbox" checked={preferences.higherProtein} onChange={(event: ChangeEvent<HTMLInputElement>) => setPreferences((current) => ({ ...current, higherProtein: event.target.checked }))} /> Higher protein</label>
                <label className="food-allergen-input">Avoid declared allergens<input value={allergenText} onChange={(event: ChangeEvent<HTMLInputElement>) => setAllergenText(event.target.value)} placeholder="e.g. milk, peanuts" /></label>
              </div>
            </section>

            <section className="food-comparison" aria-labelledby="food-comparison-title">
              <div className="food-section-heading">
                <div><span className="food-kicker">Direct substitutes only</span><h2 id="food-comparison-title">Transparent comparison</h2></div>
                <p>{ranked?.eligible.length ?? 0} direct · {ranked?.adjacent.length ?? 0} adjacent · {ranked?.unsuitable.length ?? 0} unsuitable</p>
              </div>
              {ranked && !ranked.fairComparison ? (
                <div className="food-empty-comparison"><strong>Products cannot be compared fairly yet.</strong><br />{ranked.limitations.join(" ")}</div>
              ) : result.alternativeState === "source_error" ? (
                <div className="food-empty-comparison"><strong>Alternative source unavailable.</strong><br />No comparison candidates were inferred or substituted. Retry later or inspect the recorded source attempts.</div>
              ) : result.alternativeState === "not_found" ? (
                <div className="food-empty-comparison"><strong>No bounded source candidates found.</strong><br />This is a source result, not evidence that no alternatives exist in the market.</div>
              ) : ranked && ranked.eligible.length > 0 ? (
                <div className="food-alternative-list">{ranked.eligible.map((item, index) => <AlternativeCard key={item.product.gtin} item={item} index={index} />)}</div>
              ) : (
                <div className="food-empty-comparison">No candidate currently passes the direct-substitute, source-quality and personal-constraint gates.</div>
              )}
              {ranked && <CandidateInspection title="Adjacent products — inspect, do not rank as substitutes" items={ranked.adjacent} />}
              {ranked && <CandidateInspection title="Unsuitable or unresolved candidates" items={ranked.unsuitable} />}
            </section>

            <section className="food-gates">
              <div data-pass={productGatePass}><span className="food-kicker">Product-card gate</span><strong>{productGatePass ? "PASS" : "AMEND"}</strong><p>Identity, source reference and non-conflicted product state.</p></div>
              <div data-pass={comparisonGatePass}><span className="food-kicker">Comparison gate</span><strong>{comparisonGatePass ? "PASS" : "AMEND"}</strong><p>At least three controlled direct substitutes with inspectable reasons.</p></div>
            </section>

            <section className="food-card food-source-panel">
              <div>
                <span className="food-kicker">Source and licence</span>
                <h2>Open Food Facts</h2>
                <p>Product identity and alternative discovery are separate source operations. Every retry remains inspectable. Source data may be incomplete, old or contributed by users.</p>
              </div>
              <dl>
                <div><dt>API</dt><dd>{result.source?.apiVersion || "Unknown"}</dd></div>
                <div><dt>Adapter</dt><dd>{result.source?.adapterVersion || "Unknown"}</dd></div>
                <div><dt>Schema</dt><dd>{result.source?.schemaVersion ?? "Not reported"}</dd></div>
                <div><dt>Search category</dt><dd>{categoryLabel(result.sourceSearchCategory)}</dd></div>
                <div><dt>Database</dt><dd>{String(result.source?.licence?.database ?? "ODbL 1.0")}</dd></div>
                <div><dt>Contents</dt><dd>{String(result.source?.licence?.contents ?? "DbCL 1.0")}</dd></div>
                <div><dt>Images</dt><dd>{String(result.source?.licence?.images ?? "Separate image terms")}</dd></div>
                <div><dt>Model</dt><dd>{result.product.modelVersion}</dd></div>
              </dl>
              {result.alternativeAttempts && result.alternativeAttempts.length > 0 && (
                <details className="food-source-attempts">
                  <summary>Inspect {result.alternativeAttempts.length} alternative-source attempt{result.alternativeAttempts.length === 1 ? "" : "s"}</summary>
                  <pre>{JSON.stringify(result.alternativeAttempts, null, 2)}</pre>
                </details>
              )}
              <p className="food-source-limit">This interface is not medical advice and does not claim that one product is universally healthier. Always verify allergens and formulation against the physical label. Norway tagging does not prove current availability in every Norwegian store.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
