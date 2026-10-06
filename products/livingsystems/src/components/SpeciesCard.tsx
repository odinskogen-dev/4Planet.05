import Link from "next/link";
import type { SpeciesProfile } from "@/types";
import { primaryEcosystem } from "@/lib/registry";
import { StatusBadge, ScoreCells } from "./ui";

export function SpeciesCard({ species }: { species: SpeciesProfile }) {
  const eco = primaryEcosystem(species);
  return (
    <Link
      href={`/species/${species.slug}`}
      className="group flex flex-col border border-line p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-start justify-between">
        <span className="micro tabular-nums">{species.referenceCode}</span>
        <StatusBadge status={species.conservation.iucnStatus} withLabel={false} />
      </div>

      <div className="mt-6">
        <h3 className="text-[20px] font-semibold leading-tight tracking-tight group-hover:text-brand">
          {species.commonName}
        </h3>
        <p className="mt-0.5 text-[13px] italic text-muted">
          {species.scientificName}
        </p>
      </div>

      <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-ink/70">
        {species.summary}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <div className="micro mb-1">Ecological Role</div>
          <div className="text-[12.5px]">{species.roleLabel}</div>
        </div>
        <div>
          <div className="micro mb-1">Main Ecosystem</div>
          <div className="text-[12.5px]">{eco?.name ?? "—"}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="micro">Mission Relevance</span>
        <ScoreCells value={species.fourPlanetIntelligence.missionRelevance} />
      </div>
    </Link>
  );
}

export function PlaceholderCard({
  referenceCode,
  commonName,
  scientificName,
  summary,
  status,
}: {
  referenceCode: string;
  commonName: string;
  scientificName: string;
  summary: string;
  status: "partial" | "coming-soon";
}) {
  return (
    <div className="flex flex-col border border-dashed border-line p-5">
      <div className="flex items-start justify-between">
        <span className="micro tabular-nums">{referenceCode}</span>
        <span className="micro">
          {status === "partial" ? "In progress" : "Coming soon"}
        </span>
      </div>
      <div className="mt-6">
        <h3 className="text-[20px] font-semibold leading-tight tracking-tight text-ink/45">
          {commonName}
        </h3>
        <p className="mt-0.5 text-[13px] italic text-muted/70">
          {scientificName}
        </p>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink/40">{summary}</p>
      <div className="mt-auto pt-5">
        <span className="micro text-ink/30">Profile not yet active</span>
      </div>
    </div>
  );
}
