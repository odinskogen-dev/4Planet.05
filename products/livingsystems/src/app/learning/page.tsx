import Link from "next/link";
import {
  LEARNING_RECORDS,
  CONFIDENCE_UPDATES,
  getLearningDataGaps,
} from "@/lib/learning";
import { LearningRecordCard } from "@/components/LearningIntelligence";

export const metadata = { title: "Learning — LIVING SYSTEMS INTELLIGENCE" };

const LOOP = [
  "Decision",
  "Expected outcome",
  "Observed outcome",
  "Learning record",
  "Confidence update",
];

export default function LearningPage() {
  const amazon = LEARNING_RECORDS.filter((l) =>
    (l.ecosystemIds ?? []).includes("EC_AMAZON_RAINFOREST")
  );
  const pollination = LEARNING_RECORDS.filter((l) =>
    (l.speciesIds ?? []).includes("SP_HONEY_BEE")
  );
  const gaps = getLearningDataGaps();

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="micro-brand mb-2">Learning intelligence</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
        Learning
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        Learning Intelligence helps the system track what was expected, what was
        observed, what was learned, and whether confidence should change. This is
        not a live impact reporting system — it is a structured intelligence layer
        for learning from outcomes, using example learning records for the
        existing proof cases.
      </p>

      <div className="mt-5 max-w-2xl border-l-2 border-brand pl-4 py-1">
        <div className="micro-brand mb-1">Why learning matters</div>
        <p className="text-[14px] leading-relaxed text-ink/85">
          Learning Intelligence connects expectations to observations. It helps
          the system avoid being static: evidence can confirm, weaken or refine
          what the system believes. Use learning records to see whether a solution
          pathway is supported, uncertain, context-dependent or in need of better
          measurement.
        </p>
      </div>

      <section className="mt-10">
        <div className="micro-brand mb-4">How the loop works</div>
        <div className="flex flex-wrap items-stretch gap-1.5">
          {LOOP.map((step, i) => (
            <div key={step} className="flex items-stretch gap-1.5">
              <span className="border border-line bg-paper px-3 py-2 text-[13px] font-medium">
                {step}
              </span>
              {i < LOOP.length - 1 ? (
                <span className="flex items-center text-brand" aria-hidden>&rarr;</span>
              ) : null}
            </div>
          ))}
          <span className="flex items-center text-brand" aria-hidden>&#8631;</span>
        </div>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">
          The loop feeds back: what is learned can update confidence and improve
          the next decision.
        </p>
      </section>

      <section className="mt-12">
        <div className="micro-brand mb-4">Amazon — learning examples</div>
        <div className="space-y-2">
          {amazon.map((l) => (
            <LearningRecordCard key={l.id} record={l} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="micro-brand mb-4">Pollination &amp; the food system — learning examples</div>
        <div className="space-y-2">
          {pollination.map((l) => (
            <LearningRecordCard key={l.id} record={l} />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Confidence updates</div>
        <div className="space-y-2">
          {CONFIDENCE_UPDATES.map((u) => (
            <div key={u.id} className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3">
              <span className="text-[13px]">{u.reason}</span>
              <span className="micro shrink-0">{u.targetId} · <span className="text-ink">{u.previousConfidence} → {u.updatedConfidence}</span></span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-6">
        <div className="micro-brand mb-4">Data gaps &amp; limitations</div>
        <ul className="space-y-1.5">
          {gaps.map((g, i) => (
            <li key={i} className="text-[13px] leading-snug text-muted">— {g}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/decisions" className="micro-ink hover:text-brand">Decisions →</Link>
          <Link href="/trust" className="micro-ink hover:text-brand">Trust →</Link>
          <Link href="/ecosystems/EC_AMAZON_RAINFOREST" className="micro-ink hover:text-brand">Amazon →</Link>
        </div>
      </section>
    </div>
  );
}
