import type { CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import discovery from "@/data/discoveryTopics.json";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { NotFound } from "@/pages/system";
import { trackEvent } from "@/analytics/Analytics";
import "@/styles/human-first-public.css";
import "@/styles/discovery-human.css";

type DiscoveryTopic = (typeof discovery.topics)[number];

const ACCENT: Record<string, string> = {
  PLANET: "#2E2EFF",
  OCE4N: "#2E2EFF",
  E4RTH: "#3AE86F",
  S4PIENS: "#FF4D22",
};

function topicBySlug(slug: string) {
  return (discovery.topics as DiscoveryTopic[]).find((topic) => topic.slug === slug);
}

function atlasEmbedHref(atlasHref: string, embedKind: string) {
  const [, raw = ""] = atlasHref.split("?");
  const params = new URLSearchParams(raw);
  params.set("embed", embedKind.toLowerCase());
  params.set("surface", "discovery");
  return `/embed/atlas?${params.toString()}`;
}

function AtlasEmbed({
  href,
  embedKind,
  title,
  note,
  eager = false,
}: {
  href: string;
  embedKind: string;
  title: string;
  note: string;
  eager?: boolean;
}) {
  const embedded = atlasEmbedHref(href, embedKind);
  return (
    <section className="discovery-atlas" aria-labelledby="discovery-atlas-title">
      <div className="editorial-wrap discovery-atlas__head">
        <div className="editorial-kicker">4PLANET ATLAS</div>
        <div className="discovery-atlas__title-row">
          <div>
            <h2 id="discovery-atlas-title">{title}</h2>
            <p>{note}</p>
          </div>
          <a
            className="discovery-atlas__open"
            href={href}
            onClick={() => trackEvent("discovery_atlas_open", { product_area: "discovery", atlas_title: title })}
          >
            OPEN FULL ATLAS →
          </a>
        </div>
      </div>
      <div className="discovery-atlas__frame-wrap">
        <iframe
          className="discovery-atlas__frame"
          src={embedded}
          title={`4PLANET ATLAS — ${title}`}
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <div
        className="editorial-wrap discovery-atlas__fallback"
        role="note"
        aria-label="ATLAS embed fallback"
      >
        <strong>ATLAS EMBED FALLBACK</strong>
        <span>If the embedded map is unavailable, open the same governed view in full ATLAS.</span>
        <a
          href={href}
          onClick={() => trackEvent("discovery_atlas_fallback_open", { product_area: "discovery", atlas_title: title })}
        >
          OPEN THE SAME VIEW IN FULL ATLAS →
        </a>
      </div>
    </section>
  );
}

function SourceList({ topic }: { topic: DiscoveryTopic }) {
  return (
    <section className="editorial-section discovery-source-section">
      <div className="editorial-kicker">Sources</div>
      <div className="editorial-list">
        {topic.sources.map((source) => (
          <a
            key={source.url}
            className="editorial-source"
            href={source.url}
            target="_blank"
            rel="noreferrer"
            onClick={() =>
              trackEvent("source_opened", {
                product_area: "discovery",
                object_kind: "topic",
                object_slug: topic.slug,
                source_authority: source.authority,
              })
            }
          >
            <strong>{source.authority}</strong>
            <span>{source.label} ↗</span>
          </a>
        ))}
      </div>
      <div className="editorial-meta">LAST CHECKED {discovery.updatedAt}</div>
    </section>
  );
}

export function DiscoveryTopicPage({ slug }: { slug: string }) {
  const topic = topicBySlug(slug);
  if (!topic) return <NotFound />;

  const path = `/${topic.slug}`;
  const accent = ACCENT[topic.domain] ?? "#2E2EFF";
  const style = { "--discovery-accent": accent } as CSSProperties;

  return (
    <PublicShell>
      <Seo
        title={topic.title}
        description={topic.description}
        path={path}
        robots={topic.indexable ? "index,follow,max-image-preview:large" : "noindex,follow"}
        imageAlt={`${topic.name} — 4PLANET`}
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: topic.title,
              description: topic.description,
              url: canonicalUrl,
              dateModified: discovery.updatedAt,
              inLanguage: "en-GB",
              publisher: { "@type": "Organization", name: "4PLANET", url: "https://4planet.org/" },
              about: { "@type": "Thing", name: topic.name },
              citation: topic.sources.map((source) => source.url),
              isPartOf: { "@type": "WebSite", name: "4PLANET", url: "https://4planet.org/" },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "4PLANET", item: "https://4planet.org/" },
                { "@type": "ListItem", position: 2, name: topic.name, item: canonicalUrl },
              ],
            },
          ],
        })}
      />
      <div className="editorial-page discovery-page" style={style}>
        <div className="editorial-wrap">
          <header className="editorial-hero discovery-hero">
            <div className="editorial-kicker">4PLANET / {topic.domain}</div>
            <h1>{topic.name}</h1>
            <p className="editorial-deck">{topic.answer}</p>
            <div className="editorial-actions">
              <a
                href={topic.atlasHref}
                className="editorial-primary discovery-primary"
                onClick={() =>
                  trackEvent("discovery_object_explore", {
                    object_kind: "topic",
                    object_slug: topic.slug,
                    product_area: "discovery",
                  })
                }
              >
                EXPLORE IN ATLAS →
              </a>
              <Link to="/now" className="editorial-secondary">EARTH NOW</Link>
            </div>
          </header>

          <section className="discovery-fact-strip" aria-label="Key facts">
            {topic.keyFacts.map((fact, index) => (
              <div className="discovery-fact" key={fact}>
                <span>0{index + 1}</span>
                <p>{fact}</p>
              </div>
            ))}
          </section>
        </div>

        <AtlasEmbed
          href={topic.atlasHref}
          embedKind={topic.embedKind}
          title={topic.atlasLabel}
          note={topic.atlasContextNote}
        />

        <div className="editorial-wrap">
          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">What is happening</div>
            <div>
              <h2>What the evidence shows</h2>
              <p className="editorial-copy">{topic.happening}</p>
            </div>
          </section>

          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">Why it matters</div>
            <div>
              <h2>Why it matters</h2>
              <p className="editorial-copy">{topic.whyItMatters}</p>
            </div>
          </section>

          <section className="editorial-section discovery-evidence">
            <div>
              <div className="editorial-kicker">What the sources establish</div>
              <p>{topic.sourceEstablishes}</p>
            </div>
            <div>
              <div className="editorial-kicker">What they do not establish</div>
              <p>{topic.sourceDoesNotEstablish}</p>
            </div>
          </section>

          <SourceList topic={topic} />

          <section className="editorial-section">
            <div className="editorial-kicker">Continue through 4PLANET</div>
            <div className="editorial-list">
              {topic.related.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="editorial-row discovery-related"
                  onClick={() =>
                    trackEvent("discovery_object_next", {
                      object_kind: "topic",
                      object_slug: topic.slug,
                      next_path: item.href,
                    })
                  }
                >
                  {item.label}<span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}

const EARTH_VIEWS = [
  { id: "events", label: "Events", title: "Natural events", layers: "bluemarble,events,quakes,fires", note: "Explore reported wildfires, earthquakes and other natural events.", signals: [0, 1] },
  { id: "ocean", label: "Ocean", title: "Ocean conditions", layers: "bluemarble,coral,sst", note: "See sea-surface temperature and accumulated heat stress on coral reefs.", signals: [3, 6] },
  { id: "land", label: "Land", title: "Forests and land", layers: "bluemarble,forest", note: "Explore mapped tree-cover change. These are historical assessments, not a live forest feed.", signals: [4] },
  { id: "air", label: "Air", title: "Our atmosphere", layers: "bluemarble,aerosol", note: "Explore satellite aerosol observations. These are not street-level air-quality readings.", signals: [5] },
  { id: "life", label: "Life", title: "Life on Earth", layers: "bluemarble,biodiv", note: "Explore reported biodiversity observations, not live animal locations or complete species ranges.", signals: [7] },
] as const;

const SIGNAL_NAMES: Record<number, string> = {
  0: "Wildfires", 1: "Earthquakes", 3: "Coral heat stress", 4: "Forest change",
  5: "Aerosols and air quality", 6: "Ocean temperature", 7: "Biodiversity observations",
};

export function EarthNowPage() {
  const now = discovery.earthNow;
  const [params, setParams] = useSearchParams();
  const view = EARTH_VIEWS.find((item) => item.id === params.get("view")) ?? EARTH_VIEWS[0];
  const atlasParams = new URLSearchParams(now.atlasHref.split("?")[1]);
  atlasParams.set("l", view.layers);
  const atlasHref = `/atlas?${atlasParams.toString()}`;
  const indexableTopics = (discovery.topics as DiscoveryTopic[]).filter((topic) => topic.indexable);

  return (
    <PublicShell>
      <Seo title={now.title} description={now.description} path="/now" imageAlt="Earth Now — 4PLANET"
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org", "@type": "CollectionPage", name: now.title,
          description: now.description, url: canonicalUrl, dateModified: discovery.updatedAt,
          inLanguage: "en-GB", publisher: { "@type": "Organization", name: "4PLANET", url: "https://4planet.org/" },
          hasPart: now.signals.map((signal) => ({ "@type": "WebPage", name: signal.label, url: new URL(signal.href, canonicalUrl).toString() })),
        })}
      />
      <div className="editorial-page discovery-page discovery-now">
        <header className="earth-now-intro editorial-wrap">
          <p className="earth-now-eyebrow">4PLANET / EARTH NOW</p>
          <h1>A living planet.<br />A clearer view.</h1>
          <p>Explore what is happening across Earth. Choose a view to see natural events and environmental change in context.</p>
        </header>

        <div className="editorial-wrap earth-now-explorer">
          <nav className="earth-now-views" aria-label="Choose an Earth view">
            {EARTH_VIEWS.map((item) => (
              <button key={item.id} type="button" aria-pressed={view.id === item.id}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  if (item.id === "events") next.delete("view"); else next.set("view", item.id);
                  setParams(next, { preventScrollReset: true });
                  trackEvent("earth_now_view_selected", { product_area: "discovery", view: item.id });
                }}>
                {item.label}
              </button>
            ))}
          </nav>
          <section className="earth-now-map" aria-labelledby="earth-now-map-title">
            <div className="earth-now-map__heading">
              <div><h2 id="earth-now-map-title">{view.title}</h2><p>{view.note}</p></div>
              <a className="earth-now-open" href={atlasHref}>Open full map <span aria-hidden="true">↗</span></a>
            </div>
            <div className="earth-now-map__frame">
              <iframe key={view.id} src={atlasEmbedHref(atlasHref, "NEWS")} title={`Interactive Earth map: ${view.title}`}
                loading="eager" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
            </div>
            <p className="earth-now-caption">Latest available from each source. Select a marker for its details. Open the full map for layer sources and dates.</p>
          </section>

          <section className="earth-now-reading" aria-labelledby="earth-now-reading-title">
            <h2 id="earth-now-reading-title">Understand this view</h2>
            <div className="earth-now-guides">
              {view.signals.map((index) => {
                const signal = now.signals[index];
                return <Link key={index} to={signal.href} className="earth-now-guide"
                  onClick={() => trackEvent("earth_now_signal_open", { product_area: "discovery", signal: signal.label })}>
                  <div><h3>{SIGNAL_NAMES[index]}</h3><p>{signal.detail}</p><span className="earth-now-source">{signal.layers}</span></div>
                  <span className="earth-now-guide__action">Read guide <span aria-hidden="true">→</span></span>
                </Link>;
              })}
            </div>
          </section>

          <details className="earth-now-details">
            <summary>About the data</summary>
            <div><p>{now.truthBoundary}</p><p>Sources include NASA, the US Geological Survey, NOAA, Global Forest Watch, GBIF and OBIS. Observation times, coverage and limitations differ. A visible layer is not an emergency warning service.</p><p>Guide content reviewed {new Date(discovery.updatedAt + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. This is not the observation time of the map data.</p></div>
          </details>
          <details className="earth-now-details earth-now-details--guides">
            <summary>Explore all guides</summary>
            <nav aria-label="Earth and nature guides" className="earth-now-all-guides">
              {indexableTopics.map((topic) => <Link key={topic.slug} to={`/${topic.slug}`}>{topic.name}<span aria-hidden="true">↗</span></Link>)}
            </nav>
          </details>
        </div>
      </div>
    </PublicShell>
  );
}

export const DISCOVERY_TOPIC_SLUGS = discovery.topics
  .filter((topic) => topic.indexable)
  .map((topic) => topic.slug);
