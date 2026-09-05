import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { FOUNDING_EDITION } from "@/content/magazineEditorial";
import { NotFound } from "@/pages/system";

const pageStyle = {
  maxWidth: 1180,
  margin: "0 auto",
  padding: "clamp(72px,10vw,140px) clamp(20px,5vw,72px)",
} as const;

const kickerStyle = {
  fontFamily: "Fragment Mono, monospace",
  fontSize: 11,
  letterSpacing: ".12em",
  textTransform: "uppercase",
} as const;

export function MagazineStoryRecord() {
  const { id } = useParams();
  const item = FOUNDING_EDITION.items.find((candidate) => candidate.id === id);

  if (!item) return <NotFound />;

  const path = `/magazine/stories/${item.id}`;

  return (
    <PublicShell>
      <Seo
        title={`${item.title} — Pre-publication record | 4PLANET MAGAZINE`}
        description={`${item.summary} This is a controlled pre-publication story record, not a published article.`}
        path={path}
        robots="noindex,follow"
      />
      <main style={pageStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid rgba(0,0,0,.16)" }}>
          <Link to="/magazine" style={{ ...kickerStyle, color: "#080808", textDecoration: "none" }}>4PLANET MAGAZINE / WHAT HOLDS</Link>
          <span style={{ ...kickerStyle, color: "#2e2eff" }}>PRE-PUBLICATION STORY RECORD</span>
        </div>

        <header style={{ padding: "clamp(52px,8vw,104px) 0 clamp(40px,6vw,76px)" }}>
          <p style={{ ...kickerStyle, color: "rgba(8,8,8,.52)" }}>{String(item.order).padStart(2, "0")} / {item.format}</p>
          <h1 style={{ maxWidth: 1000, margin: "20px 0 24px", fontSize: "clamp(46px,7vw,100px)", lineHeight: .92, letterSpacing: "-.055em", fontWeight: 500 }}>{item.title}</h1>
          <p style={{ maxWidth: 800, margin: 0, fontSize: "clamp(18px,2vw,25px)", lineHeight: 1.48 }}>{item.summary}</p>
        </header>

        <section aria-labelledby="record-state-title" style={{ background: "#090909", color: "#fff", padding: "clamp(28px,5vw,60px)" }}>
          <p style={{ ...kickerStyle, color: "rgba(255,255,255,.55)" }}>EDITORIAL GATE STATE</p>
          <h2 id="record-state-title" style={{ margin: "14px 0 30px", fontSize: "clamp(30px,4vw,56px)", lineHeight: 1, letterSpacing: "-.045em", fontWeight: 500 }}>{item.status.replace(/_/g, " ")}</h2>
          <dl style={{ margin: 0, display: "grid", gap: 0 }}>
            <div style={{ padding: "20px 0", borderTop: "1px solid rgba(255,255,255,.18)" }}>
              <dt style={{ ...kickerStyle, color: "rgba(255,255,255,.48)" }}>SOURCE STATE</dt>
              <dd style={{ margin: "9px 0 0", fontSize: 16, lineHeight: 1.55 }}>{item.sourceState}</dd>
            </div>
            <div style={{ padding: "20px 0", borderTop: "1px solid rgba(255,255,255,.18)" }}>
              <dt style={{ ...kickerStyle, color: "rgba(255,255,255,.48)" }}>RIGHTS STATE</dt>
              <dd style={{ margin: "9px 0 0", fontSize: 16, lineHeight: 1.55 }}>{item.rightsState}</dd>
            </div>
            <div style={{ padding: "20px 0", borderTop: "1px solid rgba(255,255,255,.18)" }}>
              <dt style={{ ...kickerStyle, color: "rgba(255,255,255,.48)" }}>RESPONSIBILITY STATE</dt>
              <dd style={{ margin: "9px 0 0", fontSize: 16, lineHeight: 1.55 }}>{FOUNDING_EDITION.responsibilityState}</dd>
            </div>
            <div style={{ padding: "20px 0", borderTop: "1px solid rgba(255,255,255,.18)" }}>
              <dt style={{ ...kickerStyle, color: "rgba(255,255,255,.48)" }}>PRODUCT BRIDGE</dt>
              <dd style={{ margin: "9px 0 0", fontSize: 16, lineHeight: 1.55 }}>{item.productBridgeState}</dd>
            </div>
          </dl>
        </section>

        <section style={{ padding: "clamp(54px,8vw,96px) 0 0", maxWidth: 820 }}>
          <p style={{ ...kickerStyle, color: "#2e2eff" }}>PUBLICATION BOUNDARY</p>
          <h2 style={{ margin: "16px 0 20px", fontSize: "clamp(32px,4.6vw,62px)", lineHeight: 1, letterSpacing: "-.045em", fontWeight: 500 }}>A permanent record is not a published article.</h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.62 }}>This URL preserves the editorial object while its source, rights, contributor, responsibility and publication gates remain open. It is deliberately excluded from search indexing and does not emit Article structured data. No byline, publication date, reporting claim or rights clearance is implied.</p>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 34 }}>
            <Link to="/magazine" style={{ color: "#2e2eff" }}>← WHAT HOLDS</Link>
            <Link to="/magazine/sources" style={{ color: "#080808" }}>SOURCES & METHOD →</Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
