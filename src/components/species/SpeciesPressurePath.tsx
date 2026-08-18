import { T } from "@/styles/tokens";

export type PressureCauseClass = "HUMAN_SYSTEM" | "NATURAL_SYSTEM" | "MIXED" | "UNKNOWN";

export interface PressurePathItem {
  id: string;
  label: string;
  summary: string;
  causeClass: PressureCauseClass;
  causeLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  boundary: string;
}

export type SpeciesPressureItem = PressurePathItem;

const mono: React.CSSProperties = { fontFamily: T.mono, fontSize: 10, letterSpacing: ".12em" };

function causeCopy(cause: PressureCauseClass) {
  if (cause === "HUMAN_SYSTEM") return "HUMAN SYSTEM";
  if (cause === "NATURAL_SYSTEM") return "NATURAL SYSTEM";
  if (cause === "MIXED") return "MIXED CAUSE";
  return "CAUSE UNKNOWN";
}

export function PressurePath({
  items,
  eyebrow = "LIVING SYSTEM_ · PRESSURE → CAUSE",
  title = "Pressures have causes.",
  intro = "A pressure is not the end of the chain. Follow the evidence into the systems and mechanisms that shape it — without assuming every pressure has the same kind of cause.",
  ariaId = "pressure-path-title",
}: {
  items: PressurePathItem[];
  eyebrow?: string;
  title?: string;
  intro?: string;
  ariaId?: string;
}) {
  return (
    <section aria-labelledby={ariaId} style={{ background: "#0b0b0b", color: "#fff" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "clamp(60px,9vw,116px) clamp(18px,5vw,72px)" }}>
        <div style={{ maxWidth: 860 }}>
          <div style={{ ...mono, color: T.acid }}>{eyebrow}</div>
          <h2 id={ariaId} style={{ margin: "16px 0 0", fontFamily: T.display, fontWeight: 500, fontSize: "clamp(38px,6vw,78px)", letterSpacing: "-.05em", lineHeight: .94 }}>
            {title}
          </h2>
          <p style={{ margin: "24px 0 0", maxWidth: 720, fontSize: "clamp(16px,2vw,20px)", lineHeight: 1.58, color: "rgba(255,255,255,.74)" }}>{intro}</p>
        </div>

        <div className="species-pressure-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", marginTop: 48, borderTop: "1px solid rgba(255,255,255,.18)", borderLeft: "1px solid rgba(255,255,255,.18)" }}>
          {items.map((item, index) => (
            <article key={item.id} style={{ minHeight: 300, padding: "clamp(22px,4vw,38px)", borderRight: "1px solid rgba(255,255,255,.18)", borderBottom: "1px solid rgba(255,255,255,.18)", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                <span style={{ ...mono, color: T.acid }}>P{String(index + 1).padStart(2, "0")}</span>
                <span style={{ ...mono, color: "rgba(255,255,255,.68)", border: "1px solid rgba(255,255,255,.26)", padding: "5px 7px" }}>{causeCopy(item.causeClass)}</span>
              </div>
              <h3 style={{ fontFamily: T.display, fontSize: "clamp(24px,3vw,38px)", letterSpacing: "-.03em", margin: "26px 0 0" }}>{item.label}</h3>
              <p style={{ margin: "18px 0 0", maxWidth: 520, lineHeight: 1.6, color: "rgba(255,255,255,.74)" }}>{item.summary}</p>
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.14)" }}>
                <div style={{ ...mono, color: "rgba(255,255,255,.46)" }}>CAUSE PATH</div>
                <p style={{ margin: "8px 0 0", fontSize: 14, lineHeight: 1.55 }}>{item.causeLabel}</p>
              </div>
              <p style={{ margin: "18px 0 0", fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,.52)" }}><strong>BOUNDARY:</strong> {item.boundary}</p>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, marginTop: "auto", paddingTop: 22, color: T.acid }}>{item.sourceLabel} ↗</a>
            </article>
          ))}
        </div>

        <div style={{ marginTop: 20, ...mono, color: "rgba(255,255,255,.52)", lineHeight: 1.75 }}>
          PRESSURE ≠ CAUSE · HUMAN SYSTEM ≠ DEFAULT · CAUSE CLASSIFICATION MUST FOLLOW THE CURRENT EVIDENCE AND MAY BE HUMAN, NATURAL, MIXED OR UNKNOWN.
        </div>
      </div>
      <style>{`@media(max-width:760px){.species-pressure-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}

export function SpeciesPressurePath({
  items,
  title = "Threats have causes.",
  intro = "A pressure is not the end of the chain. Follow the evidence into the systems and mechanisms that shape it — without assuming every pressure has the same kind of cause.",
}: {
  items: SpeciesPressureItem[];
  title?: string;
  intro?: string;
}) {
  return (
    <PressurePath
      items={items}
      eyebrow="SPECIES_ · PRESSURE → CAUSE"
      title={title}
      intro={intro}
      ariaId="species-pressure-title"
    />
  );
}
