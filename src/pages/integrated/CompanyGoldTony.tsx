import { useEffect } from "react";
import { TONYS_COMPANY_GOLD } from "@/data/companyGoldTony";

function EvidencePill({ children }: { children: React.ReactNode }) {
  return <span style={{ border: "1px solid #2b2b2b", borderRadius: 999, padding: "0.25rem 0.6rem", fontSize: 12 }}>{children}</span>;
}

export default function CompanyGoldTony() {
  useEffect(() => {
    const previous = document.querySelector('meta[name="robots"]')?.getAttribute("content");
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex,nofollow,noarchive";
    return () => {
      if (previous) meta!.content = previous;
      else meta?.remove();
    };
  }, []);

  const product = TONYS_COMPANY_GOLD.sources[0].payload;
  const materials = TONYS_COMPANY_GOLD.contexts.filter((context) => context.entityId.startsWith("material:"));

  return (
    <main style={{ minHeight: "100vh", background: "#f4f1eb", color: "#111", padding: "48px 24px 80px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <section style={{ width: "min(1080px, 100%)", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <EvidencePill>INTERNAL TEST</EvidencePill>
          <EvidencePill>AUTO-PROOF-01A</EvidencePill>
          <EvidencePill>UNKNOWN PRESERVED</EvidencePill>
        </div>

        <p style={{ margin: 0, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase" }}>Company → Product → Value Chain</p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 88px)", lineHeight: 0.95, margin: "18px 0 24px", maxWidth: 900 }}>Tony's Chocolonely</h1>
        <p style={{ fontSize: 22, maxWidth: 760, lineHeight: 1.4 }}>
          Milk Chocolate 32% · 180g · EAN {String(product.ean)}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 40 }}>
          <article style={{ background: "#fff", padding: 24, border: "1px solid #d7d2c8" }}>
            <h2 style={{ marginTop: 0 }}>What is source-backed</h2>
            <p>Product identity, EAN and ingredient list come from Tony's own product page.</p>
            <p>At company level, Tony's states that cocoa for cocoa mass and cocoa butter is traceable and sourced from partner cooperatives in Ghana and Côte d'Ivoire.</p>
          </article>

          <article style={{ background: "#111", color: "#fff", padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>What remains UNKNOWN</h2>
            <p>{TONYS_COMPANY_GOLD.unknowns.text.replace(/^UNKNOWN:\s*/, "")}</p>
          </article>
        </div>

        <section style={{ marginTop: 48 }}>
          <h2>Materials in this product</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {materials.map((material) => (
              <div key={material.id} style={{ background: "#fff", border: "1px solid #d7d2c8", padding: "14px 16px", display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
                <strong>{material.entityId.replace("material:", "").replaceAll("-", " ")}</strong>
                <span style={{ maxWidth: 680 }}>{material.disclosure}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 48, padding: 28, border: "2px solid #111" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Next evidence decision</p>
          <h2 style={{ margin: 0, fontSize: 30 }}>{TONYS_COMPANY_GOLD.decision.text}</h2>
          <p style={{ marginBottom: 0 }}>This is not an ecological outcome claim and not business advice.</p>
        </section>

        <section style={{ marginTop: 48 }}>
          <h2>Evidence</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {TONYS_COMPANY_GOLD.sources.map((source) => (
              <article key={source.id} style={{ background: "#fff", border: "1px solid #d7d2c8", padding: 20 }}>
                <strong>{source.sourceAuthority}</strong>
                <div style={{ marginTop: 6 }}>{source.attribution}</div>
                <div style={{ marginTop: 6, fontSize: 13 }}>Retrieved {source.retrievedAt} · rights {source.rightsStatus} · visibility {source.visibility}</div>
                <a href={source.sourceUrl} rel="noreferrer" target="_blank" style={{ display: "inline-block", marginTop: 10, color: "inherit" }}>Open source</a>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
