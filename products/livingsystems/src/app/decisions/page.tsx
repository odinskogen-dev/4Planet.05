import { DECISION_SIGNALS } from "@/lib/solutions";
import { getLearningRecordsForDecision } from "@/lib/learning";
import { DecisionSignalCard } from "@/components/SolutionIntelligence";
import { LearningRecordCard } from "@/components/LearningIntelligence";
import { DecisionJourneyCard, PracticalInterpretation } from "@/components/HumanUse";
import { GUIDED_JOURNEYS } from "@/data/humanUse";

export const metadata = { title: "Decisions — LIVING SYSTEMS INTELLIGENCE" };

function SignalWithLearning({ id }: { id: string }) {
  const signal = DECISION_SIGNALS.find((d) => d.id === id)!;
  const learning = getLearningRecordsForDecision(id);
  return (
    <div>
      <DecisionSignalCard signal={signal} />
      <div className="mt-1 border-l-2 border-line pl-3">
        <div className="micro mb-2 mt-2">Learning linked to this decision</div>
        {learning.length ? (
          <div className="space-y-2">
            {learning.map((l) => (
              <LearningRecordCard key={l.id} record={l} />
            ))}
          </div>
        ) : (
          <p className="text-[12.5px] text-muted">No learning records yet.</p>
        )}
      </div>
    </div>
  );
}

export default function DecisionsPage() {
  const amazon = DECISION_SIGNALS.filter((d) =>
    (d.ecosystemIds ?? []).includes("EC_AMAZON_RAINFOREST")
  );
  const pollination = DECISION_SIGNALS.filter(
    (d) => !(d.ecosystemIds ?? []).includes("EC_AMAZON_RAINFOREST")
  );

  return (
    <div className="mx-auto max-w-page px-6 py-12">
      <div className="micro-brand mb-2">Decision intelligence</div>
      <h1 className="text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight tracking-tight">
        Decisions
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
        Decision Intelligence is structured reasoning, not automated advice. Each
        signal connects a solution to the threats it addresses and the services
        and human systems it may strengthen — with explicit leverage, urgency,
        confidence, difficulty and the gaps that remain. It is meant to inform
        judgement, not replace it.
      </p>

      <div className="mt-6 max-w-2xl border border-line p-4">
        <div className="micro mb-2">A useful decision signal connects</div>
        <p className="text-[13.5px] leading-relaxed text-ink/85">
          what is at risk · what solution may help · what service may be
          strengthened · what human system may benefit · what evidence supports
          it · what uncertainty remains · what has been learned.
        </p>
      </div>

      <section className="mt-12">
        <div className="micro-brand mb-4">Guided decision pathways</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DecisionJourneyCard journey={GUIDED_JOURNEYS.AMAZON} />
          <DecisionJourneyCard journey={GUIDED_JOURNEYS.POLLINATION} />
        </div>
      </section>

      <section className="mt-12">
        <div className="micro-brand mb-4">Amazon — flagship living system</div>
        <div className="space-y-6">
          {amazon.map((d) => (
            <SignalWithLearning key={d.id} id={d.id} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="micro-brand mb-4">Pollination &amp; the food system</div>
        <div className="space-y-6">
          {pollination.map((d) => (
            <SignalWithLearning key={d.id} id={d.id} />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-line pt-6">
        <PracticalInterpretation text="A signal should not be read as an automatic recommendation. It shows what should be considered: leverage, urgency, evidence, uncertainty and implementation difficulty — so a human can reason better, not be told what to do." />
      </section>
    </div>
  );
}
