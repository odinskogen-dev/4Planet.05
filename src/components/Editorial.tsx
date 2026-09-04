import { type CSSProperties, type ReactNode } from "react";
import { T } from "@/styles/tokens";
import { Reveal } from "@/components/Cinematic";
import type { Block } from "@/content/narratives";

/**
 * Editorial article renderer — a calm reading plane. Core journalism can opt out
 * of intersection-triggered reveals so article copy is never hidden if observer
 * APIs, embeds or unusual browsers fail. Other cinematic surfaces keep reveals.
 */
export function Editorial({
  blocks,
  accent = T.blue,
  dark = false,
  readingSize = "standard",
  reveal = true,
}: {
  blocks: Block[];
  accent?: string;
  dark?: boolean;
  readingSize?: "standard" | "large";
  reveal?: boolean;
}) {
  const body = dark ? "rgba(255,255,255,.90)" : T.ink;
  const strong = dark ? "#fff" : T.ink;
  const labelInk = dark ? "rgba(255,255,255,.60)" : T.dim;
  const rule = accent;
  const large = readingSize === "large";

  const lead: CSSProperties = {
    fontFamily: T.display,
    color: strong,
    fontWeight: 500,
    fontSize: large ? "clamp(26px,3.2vw,42px)" : "clamp(23px,2.9vw,38px)",
    letterSpacing: "-.02em",
    lineHeight: large ? 1.26 : 1.22,
    maxWidth: large ? 900 : 940,
    margin: 0,
  };
  const para: CSSProperties = {
    color: body,
    fontSize: large ? "clamp(18.5px,1.5vw,22px)" : "clamp(16.5px,1.3vw,19px)",
    lineHeight: large ? 1.78 : 1.7,
    maxWidth: large ? 700 : 660,
    margin: 0,
  };

  const wrap = (key: number, child: ReactNode, style?: CSSProperties) => reveal
    ? <Reveal key={key} style={style}>{child}</Reveal>
    : <div key={key} style={style}>{child}</div>;

  return (
    <div className="editorial" data-reading-size={readingSize} data-editorial-reveal={reveal ? "on" : "off"} style={{ display: "grid", gap: large ? "clamp(24px,3vw,36px)" : "clamp(20px,2.6vw,30px)" }}>
      {blocks.map((b, i) => {
        if (b.k === "lead") return wrap(i, <p style={lead}>{b.t}</p>);
        if (b.k === "sub") return wrap(i,
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span aria-hidden style={{ width: 20, height: 2, background: rule, display: "inline-block", flex: "0 0 auto" }} />
            <span style={{ fontFamily: T.mono, fontSize: large ? 12 : 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: labelInk }}>{b.t}</span>
          </div>,
          { marginTop: "clamp(12px,1.8vw,22px)" },
        );
        if (b.k === "quote") return wrap(i,
          <blockquote style={{ margin: 0, borderLeft: `2px solid ${accent}`, paddingLeft: "clamp(18px,2.4vw,30px)", maxWidth: 860 }}>
            <p style={{ fontFamily: T.display, margin: 0, color: strong, fontWeight: 500, fontSize: large ? "clamp(23px,2.7vw,35px)" : "clamp(20px,2.4vw,30px)", letterSpacing: "-.015em", lineHeight: 1.3 }}>{b.t}</p>
          </blockquote>,
          { margin: "clamp(8px,1.4vw,20px) 0" },
        );
        return wrap(i, <p style={para}>{b.t}</p>);
      })}
    </div>
  );
}
