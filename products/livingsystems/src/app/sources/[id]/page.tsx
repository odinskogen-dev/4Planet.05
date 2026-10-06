import { notFound } from "next/navigation";
import Link from "next/link";
import { sourcesList, getSource, getClaimsForSource } from "@/lib/trust";
import { nodeMeta } from "@/lib/graph";
import { EvidencePanel } from "@/components/EvidencePanel";
import { DataQualityBadge, DataQualityPanel } from "@/components/DataQuality";
import { getDataQualityIssuesForTarget } from "@/lib/dataQuality";

export function generateStaticParams() {
  return sourcesList.map((s) => ({ id: s.id }));
}
export function generateMetadata({ params }: { params: { id: string } }) {
  const s = getSource(params.id);
  return s ? { title: `${s.title} — LIVING SYSTEMS INTELLIGENCE` } : {};
}

export default function SourcePage({ params }: { params: { id: string } }) {
  const s = getSource(params.id);
  if (!s) notFound();
  const claims = getClaimsForSource(s.id);
  const nodeIds = Array.from(
    new Set(claims.map((c) => c.nodeId).filter(Boolean) as string[])
  );
  const relIds = Array.from(
    new Set(claims.map((c) => c.relationshipId).filter(Boolean) as string[])
  );
  const meta: [string, string | undefined][] = [
    ["Organisation", s.organization],
    ["Author", s.author],
    ["Year", s.year ? String(s.year) : undefined],
    ["Type", s.sourceType.replace(/([A-Z])/g, " $1").trim()],
    ["Reliability", s.trustLevel],
    ["Evidence tier", s.evidenceTier?.replace(/([A-Z])/g, " $1").trim()],
    ["Source quality", s.sourceQuality],
    ["Verification", s.verificationStatus?.replace(/([A-Z])/g, " $1").trim()],
  ];
  const dqIssues = getDataQualityIssuesForTarget("Source", s.id);
  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <Link href="/sources" className="micro hover:text-brand">
        ← Sources
      </Link>
      <h1 className="mt-5 text-[clamp(1.7rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-tight">
        {s.title}
      </h1>
      {s.verificationStatus ? (
        <div className="mt-2">
          <DataQualityBadge verification={s.verificationStatus} />
        </div>
      ) : null}
      {s.url ? (
        <a
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-block text-[13px] text-brand hover:underline"
        >
          {s.url}
        </a>
      ) : null}

      {s.needsVerification ? (
        <div className="mt-5 border border-brand/40 bg-brand/[0.03] px-4 py-2.5 text-[13px] text-ink/80">
          This source entry needs verification — specific citation details or URL
          are still to be confirmed.
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {meta.map(([k, v]) =>
          v ? (
            <div key={k}>
              <div className="micro mb-0.5">{k}</div>
              <div className="text-[13.5px] font-medium">{v}</div>
            </div>
          ) : null
        )}
      </div>

      <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink/80">{s.summary}</p>

      {s.usedFor?.length ? (
        <div className="mt-4">
          <div className="micro mb-1">Used for</div>
          <div className="text-[13px] text-muted">{s.usedFor.join(" · ")}</div>
        </div>
      ) : null}

      {s.citationNote ? (
        <div className="mt-4">
          <div className="micro mb-1">Citation note</div>
          <div className="text-[13px] text-muted">{s.citationNote}</div>
        </div>
      ) : null}

      <section className="mt-10 border-t border-line pt-6">
        <div className="micro-brand mb-4">Claims supported ({claims.length})</div>
        {claims.length ? (
          <div className="space-y-2">
            {claims.map((c) => (
              <EvidencePanel key={c.id} claim={c} />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted">No claims cite this source yet.</p>
        )}
      </section>

      {nodeIds.length ? (
        <section className="mt-8 border-t border-line pt-6">
          <div className="micro mb-3">Related nodes</div>
          <div className="flex flex-wrap gap-1.5">
            {nodeIds.map((id) => {
              const n = nodeMeta(id);
              return n.href ? (
                <Link
                  key={id}
                  href={n.href}
                  className="border border-line px-2.5 py-1 text-[12.5px] hover:border-brand hover:text-brand"
                >
                  {n.name}
                </Link>
              ) : (
                <span key={id} className="border border-line px-2.5 py-1 text-[12.5px]">
                  {n.name}
                </span>
              );
            })}
          </div>
        </section>
      ) : null}

      {relIds.length ? (
        <section className="mt-8 border-t border-line pt-6">
          <div className="micro mb-3">Related dependency relationships</div>
          <div className="flex flex-wrap gap-1.5">
            {relIds.map((id) => (
              <span key={id} className="border border-line px-2.5 py-1 font-mono text-[11.5px] text-ink/60">
                {id}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <DataQualityPanel issues={dqIssues} title="Data quality notes for this source" />
    </div>
  );
}
