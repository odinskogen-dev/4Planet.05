import type { ConservationStatus, SeverityScore } from "@/types";

// --- Section scaffolding ----------------------------------------------------

export function SectionHeader({
  index,
  title,
  hint,
}: {
  index: string;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-5 flex items-baseline gap-3">
      <span className="micro-brand tabular-nums">{index}</span>
      <h2 className="text-[19px] font-semibold tracking-tight">{title}</h2>
      {hint ? <span className="micro ml-auto">{hint}</span> : null}
    </div>
  );
}

export function Section({
  index,
  title,
  hint,
  children,
}: {
  index: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-10">
      <SectionHeader index={index} title={title} hint={hint} />
      {children}
    </section>
  );
}

// --- Human Translation card (mandatory plain-language layer) ----------------

export function HumanNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 border-l-2 border-brand bg-brand/[0.035] px-4 py-3">
      <div className="micro-brand mb-1">Human Translation</div>
      <p className="text-[13.5px] leading-relaxed text-ink/80">{children}</p>
    </div>
  );
}

// --- Key/value rows ---------------------------------------------------------

export function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-line py-3 last:border-b-0">
      <div className="micro pt-0.5">{label}</div>
      <div className="text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}

// --- Conservation status badge ----------------------------------------------

const STATUS_TONE: Record<ConservationStatus, string> = {
  "Least Concern": "text-[#1A7F37] border-[#1A7F37]/30 bg-[#1A7F37]/[0.06]",
  "Near Threatened": "text-[#9A6700] border-[#9A6700]/30 bg-[#9A6700]/[0.06]",
  Vulnerable: "text-[#BC4C00] border-[#BC4C00]/30 bg-[#BC4C00]/[0.06]",
  Endangered: "text-[#CF222E] border-[#CF222E]/30 bg-[#CF222E]/[0.06]",
  "Critically Endangered":
    "text-[#A40E26] border-[#A40E26]/30 bg-[#A40E26]/[0.06]",
  "Extinct in the Wild": "text-ink border-line bg-ink/[0.04]",
  Extinct: "text-ink border-line bg-ink/[0.04]",
  "Data Deficient": "text-muted border-line bg-ink/[0.03]",
};

const STATUS_CODE: Record<ConservationStatus, string> = {
  "Least Concern": "LC",
  "Near Threatened": "NT",
  Vulnerable: "VU",
  Endangered: "EN",
  "Critically Endangered": "CR",
  "Extinct in the Wild": "EW",
  Extinct: "EX",
  "Data Deficient": "DD",
};

export function StatusBadge({
  status,
  withLabel = true,
}: {
  status: ConservationStatus;
  withLabel?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[11px] font-medium ${STATUS_TONE[status]}`}
    >
      <span className="font-semibold tabular-nums">{STATUS_CODE[status]}</span>
      {withLabel ? <span className="opacity-80">{status}</span> : null}
    </span>
  );
}

// --- Score (1–5) as a row of cells ------------------------------------------

export function ScoreCells({
  value,
  tone = "brand",
}: {
  value: SeverityScore;
  tone?: "brand" | "ink";
}) {
  const on = tone === "brand" ? "bg-brand" : "bg-ink";
  return (
    <span className="inline-flex gap-[3px]" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-3 w-1.5 ${i <= value ? on : "bg-line"}`}
        />
      ))}
    </span>
  );
}
