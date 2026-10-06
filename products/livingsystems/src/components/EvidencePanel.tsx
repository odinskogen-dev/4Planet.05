import Link from "next/link";
import type { ClaimNode, ReviewStatus } from "@/types";
import { getSourcesForClaim, getClaimsForNode, getTrustSummaryForNode } from "@/lib/trust";

export const reviewLabel = (s?: ReviewStatus): string =>
  s === "NeedsSource"
    ? "Needs source"
    : s === "NeedsUpdate"
    ? "Needs update"
    : s ?? "—";

// A small status marker — minimal colour, premium. Only attention states tint.
function Status({ status }: { status?: ReviewStatus }) {
  const attention = status === "NeedsSource" || status === "NeedsUpdate";
  return (
    <span className={attention ? "text-brand" : "text-ink"}>{reviewLabel(status)}</span>
  );
}

export function EvidencePanel({ claim }: { claim: ClaimNode }) {
  const sources = getSourcesForClaim(claim.id);
  return (
    <div className="border border-line p-4">
      <p className="text-[14.5px] leading-relaxed text-ink/90">{claim.statement}</p>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
        <div>
          <div className="micro mb-0.5">Confidence</div>
          <div className="text-[13px] font-medium">{claim.confidence}</div>
        </div>
        <div>
          <div className="micro mb-0.5">Review</div>
          <div className="text-[13px] font-medium">
            <Status status={claim.reviewStatus} />
          </div>
        </div>
        <div className="col-span-2">
          <div className="micro mb-0.5">Sources</div>
          <div className="flex flex-wrap gap-1.5">
            {sources.length ? (
              sources.map((s) => (
                <Link
                  key={s.id}
                  href={`/sources/${s.id}`}
                  className="border border-line px-1.5 py-0.5 text-[11.5px] hover:border-brand hover:text-brand"
                >
                  {s.title}
                </Link>
              ))
            ) : (
              <span className="text-[12.5px] text-muted">No source yet</span>
            )}
          </div>
        </div>
      </div>
      {claim.dataGaps?.length ? (
        <div className="mt-3 border-t border-line pt-2">
          <span className="micro mr-2">Data gaps</span>
          <span className="text-[12.5px] text-muted">{claim.dataGaps.join(" · ")}</span>
        </div>
      ) : null}
      {claim.lastReviewed ? (
        <div className="mt-2 text-[11px] text-ink/40">Last reviewed {claim.lastReviewed}</div>
      ) : null}
    </div>
  );
}

/** All claims about a node, rendered as a compact evidence section. */
export function NodeEvidence({ nodeId }: { nodeId: string }) {
  const claims = getClaimsForNode(nodeId);
  if (claims.length === 0) return null;
  return (
    <section className="border-t border-line py-8">
      <div className="micro-brand mb-4">Evidence</div>
      <div className="space-y-2">
        {claims.map((c) => (
          <EvidencePanel key={c.id} claim={c} />
        ))}
      </div>
    </section>
  );
}

/** Small, non-dominant trust summary for a node. Renders nothing if empty. */
export function NodeTrustSummary({ nodeId }: { nodeId: string }) {
  const t = getTrustSummaryForNode(nodeId);
  if (t.claimCount === 0) return null;
  const cell = (label: string, value: React.ReactNode) => (
    <div className="flex items-baseline gap-2">
      <span className="micro">{label}</span>
      <span className="text-[13px] font-medium">{value}</span>
    </div>
  );
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border border-line bg-paper px-4 py-3">
      <span className="micro-brand">Trust summary</span>
      {cell("Claims", t.claimCount)}
      {cell("Sources", t.sourceCount)}
      {t.confidence ? cell("Confidence", t.confidence) : null}
      {t.reviewStatus ? cell("Review", reviewLabel(t.reviewStatus)) : null}
      {t.dataGaps.length ? cell("Data gaps", t.dataGaps.length) : null}
    </div>
  );
}
