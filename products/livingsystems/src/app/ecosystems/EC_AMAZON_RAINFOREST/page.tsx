import Link from "next/link";
import { ECOSYSTEMS, THREATS, SOLUTIONS } from "@/data/nodes";
import {
  nodeMeta,
  ecosystemPathways,
  humanSystemsDownstream,
  type GraphNode,
} from "@/lib/graph";
import { NodeTrustSummary, NodeEvidence } from "@/components/EvidencePanel";
import { ReverseDependency, FailureCascade } from "@/components/FailureCascade";
import { SolutionIntelligencePanel } from "@/components/SolutionIntelligence";
import { DecisionJourneyCard } from "@/components/HumanUse";
import { GUIDED_JOURNEYS } from "@/data/humanUse";
import { LearningIntelligencePanel } from "@/components/LearningIntelligence";
import { getLearningRecordsForEcosystem, CONFIDENCE_UPDATES } from "@/lib/learning";
import { DataQualityPanel } from "@/components/DataQuality";
import { getDataQualityIssuesForTarget } from "@/lib/dataQuality";

const ID = "EC_AMAZON_RAINFOREST";

export const metadata = {
  title: "Amazon Rainforest — LIVING SYSTEMS INTELLIGENCE",
};

function Chip({ node }: { node: GraphNode }) {
  const inner = (
    <span className="inline-flex flex-col border border-line bg-paper px-2.5 py-1.5 group-hover:border-brand">
      <span className="micro text-[9.5px] leading-none">{node.kind}</span>
      <span className="mt-0.5 text-[12.5px] font-medium leading-snug group-hover:text-brand">
        {node.name}
      </span>
    </span>
  );
  return node.href ? (
    <Link href={node.href} className="group">
      {inner}
    </Link>
  ) : (
    <span className="group">{inner}</span>
  );
}

function PathwayRows({ chains }: { chains: GraphNode[][] }) {
  return (
    <div className="space-y-2">
      {chains.map((chain, i) => (
        <div key={i} className="flex flex-wrap items-stretch gap-1.5 border border-line p-2">
          {chain.map((step, j) => (
            <div key={j} className="flex items-stretch gap-1.5">
              <Chip node={step} />
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
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <div className="micro-brand mb-4 mt-12 border-t border-line pt-6">{children}</div>;
}

export default function AmazonPage() {
  const eco = ECOSYSTEMS[ID as keyof typeof ECOSYSTEMS];
  const pathways = ecosystemPathways(ID);
  const humanSystems = humanSystemsDownstream(ID);
  const threats = (eco.threats ?? []).map((t) => nodeMeta(t as string));
  const solutions = eco.solutions ?? [];

  const explore = [
    "SV_RAINFALL_REGULATION",
    "SV_CARBON_STORAGE",
    "SV_BIODIVERSITY_HABITAT",
    "HS_WATER",
    "HS_FOOD",
    "SO_INDIGENOUS_STEWARDSHIP",
    "TH_DEFORESTATION",
    "SO_FOREST_RESTORATION",
  ].map((id) => nodeMeta(id));

  return (
    <div className="mx-auto max-w-page px-6 py-10">
      <Link href="/ecosystems" className="micro hover:text-brand">
        ← Ecosystems
      </Link>

      {/* 1 — Identity */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="micro-brand">Flagship Living System Case</span>
        <span className="micro">Living System · Proof of Concept</span>
      </div>
      <h1 className="mt-3 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight">
        Amazon Rainforest
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink/85">
        {eco.shortDefinition}
      </p>

      <NodeTrustSummary nodeId={ID} />

      {/* How to read this case — human journey */}
      <H>How to read this case</H>
      <div className="max-w-2xl">
        <DecisionJourneyCard journey={GUIDED_JOURNEYS.AMAZON} />
      </div>

      {/* 2 — Why it matters */}
      <H>Why it matters</H>
      <p className="max-w-2xl text-[16px] leading-relaxed text-ink/85">
        The Amazon is not only a forest. It is a living system that helps regulate
        rainfall, store carbon, cycle water and hold biodiversity — and through
        those functions it is connected to agriculture, water, climate stability
        and the people who depend on them. {eco.systemRole}
      </p>

      {/* 3 — Core system pathways */}
      <H>Core system pathways</H>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">
        What the Amazon provides, and what each service supports downstream. Every
        step is a node in the graph.
      </p>
      <PathwayRows chains={pathways} />

      {/* 4 — Human systems connected */}
      <H>Human systems connected</H>
      <div className="flex flex-wrap gap-1.5">
        {humanSystems.map((n) => (
          <Chip key={n.id} node={n} />
        ))}
      </div>

      {/* 5/6 — Reverse dependencies */}
      <div className="mt-2">
        <ReverseDependency nodeId={ID} />
      </div>

      {/* 7 — Failure cascades (themed) */}
      <H>Failure cascades</H>
      <FailureCascade
        nodeId="SV_RAINFALL_REGULATION"
        title="Cascade · Rainfall & agriculture"
        intro="If rainfall regulation weakens, regional agriculture and the food and water systems that rely on it come under pressure."
      />
      <FailureCascade
        nodeId="SV_CARBON_STORAGE"
        title="Cascade · Carbon & climate"
        intro="If carbon storage weakens, climate regulation and the human systems that depend on a stable climate are affected."
      />
      <FailureCascade
        nodeId="SV_BIODIVERSITY_HABITAT"
        title="Cascade · Biodiversity & resilience"
        intro="If habitat is lost, the species, functions and resilience the living system rests on decline."
      />

      {/* 8 — Threats */}
      <H>Threats</H>
      <div className="flex flex-wrap gap-1.5">
        {threats.map((n) => (
          <Chip key={n.id} node={n} />
        ))}
      </div>

      {/* 9 — Solution map */}
      <H>Solution map</H>
      <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-muted">
        Each solution and the threats it helps address. Solutions strengthen the
        forest protection, habitat and services the system depends on.
      </p>
      <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
        {solutions.map((sid) => {
          const sol = SOLUTIONS[sid as keyof typeof SOLUTIONS];
          if (!sol) return null;
          return (
            <div key={sid as string} className="bg-paper p-4">
              <Link
                href={`/solutions/${sid}`}
                className="text-[14px] font-medium hover:text-brand"
              >
                {sol.name}
              </Link>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sol.addressesThreats.map((t) => (
                  <Link
                    key={t as string}
                    href={`/threats/${t}`}
                    className="border border-line px-2 py-0.5 text-[11.5px] text-muted hover:border-brand hover:text-brand"
                  >
                    {THREATS[t as keyof typeof THREATS]?.name ?? (t as string)}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 10 — Evidence / trust */}
      <SolutionIntelligencePanel nodeId={ID} />
      <LearningIntelligencePanel
        records={getLearningRecordsForEcosystem(ID)}
        confidenceUpdates={CONFIDENCE_UPDATES}
      />
      <NodeEvidence nodeId={ID} />
      <DataQualityPanel issues={getDataQualityIssuesForTarget("Node", ID)} />

      {/* 11 — Explore related nodes */}
      <H>Explore related nodes</H>
      <div className="flex flex-wrap gap-1.5">
        {explore.map((n) => (
          <Chip key={n.id} node={n} />
        ))}
      </div>
    </div>
  );
}
