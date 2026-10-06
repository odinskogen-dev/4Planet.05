import Link from "next/link";
import type {
  HumanUseQuestion,
  GuidedJourney,
  RoleUseCase,
} from "@/data/humanUse";

/** "So what does this mean?" — translates intelligence into understanding. */
export function PracticalInterpretation({
  text,
  title = "Practical interpretation",
}: {
  text: string;
  title?: string;
}) {
  return (
    <div className="border-l-2 border-brand pl-4 py-1">
      <div className="micro-brand mb-1">{title}</div>
      <p className="max-w-2xl text-[14px] leading-relaxed text-ink/85">{text}</p>
    </div>
  );
}

export function HumanUseQuestionCard({ q }: { q: HumanUseQuestion }) {
  return (
    <Link
      href={q.bestExampleRoute}
      className="group block border border-line p-5 transition-colors hover:border-brand"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-medium leading-snug">{q.label}</h3>
        <span className="text-brand opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>→</span>
      </div>
      <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{q.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {q.pathway.map((p, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="micro text-ink/55">{p}</span>
            {i < q.pathway.length - 1 ? <span className="text-ink/25" aria-hidden>·</span> : null}
          </span>
        ))}
      </div>
      <div className="mt-3 micro-ink group-hover:text-brand">
        Start: {q.bestExampleLabel} →
      </div>
    </Link>
  );
}

export function StartHerePanel({ questions }: { questions: HumanUseQuestion[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {questions.map((q) => (
        <HumanUseQuestionCard key={q.id} q={q} />
      ))}
    </div>
  );
}

export function HumanPathway({ steps }: { steps: { label: string; href?: string; kind: string }[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1.5 h-2 w-2 shrink-0 border border-brand bg-paper" aria-hidden />
            {i < steps.length - 1 ? <span className="my-0.5 w-px flex-1 bg-line" aria-hidden /> : null}
          </div>
          <div className="pb-4">
            <div className="micro text-ink/45">{s.kind}</div>
            {s.href ? (
              <Link href={s.href} className="text-[14px] font-medium hover:text-brand">
                {s.label}
              </Link>
            ) : (
              <span className="text-[14px] font-medium">{s.label}</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Guided proof pathway — a hand-built human journey, NOT an automated engine. */
export function DecisionJourneyCard({ journey }: { journey: GuidedJourney }) {
  return (
    <div className="border border-line p-5">
      <div className="micro-brand mb-1">Guided decision pathway</div>
      <h3 className="text-[16px] font-semibold leading-snug">{journey.title}</h3>
      <p className="mt-1.5 mb-4 text-[13px] leading-relaxed text-muted">{journey.intro}</p>
      <HumanPathway steps={journey.steps} />
      <div className="mt-2 border-t border-line pt-4">
        <PracticalInterpretation text={journey.interpretation} />
      </div>
      <p className="mt-3 text-[12px] text-muted">
        A guided proof pathway for this case — structured reasoning, not an
        automated decision engine.
      </p>
    </div>
  );
}

export function RoleUseCard({ roles }: { roles: RoleUseCase[] }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
      {roles.map((r) => (
        <div key={r.role} className="bg-paper p-4">
          <div className="micro-brand mb-1">{r.role}</div>
          <p className="text-[13.5px] leading-relaxed text-ink/85">{r.useCase}</p>
          <Link href={r.startRoute} className="mt-2 inline-block micro-ink hover:text-brand">
            {r.startLabel} →
          </Link>
        </div>
      ))}
    </div>
  );
}
