import { type CSSProperties } from "react";
import { T } from "@/styles/tokens";
import { Reveal } from "@/components/Cinematic";
import type { Block } from "@/content/narratives";

/**
 * Editorial article renderer — a calm white reading plane.
 * Instrument Sans leads, DM Sans body, Fragment Mono section labels.
 * Restraint: accent appears only as a short rule on a section label and a thin
 * rule on a pull-quote. No automatic indentation, no per-paragraph colour.
 */
export function Editorial({ blocks, accent = T.blue, dark = false }: { blocks: Block[]; accent?: string; dark?: boolean }) {
  const body = dark ? "rgba(255,255,255,.90)" : T.ink;
  const strong = dark ? "#fff" : T.ink;
  const labelInk = dark ? "rgba(255,255,255,.60)" : T.dim;
  const rule = dark ? accent : accent;   // the one place a section label earns a tick of colour

  const lead: CSSProperties = { fontFamily: T.display, color: strong, fontWeight: 500, fontSize: "clamp(23px,2.9vw,38px)", letterSpacing: "-.02em", lineHeight: 1.22, maxWidth: 940, margin: 0 };
  const para: CSSProperties = { color: body, fontSize: "clamp(16.5px,1.3vw,19px)", lineHeight: 1.7, maxWidth: 660, margin: 0 };

  return (
    <div className="editorial" style={{ display: "grid", gap: "clamp(20px,2.6vw,30px)" }}>
      {blocks.map((b, i) => {
        if (b.k === "lead") return <Reveal key={i}><p style={lead}>{b.t}</p></Reveal>;
        if (b.k === "sub") return (
          <Reveal key={i} style={{ marginTop: "clamp(12px,1.8vw,22px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span aria-hidden style={{ width: 20, height: 2, background: rule, display: "inline-block", flex: "0 0 auto" }} />
              <span style={{ fontFamily: T.mono, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: labelInk }}>{b.t}</span>
            </div>
          </Reveal>
        );
        if (b.k === "quote") return (
          <Reveal key={i} style={{ margin: "clamp(8px,1.4vw,20px) 0" }}>
            <blockquote style={{ margin: 0, borderLeft: `2px solid ${accent}`, paddingLeft: "clamp(18px,2.4vw,30px)", maxWidth: 860 }}>
              <p style={{ fontFamily: T.display, margin: 0, color: strong, fontWeight: 500, fontSize: "clamp(20px,2.4vw,30px)", letterSpacing: "-.015em", lineHeight: 1.3 }}>{b.t}</p>
            </blockquote>
          </Reveal>
        );
        return <Reveal key={i}><p style={para}>{b.t}</p></Reveal>;
      })}
    </div>
  );
}
