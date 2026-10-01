import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import discovery from "@/data/atlasDiscovery.json";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { NotFound } from "@/pages/system";
import { trackEvent } from "@/analytics/Analytics";
import { T } from "@/styles/tokens";

type AtlasDiscoveryObject = (typeof discovery.objects)[number];

const mono = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".12em",
  textTransform: "uppercase" as const,
};

function atlasHostHref(href: string) {
  if (typeof window === "undefined") return href;
  const host = window.location.hostname.toLowerCase().replace(/^www\./, "");
  return host === "4planet.org" || host === "test.4planet.org" || host === "localhost" || host.endsWith(".pages.dev")
    ? href
    : `https://4planet.org${href}`;
}

export function AtlasDiscoveryPage() {
  const { objectSlug = "" } = useParams();
  const object = useMemo(
    () => (discovery.objects as AtlasDiscoveryObject[]).find((item) => item.slug === objectSlug),
    [objectSlug],
  );
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!object) return;
    trackEvent("discovery_object_view", {
      object_kind: "atlas",
      object_slug: object.slug,
      product_area: "atlas",
    });
  }, [object]);

  if (!object) return <NotFound />;

  const canonicalPath = `/atlas/${object.slug}`;
  const fullAtlasHref = atlasHostHref(object.atlasHref);

  const share = async () => {
    const url = new URL(canonicalPath, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: object.title, text: object.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
      trackEvent("discovery_object_share", {
        object_kind: "atlas",
        object_slug: object.slug,
        product_area: "atlas",
      });
    } catch (error: unknown) {
      if ((error as { name?: string })?.name === "AbortError") return;
    }
  };

  return (
    <PublicShell>
      <Seo
        title={object.title}
        description={object.description}
        path={canonicalPath}
        robots={object.indexable ? "index,follow,max-image-preview:large" : "noindex,follow"}
        imageAlt={`${object.name} — 4PLANET ATLAS`}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: object.title,
          description: object.description,
          url: canonicalUrl,
          dateModified: discovery.updatedAt,
          author: { "@type": "Organization", name: "4PLANET" },
          publisher: { "@type": "Organization", name: "4PLANET" },
          about: { "@type": "Thing", name: object.name },
          citation: object.sources.map((source) => source.url),
          isPartOf: { "@type": "WebSite", name: "4PLANET", url: new URL("/", canonicalUrl).toString() },
        })}
      />
      <main data-testid="atlas-discovery-object" style={{ background: "#fff", color: T.ink, minHeight: "100vh" }}>
        <header style={{ padding: "clamp(42px,8vw,110px) clamp(20px,6vw,86px)", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: T.blue }}>{object.eyebrow} / USEFUL INTERNET OBJECT</div>
          <h1
            style={{
              margin: "24px 0 0",
              maxWidth: 1180,
              fontFamily: T.display,
              fontWeight: 500,
              fontSize: "clamp(64px,13vw,178px)",
              letterSpacing: "-.075em",
              lineHeight: .8,
            }}
          >
            {object.name}
          </h1>
          <p style={{ margin: "34px 0 0", maxWidth: 900, fontSize: "clamp(20px,2.8vw,34px)", lineHeight: 1.35 }}>
            {object.summary}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
            <a
              href={fullAtlasHref}
              onClick={() => trackEvent("discovery_object_explore", { object_kind: "atlas", object_slug: object.slug, product_area: "atlas" })}
              style={{ ...mono, minHeight: 48, display: "inline-flex", alignItems: "center", padding: "0 18px", background: T.ink, color: "#fff", textDecoration: "none" }}
            >
              OPEN LIVE ATLAS →
            </a>
            <button
              type="button"
              onClick={share}
              style={{ ...mono, minHeight: 48, padding: "0 18px", border: `1px solid ${T.ink}`, background: "#fff", color: T.ink, cursor: "pointer" }}
            >
              {shared ? "LINK COPIED" : "SHARE"}
            </button>
          </div>
        </header>

        <section style={{ padding: "clamp(50px,7vw,96px) clamp(20px,6vw,86px)", display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(280px,.85fr)", gap: "clamp(34px,7vw,100px)", borderBottom: `1px solid ${T.line}` }}>
          <div>
            <div style={{ ...mono, color: T.blue }}>WHY IT MATTERS</div>
            <p style={{ margin: "18px 0 0", maxWidth: 850, fontSize: "clamp(24px,3.5vw,48px)", lineHeight: 1.14, letterSpacing: "-.03em" }}>
              {object.whyItMatters}
            </p>
          </div>
          <div>
            <div style={{ ...mono, color: T.dim }}>DATE / FRESHNESS</div>
            <p style={{ margin: "14px 0 0", color: T.dim, lineHeight: 1.65 }}>{object.freshness}</p>
            <div style={{ ...mono, marginTop: 18, color: T.dim }}>OBJECT CHECKED / {discovery.updatedAt}</div>
          </div>
        </section>

        <section style={{ padding: "clamp(50px,7vw,96px) clamp(20px,6vw,86px)", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: T.blue }}>CURRENT / AVAILABLE DATA</div>
          <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,270px),1fr))", borderTop: `1px solid ${T.line}`, borderLeft: `1px solid ${T.line}` }}>
            {object.availableData.map((item) => (
              <div key={item} style={{ minHeight: 150, padding: 24, borderRight: `1px solid ${T.line}`, borderBottom: `1px solid ${T.line}`, fontSize: 17, lineHeight: 1.5 }}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "clamp(50px,7vw,96px) clamp(20px,6vw,86px)", background: "#0a0a0a", color: "#fff" }}>
          <div style={{ ...mono, color: "#79dcff" }}>SOURCES / PROVENANCE</div>
          <h2 style={{ margin: "16px 0 0", maxWidth: 940, fontFamily: T.display, fontWeight: 500, fontSize: "clamp(36px,6vw,76px)", letterSpacing: "-.05em", lineHeight: .98 }}>
            Open the sources. Keep the limits visible.
          </h2>
          <div style={{ marginTop: 34, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))", borderTop: "1px solid rgba(255,255,255,.2)", borderLeft: "1px solid rgba(255,255,255,.2)" }}>
            {object.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("source_opened", { product_area: "atlas", source_kind: "atlas_discovery", object_slug: object.slug })}
                style={{ color: "#fff", textDecoration: "none", padding: 24, borderRight: "1px solid rgba(255,255,255,.2)", borderBottom: "1px solid rgba(255,255,255,.2)" }}
              >
                <div style={{ ...mono, color: "#79dcff" }}>{source.authority}</div>
                <h3 style={{ margin: "12px 0 0", fontSize: 20, lineHeight: 1.2 }}>{source.label}</h3>
                <p style={{ margin: "14px 0 0", color: "rgba(255,255,255,.72)", fontSize: 14, lineHeight: 1.55 }}>{source.use}</p>
                <div style={{ ...mono, marginTop: 16, color: "rgba(255,255,255,.56)" }}>CHECKED {source.checkedAt} · OPEN SOURCE ↗</div>
              </a>
            ))}
          </div>
        </section>

        <section style={{ padding: "clamp(50px,7vw,96px) clamp(20px,6vw,86px)", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ ...mono, color: "#8A6500" }}>LIMITATIONS / WHAT THIS DOES NOT ESTABLISH</div>
          <ul style={{ margin: "24px 0 0", paddingLeft: 22, maxWidth: 940, display: "grid", gap: 13, fontSize: 17, lineHeight: 1.55 }}>
            {object.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        </section>

        <section style={{ padding: "clamp(50px,7vw,96px) clamp(20px,6vw,86px)" }}>
          <div style={{ ...mono, color: T.blue }}>NEXT JOURNEY</div>
          <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 1, background: T.line, border: `1px solid ${T.line}` }}>
            {object.related.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => trackEvent("discovery_object_next", { object_kind: "atlas", object_slug: object.slug, next_path: item.href })}
                style={{ minHeight: 120, padding: 24, display: "flex", alignItems: "flex-end", background: "#fff", color: T.ink, textDecoration: "none", fontFamily: T.display, fontSize: 26, letterSpacing: "-.025em" }}
              >
                {item.label} →
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export default AtlasDiscoveryPage;
