import type { DataQualityIssue, DataQualityStatus, VerificationStatus } from "@/types";
import { getEvidenceCoverageSummary } from "@/lib/dataQuality";

const STATUS_LABEL: Record<DataQualityStatus, string> = {
  Strong: "Strong",
  Moderate: "Moderate",
  Limited: "Limited",
  NeedsSource: "Needs source",
  NeedsReview: "Needs review",
  Unverified: "Unverified",
};

const VERIF_LABEL: Record<VerificationStatus, string> = {
  Verified: "Verified",
  NeedsURL: "Needs URL",
  NeedsMetadata: "Needs metadata",
  NeedsReview: "Needs review",
  Deprecated: "Deprecated",
};

export function DataQualityBadge({
  status,
  verification,
}: {
  status?: DataQualityStatus;
  verification?: VerificationStatus;
}) {
  const label = status ? STATUS_LABEL[status] : verification ? VERIF_LABEL[verification] : null;
  if (!label) return null;
  const strong = status === "Strong" || verification === "Verified";
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[11px] uppercase tracking-[0.12em] ${
        strong ? "border-brand text-brand" : "border-line text-muted"
      }`}
    >
      {label}
    </span>
  );
}

export function DataQualityIssueList({ issues }: { issues: DataQualityIssue[] }) {
  if (!issues.length) return null;
  return (
    <div className="space-y-2">
      {issues.map((i) => (
        <div key={i.id} className="border border-line p-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px]">{i.note}</span>
            <span className="micro shrink-0">{i.severity}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="micro text-muted">{i.issueType}</span>
            <span className="font-mono text-[11px] text-ink/45">{i.targetType}:{i.targetId}</span>
          </div>
          {i.suggestedFix ? (
            <div className="mt-1.5 text-[12px] text-muted">Fix: {i.suggestedFix}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Small panel for a node/source detail page. Renders nothing if no issues. */
export function DataQualityPanel({
  issues,
  title = "Data quality notes",
}: {
  issues: DataQualityIssue[];
  title?: string;
}) {
  if (!issues.length) return null;
  return (
    <section className="border-t border-line py-6">
      <div className="micro-brand mb-3">{title}</div>
      <DataQualityIssueList issues={issues} />
    </section>
  );
}

export function EvidenceCoverageSummary() {
  const rows = getEvidenceCoverageSummary();
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
      {rows.map((r) => (
        <div key={r.label} className="bg-paper p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[14px] font-medium">{r.label}</div>
            <DataQualityBadge status={r.status} />
          </div>
          <div className="mt-2 flex gap-4">
            <span className="micro">Claims <span className="ml-1 text-ink tabular-nums">{r.claims}</span></span>
            <span className="micro">Sources <span className="ml-1 text-ink tabular-nums">{r.sources}</span></span>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{r.note}</p>
        </div>
      ))}
    </div>
  );
}
