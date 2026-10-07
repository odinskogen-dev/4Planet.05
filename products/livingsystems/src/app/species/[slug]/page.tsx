import { notFound } from "next/navigation";
import Link from "next/link";
import { speciesList, getSpeciesBySlug } from "@/data/species";
import { Section, DataRow, HumanNote, StatusBadge } from "@/components/ui";
import { RelationshipChain } from "@/components/RelationshipChain";
import { FailureCascade } from "@/components/FailureCascade";
import { SpeciesScoreGrid } from "@/components/SpeciesScoreGrid";
import { SpeciesThreatMatrix } from "@/components/SpeciesThreatMatrix";
import { SpeciesSolutionMatrix } from "@/components/SpeciesSolutionMatrix";
import { SpeciesConnections } from "@/components/SpeciesConnections";
import { SpeciesSignals } from "@/components/SpeciesSignals";
import { NodeTrustSummary, NodeEvidence } from "@/components/EvidencePanel";
import { SolutionIntelligencePanel } from "@/components/SolutionIntelligence";
import { LearningIntelligencePanel } from "@/components/LearningIntelligence";
import { getLearningRecordsForSpecies } from "@/lib/learning";
import { DecisionJourneyCard } from "@/components/HumanUse";
import { GUIDED_JOURNEYS } from "@/data/humanUse";
import { getSource } from "@/lib/registry";

export function generateStaticParams() {
  return speciesList.map((s) => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const s = getSpeciesBySlug(params.slug);
  if (!s) return {};
  return {
    title: `${s.commonName} (${s.scientificName}) — Living Systems Intelligence`,
    description: s.summary,
  };
}

export default function SpeciesProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const s = getSpeciesBySlug(params.slug);
  if (!s) notFound();

  return (
    <article className="pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 py-5 text-[12px]">
        <Link href="/species" className="text-muted hover:text-brand">
          Species
        </Link>
        <span className="text-line">/</span>
        <span className="text-ink">{s.commonName}</span>
      </div>

      {/* Hero */}
      <header className="border-t-2 border-ink pt-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="micro tabular-nums">{s.referenceCode}</span>
          <StatusBadge status={s.conservation.iucnStatus} />
          <span className="micro ml-auto">Updated {s.lastUpdated}</span>
        </div>
        <h1 className="mt-6 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1] tracking-tight">
          {s.commonName}
        </h1>
        <p className="mt-2 text-[18px] italic text-muted">{s.scientificName}</p>
        {s.alternativeNames.length > 0 ? (
          <p className="mt-1 text-[13px] text-muted">
            Also known as {s.alternativeNames.join(", ")}
          </p>
        ) : null}

        <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-ink/85">
          {s.summary}
        </p>

        <div className="mt-7 flex flex-wrap gap-2">
          {s.highlights.map((h) => (
            <span
              key={h}
              className="border border-line px-2.5 py-1 text-[12px] text-ink/70"
            >
              {h}
            </span>
          ))}
        </div>
      </header>

      {s.whyItMatters ? (
        <div className="mt-8 border-t-2 border-brand pt-5">
          <div className="micro-brand mb-2">Why this matters</div>
          <p className="max-w-2xl text-[17px] leading-relaxed text-ink/85">
            {s.whyItMatters}
          </p>
        </div>
      ) : null}

      {s.slug === "orca" ? (
        <section className="mt-8 border-y border-line py-6" aria-label="Orca Living Planet journey">
          <div className="micro-brand">ONE ORCA · SHARED INTELLIGENCE</div>
          <h2 className="mt-2 max-w-3xl text-[clamp(1.5rem,3vw,2.4rem)] font-semibold leading-tight tracking-tight">
            Move from the animal to relationships, place, actors and action without changing the underlying identity.
          </h2>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">
            Canonical entity <span className="font-mono">taxon:gbif:2440483</span>. Each surface answers a different question; none turns an occurrence point, candidate solution or participation path into an ecological outcome claim.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            <a href="/species/orca" className="bg-paper p-4 transition-colors hover:text-brand"><span className="micro">01 · SPECIES</span><strong className="mt-2 block text-[13px]">What is an Orca?</strong></a>
            <div className="bg-ink p-4 text-paper"><span className="micro opacity-60">02 · LIVING SYSTEMS</span><strong className="mt-2 block text-[13px]">How does it connect?</strong></div>
            <a href="/atlas/whales" className="bg-paper p-4 transition-colors hover:text-brand"><span className="micro">03 · ATLAS</span><strong className="mt-2 block text-[13px]">Where are records?</strong></a>
            <a href="/actors/orca" className="bg-paper p-4 transition-colors hover:text-brand"><span className="micro">04 · ACTOR</span><strong className="mt-2 block text-[13px]">Who can act?</strong></a>
            <a href="/impact/actions/bay-of-biscay-survey" className="bg-paper p-4 transition-colors hover:text-brand"><span className="micro">05 · IMPACT</span><strong className="mt-2 block text-[13px]">What can be proved?</strong></a>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Current action path is a bounded monitoring/proof case. It is not presented as a universal Orca-conservation solution.
          </p>
        </section>
      ) : null}

      <NodeTrustSummary nodeId={s.id} />

      {/* RELATIONSHIP CHAIN — the dominant narrative, surfaced first */}
      <Section
        index="01"
        title="How this species supports living systems"
        hint="Functions → Services → Recipients"
      >
        <RelationshipChain species={s} />
        <FailureCascade nodeId={s.id} />
      </Section>

      {/* Identity */}
      <Section index="02" title="Identity">
        <div className="max-w-2xl">
          <DataRow label="Class">{s.identity.className}</DataRow>
          <DataRow label="Order">{s.identity.order}</DataRow>
          <DataRow label="Family">{s.identity.family}</DataRow>
          <DataRow label="Genus">
            <span className="italic">{s.identity.genus}</span>
          </DataRow>
          <DataRow label="Species">
            <span className="italic">{s.identity.species}</span>
          </DataRow>
        </div>
        <HumanNote>{s.identity.humanTranslation}</HumanNote>
      </Section>

      {/* Conservation */}
      <Section index="03" title="Conservation">
        <div className="max-w-2xl">
          <DataRow label="IUCN Status">
            <StatusBadge status={s.conservation.iucnStatus} />
          </DataRow>
          <DataRow label="Population Trend">
            {s.conservation.populationTrend}
          </DataRow>
          <DataRow label="Wild Population">
            {s.conservation.estimatedWildPopulation}
          </DataRow>
          <DataRow label="Main Issue">
            {s.conservation.mainConservationIssue}
          </DataRow>
          {s.conservation.citesStatus ? (
            <DataRow label="CITES">{s.conservation.citesStatus}</DataRow>
          ) : null}
        </div>
        <HumanNote>{s.conservation.humanTranslation}</HumanNote>
      </Section>

      {/* Distribution */}
      <Section index="04" title="Distribution">
        <div className="max-w-2xl">
          <DataRow label="Native Range">
            {s.distribution.nativeRange}
          </DataRow>
          <DataRow label="Current Range">
            {s.distribution.currentRange}
          </DataRow>
        </div>
        <HumanNote>{s.distribution.humanTranslation}</HumanNote>
      </Section>

      {/* Biology */}
      <Section index="05" title="Biology">
        <div className="max-w-2xl">
          <DataRow label="Length">{s.biology.length}</DataRow>
          <DataRow label="Weight">{s.biology.weight}</DataRow>
          <DataRow label="Lifespan">{s.biology.lifespan}</DataRow>
          <DataRow label="Diet">{s.biology.diet}</DataRow>
          <DataRow label="Key Food">
            {s.biology.keyFoodSources.join(", ")}
          </DataRow>
          <DataRow label="Reproduction">{s.biology.reproduction}</DataRow>
          <DataRow label="Behaviour">
            <ul className="space-y-1">
              {s.biology.behaviour.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </DataRow>
        </div>
        <HumanNote>{s.biology.humanTranslation}</HumanNote>
      </Section>

      {/* Ecological Intelligence */}
      <Section index="06" title="Ecological Intelligence">
        <div className="max-w-2xl">
          <DataRow label="Ecological Role">
            {s.ecologicalIntelligence.ecologicalRole}
          </DataRow>
          <DataRow label="Keystone">
            {s.ecologicalIntelligence.keystoneSpecies}
          </DataRow>
          <DataRow label="Trophic Level">
            {s.ecologicalIntelligence.trophicLevel}
          </DataRow>
        </div>
        <HumanNote>{s.ecologicalIntelligence.humanTranslation}</HumanNote>
      </Section>

      {/* Threats & Solutions */}
      <Section
        index="07"
        title="Threats & Solutions"
        hint="Threat → Category → Driver"
      >
        <div className="mb-3 micro">Threats</div>
        <SpeciesThreatMatrix threats={s.threats} />
        <div className="mb-3 mt-8 micro">Solutions</div>
        <SpeciesSolutionMatrix solutions={s.solutions} />
      </Section>

      {/* Importance Assessment (fourPlanetIntelligence) */}
      <Section index="08" title="Importance Assessment">
        <SpeciesScoreGrid scores={s.fourPlanetIntelligence} />
        <SpeciesSignals signals={s.signals} knowledge={s.knowledge} />
        <NodeEvidence nodeId={s.id} />
        {s.slug === "western-honey-bee" ? (
          <>
            <SolutionIntelligencePanel nodeId="FN_POLLINATION" />
            <div className="border-t border-line py-8">
              <div className="micro-brand mb-4">How to read this case</div>
              <div className="max-w-2xl">
                <DecisionJourneyCard journey={GUIDED_JOURNEYS.POLLINATION} />
              </div>
            </div>
            <LearningIntelligencePanel records={getLearningRecordsForSpecies(s.id)} />
          </>
        ) : null}
      </Section>

      {/* Connections */}
      <Section
        index="09"
        title="Connections"
        hint="First layer of the knowledge graph"
      >
        <SpeciesConnections species={s} />
      </Section>

      {/* Sources */}
      <Section index="10" title="Sources">
        <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-muted">
          Source keys reference the bodies this profile draws on. Full citations
          will connect to a dedicated source database in a later version. No
          citations are fabricated.
        </p>
        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
          {s.sourceIds.map((k) => {
            const src = getSource(k);
            return (
              <div key={k} className="bg-paper p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13.5px] font-medium">
                    {src ? src.title : k}
                  </span>
                  {src ? (
                    <span className="micro whitespace-nowrap">
                      Trust · {src.trustLevel}
                    </span>
                  ) : null}
                </div>
                {src ? (
                  <p className="mt-1 text-[12px] text-muted">{src.organization}</p>
                ) : null}
                <div className="mt-2 font-mono text-[10.5px] text-ink/40">{k}</div>
              </div>
            );
          })}
        </div>
      </Section>
    </article>
  );
}
