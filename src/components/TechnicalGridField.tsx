import type { ReactNode, CSSProperties } from "react";
import { T } from "@/styles/tokens";

type Variant = "large" | "card" | "footer";
export function TechnicalGridField({ variant = "large", dark = false, accent, coords, highlight, children, style }:
  { variant?: Variant; dark?: boolean; accent?: string; coords?: string[]; highlight?: boolean; children?: ReactNode; style?: CSSProperties }) {
  const stroke = dark ? "white" : "black";
  const op = dark ? "0.10" : "0.07";
  const cellPx = variant === "footer" ? 72 : variant === "card" ? 32 : 64;
  const acc = accent ?? (dark ? "rgba(255,255,255,.4)" : T.blue);
  // Explicit SVG line system (structural, not a soft gradient wallpaper)
  const grid = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${cellPx}' height='${cellPx}'%3E%3Cpath d='M${cellPx} 0H0V${cellPx}' fill='none' stroke='${stroke}' stroke-opacity='${op}' stroke-width='1'/%3E%3C/svg%3E")`;
  return (
    <div style={{ position: "relative", backgroundImage: grid, backgroundSize: `${cellPx}px ${cellPx}px`, ...style }}>
      {accent && <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 2, background: accent }} />}
      {highlight && <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "42%", height: 1, background: acc, opacity: .55 }} />}
      {coords && <div className="mono" aria-hidden style={{ position: "absolute", right: 14, top: 12, textAlign: "right", fontSize: 10.5, lineHeight: 1.7, color: dark ? "rgba(255,255,255,.55)" : T.faint }}>
        {coords.map((c, i) => <div key={i} style={i === 0 ? { color: acc } : undefined}>{c}</div>)}
      </div>}
      {children}
    </div>
  );
}
