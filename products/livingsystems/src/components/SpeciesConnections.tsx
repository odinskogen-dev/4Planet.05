import Link from "next/link";
import type { SpeciesProfile } from "@/types";
import {
  getThreat,
  getSolution,
  getEcosystem,
  getMission,
} from "@/lib/registry";
import { speciesList } from "@/data/species";

function ConnGroup({
  label,
  items,
}: {
  label: string;
  items: { id: string; name: string; sub?: string; href?: string }[];
}) {
  return (
    <div className="border-b border-line py-4 last:border-b-0">
      <div className="micro mb-3">{label}</div>
      {items.length === 0 ? (
        <span className="text-[13px] text-muted">—</span>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) =>
            it.href ? (
              <Link
                key={it.id}
                href={it.href}
                className="border border-line px-2.5 py-1 text-[12.5px] transition-colors hover:border-brand hover:text-brand"
              >
                {it.name}
                {it.sub ? <span className="ml-1.5 text-muted">{it.sub}</span> : null}
              </Link>
            ) : (
              <span key={it.id} className="border border-line px-2.5 py-1 text-[12.5px]">
                {it.name}
                {it.sub ? <span className="ml-1.5 text-muted">{it.sub}</span> : null}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

export function SpeciesConnections({ species }: { species: SpeciesProfile }) {
  const ecosystems = species.distribution.ecosystems.map((l) => {
    const e = getEcosystem(l.ecosystem);
    return { id: e.id, name: e.name, sub: l.dependency, href: `/ecosystems/${e.id}` };
  });
  const threats = species.threats.map((l) => {
    const t = getThreat(l.threat);
    return { id: t.id, name: t.name, href: `/threats/${t.id}` };
  });
  const solutions = species.solutions.map((l) => {
    const s = getSolution(l.solution);
    return { id: s.id, name: s.name, href: `/solutions/${s.id}` };
  });
  const missions = species.connections.missions.map((m) => {
    const mn = getMission(m);
    return { id: mn.id, name: mn.code, href: `/missions/${mn.id}` };
  });
  const related = species.connections.species
    .map((id) => speciesList.find((s) => s.id === id))
    .filter((s): s is SpeciesProfile => Boolean(s))
    .map((s) => ({ id: s.id, name: s.commonName, href: `/species/${s.slug}` }));

  return (
    <div className="border border-line px-4">
      <ConnGroup label="Ecosystems" items={ecosystems} />
      <ConnGroup label="Threats" items={threats} />
      <ConnGroup label="Solutions" items={solutions} />
      <ConnGroup label="Missions" items={missions} />
      <ConnGroup label="Related Species" items={related} />
    </div>
  );
}
