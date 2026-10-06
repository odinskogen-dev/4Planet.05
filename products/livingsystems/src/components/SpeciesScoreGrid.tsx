import type { FourPlanetIntelligence } from "@/types";
import { ScoreCells } from "./ui";

const METRICS: { key: keyof FourPlanetIntelligence; label: string; note: string }[] =
  [
    {
      key: "ecologicalImportance",
      label: "Ecological Importance",
      note: "How much this species shapes its ecosystem.",
    },
    {
      key: "extinctionRisk",
      label: "Extinction Risk",
      note: "How close the species is to disappearing.",
    },
    {
      key: "culturalImportance",
      label: "Cultural Importance",
      note: "Its significance to people and cultures.",
    },
    {
      key: "publicRecognition",
      label: "Public Recognition",
      note: "How widely known the species is.",
    },
    {
      key: "dataAvailability",
      label: "Data Availability",
      note: "How much reliable data exists.",
    },
    {
      key: "missionRelevance",
      label: "Mission Relevance",
      note: "How relevant it is to 4PLANET missions.",
    },
  ];

export function SpeciesScoreGrid({
  scores,
}: {
  scores: FourPlanetIntelligence;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS.map((m, i) => (
        <div
          key={m.key}
          className={`border-line p-4 ${
            i % 3 !== 2 ? "lg:border-r" : ""
          } ${i < 3 ? "lg:border-b" : ""} border-b sm:[&:nth-last-child(-n+1)]:border-b-0`}
        >
          <div className="flex items-center justify-between">
            <span className="micro">{m.label}</span>
            <span className="text-[13px] font-semibold tabular-nums text-brand">
              {scores[m.key]}
              <span className="text-muted">/5</span>
            </span>
          </div>
          <div className="mt-2">
            <ScoreCells value={scores[m.key]} />
          </div>
          <p className="mt-2 text-[11.5px] leading-snug text-muted">{m.note}</p>
        </div>
      ))}
    </div>
  );
}
