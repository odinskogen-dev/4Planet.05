import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorks, WhyThisMatters, ProofCase } from "@/components/Explain";


export const metadata: Metadata = {
  title: "Living Systems Intelligence | 4PLANET",
  description:
    "Explore source-grounded relationships between species, ecosystems, ecological functions, human systems, threats, solutions and evidence.",
  alternates: {
    canonical: "https://4planet.org/livingsystems/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    url: "https://4planet.org/livingsystems/",
    title: "Living Systems Intelligence | 4PLANET",
    description:
      "Explore source-grounded relationships between species, ecosystems, ecological functions, human systems, threats, solutions and evidence.",
    siteName: "4PLANET",
  },
};

const LIVING_SYSTEMS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Living Systems Intelligence",
  url: "https://4planet.org/livingsystems/",
  description:
    "Explore source-grounded relationships between species, ecosystems, ecological functions, human systems, threats, solutions and evidence.",
  isPartOf: {
    "@type": "WebSite",
    name: "4PLANET",
    url: "https://4planet.org/",
  },
  about: [
    { "@type": "Thing", name: "Living systems" },
    { "@type": "Thing", name: "Biodiversity" },
    { "@type": "Thing", name: "Ecological dependencies" },
  ],
};

const CORE = [
  { n: "01", title: "See what exists", desc: "Species, ecosystems, ecological functions and services." },
  { n: "02", title: "Understand what depends on what", desc: "Dependency pathways, reverse dependencies and failure cascades." },
  { n: "03", title: "Know why it matters", desc: "Human systems, threats, solutions, confidence and sources." },
];

const EXPLORE = [
  { href: "/ecosystems/EC_AMAZON_RAINFOREST", label: "Amazon Rainforest", sub: "Flagship case" },
  { href: "/species/western-honey-bee", label: "Western Honey Bee", sub: "Species" },
  { href: "/dependencies", label: "Dependencies", sub: "What depends on what" },
  { href: "/decisions", label: "Decisions", sub: "What to weigh first" },
  { href: "/learning", label: "Learning", sub: "What we learned" },
  { href: "/trust", label: "Trust", sub: "Evidence integrity" },
  { href: "/sources", label: "Sources", sub: "The evidence base" },
  { href: "/about", label: "About", sub: "What this is" },
];

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LIVING_SYSTEMS_JSON_LD) }}
      />
      <div className="pb-10 pt-16">
      <div className="max-w-3xl">
        <div className="micro-brand mb-6">4PLANET</div>
        <h1 className="text-[clamp(2.4rem,6vw,4.3rem)] font-semibold leading-[0.98] tracking-tight">
          Living Systems
          <br />
          Intelligence
        </h1>
        <p className="mt-7 max-w-xl text-[18px] leading-snug text-ink/85">
          A system for understanding how nature, human systems, threats and
          solutions are connected.
        </p>
        <p className="mt-5 max-w-2xl text-[14.5px] leading-relaxed text-muted">
          Living Systems Intelligence maps the relationships between species,
          ecosystems, ecological functions, human systems, threats, solutions,
          claims and sources — making the relationships that make life possible
          visible.
        </p>
      </div>

      <div className="mt-12 border border-brand/40 bg-brand/[0.03] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <div className="micro-brand mb-2">New here?</div>
          <p className="max-w-xl text-[15px] leading-relaxed text-ink/85">
            Start with a question. The system guides you from a species or
            ecosystem to dependencies, threats, solutions, evidence and learning.
          </p>
        </div>
        <Link
          href="/start"
          className="mt-4 inline-block whitespace-nowrap border border-brand px-5 py-2.5 text-[14px] font-medium text-brand transition-colors hover:bg-brand hover:text-paper sm:mt-0"
        >
          Start Here →
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-1 border-l border-t border-line sm:grid-cols-3">
        {CORE.map((c) => (
          <div key={c.n} className="border-b border-r border-line p-6">
            <span className="micro">{c.n}</span>
            <h2 className="mt-6 text-[18px] font-semibold tracking-tight">{c.title}</h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <HowItWorks />
      </div>

      <div className="mt-16">
        <div className="micro-brand mb-4">Two proof cases — one system, two scales</div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ProofCase
            index="Example 01"
            scale="Species scale"
            href="/species/western-honey-bee"
            chain={["Honey Bee", "Pollination", "Food Production", "Food System"]}
          />
          <ProofCase
            index="Example 02"
            scale="Ecosystem scale"
            href="/ecosystems/EC_AMAZON_RAINFOREST"
            chain={["Amazon Rainforest", "Rainfall Regulation", "Agriculture", "Water System"]}
          />
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-8">
        <div className="micro-brand mb-3">From understanding to better decisions</div>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink/85">
          Living Systems Intelligence does not stop at showing what depends on
          what. It also begins to map which solutions may strengthen critical
          functions, which threats they address, and where evidence, urgency and
          uncertainty should guide better decisions.
        </p>
        <div className="mt-4">
          <Link href="/decisions" className="micro-ink hover:text-brand">
            Decision intelligence →
          </Link>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-8">
        <div className="micro-brand mb-3">Why you can trust it</div>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink/85">
          Every major claim can connect to its sources, with explicit confidence,
          review status and the data gaps that remain. The system is built to show
          what it knows — and what it does not.
        </p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/trust" className="micro-ink hover:text-brand">Trust integrity →</Link>
          <Link href="/sources" className="micro-ink hover:text-brand">Sources →</Link>
        </div>
      </div>

      <div className="mt-16 border-t border-line pt-8">
        <div className="micro-brand mb-3">Learning from outcomes</div>
        <p className="max-w-2xl text-[15px] leading-relaxed text-ink/85">
          Living Systems Intelligence does not only map relationships and
          structure decisions. It also begins to track what was expected, what
          was observed, what was learned, and whether confidence should change.
        </p>
        <div className="mt-4">
          <Link href="/learning" className="micro-ink hover:text-brand">
            Learning intelligence →
          </Link>
        </div>
      </div>

      <div className="mt-16 border-t-2 border-brand pt-8">
        <WhyThisMatters />
      </div>

      <div className="mt-16">
        <div className="micro-brand mb-4">Explore</div>
        <div className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {EXPLORE.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="group flex items-baseline justify-between bg-paper p-4 hover:bg-brand/[0.02]"
            >
              <span className="text-[14.5px] font-medium tracking-tight group-hover:text-brand">
                {e.label}
              </span>
              <span className="micro">{e.sub}</span>
            </Link>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
