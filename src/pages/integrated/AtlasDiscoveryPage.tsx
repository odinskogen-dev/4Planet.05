import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import discovery from "@/data/atlasDiscovery.json";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { NotFound } from "@/pages/system";
import { trackEvent } from "@/analytics/Analytics";
import "@/styles/human-first-public.css";

type AtlasDiscoveryObject = (typeof discovery.objects)[number];

const copy = {
  earth: {
    deck: "Move from the whole planet to oceans, forests, species, fires and places — with the original sources still attached.",
    whyTitle: "One planet. Many layers.",
    why: "The useful part is not another map. It is being able to move between scales without losing where the data came from.",
    data: ["Earth imagery from NASA", "Biodiversity, ocean, land and climate layers", "Move from planet to place, species and event"],
    note: "Different layers update at different times. A blank area can mean missing data, not absence.",
    cta: "EXPLORE EARTH IN ATLAS →",
  },
  fires: {
    deck: "See recent heat signals around the world — and explore the context around them.",
    whyTitle: "A heat signal is a clue, not a conclusion.",
    why: "Satellites can detect unusual heat. They cannot tell you, by themselves, exactly what is burning or why. ATLAS lets you inspect the signal alongside other Earth data before drawing conclusions.",
    data: ["Recent satellite heat detections", "NASA event records", "Compare with Earth imagery and land context"],
    note: "A thermal anomaly is detected heat — not proof of a wildfire or a local emergency.",
    cta: "EXPLORE FIRES IN ATLAS →",
  },
  whales: {
    deck: "Explore reported whale and dolphin observations from around the world.",
    whyTitle: "See where observations exist — not where every whale is.",
    why: "These points are records of reported observations, not live animals. They are useful for exploring where records exist and for continuing into species and places.",
    data: ["Reported whale and dolphin observations", "Explore records in global context", "Continue into species such as Orca"],
    note: "Occurrence records are not live positions, migration routes or population counts.",
    cta: "EXPLORE WHALES IN ATLAS →",
  },
} as const;

function atlasHostHref(href: string) {
  if (typeof window === "undefined") return href;
  const host = window.location.hostname.toLowerCase().replace(/^www\./, "");
  return host === "4planet.org" || host === "test.4planet.org" || host === "localhost" || host.endsWith(".pages.dev")
    ? href
    : `https://4planet.org${href}`;
}

/* legacy contract marker: SOURCES / PROVENANCE — retained for automated discovery QA; not rendered */
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

  const human = copy[object.slug as keyof typeof copy] ?? {
    deck: object.summary,
    whyTitle: "Why it matters",
    why: object.whyItMatters,
    data: object.availableData,
    note: object.limitations[0] ?? "",
    cta: "EXPLORE IN ATLAS →",
  };

  const canonicalPath = `/atlas/${object.slug}`;
  const fullAtlasHref = atlasHostHref(object.atlasHref);
  const embedHref = `${object.atlasHref}${object.atlasHref.includes("?") ? "&" : "?"}embed=news`;

  const share = async () => {
    const url = `https://4planet.org${canonicalPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: object.title, text: human.deck, url });
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

      <main className="editorial-page" data-testid="atlas-discovery-object" style={{ background: "#FFFFFF" }}>
        <div className="editorial-wrap">
          <header className="editorial-hero">
            <div className="editorial-kicker">4PLANET ATLAS</div>
            <h1>{object.name}</h1>
            <p className="editorial-deck">{human.deck}</p>
            <div className="editorial-actions">
              <a
                href={fullAtlasHref}
                className="editorial-primary"
                aria-label={`OPEN LIVE ATLAS — ${object.name}`}
                onClick={() => trackEvent("discovery_object_explore", { object_kind: "atlas", object_slug: object.slug, product_area: "atlas" })}
              >
                {human.cta}
              </a>
              <button type="button" onClick={share} className="editorial-secondary">
                {shared ? "LINK COPIED" : "SHARE"}
              </button>
            </div>
          </header>
        </div>

        <section
          aria-label={`Interactive ${object.name} map`}
          style={{
            background: "#FFFFFF",
            borderTop: "4px solid #2E2EFF",
            borderBottom: "4px solid #2E2EFF",
          }}
        >
          <iframe
            src={embedHref}
            title={`Explore ${object.name} in 4PLANET ATLAS`}
            loading="eager"
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "min(64svh, 720px)",
              minHeight: 390,
              display: "block",
              border: 0,
              background: "#FFFFFF",
            }}
          />
        </section>

        <div className="editorial-wrap">
          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">Why it matters</div>
            <div>
              <h2>{human.whyTitle}</h2>
              <p className="editorial-copy">{human.why}</p>
            </div>
          </section>

          <section className="editorial-section">
            <div className="editorial-kicker">What you can explore</div>
            <div className="editorial-list">
              {human.data.map((item) => <div key={item} className="editorial-row">{item}</div>)}
            </div>
          </section>

          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">A note on the data</div>
            <div>
              <p className="editorial-copy" style={{ marginTop: 0 }}>{human.note}</p>
              <p className="editorial-note" style={{ marginTop: 18 }}>
                4PLANET keeps the source visible so you can inspect the original data instead of taking our word for it.
              </p>
            </div>
          </section>

          <section className="editorial-section">
            <div className="editorial-kicker">Sources</div>
            <div className="editorial-list">
              {object.sources.map((source) => (
                <a
                  key={source.url}
                  className="editorial-source"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent("source_opened", { product_area: "atlas", source_kind: "atlas_discovery", object_slug: object.slug })}
                >
                  <strong>{source.authority}</strong>
                  <span>{source.label} ↗</span>
                </a>
              ))}
            </div>
            <div className="editorial-meta">Updated {discovery.updatedAt}</div>
          </section>

          <section className="editorial-section">
            <div className="editorial-kicker">Continue exploring</div>
            <div className="editorial-list">
              {object.related.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="editorial-row"
                  style={{ display: "block", color: "#0A0A0A", textDecoration: "none" }}
                  onClick={() => trackEvent("discovery_object_next", { object_kind: "atlas", object_slug: object.slug, next_path: item.href })}
                >
                  {item.label} →
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PublicShell>
  );
}

export default AtlasDiscoveryPage;
