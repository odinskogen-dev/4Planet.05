import Link from "next/link";
import { HUMAN_USE_QUESTIONS, GUIDED_JOURNEYS, ROLE_USE_CASES } from "@/data/humanUse";
import {
  StartHerePanel,
  DecisionJourneyCard,
  RoleUseCard,
  PracticalInterpretation,
} from "@/components/HumanUse";

export const metadata = { title: "Start Here — LIVING SYSTEMS INTELLIGENCE" };

export default function StartPage() {
  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="micro-brand mb-2">Start here</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
        What do you want to understand?
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        Living Systems Intelligence connects living systems, human systems,
        threats, solutions, evidence, decisions and learning. Start with a
        question — each one opens a real pathway through the system. No account,
        nothing personalised; just a clearer way in.
      </p>

      <section className="mt-10">
        <StartHerePanel questions={HUMAN_USE_QUESTIONS} />
      </section>

      <section className="mt-14">
        <div className="micro-brand mb-4">Two guided pathways</div>
        <p className="mb-5 max-w-2xl text-[13.5px] leading-relaxed text-muted">
          Each follows one living system from what it does to what a decision
          would need to consider — structured reasoning, not an automated engine.
        </p>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DecisionJourneyCard journey={GUIDED_JOURNEYS.AMAZON} />
          <DecisionJourneyCard journey={GUIDED_JOURNEYS.POLLINATION} />
        </div>
      </section>

      <section className="mt-14">
        <div className="micro-brand mb-4">Who is this for?</div>
        <RoleUseCard roles={ROLE_USE_CASES} />
      </section>

      <section className="mt-14 border-t border-line pt-6">
        <PracticalInterpretation
          text="You do not need to read everything. Pick one question, follow one pathway, and let the connections — not a dashboard — show you why a living system matters."
        />
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/ecosystems/EC_AMAZON_RAINFOREST" className="micro-ink hover:text-brand">Amazon case →</Link>
          <Link href="/species/western-honey-bee" className="micro-ink hover:text-brand">Honey bee →</Link>
          <Link href="/about" className="micro-ink hover:text-brand">About →</Link>
        </div>
      </section>
    </div>
  );
}
