import type { SpeciesSolutionLink } from "@/types";
import { getSolution } from "@/lib/registry";
import { ScoreCells } from "./ui";

export function SpeciesSolutionMatrix({
  solutions,
}: {
  solutions: SpeciesSolutionLink[];
}) {
  const sorted = [...solutions].sort((a, b) => b.importance - a.importance);
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2">
      {sorted.map((link) => {
        const sol = getSolution(link.solution);
        return (
          <div key={sol.id} className="bg-paper p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-[14px] font-medium">{sol.name}</div>
              <ScoreCells value={link.importance} />
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-muted">
              {sol.humanTranslation}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-ink/70">
              {link.explanation}
            </p>
          </div>
        );
      })}
    </div>
  );
}
