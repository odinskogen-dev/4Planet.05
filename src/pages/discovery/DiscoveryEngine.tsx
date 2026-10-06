import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import discovery from "@/data/discoveryTopics.json";
import { PublicShell } from "@/components/layout/PublicShell";
import { Seo } from "@/components/Seo";
import { NotFound } from "@/pages/system";
import { trackEvent } from "@/analytics/Analytics";
import "@/styles/human-first-public.css";

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
  return `https://4planetatlas.com/?${params.toString()}`;
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
              <h2>Read the latest available evidence in context.</h2>
              <p className="editorial-copy">{topic.happening}</p>
            </div>
          </section>

          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">Why it matters</div>
            <div>
              <h2>Useful before it is simplified.</h2>
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

export function EarthNowPage() {
  const now = discovery.earthNow;
  const atlasHref = now.atlasHref;
  const indexableTopics = (discovery.topics as DiscoveryTopic[]).filter((topic) => topic.indexable);

  return (
    <PublicShell>
      <Seo
        title={now.title}
        description={now.description}
        path="/now"
        imageAlt="Earth Now — 4PLANET"
        jsonLd={({ canonicalUrl }) => ({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: now.title,
              description: now.description,
              url: canonicalUrl,
              dateModified: discovery.updatedAt,
              inLanguage: "en-GB",
              publisher: { "@type": "Organization", name: "4PLANET", url: "https://4planet.org/" },
              hasPart: now.signals.map((signal) => ({
                "@type": "WebPage",
                name: signal.label,
                url: new URL(signal.href, canonicalUrl).toString(),
              })),
            },
            {
              "@type": "ItemList",
              name: "4PLANET Earth Now signals",
              itemListElement: now.signals.map((signal, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: signal.label,
                url: new URL(signal.href, canonicalUrl).toString(),
              })),
            },
          ],
        })}
      />
      <div className="editorial-page discovery-page discovery-now" style={{ "--discovery-accent": "#2E2EFF" } as CSSProperties}>
        <div className="discovery-now__hero">
          <div className="editorial-wrap">
            <div className="editorial-kicker">4PLANET / EARTH NOW</div>
            <h1>What is happening on Earth right now?</h1>
            <p className="editorial-deck">{now.answer}</p>
            <div className="discovery-now__status">
              <strong>LATEST AVAILABLE</strong>
              <span>Every source keeps its own clock, coverage and limitations.</span>
            </div>
          </div>
        </div>

        <AtlasEmbed
          href={atlasHref}
          embedKind={now.embedKind}
          title="Earth — latest available signals"
          note="Move across fires, earthquakes, natural events, coral heat stress, forest change, atmosphere and biodiversity. A visible layer is not automatically live."
          eager
        />

        <div className="editorial-wrap">
          <section className="editorial-section">
            <div className="editorial-kicker">Signals</div>
            <div className="discovery-signal-list">
              {now.signals.map((signal, index) => (
                <Link
                  key={`${signal.label}-${index}`}
                  to={signal.href}
                  className="discovery-signal-row"
                  onClick={() => trackEvent("earth_now_signal_open", { product_area: "discovery", signal: signal.label })}
                >
                  <span className="discovery-signal-row__index">{String(index + 1).padStart(2, "0")}</span>
                  <strong>{signal.label}</strong>
                  <span>{signal.detail}</span>
                  <small>{signal.layers}</small>
                  <b aria-hidden>→</b>
                </Link>
              ))}
            </div>
          </section>

          <section className="editorial-section editorial-split">
            <div className="editorial-kicker">Read this correctly</div>
            <div>
              <h2>Now is not one clock.</h2>
              <p className="editorial-copy">{now.truthBoundary}</p>
            </div>
          </section>

          <section className="editorial-section">
            <div className="editorial-kicker">Explore permanent 4PLANET guides</div>
            <div className="discovery-topic-index">
              {indexableTopics.map((topic) => (
                <Link key={topic.slug} to={`/${topic.slug}`} className="discovery-topic-index__row">
                  <span>{topic.name}</span>
                  <small>{topic.domain}</small>
                  <b aria-hidden>→</b>
                </Link>
              ))}
            </div>
            <div className="editorial-meta">UPDATED {discovery.updatedAt}</div>
          </section>
        </div>
      </div>
    </PublicShell>
  );
}

export const DISCOVERY_TOPIC_SLUGS = discovery.topics
  .filter((topic) => topic.indexable)
  .map((topic) => topic.slug);
