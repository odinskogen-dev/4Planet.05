import Link from "next/link";
import { buildPathways } from "@/lib/intelligence";

function Step({ label, kind, href }: { label: string; kind: string; href?: string }) {
  const body = (
    <div className="border border-line bg-paper px-2.5 py-1.5 group-hover:border-brand">
      <div className="micro mb-0.5 text-[9.5px]">{kind}</div>
      <div className="text-[12.5px] font-medium leading-snug group-hover:text-brand">
        {label}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="group block">
      {body}
    </Link>
  ) : (
    <div className="group block">{body}</div>
  );
}

export function DependencyPathway({ systemId }: { systemId: string }) {
  const chains = buildPathways(systemId);
  if (chains.length === 0) return null;
  return (
    <section className="border-t border-line py-8">
      <div className="mb-1 flex items-baseline gap-3">
        <span className="micro-brand">Dependency Pathways</span>
      </div>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">
        Each row is one complete dependency chain — following what this system
        rests on, down through the living systems and out to the threats and
        solutions that decide whether it holds.
      </p>
      <div className="space-y-2">
        {chains.map((chain, i) => (
          <div
            key={i}
            className="flex flex-wrap items-stretch gap-1.5 border border-line p-2"
          >
            {chain.map((step, j) => (
              <div key={j} className="flex items-stretch gap-1.5">
                <Step label={step.label} kind={step.kind} href={step.href} />
                {j < chain.length - 1 ? (
                  <span className="flex items-center text-brand" aria-hidden>
                    &rarr;
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
