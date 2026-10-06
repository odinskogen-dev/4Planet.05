import Link from "next/link";
import { nodeMeta } from "@/lib/graph";
import { reviewLabel } from "@/components/EvidencePanel";
import { pathwaysForNode, decisionSignalsForNode } from "@/lib/solutions";
import type { SolutionPathway, DecisionSignal } from "@/types";

function Ref({ id }: { id: string }) {
  const n = nodeMeta(id);
  return n.href ? (
    <Link
      href={n.href}
      className="border border-line px-2 py-0.5 text-[12px] hover:border-brand hover:text-brand"
    >
      {n.name}
    </Link>
  ) : (
    <span className="border border-line px-2 py-0.5 text-[12px]">{n.name}</span>
  );
}

function Arrow() {
  return (
    <span className="self-center text-brand" aria-hidden>
      &rarr;
    </span>
  );
}

export function SolutionPathwayCard({ pathway }: { pathway: SolutionPathway }) {
  const p = pathway;
  return (
    <div className="border border-line p-4">
      <div className="flex flex-wrap items-stretch gap-x-3 gap-y-3">
        <div className="flex flex-col gap-1">
          <span className="micro">Threat</span>
          <Ref id={p.threatId} />
        </div>
        <Arrow />
        <div className="flex flex-col gap-1">
          <span className="micro">Solution</span>
          <Ref id={p.solutionId} />
        </div>
        <Arrow />
        <div className="flex flex-col gap-1">
          <span className="micro">Strengthens</span>
          <div className="flex flex-wrap gap-1">
            {p.strengthenedServiceIds.map((id) => (
              <Ref key={id} id={id} />
            ))}
          </div>
        </div>
        <Arrow />
        <div className="flex flex-col gap-1">
          <span className="micro">Supports</span>
          <div className="flex flex-wrap gap-1">
            {p.supportedHumanSystemIds.map((id) => (
              <Ref key={id} id={id} />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line pt-2">
        <span className="micro">Confidence <span className="ml-1 text-ink">{p.confidence}</span></span>
        <span className="micro">Review <span className="ml-1 text-ink">{reviewLabel(p.reviewStatus)}</span></span>
        {p.dataGaps?.length ? (
          <span className="text-[12px] text-muted">Data gap: {p.dataGaps.join(" · ")}</span>
        ) : null}
      </div>
    </div>
  );
}

function Pair({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="micro">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

export function DecisionSignalCard({ signal }: { signal: DecisionSignal }) {
  const d = signal;
  return (
    <div className="border border-line p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug">{d.title}</h3>
        <Link href={`/solutions/${d.solutionId}`} className="micro shrink-0 hover:text-brand">
          {nodeMeta(d.solutionId).name} →
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
        <Pair label="Leverage" value={d.leverage} />
        <Pair label="Urgency" value={d.urgency} />
        <Pair label="Confidence" value={d.confidence} />
        <Pair label="Difficulty" value={d.implementationDifficulty} />
        <Pair label="Horizon" value={d.timeHorizon ?? "Unknown"} />
      </div>
      <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink/80">{d.reasoning}</p>
      <div className="mt-3 flex flex-wrap gap-1">
        {d.threatIds.map((id) => (
          <Ref key={id} id={id} />
        ))}
      </div>
      {d.dataGaps?.length ? (
        <div className="mt-2 text-[12px] text-muted">Data gap: {d.dataGaps.join(" · ")}</div>
      ) : null}
      <div className="mt-2 flex flex-wrap items-center gap-x-4">
        <span className="micro">Review <span className="ml-1 text-ink">{reviewLabel(d.reviewStatus)}</span></span>
        {d.sourceIds?.length ? (
          <span className="flex flex-wrap gap-1">
            {d.sourceIds.map((s) => (
              <Link
                key={s}
                href={`/sources/${s}`}
                className="border border-line px-1.5 py-0.5 text-[11px] hover:border-brand hover:text-brand"
              >
                {s}
              </Link>
            ))}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** Combines solution pathways + decision signals for any node. */
export function SolutionIntelligencePanel({ nodeId }: { nodeId: string }) {
  const pathways = pathwaysForNode(nodeId);
  const signals = decisionSignalsForNode(nodeId);
  if (pathways.length === 0 && signals.length === 0) return null;
  return (
    <section className="border-t border-line py-8">
      <div className="micro-brand mb-1">Solution intelligence</div>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">
        What can help, what it addresses, and what it may strengthen — structured
        reasoning with confidence and gaps, not automated advice.
      </p>
      {pathways.length ? (
        <div className="space-y-2">
          {pathways.map((p) => (
            <SolutionPathwayCard key={p.id} pathway={p} />
          ))}
        </div>
      ) : null}
      {signals.length ? (
        <div className="mt-6">
          <div className="micro mb-3">Decision signals</div>
          <div className="space-y-2">
            {signals.map((s) => (
              <DecisionSignalCard key={s.id} signal={s} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
