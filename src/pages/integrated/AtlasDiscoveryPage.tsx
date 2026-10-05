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

const publicCopy: Record<string, {
  kicker: string;
  lede: string;
  story: string;
  exploreTitle: string;
  items: string[];
  note: string;
}> = {
  earth: {
    kicker: "PLANET",
    lede: "Explore the living planet through satellite imagery and public data.",
    story: "Start with Earth as a whole, then move closer. ATLAS brings different planetary datasets into one place so you can explore land, ocean, climate and life without needing to be a GIS specialist.",
    exploreTitle: "What you can explore",
    items: ["Satellite imagery", "Biodiversity and ocean data", "Land, climate and event layers"],
    note: "Different layers update at different times. The source date stays visible in ATLAS.",
  },
  fires: {
    kicker: "EARTH SIGNAL",
    lede: "See recent heat signals from space — then explore the context around them.",
    story: "Satellite sensors can detect unusual heat across the planet. ATLAS lets you place those signals beside other Earth data instead of treating every dot as the same thing.",
    exploreTitle: "What you can explore",
    items: ["Recent satellite heat detections", "Source-reported natural events", "Vegetation, forest and Earth imagery"],
    note: "A heat signal is not automatically a wildfire. Open the source before drawing a conclusion.",
  },
  whales: {
    kicker: "OCEAN LIFE",
    lede: "Explore where whales and dolphins have been recorded.",
    story: "Public biodiversity records can show where people have documented cetaceans over time. ATLAS turns those records into a starting point for exploration — not a live animal tracker.",
    exploreTitle: "What you can explore",
    items: ["Reported whale and dolphin observations", "The place and date attached to records", "Related species such as Orca"],
    note: "Recorded observations are not live positions, population counts or migration routes.",
  },
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

  const copy = publicCopy[object.slug] ?? {
    kicker: "ATLAS",
    lede: object.summary,
    story: object.whyItMatters,
    exploreTitle: "Explore",
    items: object.availableData.slice(0, 3),
    note: object.limitations[0] ?? "",
  };
  const canonicalPath = `/atlas/${object.slug}`;
  const fullAtlasHref = atlasHostHref(object.atlasHref);
  const embedHref = `${object.atlasHref}${object.atlasHref.includes("?") ? "&" : "?"}embed=news`;

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

      <main data-testid="atlas-discovery-object" style={{ background: "#FFFFFF", color: T.ink, minHeight: "100vh" }}>
        <header style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(56px,9vw,120px) clamp(20px,5vw,64px) clamp(50px,7vw,88px)" }}>
          <div style={{ ...mono, color: T.blue }}>4PLANET ATLAS · {copy.kicker}</div>
          <h1 style={{
            margin: "18px 0 0",
            maxWidth: 980,
            fontFamily: T.display,
            fontWeight: 520,
            fontSize: "clamp(58px,10vw,118px)",
            letterSpacing: "-.065em",
            lineHeight: .86,
          }}>{object.name}</h1>
          <p style={{
            margin: "30px 0 0",
            maxWidth: 760,
            fontFamily: T.display,
            fontSize: "clamp(24px,3.7vw,48px)",
            letterSpacing: "-.035em",
            lineHeight: 1.06,
          }}>{copy.lede}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 34 }}>
            <a
              href={fullAtlasHref}
              onClick={() => trackEvent("discovery_object_explore", { object_kind: "atlas", object_slug: object.slug, product_area: "atlas" })}
              style={{ ...mono, minHeight: 50, display: "inline-flex", alignItems: "center", padding: "0 20px", background: T.blue, color: "#fff", textDecoration: "none" }}
            >EXPLORE IN ATLAS →</a>
            <button
              type="button"
              onClick={share}
              style={{ ...mono, minHeight: 50, padding: "0 18px", border: `1px solid ${T.lineStrong}`, background: "#FFFFFF", color: T.ink, cursor: "pointer" }}
            >{shared ? "LINK COPIED" : "SHARE"}</button>
          </div>
        </header>

        <section aria-label={`Interactive ${object.name} map`} style={{ borderTop: `4px solid ${T.blue}`, borderBottom: `4px solid ${T.blue}`, background: "#FFFFFF" }}>
          <iframe
            src={embedHref}
            title={`Explore ${object.name} in 4PLANET ATLAS`}
            loading="eager"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "min(62svh,720px)", minHeight: 420, display: "block", border: 0 }}
          />
        </section>

        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "clamp(64px,9vw,120px) clamp(20px,5vw,64px)" }}>
          <p style={{ margin: 0, maxWidth: 800, fontSize: "clamp(20px,2.5vw,30px)", lineHeight: 1.45, letterSpacing: "-.02em" }}>{copy.story}</p>

          <div style={{ marginTop: "clamp(50px,7vw,82px)" }}>
            <div style={{ ...mono, color: T.blue }}>{copy.exploreTitle.toUpperCase()}</div>
            <div style={{ marginTop: 18, borderTop: `1px solid ${T.line}` }}>
              {copy.items.map((item) => (
                <div key={item} style={{ padding: "20px 0", borderBottom: `1px solid ${T.line}`, fontFamily: T.display, fontSize: "clamp(22px,3vw,34px)", letterSpacing: "-.025em" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "clamp(48px,7vw,78px)", paddingLeft: 18, borderLeft: `3px solid ${T.blue}`, maxWidth: 760 }}>
            <div style={{ ...mono, color: T.blue }}>GOOD TO KNOW</div>
            <p style={{ margin: "10px 0 0", fontSize: "clamp(17px,2vw,21px)", lineHeight: 1.55 }}>{copy.note}</p>
          </div>
        </section>

        <section style={{ maxWidth: 1040, margin: "0 auto", padding: "0 clamp(20px,5vw,64px) clamp(70px,9vw,120px)" }}>
          <div style={{ borderTop: `1px solid ${T.line}`, paddingTop: 26 }}>
            <div style={{ ...mono, color: T.dim }}>SOURCES</div>
            <div style={{ display: "flex", gap: "12px 22px", flexWrap: "wrap", marginTop: 14 }}>
              {object.sources.map((source) => (
                <a
                  key={source.url}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("source_opened", { product_area: "atlas", source_kind: "atlas_discovery", object_slug: object.slug })}
                  style={{ color: T.blue, fontSize: 14, textDecoration: "none", borderBottom: `1px solid ${T.blue}`, paddingBottom: 2 }}
                >{source.authority} ↗</a>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 46, borderTop: `1px solid ${T.line}`, paddingTop: 26 }}>
            <div style={{ ...mono, color: T.dim }}>KEEP EXPLORING</div>
            <div style={{ display: "flex", gap: "14px 26px", flexWrap: "wrap", marginTop: 16 }}>
              {object.related.slice(0, 3).map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => trackEvent("discovery_object_next", { object_kind: "atlas", object_slug: object.slug, next_path: item.href })}
                  style={{ color: T.ink, textDecoration: "none", fontFamily: T.display, fontSize: "clamp(20px,2.5vw,30px)", letterSpacing: "-.02em" }}
                >{item.label} →</Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}

export default AtlasDiscoveryPage;
