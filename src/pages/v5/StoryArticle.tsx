import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { MagazineSeo } from "@/components/MagazineSeo";
import {
  trackMagazineEntry,
  trackMagazineEngagedRead,
  trackMagazineReadDepth,
  trackMagazineReadComplete,
  trackMagazineSave,
  trackMagazineShare,
  trackMagazineRelatedStoryOpen,
  trackMagazineSourceOpen,
  trackMagazineSecondObject,
} from "@/analytics/MagazineAnalytics";
import { Editorial } from "@/components/Editorial";
import { storyBySlug, relatedStories } from "@/content/stories";
import { featureForStory } from "@/content/magazineFeatures";
import { standfirstForStory } from "@/content/magazineStandfirsts";
import { MAGAZINE_STORY_MODES, MAGAZINE_TOPICS } from "@/content/magazineOperating";
import { MAGAZINE_ARTICLE_TEMPLATES } from "@/content/magazineEngine";
import { experienceForStory } from "@/content/magazineExperience";
import { isStorySaved, recordMagazineRecent, recordMagazineResume, toggleSavedStory } from "@/content/magazineReader";
import { img, missionSecondary } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-article.css";
import "@/styles/magazine-article-gold.css";
import "@/styles/magazine-article-modes.css";
import "@/styles/magazine-article-round-06.css";
import "@/styles/magazine-article-premium-reader.css";
import "@/styles/magazine-world.css";

const DEPTH_THRESHOLDS = [25, 50, 75, 90] as const;
type ReadingSize = "standard" | "large";

function editorialLabel(type: string) {
  if (type === "SOURCE_REPORTED_EDITORIAL") return "4PLANET EDITORIAL · REPORTED FROM PUBLISHED SOURCES";
  if (type === "ORGANISATIONAL_EXPLAINER") return "4PLANET ORGANISATIONAL EXPLAINER";
  if (type === "PARTNER_SUBMITTED") return "PARTNER-SUBMITTED · EDITORIALLY REVIEWED";
  return "4PLANET MAGAZINE EDITORIAL";
}

function initialReadingSize(): ReadingSize {
  if (typeof window === "undefined") return "standard";
  return window.localStorage.getItem("4planet.magazine.reading-size") === "large" ? "large" : "standard";
}

export function StoryArticle() {
  const { slug } = useParams();
  const s = slug ? storyBySlug(slug) : undefined;
  const progressRef = useRef<HTMLSpanElement>(null);
  const [saved, setSaved] = useState(false);
  const [readingSize, setReadingSize] = useState<ReadingSize>(initialReadingSize);

  useEffect(() => {
    if (!s) return;
    setSaved(isStorySaved(s.slug));
    recordMagazineRecent(s.slug, s.title);
    trackMagazineEntry("article", s.slug);
    const seen = new Set<number>();
    let completed = false;
    const engagedTimer = window.setTimeout(() => trackMagazineEngagedRead(s.slug, 30), 30_000);

    const measureDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (progressRef.current) progressRef.current.style.width = `${depth}%`;
      DEPTH_THRESHOLDS.forEach((threshold) => {
        if (depth >= threshold && !seen.has(threshold)) {
          seen.add(threshold);
          trackMagazineReadDepth(s.slug, threshold);
          recordMagazineResume(s.slug, s.title, threshold);
        }
      });
      if (depth >= 90 && !completed) {
        completed = true;
        recordMagazineResume(s.slug, s.title, 100);
        trackMagazineReadComplete(s.slug);
      }
    };

    window.addEventListener("scroll", measureDepth, { passive: true });
    measureDepth();
    return () => {
      window.clearTimeout(engagedTimer);
      window.removeEventListener("scroll", measureDepth);
    };
  }, [s]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("4planet.magazine.reading-size", readingSize);
  }, [readingSize]);

  if (!s) return <NotFound />;

  const feature = featureForStory(s.slug);
  const articleBlocks = feature?.blocks ?? s.blocks;
  const heroKey = feature?.hero ?? s.image;
  const media = img(heroKey);
  const secondaryMedia = feature?.secondaryMission
    ? missionSecondary(feature.secondaryMission)
    : feature?.secondary
      ? img(feature.secondary)
      : undefined;
  const mode = MAGAZINE_STORY_MODES[s.mode];
  const template = MAGAZINE_ARTICLE_TEMPLATES.find((candidate) => candidate.id === s.franchise);
  const more = relatedStories(s, 3);
  const nextStory = more[0];
  const experience = experienceForStory(s);
  const standfirst = standfirstForStory(s.slug, s.dek);
  const articleWords = articleBlocks.reduce((total, block) => total + block.t.trim().split(/\s+/).filter(Boolean).length, 0);
  const readMins = Math.max(s.readMins, Math.ceil(articleWords / 190));

  const sourceMap = new Map<string, NonNullable<typeof s.sourceLinks>[number]>();
  for (const source of s.sourceLinks ?? []) sourceMap.set(source.url, source);
  for (const source of feature?.addedSources ?? []) sourceMap.set(source.url, source);
  const sources = Array.from(sourceMap.values());

  const firstLaterSub = articleBlocks.findIndex((block, index) => index > 4 && block.k === "sub");
  const splitAt = firstLaterSub > 0 ? firstLaterSub : Math.ceil(articleBlocks.length / 2);
  const articleBeforeVisual = secondaryMedia ? articleBlocks.slice(0, splitAt) : articleBlocks;
  const articleAfterVisual = secondaryMedia ? articleBlocks.slice(splitAt) : [];

  const shareStory = async () => {
    const url = window.location.href;
    const data = { title: s.title, text: standfirst, url };
    if (navigator.share) {
      try {
        await navigator.share(data);
        trackMagazineShare(s.slug, "native");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard?.writeText(url);
      trackMagazineShare(s.slug, "copy");
    } catch {
      // Reading never depends on clipboard support.
    }
  };

  const toggleSave = () => {
    const next = toggleSavedStory(s.slug);
    setSaved(next);
    trackMagazineSave(s.slug, next ? "saved" : "removed");
  };

  return (
    <MagazineShell>
      <MagazineSeo
        title={`${s.title} | 4PLANET MAGAZINE`}
        description={standfirst}
        path={`/magazine/${s.slug}`}
        image={media.src}
        imageAlt={media.alt}
        section={s.lane}
        tags={s.tags}
        jsonLd={({ canonicalUrl, imageUrl }) => ({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: s.title,
          description: standfirst,
          image: [imageUrl],
          mainEntityOfPage: canonicalUrl,
          author: { "@type": "Organization", name: s.byline },
          publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: new URL("/magazine", canonicalUrl).toString() },
          isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: new URL("/magazine", canonicalUrl).toString() },
          articleSection: s.category,
          keywords: s.tags.join(", "),
          about: s.tags.map((name) => ({ "@type": "Thing", name })),
          datePublished: s.asOf,
          dateModified: s.asOf,
          citation: sources.map((source) => source.url),
        })}
      />

      <div className="mag-reading-progress" aria-hidden><span ref={progressRef} /></div>

      <article className={`mag-article-world mag-premium-reader mag-experience mag-experience--${experience.toLowerCase().replace(/_/g, "-")}`} data-longform={feature ? "true" : "false"}>
        <header className="mag-article-world-header">
          <div className="mag-article-world-kicker">
            <span>{template?.label ?? s.franchise.replace(/_/g, " ")}</span><span>·</span><span>{mode.label}</span><span>·</span><span>{readMins} MIN</span>{s.location ? <><span>·</span><span>{s.location}</span></> : null}
          </div>
          <h1>{s.title}</h1>
        </header>

        <section className="mag-article-world-hero">
          <figure>
            <img src={media.src} alt={media.alt} loading="eager" decoding="async" fetchPriority="high" />
            <figcaption>
              <strong>{media.credit ? `${media.credit} · ` : ""}{media.alt}</strong>
              <span>{s.imageContextNote ?? (s.imageRole === "DOCUMENTARY" ? "Documentary image." : "Context image; not evidence for the claims in this story.")}</span>
            </figcaption>
          </figure>
        </section>

        <section className="mag-article-world-intro" aria-label="Story introduction">
          <p className="mag-article-world-dek">{standfirst}</p>
          <div className="mag-article-world-meta">
            <div><span>BY {s.byline}</span><span>{editorialLabel(s.editorialType)}</span>{s.asOf ? <span>AS OF {s.asOf}</span> : null}</div>
            <div className="mag-reader-actions">
              <button type="button" aria-pressed={saved} onClick={toggleSave}>{saved ? "SAVED ✓" : "SAVE +"}</button>
              <button type="button" aria-pressed={readingSize === "large"} onClick={() => setReadingSize((value) => value === "standard" ? "large" : "standard")}>{readingSize === "large" ? "TEXT A" : "TEXT A+"}</button>
              <button type="button" onClick={shareStory}>SHARE ↗</button>
            </div>
          </div>
        </section>

        <section className="mag-article-world-body">
          <div className="mag-article-world-reading">
            <Editorial blocks={articleBeforeVisual} readingSize={readingSize} reveal={false} />
          </div>
        </section>

        {secondaryMedia ? (
          <figure className="mag-article-inline-visual">
            <div className="mag-article-inline-media"><img src={secondaryMedia.src} alt={secondaryMedia.alt} loading="lazy" decoding="async" /></div>
            <figcaption>
              <span>{feature?.secondaryKicker}</span>
              <strong>{feature?.secondaryCaption}</strong>
              <p>{feature?.secondaryNote}</p>
            </figcaption>
          </figure>
        ) : null}

        {articleAfterVisual.length ? (
          <section className="mag-article-world-body mag-article-world-body--continuation">
            <div className="mag-article-world-reading">
              <Editorial blocks={articleAfterVisual} readingSize={readingSize} reveal={false} />
            </div>
          </section>
        ) : null}

        <section className="mag-source-desk" aria-labelledby="source-desk-title">
          <div className="mag-source-desk-inner">
            <div><p className="mag-source-label">HOW WE KNOW</p><h2 id="source-desk-title">The evidence stays attached.</h2></div>
            <div className="mag-source-desk-copy">
              <p>{s.reportingNote ?? template?.trustRule ?? "Material claims should remain traceable to source objects, while uncertainty and corrections remain visible."}</p>
              {sources.length ? (
                <div className="mag-source-list">
                  {sources.map((source, index) => (
                    <a
                      className="mag-source-item"
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      key={source.url}
                      onClick={() => trackMagazineSourceOpen(s.slug, source.url, source.label)}
                    >
                      <div><span className="mag-source-number">{String(index + 1).padStart(2, "0")}</span><strong>{source.label}</strong><span>{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ""}</span></div><b>OPEN SOURCE ↗</b>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mag-source-list"><Link className="mag-source-item" to="/magazine/sources"><div><strong>4PLANET Sources & Method</strong><span>Organisational explainer source workflow</span></div><b>OPEN →</b></Link></div>
              )}
              <div className="mag-trust-links"><Link to="/magazine/sources">SOURCES & METHOD →</Link><Link to="/magazine/corrections">CORRECTIONS →</Link></div>
            </div>
          </div>
        </section>

        {s.topics?.length ? (
          <nav className="mag-article-topics" aria-label="Story topics">
            {s.topics.map((topicId) => {
              const topic = MAGAZINE_TOPICS.find((candidate) => candidate.id === topicId);
              return <Link key={topicId} to={`/magazine/topics/${topicId.toLowerCase()}`}>{topic?.label ?? topicId}</Link>;
            })}
          </nav>
        ) : null}

        {s.pathway ? (
          <section className="mag-second-object" aria-labelledby="second-object-title">
            <div className="mag-second-object-inner">
              <p className="mono">ONE USEFUL NEXT OBJECT</p>
              <h2 id="second-object-title">Keep the context. Go deeper.</h2>
              <p className="mag-second-object-note">{template?.secondObjectRule}</p>
              <Link to={s.pathway.to} onClick={() => trackMagazineSecondObject(s.slug, s.pathway!.to, s.pathway!.kind)}>{s.pathway.label} <span aria-hidden>→</span></Link>
            </div>
          </section>
        ) : null}

        <section className="mag-related-editorial" aria-labelledby="related-editorial-title">
          <header className="mag-related-editorial-head">
            <h2 id="related-editorial-title">Keep reading.</h2>
            <div className="mag-end-tools"><button type="button" className="mag-share-button" onClick={toggleSave}>{saved ? "SAVED ✓" : "SAVE FOR LATER +"}</button><button type="button" className="mag-share-button" onClick={shareStory}>SHARE THIS STORY ↗</button></div>
          </header>
          <div className="mag-related-editorial-grid">
            {more.map((story) => {
              const relatedFeature = featureForStory(story.slug);
              const relatedMedia = img(relatedFeature?.hero ?? story.image);
              return (
                <Link className="mag-related-editorial-card" key={story.slug} to={`/magazine/${story.slug}`} onClick={() => {
                  trackMagazineRelatedStoryOpen(s.slug, story.slug);
                  trackMagazineSecondObject(s.slug, `/magazine/${story.slug}`, "related_story");
                }}>
                  <img src={relatedMedia.src} alt={relatedMedia.alt} loading="lazy" decoding="async" />
                  <span>{story.category} · {experienceForStory(story).replace(/_/g, " ")} · {story.readMins} MIN</span>
                  <strong>{story.title}</strong>
                </Link>
              );
            })}
          </div>
          {nextStory ? <Link className="mag-next-story" to={`/magazine/${nextStory.slug}`} onClick={() => trackMagazineRelatedStoryOpen(s.slug, nextStory.slug)}>NEXT STORY — {nextStory.title} →</Link> : null}
        </section>
      </article>
    </MagazineShell>
  );
}
