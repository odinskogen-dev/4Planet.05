import Link from "next/link";
import type { SpeciesProfile } from "@/types";
import { resolveFunctionChains } from "@/lib/registry";

type PathRow = {
  key: string;
  fnId: string;
  fnName: string;
  svId: string;
  svName: string;
  rcName: string;
};

function Cell({
  kind,
  name,
  href,
  muted = false,
}: {
  kind: string;
  name: string;
  href?: string;
  muted?: boolean;
}) {
  const body = (
    <div className="h-full border border-line bg-paper px-3 py-2 group-hover:border-brand">
      <div className={`micro mb-0.5 ${muted ? "text-ink/35" : ""}`}>{kind}</div>
      <div
        className={`text-[13.5px] font-medium leading-snug ${
          muted ? "text-ink/40" : ""
        } ${href ? "group-hover:text-brand" : ""}`}
      >
        {name}
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

function Arrow() {
  return (
    <div className="flex items-center justify-center text-brand">
      <span className="rotate-90 lg:rotate-0" aria-hidden>
        &rarr;
      </span>
    </div>
  );
}

export function RelationshipChain({ species }: { species: SpeciesProfile }) {
  const rows: PathRow[] = [];
  for (const chain of resolveFunctionChains(species)) {
    for (const sc of chain.services) {
      for (const r of sc.recipients) {
        rows.push({
          key: `${chain.function.id}-${sc.service.id}-${r.id}`,
          fnId: chain.function.id,
          fnName: chain.function.name,
          svId: sc.service.id,
          svName: sc.service.name,
          rcName: r.name,
        });
      }
    }
  }

  return (
    <div>
      <div className="mb-3 hidden grid-cols-[1fr_24px_1fr_24px_1fr_24px_1fr] gap-2 lg:grid">
        <span className="micro-ink">Species</span>
        <span />
        <span className="micro-ink">Function</span>
        <span />
        <span className="micro-ink">Service</span>
        <span />
        <span className="micro-ink">Recipient</span>
      </div>

      <div className="space-y-2">
        {rows.map((row, i) => {
          const prev = rows[i - 1];
          const sameFn = Boolean(prev && prev.fnId === row.fnId);
          return (
            <div
              key={row.key}
              className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_24px_1fr_24px_1fr_24px_1fr]"
            >
              <Cell kind="Species" name={species.commonName} muted={i !== 0} />
              <Arrow />
              <Cell kind="Function" name={row.fnName} href={`/functions/${row.fnId}`} muted={sameFn} />
              <Arrow />
              <Cell kind="Service" name={row.svName} href={`/services/${row.svId}`} />
              <Arrow />
              <Cell kind="Recipient" name={row.rcName} />
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-2xl text-[13px] leading-relaxed text-muted">
        Each row is one complete path through the graph: the{" "}
        {species.commonName.toLowerCase()} performs a function, which supports a
        service, which benefits a recipient. Functions and services are shared
        nodes &mdash; tap one to see every species and system connected to it.
      </p>
    </div>
  );
}
