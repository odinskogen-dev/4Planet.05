"use client";

import { useMemo, useState } from "react";
import { speciesList, placeholders } from "@/data/species";
import { ECOSYSTEMS } from "@/data/nodes";
import { primaryEcosystem } from "@/lib/registry";
import { SpeciesCard, PlaceholderCard } from "@/components/SpeciesCard";
import type { ConservationStatus } from "@/types";

const STATUSES: ConservationStatus[] = [
  "Least Concern",
  "Near Threatened",
  "Vulnerable",
  "Endangered",
  "Critically Endangered",
  "Data Deficient",
];

export default function SpeciesIndexPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [ecosystem, setEcosystem] = useState<string>("");
  const [minRelevance, setMinRelevance] = useState<string>("");

  const filtered = useMemo(() => {
    return speciesList.filter((s) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        s.commonName.toLowerCase().includes(q) ||
        s.scientificName.toLowerCase().includes(q);
      const matchesStatus = !status || s.conservation.iucnStatus === status;
      const matchesEco =
        !ecosystem ||
        s.distribution.ecosystems.some((l) => l.ecosystem === ecosystem);
      const matchesRel =
        !minRelevance ||
        s.fourPlanetIntelligence.missionRelevance >= Number(minRelevance);
      return matchesQuery && matchesStatus && matchesEco && matchesRel;
    });
  }, [query, status, ecosystem, minRelevance]);

  return (
    <div className="pb-10 pt-16">
      <div className="micro-brand mb-4">Node Type · Species</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold tracking-tight">
        Species
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
        Browse species as intelligence dossiers. Each profile maps the species
        to the ecological functions, services and recipients it is linked to.
      </p>

      {/* Controls */}
      <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-4">
        <div className="bg-paper p-3">
          <label className="micro mb-1.5 block">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or scientific name"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted/60"
          />
        </div>
        <div className="bg-paper p-3">
          <label className="micro mb-1.5 block">IUCN Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-paper p-3">
          <label className="micro mb-1.5 block">Ecosystem</label>
          <select
            value={ecosystem}
            onChange={(e) => setEcosystem(e.target.value)}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            <option value="">All</option>
            {Object.values(ECOSYSTEMS).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div className="bg-paper p-3">
          <label className="micro mb-1.5 block">Mission Relevance ≥</label>
          <select
            value={minRelevance}
            onChange={(e) => setMinRelevance(e.target.value)}
            className="w-full bg-transparent text-[14px] outline-none"
          >
            <option value="">Any</option>
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="micro">
          {filtered.length} active · {placeholders.length} pending
        </span>
      </div>

      {/* Active species */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <SpeciesCard key={s.id} species={s} />
        ))}
        {placeholders.map((p) => (
          <PlaceholderCard
            key={p.id}
            referenceCode={p.referenceCode}
            commonName={p.commonName}
            scientificName={p.scientificName}
            summary={p.summary}
            status={p.status as "partial" | "coming-soon"}
          />
        ))}
      </div>
    </div>
  );
}
