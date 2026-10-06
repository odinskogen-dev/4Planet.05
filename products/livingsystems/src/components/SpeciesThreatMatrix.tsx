import type { SpeciesThreatLink } from "@/types";
import { getThreat, getDriver } from "@/lib/registry";
import { ScoreCells } from "./ui";

export function SpeciesThreatMatrix({
  threats,
}: {
  threats: SpeciesThreatLink[];
}) {
  const sorted = [...threats].sort((a, b) => b.severity - a.severity);
  return (
    <div className="border border-line">
      {/* header */}
      <div className="hidden grid-cols-[1.4fr_0.8fr_1fr_0.7fr] gap-4 border-b border-line bg-ink/[0.02] px-4 py-2.5 lg:grid">
        <span className="micro">Threat</span>
        <span className="micro">Category</span>
        <span className="micro">Driver</span>
        <span className="micro text-right">Severity</span>
      </div>

      {sorted.map((link) => {
        const threat = getThreat(link.threat);
        const driver = getDriver(threat.driver);
        return (
          <div
            key={threat.id}
            className="border-b border-line px-4 py-4 last:border-b-0"
          >
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1.4fr_0.8fr_1fr_0.7fr] lg:items-center lg:gap-4">
              <div>
                <div className="text-[14px] font-medium">{threat.name}</div>
                <div className="mt-0.5 text-[11.5px] text-muted lg:hidden">
                  {threat.category} · {driver.name}
                </div>
              </div>
              <div className="hidden text-[13px] lg:block">
                {threat.category}
              </div>
              <div className="hidden text-[13px] lg:block">
                {driver.name}
                <span className="block text-[11px] text-muted">
                  {driver.humanTranslation}
                </span>
              </div>
              <div className="lg:flex lg:justify-end">
                <ScoreCells value={link.severity} tone="ink" />
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-ink/70">
              {link.explanation}
            </p>
            {link.confidence ? (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="micro">Confidence</span>
                <span className="text-[11px] font-medium text-ink/60">
                  {link.confidence}
                </span>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
