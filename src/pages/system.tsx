import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";

export function NotFound() {
  return (
    <PublicShell>
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}>
        <div>
          <div className="mono" style={{ color: T.blue, fontSize: 13 }}>404</div>
          <h1 style={{ fontWeight: 500, fontSize: "clamp(28px,5vw,36px)", letterSpacing: "-.03em", marginTop: 10 }}>Off the map.</h1>
          <p style={{ color: T.dim, marginTop: 12, fontWeight: 300 }}>That route doesn't exist in the system yet.</p>
          <Link to="/" className="hov" style={{ display: "inline-block", marginTop: 22, border: `1px solid ${T.ink}`, padding: "12px 22px", fontWeight: 500 }}>Back to 4PLANET_ →</Link>
        </div>
      </div>
    </PublicShell>
  );
}
