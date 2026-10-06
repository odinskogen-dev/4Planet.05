import Link from "next/link";
import type { NodeIntel, IntelLink } from "@/lib/intelligence";
import { FailureCascade, ReverseDependency } from "@/components/FailureCascade";
import { NodeTrustSummary, NodeEvidence } from "@/components/EvidencePanel";
import { SolutionIntelligencePanel } from "@/components/SolutionIntelligence";

function LinkChip({ item }: { item: IntelLink }) {
  const inner = (
    <span className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1 text-[12.5px] transition-colors group-hover:border-brand">
      {item.name}
      {item.sub ? <span className="text-muted">{item.sub}</span> : null}
    </span>
  );
  return item.href ? (
    <Link href={item.href} className="group">
      {inner}
    </Link>
  ) : (
    <span className="inline-flex items-center gap-1.5 border border-dashed border-line px-2.5 py-1 text-[12.5px] text-ink/70">
      {item.name}
      {item.sub ? <span className="text-muted">{item.sub}</span> : null}
    </span>
  );
}

export function NodeIntelligence({
  intel,
  backHref,
  backLabel,
  children,
}: {
  intel: NodeIntel;
  backHref: string;
  backLabel: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="pb-16">
      <div className="flex items-center gap-2 py-5 text-[12px]">
        <Link href={backHref} className="text-muted hover:text-brand">
          {backLabel}
        </Link>
        <span className="text-line">/</span>
        <span className="text-ink">{intel.title}</span>
      </div>

      <header
        className={`pt-8 ${
          intel.flagship ? "border-t-2 border-brand" : "border-t-2 border-ink"
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="micro-brand">{intel.kind}</span>
          {intel.flagship ? (
            <span className="border border-brand px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-micro text-brand">
              Living System · Proof of Concept
            </span>
          ) : null}
          <span className="micro ml-auto font-mono text-ink/40">{intel.id}</span>
        </div>
        <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1] tracking-tight">
          {intel.title}
        </h1>
        {intel.subtitle ? (
          <p className="mt-2 text-[15px] text-muted">{intel.subtitle}</p>
        ) : null}
        {intel.humanTranslation ? (
          <div className="mt-6 max-w-2xl border-l-2 border-brand bg-brand/[0.035] px-4 py-3">
            <div className="micro-brand mb-1">Human Translation</div>
            <p className="text-[14px] leading-relaxed text-ink/80">
              {intel.humanTranslation}
            </p>
          </div>
        ) : null}
      </header>

      <NodeTrustSummary nodeId={intel.id} />

      {children ? <div className="mt-2">{children}</div> : null}

      {intel.showCascade ? (
        <>
          <ReverseDependency nodeId={intel.id} />
          <FailureCascade nodeId={intel.id} />
        </>
      ) : null}

      <NodeEvidence nodeId={intel.id} />

      <SolutionIntelligencePanel nodeId={intel.id} />

      <div className="mt-4">
        {intel.sections.map((section) => (
          <section
            key={section.label}
            className="grid grid-cols-1 gap-3 border-t border-line py-6 lg:grid-cols-[200px_1fr]"
          >
            <div className="micro pt-1">
              {section.label}
              <span className="ml-2 text-ink/30">{section.items.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {section.items.map((item) => (
                <LinkChip key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 max-w-2xl text-[12.5px] leading-relaxed text-muted">
        Every item above is a node in the graph. Linked items open their own
        intelligence view — follow the connections to explore how the system fits
        together.
      </p>
    </article>
  );
}
