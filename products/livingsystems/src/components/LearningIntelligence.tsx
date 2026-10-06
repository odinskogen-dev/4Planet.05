import Link from "next/link";
import { nodeMeta } from "@/lib/graph";
import { reviewLabel } from "@/components/EvidencePanel";
import type {
  ExpectedOutcome,
  ObservedOutcome,
  LearningRecord,
  ConfidenceUpdate,
} from "@/types";

function SourceRefs({ ids }: { ids?: string[] }) {
  if (!ids?.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {ids.map((s) => (
        <Link
          key={s}
          href={`/sources/${s}`}
          className="border border-line px-1.5 py-0.5 text-[11px] hover:border-brand hover:text-brand"
        >
          {s}
        </Link>
      ))}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="micro mb-1">{label}</div>
      <p className="text-[13.5px] leading-relaxed text-ink/85">{value}</p>
    </div>
  );
}

export function ExpectedOutcomeCard({ outcome }: { outcome: ExpectedOutcome }) {
  const o = outcome;
  return (
    <div className="border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[14.5px] font-medium leading-snug">{o.title}</h3>
        <span className="micro shrink-0">{o.expectedDirection}</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink/80">{o.description}</p>
      {o.assumptions.length ? (
        <div className="mt-3">
          <div className="micro mb-1">Assumptions</div>
          <ul className="space-y-1">
            {o.assumptions.map((a, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-muted">— {a}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-2">
        <span className="micro">Confidence <span className="ml-1 text-ink">{o.confidence}</span></span>
        {o.timeHorizon ? <span className="micro">Horizon <span className="ml-1 text-ink">{o.timeHorizon}</span></span> : null}
        <span className="micro">Review <span className="ml-1 text-ink">{reviewLabel(o.reviewStatus)}</span></span>
        <SourceRefs ids={o.sourceIds} />
      </div>
      {o.dataGaps?.length ? (
        <div className="mt-2 text-[12px] text-muted">Data gap: {o.dataGaps.join(" · ")}</div>
      ) : null}
    </div>
  );
}

export function ObservedOutcomeCard({ outcome }: { outcome: ObservedOutcome }) {
  const o = outcome;
  return (
    <div className="border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[14.5px] font-medium leading-snug">{o.title}</h3>
        <span className="micro shrink-0">{o.observedDirection}</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink/80">{o.evidenceSummary}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-2">
        <span className="micro">Confidence <span className="ml-1 text-ink">{o.confidence}</span></span>
        <span className="micro">Review <span className="ml-1 text-ink">{reviewLabel(o.reviewStatus)}</span></span>
        <SourceRefs ids={o.sourceIds} />
      </div>
      {o.dataGaps?.length ? (
        <div className="mt-2 text-[12px] text-muted">Data gap: {o.dataGaps.join(" · ")}</div>
      ) : null}
    </div>
  );
}

export function LearningRecordCard({ record }: { record: LearningRecord }) {
  const l = record;
  return (
    <div className="border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug">{l.title}</h3>
        <span className="micro shrink-0">{l.assumptionStatus}</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field label="Expected" value={l.whatWasExpected} />
        <Field label="Observed" value={l.whatWasObserved} />
        <Field label="Learned" value={l.whatWeLearned} />
      </div>
      <div className="mt-3 border-t border-line pt-2">
        <div className="micro mb-1">Decision implication</div>
        <p className="text-[13px] leading-relaxed text-ink/85">{l.decisionImplication}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
        <span className="micro">
          Confidence <span className="ml-1 text-ink">{l.confidenceBefore} → {l.confidenceAfter}</span>
          <span className="ml-1 text-muted">({l.confidenceChange})</span>
        </span>
        <span className="micro">Review <span className="ml-1 text-ink">{reviewLabel(l.reviewStatus)}</span></span>
        <SourceRefs ids={l.sourceIds} />
      </div>
      {(l.decisionSignalIds?.length || l.solutionPathwayIds?.length) ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {(l.decisionSignalIds ?? []).map((id) => (
            <Link key={id} href="/decisions" className="border border-line px-2 py-0.5 text-[11.5px] text-muted hover:border-brand hover:text-brand">
              {id}
            </Link>
          ))}
        </div>
      ) : null}
      {l.dataGaps?.length ? (
        <div className="mt-2 text-[12px] text-muted">Data gap: {l.dataGaps.join(" · ")}</div>
      ) : null}
    </div>
  );
}

function ConfidenceUpdateRow({ update }: { update: ConfidenceUpdate }) {
  const u = update;
  const target = nodeMeta(u.targetId);
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border border-line p-3">
      <span className="text-[13px]">{u.reason}</span>
      <span className="micro shrink-0">
        {target.name !== u.targetId ? target.name : u.targetId} ·{" "}
        <span className="text-ink">{u.previousConfidence} → {u.updatedConfidence}</span>
      </span>
    </div>
  );
}

/** Combines learning records (+ optional confidence updates) for a context. */
export function LearningIntelligencePanel({
  records,
  confidenceUpdates = [],
  title = "Learning intelligence",
}: {
  records: LearningRecord[];
  confidenceUpdates?: ConfidenceUpdate[];
  title?: string;
}) {
  if (records.length === 0 && confidenceUpdates.length === 0) return null;
  return (
    <section className="border-t border-line py-8">
      <div className="micro-brand mb-1">{title}</div>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">
        Structured learning examples — what was expected, what was observed, and
        what it implies for future decisions. Not live impact reports; uncertainty
        is treated as intelligence.
      </p>
      {records.length ? (
        <div className="space-y-2">
          {records.map((r) => (
            <LearningRecordCard key={r.id} record={r} />
          ))}
        </div>
      ) : null}
      {confidenceUpdates.length ? (
        <div className="mt-6">
          <div className="micro mb-3">Confidence updates</div>
          <div className="space-y-2">
            {confidenceUpdates.map((u) => (
              <ConfidenceUpdateRow key={u.id} update={u} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
