import { type ReactNode, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";

export function Mark({ size = 15, color = T.ink, accent = T.blue, sub }: { size?: number; color?: string; accent?: string; sub?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 8, lineHeight: 1 }}>
      <span style={{ fontFamily: T.sans, fontWeight: 600, fontSize: size, letterSpacing: "-.02em", color }}>
        4PLANET<span style={{ color: accent }}>_</span>
      </span>
      {sub && <span className="lbl" style={{ fontSize: size * 0.6 }}>{sub}</span>}
    </span>
  );
}

export function Label({ children, color, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return <div className="lbl" style={{ color, ...style }}>{children}</div>;
}

export function Section({ children, bg = T.paper, pad = "clamp(68px,9vw,132px)", id, minH, center }:
  { children: ReactNode; bg?: string; pad?: string; id?: string; minH?: string; center?: boolean }) {
  return (
    <section id={id} style={{ background: bg, padding: `${pad} 0`, minHeight: minH,
      display: center ? "flex" : undefined, alignItems: center ? "center" : undefined }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 clamp(20px,5vw,72px)", width: "100%" }}>{children}</div>
    </section>
  );
}

/** Seam — a controlled full-bleed gradient so a white plane never hard-meets a black plane. */
export function Seam({ from = "#FFFFFF", to = "#080808" }: { from?: string; to?: string }) {
  return <div aria-hidden style={{ height: "clamp(120px,17vh,210px)", background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }} />;
}

/* Brand OS button system — rectangular, ≤2px radius */
type BtnProps = { to?: string; href?: string; newTab?: boolean; children: ReactNode; primary?: boolean; accent?: string; onDark?: boolean; arrow?: boolean; style?: CSSProperties };
export function Button({ to, href, newTab, children, primary, accent = T.blue, onDark, arrow, style }: BtnProps) {
  const base: CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 500,
    padding: "0 22px", textDecoration: "none", justifyContent: "center",
    border: `1px solid ${accent}`, transition: "background .15s, color .15s, border-color .15s",
    background: primary ? accent : "transparent",
    color: primary ? (accent === T.acid ? T.ink : "#fff") : accent,
    ["--acc" as keyof CSSProperties]: accent,
    ["--acc-fg" as keyof CSSProperties]: accent === T.acid ? T.ink : "#fff",
    ...style,
  };
  const inner = (<>{children}{arrow && <span className="btn-arr" style={{ display: "inline-block", transition: "transform .15s" }}>→</span>}</>);
  const cls = "btn4" + (primary ? " btn4-primary" : "") + (onDark ? " btn4-dark" : "");
  const dataAcc = { ["data-acc" as string]: accent };
  if (to) return <Link to={to} className={cls} style={base} {...dataAcc}>{inner}</Link>;
  return <a href={href} target={newTab ? "_blank" : undefined} rel={newTab ? "noopener noreferrer" : undefined} className={cls} style={base} {...dataAcc}>{inner}</a>;
}

/* Operational status label: mono, square marker, no pastel chip */
export function StatusLabel({ children, accent = T.blue, dark = false }: { children: ReactNode; accent?: string; dark?: boolean }) {
  return (
    <span className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,.78)" : T.dim, whiteSpace: "nowrap" }}>
      <span aria-hidden style={{ width: 6, height: 6, background: accent, display: "inline-block", flex: "0 0 auto" }} />{children}
    </span>
  );
}
