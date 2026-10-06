import Link from "next/link";

const MODEL = [
  "Species / Ecosystems",
  "Functions / Services",
  "Human Systems",
  "Threats",
  "Solutions",
  "Claims / Sources / Confidence",
];

/** Explains the underlying model as a single readable chain. */
export function HowItWorks() {
  return (
    <section>
      <div className="micro-brand mb-4">How it works</div>
      <div className="flex flex-wrap items-stretch gap-1.5">
        {MODEL.map((step, i) => (
          <div key={step} className="flex items-stretch gap-1.5">
            <span className="border border-line bg-paper px-3 py-2 text-[13px] font-medium leading-snug">
              {step}
            </span>
            {i < MODEL.length - 1 ? (
              <span className="flex items-center text-brand" aria-hidden>
                &rarr;
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-muted">
        Everything is a node in one graph. The system reads it in both directions
        — what each thing supports, and what depends on it — so the relationships
        that make life possible become visible.
      </p>
    </section>
  );
}

/** Plain-language statement of why the relationships matter. */
export function WhyThisMatters({ compact = false }: { compact?: boolean }) {
  return (
    <section>
      <div className="micro-brand mb-3">Why this matters</div>
      <p className={`max-w-2xl leading-relaxed text-ink/85 ${compact ? "text-[15px]" : "text-[17px]"}`}>
        Living systems are not isolated parts. A species, forest, river or
        ecological function matters because other systems depend on it — including
        the human systems we rely on for food, water and a stable climate. Living
        Systems Intelligence makes those relationships visible, so better decisions
        become possible.
      </p>
    </section>
  );
}

/** A single proof-case row: one live chain through the graph. */
export function ProofCase({
  index,
  scale,
  href,
  chain,
}: {
  index: string;
  scale: string;
  href: string;
  chain: string[];
}) {
  return (
    <Link
      href={href}
      className="group block border border-line p-5 transition-colors hover:bg-brand/[0.02]"
    >
      <div className="flex items-center justify-between">
        <span className="micro">{index} · {scale}</span>
        <span className="text-brand opacity-0 transition-opacity group-hover:opacity-100">→</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
        {chain.map((node, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-[15px] font-medium tracking-tight group-hover:text-brand">
              {node}
            </span>
            {i < chain.length - 1 ? <span className="text-brand/60">→</span> : null}
          </span>
        ))}
      </div>
    </Link>
  );
}
