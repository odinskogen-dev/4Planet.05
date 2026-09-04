import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import PickScanner from "../../food/PickScanner";
import {
  FOOD_ALLERGENS,
  FOOD_CHOICE_BLIND_SPOTS,
  FOOD_PRIORITIES,
  SAMPLE_FOOD_BARCODE,
  buildFoodChoice,
  foodProductSubtitle,
  foodProductTitle,
  readFoodProduct,
  readSampleFoodProduct,
  type FoodRead,
} from "../../choice/food-choice";
import {
  browserStorage,
  makeReceiptId,
  readContext,
  writeContext,
  type ChoiceAction,
  type ChoiceReceipt,
  type EmblaContextState,
} from "../../choice/receipts";

const READ_STATE_COPY: Record<string, { title: string; body: string }> = {
  not_found: {
    title: "That barcode is not in the source.",
    body: "Open Food Facts returned no record for it. Nothing has been guessed in its place.",
  },
  source_error: {
    title: "The product source could not be read.",
    body: "A source that is unavailable is not the same as a product that is bad. Try again, or look at how Embla works on a test record.",
  },
  malformed: {
    title: "Embla cannot use that.",
    body: "The barcode or the returned record is inconsistent, so Embla will not build a decision on it.",
  },
};

export default function EmblaFoodDecision({
  intentLabel,
  onReceipt,
}: {
  intentLabel: string;
  onReceipt: (receipt: ChoiceReceipt) => void;
}) {
  const storage = useMemo(() => browserStorage(), []);
  const [barcode, setBarcode] = useState("");
  const [read, setRead] = useState<FoodRead | null>(null);
  const [busy, setBusy] = useState(false);
  const [context, setContext] = useState<EmblaContextState>(() => readContext(storage));
  const [saved, setSaved] = useState<ChoiceReceipt | null>(null);

  useEffect(() => {
    writeContext(storage, context);
  }, [storage, context]);

  const choice = useMemo(() => (read ? buildFoodChoice(read, context) : null), [read, context]);
  const product = read?.product ?? null;
  const decision = choice?.decision ?? null;
  const baselineTitle = foodProductTitle(product);

  const lookup = async (value: string) => {
    setBusy(true);
    setSaved(null);
    const result = await readFoodProduct(value);
    setRead(result);
    setBusy(false);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void lookup(barcode);
  };

  const useSample = () => {
    setBarcode(SAMPLE_FOOD_BARCODE);
    setSaved(null);
    setRead(readSampleFoodProduct());
  };

  const toggle = (key: "priorities" | "avoidAllergens", id: string) => {
    setSaved(null);
    setContext((current) => {
      const values = current[key];
      return {
        ...current,
        [key]: values.includes(id) ? values.filter((item) => item !== id) : [...values, id],
      };
    });
  };

  const commit = (action: ChoiceAction) => {
    if (!read || !product || !decision) return;
    const option = action === "SWITCH" ? decision.option : null;
    const receipt: ChoiceReceipt = {
      id: makeReceiptId(),
      savedAt: new Date().toISOString(),
      domain: "FOOD",
      intent: intentLabel,
      action,
      verdict: decision.verdict,
      chosenTitle: option ? option.title : baselineTitle,
      chosenId: option ? option.id : product.gtin,
      baselineTitle,
      reasons: option ? decision.reasons.slice(0, 3) : [],
      priorities: (choice?.selectedPriorities ?? []).map((priority) => priority.label),
      recordType: read.isFixture ? "SAMPLE_TEST_RECORD" : "LIVE_SOURCE_READ",
      feedback: null,
    };
    setSaved(receipt);
    onReceipt(receipt);
  };

  const stateCopy = read && READ_STATE_COPY[read.state] ? READ_STATE_COPY[read.state] : null;

  return (
    <div className="embla__decision">
      <section className="embla__step" aria-labelledby="embla-step-product">
        <p className="embla__step-label">STEP 1 · THE PRODUCT</p>
        <h2 id="embla-step-product">Which one are you holding?</h2>
        <p className="embla__step-lede">
          Embla reads one real product record before it says anything. Scan the barcode, or type the digits under the bars.
        </p>

        <div className="embla__lookup">
          <PickScanner onDetected={(value) => { setBarcode(value); void lookup(value); }} />
          <form onSubmit={submit} className="embla__lookup-form">
            <label htmlFor="embla-barcode">Barcode</label>
            <div className="embla__lookup-row">
              <input
                id="embla-barcode"
                inputMode="numeric"
                autoComplete="off"
                placeholder="7038010055652"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value.replace(/\D/g, ""))}
              />
              <button type="submit" className="embla__button" disabled={busy}>
                {busy ? "Reading…" : "Read product"}
              </button>
            </div>
          </form>
          <button type="button" className="embla__quiet-button" onClick={useSample}>
            Try it with a test record
          </button>
        </div>

        {product ? null : (
          <p className="embla__fine">
            Embla starts from one specific product. Searching by product name is not connected yet, so use a barcode — or open the
            bounded test record to see the whole decision end to end.
          </p>
        )}

        {stateCopy ? (
          <div className="embla__notice" role="status">
            <strong>{stateCopy.title}</strong>
            <p>{read?.message || stateCopy.body}</p>
          </div>
        ) : null}

        {read?.isFixture ? (
          <p className="embla__fixture-flag" role="status">
            TEST DATA · This is a 4PLANET fixture record, not a product on a shelf. Every name starts with TEST RECORD.
          </p>
        ) : null}

        {product ? (
          <article className="embla__product" aria-live="polite">
            <div className="embla__product-image" aria-hidden="true">
              {product.imageUrl && !product.imageUrl.startsWith("fixture:") ? (
                <img src={product.imageUrl} alt="" loading="lazy" />
              ) : (
                <span>NO IMAGE</span>
              )}
            </div>
            <div className="embla__product-body">
              <p className="embla__mono">
                {read?.isFixture ? "SAMPLE TEST RECORD" : "LIVE SOURCE READ"} · GTIN {product.gtin}
              </p>
              <h3>{baselineTitle}</h3>
              <p className="embla__product-meta">{foodProductSubtitle(product)}</p>
              <p className="embla__product-quality">
                {product.categoryControl.label} · record confidence {product.dataQuality.confidence} ·{" "}
                {Math.round(product.dataQuality.completeness * 100)}% of the fields Embla checks
                {product.dataQuality.missingFields.length > 0
                  ? ` · missing: ${product.dataQuality.missingFields.join(", ")}`
                  : ""}
              </p>
            </div>
          </article>
        ) : null}
      </section>

      {product ? (
        <section className="embla__step" aria-labelledby="embla-step-priorities">
          <p className="embla__step-label">STEP 2 · WHAT MATTERS TO YOU</p>
          <h2 id="embla-step-priorities">Tell Embla what matters.</h2>
          <p className="embla__step-lede">
            Your priorities change the ordering, never the evidence. Choose nothing and Embla will refuse to call one product better than another.
          </p>

          <div className="embla__chips" role="group" aria-label="Nutrition priorities">
            {FOOD_PRIORITIES.map((priority) => (
              <button
                key={priority.id}
                type="button"
                className="embla__chip"
                aria-pressed={context.priorities.includes(priority.id)}
                onClick={() => toggle("priorities", priority.id)}
              >
                {priority.label}
              </button>
            ))}
          </div>

          <p className="embla__chips-label" id="embla-allergen-label">Avoid declared allergens</p>
          <div className="embla__chips" role="group" aria-labelledby="embla-allergen-label">
            {FOOD_ALLERGENS.map((allergen) => (
              <button
                key={allergen.id}
                type="button"
                className="embla__chip"
                aria-pressed={context.avoidAllergens.includes(allergen.id)}
                onClick={() => toggle("avoidAllergens", allergen.id)}
              >
                {allergen.label}
              </button>
            ))}
          </div>
          <p className="embla__fine">
            Kept on this device only. This is shopping support, not medical advice — always check the physical label before you eat something.
          </p>
        </section>
      ) : null}

      {product && decision ? (
        <section className="embla__answer" data-verdict={decision.verdict} aria-labelledby="embla-answer-title" aria-live="polite">
          <p className="embla__step-label">STEP 3 · EMBLA'S ANSWER</p>
          <h2 id="embla-answer-title">{decision.headline}</h2>
          <p className="embla__answer-lede">{decision.explanation}</p>

          {decision.option ? (
            <p className="embla__answer-meta">
              {decision.option.subtitle} · {decision.option.relationReason} · record confidence {decision.option.confidence}
            </p>
          ) : null}

          {decision.reasons.length > 0 ? (
            <div className="embla__reasons">
              <p className="embla__mono">WHY</p>
              <ul>
                {decision.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {decision.tradeOffs.length > 0 ? (
            <div className="embla__reasons embla__reasons--trade">
              <p className="embla__mono">WHAT ELSE CHANGES</p>
              <ul>
                {decision.tradeOffs.map((tradeOff) => (
                  <li key={tradeOff}>{tradeOff}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {decision.unknowns.length > 0 ? (
            <div className="embla__reasons embla__reasons--unknown">
              <p className="embla__mono">NOT COMPARABLE</p>
              <ul>
                {decision.unknowns.map((unknown) => (
                  <li key={unknown}>{unknown}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {decision.limitations.length > 0 ? (
            <p className="embla__fine">{decision.limitations.join(" ")}</p>
          ) : null}

          {saved ? (
            <div className="embla__receipt" role="status">
              <p className="embla__mono">SAVED ON THIS DEVICE</p>
              <p>
                {saved.action === "SWITCH"
                  ? `You chose ${saved.chosenTitle} instead of ${saved.baselineTitle}.`
                  : `You kept ${saved.baselineTitle}.`}
              </p>
              <p className="embla__fine">
                A saved decision is not proof of a purchase, a health outcome or an environmental outcome.
              </p>
            </div>
          ) : (
            <div className="embla__actions">
              {decision.verdict === "SWITCH" && decision.option ? (
                <button type="button" className="embla__button embla__button--primary" onClick={() => commit("SWITCH")}>
                  Choose this one
                </button>
              ) : null}
              <button
                type="button"
                className={`embla__button${decision.verdict === "SWITCH" ? " embla__button--ghost" : " embla__button--primary"}`}
                onClick={() => commit("KEEP")}
              >
                Keep the one I have
              </button>
            </div>
          )}

          <details className="embla__details">
            <summary>Substitutes Embla looked at ({choice?.considered.length ?? 0})</summary>
            <div className="embla__considered">
              {(choice?.considered ?? []).map((option) => (
                <article key={option.id} data-eligible={option.eligible ? "yes" : "no"}>
                  <p className="embla__mono">
                    {option.eligible ? "COMPARED" : "NOT COMPARED"} · {option.relationLabel}
                  </p>
                  <strong>{option.title}</strong>
                  <p>{option.subtitle}</p>
                  <p className="embla__fine">
                    {option.eligible
                      ? option.dimensions
                          .filter((dimension) => dimension.state !== "UNKNOWN")
                          .map((dimension) => dimension.text)
                          .join(" · ")
                      : option.exclusions.join(" · ")}
                  </p>
                </article>
              ))}
            </div>
          </details>

          <details className="embla__details">
            <summary>Evidence, source and limits</summary>
            <div className="embla__evidence">
              <dl>
                <div>
                  <dt>Source</dt>
                  <dd>{read?.sourceId || "unknown"} · API {read?.sourceApi || "unknown"}</dd>
                </div>
                <div>
                  <dt>Licence</dt>
                  <dd>{read?.licence}</dd>
                </div>
                <div>
                  <dt>Record</dt>
                  <dd>{read?.isFixture ? "4PLANET test fixture" : "Live source read"}</dd>
                </div>
                <div>
                  <dt>Retrieved</dt>
                  <dd>{read?.retrievedAt || "Not reported"}</dd>
                </div>
              </dl>
              <p className="embla__mono">WHAT THIS COMPARISON CANNOT TELL YOU</p>
              <ul>
                {FOOD_CHOICE_BLIND_SPOTS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="embla__fine">
                Source records are contributed and may be incomplete or out of date. Embla keeps missing values as unknown instead of
                scoring them down.{" "}
                <Link to="/4sapien/food">Open the full FOOD evidence workspace</Link>.
              </p>
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}
