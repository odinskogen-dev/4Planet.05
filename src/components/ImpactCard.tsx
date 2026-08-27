import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import type { ImageMeta } from "@/content/imageRegistry";

export function ImpactCard({ to, code, label, desc, status, img, accent = T.blue, borderLeft, borderTop }:
  { to: string; code: string; label: string; desc: string; status: string; img?: ImageMeta; accent?: string; borderLeft?: boolean; borderTop?: boolean }) {
  return (
    <Link to={to} className="impact-card hov" style={{ position: "relative", display: "block", padding: "clamp(22px,3vw,38px)", textDecoration: "none", color: T.ink, overflow: "hidden", minHeight: 196,
      borderLeft: borderLeft ? `1px solid ${T.line}` : "none", borderTop: borderTop ? `1px solid ${T.line}` : "none" }}>
      {img && <span aria-hidden className="ic-img" style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(180deg, rgba(8,8,8,.18), rgba(8,8,8,.66)), url(${img.src})`, backgroundSize: "cover", backgroundPosition: img.objectPosition || "50% 50%" }} />}
      <span aria-hidden className="ic-rule" style={{ position: "absolute", top: 0, left: 0, width: 64, height: 3, background: accent }} />
      <span className="ic-text" style={{ position: "relative", display: "block" }}>
        <span style={{ display: "flex", justifyContent: "space-between" }}>
          <span className="mono ic-code" style={{ fontSize: 11, color: T.faint }}>{code}</span>
          <span className="ic-arr" style={{ color: accent, transition: "transform .15s" }}>→</span>
        </span>
        <span style={{ display: "block", fontWeight: 500, fontSize: "clamp(17px,2vw,21px)", marginTop: 16, letterSpacing: "-.01em" }}>{label}</span>
        <span className="ic-desc" style={{ display: "block", fontSize: 13.5, color: T.dim, marginTop: 10, lineHeight: 1.5 }}>{desc}</span>
        <span className="mono ic-status" style={{ display: "block", fontSize: 10.5, color: accent, marginTop: 16, letterSpacing: ".08em" }}>{status}</span>
      </span>
    </Link>
  );
}
