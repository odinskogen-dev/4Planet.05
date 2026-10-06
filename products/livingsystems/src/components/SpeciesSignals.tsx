import type { DecisionSignals, KnowledgeProfile } from "@/types";

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-line py-2 last:border-b-0">
      <span className="micro">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
}

export function SpeciesSignals({
  signals,
  knowledge,
}: {
  signals?: DecisionSignals;
  knowledge?: KnowledgeProfile;
}) {
  if (!signals && !knowledge) return null;
  return (
    <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2">
      {signals ? (
        <div>
          <div className="micro-brand mb-3">Decision signals</div>
          <Row label="Urgency" value={signals.urgency} />
          <Row label="Leverage" value={signals.leverage} />
          <Row label="Scale" value={signals.scale} />
          <Row label="Reversibility" value={signals.reversibility} />
          <Row label="Confidence" value={signals.confidence} />
          <Row label="Knowledge quality" value={signals.knowledgeQuality} />
          <Row label="Decision relevance" value={signals.decisionRelevance} />
        </div>
      ) : null}
      {knowledge ? (
        <div>
          <div className="micro-brand mb-3">Knowledge status</div>
          <Row label="Status" value={knowledge.status} />
          <Row label="Evidence quality" value={knowledge.evidenceQuality} />
          <Row label="Last reviewed" value={knowledge.lastReviewDate} />
          {knowledge.known ? (
            <p className="mt-3 text-[13px] leading-relaxed text-ink/80">
              <span className="micro mr-2">Known</span>
              {knowledge.known}
            </p>
          ) : null}
          {knowledge.unknown ? (
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              <span className="micro mr-2">Unknown</span>
              {knowledge.unknown}
            </p>
          ) : null}
          {knowledge.researchGaps?.length ? (
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
              <span className="micro mr-2">Research gaps</span>
              {knowledge.researchGaps.join(" · ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
