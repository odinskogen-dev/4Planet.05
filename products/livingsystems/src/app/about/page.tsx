import Link from "next/link";
import { HowItWorks, WhyThisMatters } from "@/components/Explain";

export const metadata = { title: "About — LIVING SYSTEMS INTELLIGENCE" };

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="micro-brand mb-3">{title}</h2>
      <div className="max-w-2xl space-y-3 text-[15px] leading-relaxed text-ink/85">
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="micro-brand mb-2">4PLANET</div>
      <h1 className="text-[clamp(2rem,4.5vw,3.2rem)] font-semibold leading-tight tracking-tight">
        About Living Systems Intelligence
      </h1>
      <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink/85">
        Living Systems Intelligence is a 4PLANET system for mapping how life,
        ecosystems, human systems, threats and solutions are connected. It does
        not only describe nature — it shows relationships: what depends on what,
        what is threatened, what helps, and where better decisions may create
        positive effect.
      </p>

      <div className="mt-12 space-y-10">
        <Block title="What it is">
          <p>
            An intelligence layer for living systems. Every species, ecosystem,
            ecological function, service, human system, threat, solution, claim
            and source is a node in one connected graph.
          </p>
        </Block>

        <Block title="Why relationships matter">
          <p>
            Nature is not background. A forest is connected to rainfall, to
            agriculture, to water and to the people who depend on them. When you
            can see those relationships, you can see what is at stake — and where
            action might help.
          </p>
        </Block>

        <div>
          <HowItWorks />
        </div>

        <Block title="What makes it different">
          <p>
            It reads the graph in both directions — what each thing supports, and
            what depends on it — and it is honest about evidence. Claims connect to
            sources, confidence and review status, and the system shows the data
            gaps that remain.
          </p>
        </Block>

        <Block title="First proof cases">
          <p>
            Two live examples show the system working at different scales:{" "}
            <Link href="/species/western-honey-bee" className="text-brand hover:underline">
              Honey Bee → Pollination → Food System
            </Link>{" "}
            at the species scale, and{" "}
            <Link href="/ecosystems/EC_AMAZON_RAINFOREST" className="text-brand hover:underline">
              Amazon Rainforest → Rainfall Regulation → Human Systems
            </Link>{" "}
            at the ecosystem scale.
          </p>
        </Block>

        <Block title="Solution + Decision Intelligence">
          <p>
            The system first maps relationships. Then it connects threats to
            solutions, and solutions to the services and human systems they may
            strengthen. Decision Intelligence does not produce automatic answers —
            it structures evidence, confidence, urgency, leverage and uncertainty
            so better decisions can become possible. See{" "}
            <Link href="/decisions" className="text-brand hover:underline">
              Decisions
            </Link>
            .
          </p>
        </Block>

        <Block title="Learning Intelligence">
          <p>
            The system is designed to become adaptive. Decisions create
            expectations. Outcomes create evidence. Evidence creates learning.
            Learning updates confidence and improves future decisions. This is
            how Living Systems Intelligence can evolve from a static knowledge
            graph into a learning intelligence system. This is currently a
            foundation layer with structured learning examples — not a live
            global impact reporting system. See{" "}
            <Link href="/learning" className="text-brand hover:underline">
              Learning
            </Link>
            .
          </p>
        </Block>

        <Block title="Sources &amp; data quality">
          <p>
            The system is designed to show what it knows, what supports it, and
            what remains uncertain. Sources carry verification status and an
            evidence tier; claims carry confidence and review status; and a
            visible data quality register records known gaps, weak sources and
            context-dependencies rather than hiding them. See{" "}
            <Link href="/trust" className="text-brand hover:underline">
              Trust
            </Link>
            .
          </p>
        </Block>

        <Block title="What this is not">
          <p>
            It is not an animal encyclopedia, a donation platform, an NGO campaign
            site, a marketplace, or a generic sustainability dashboard. It is an
            intelligence layer for understanding living systems.
          </p>
        </Block>

        <Block title="Future direction">
          <p>
            This is a public proof prototype — an early, honest demonstration of a
            future planetary intelligence layer. The 4PLANET BRAIN is the internal
            architecture behind it; Living Systems Intelligence is the public
            product. Coverage will deepen over time, always alongside its sources.
          </p>
        </Block>

        <div className="border-t-2 border-brand pt-8">
          <WhyThisMatters />
        </div>
      </div>
    </div>
  );
}
