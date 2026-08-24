import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { MagazineSeo } from "@/components/MagazineSeo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry, trackMagazineSecondObject, trackMagazineShare } from "@/analytics/MagazineAnalytics";
import { Editorial } from "@/components/Editorial";
import { storyBySlug, relatedStories } from "@/content/stories";
import { featureForStory } from "@/content/magazineFeatures";
import { MAGAZINE_STORY_MODES, MAGAZINE_TOPICS } from "@/content/magazineOperating";
import { MAGAZINE_ARTICLE_TEMPLATES } from "@/content/magazineEngine";
import { experienceContractForStory, experienceForStory } from "@/content/magazineExperience";
import { isStorySaved, recordMagazineRecent, recordMagazineResume, toggleSavedStory } from "@/content/magazineReader";
import { img, missionSecondary } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-article.css";
import "@/styles/magazine-article-gold.css";
import "@/styles/magazine-article-modes.css";
import "@/styles/magazine-article-round-06.css";
import "@/styles/magazine-world.css";

const DEPTH_THRESHOLDS = [25, 50, 75, 90] as const;
type ReadingSize = "standard" | "large";

function editorialLabel(type: string) {
  if (type === "SOURCE_REPORTED_EDITORIAL") return "4PLANET EDITORIAL · REPORTED FROM PUBLISHED SOURCES";
  if (type === "ORGANISATIONAL_EXPLAINER") return "4PLANET ORGANISATIONAL EXPLAINER";
  if (type === "PARTNER_SUBMITTED") return "PARTNER-SUBMITTED · EDITORIALLY REVIEWED";
  return "4PLANET MAGAZINE EDITORIAL";
}

function sourceState(count: number, editorialType: string) {
  if (count > 0) return `${count} ATTACHED SOURCE${count === 1 ? "" : "S"}`;
  if (editorialType === "ORGANISATIONAL_EXPLAINER") return "4PLANET EXPLAINER METHOD";
  return "SOURCE METHOD INSIDE";
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
    const engagedTimer = window.setTimeout(() => {
      trackEvent("magazine_engaged_read", { story_slug: s.slug, content_type: s.editorialType.toLowerCase(), engaged_seconds: 30 });
    }, 30_000);

    const measureDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (progressRef.current) progressRef.current.style.width = `${depth}%`;
      DEPTH_THRESHOLDS.forEach((threshold) => {
        if (depth >= threshold && !seen.has(threshold)) {
          seen.add(threshold);
          trackEvent("magazine_read_depth", { story_slug: s.slug, content_type: s.editorialType.toLowerCase(), depth_percent: threshold });
          recordMagazineResume(s.slug, s.title, threshold);
        }
      });
      if (depth >= 90 && !completed) {
        completed = true;
        recordMagazineResume(s.slug, s.title, 100);
        trackEvent("magazine_read_complete", { story_slug: s.slug, content_type: s.editorialType.toLowerCase() });
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
  const experienceContract = experienceContractForStory(s);
  const sectionCount = articleBlocks.filter((block) => block.k === "sub").length + 1;
  const articleWords = articleBlocks.reduce((total, block) => total + block.t.trim().split(/\s+/).filter(Boolean).length, 0);
  const readMins = Math.max(s.readMins, Math.ceil(articleWords / 190));

  const sourceMap = new Map<string, NonNullable<typeof s.sourceLinks>[number]>();
  for (const source of s.sourceLinks ?? []) sourceMap.set(source.url, source);
  for (const source of feature?.addedSources ?? []) sourceMap.set(source.url, source);
  const sources = Array.from(sourceMap.values());
  const attachedSources = sources.length;

  const firstLaterSub = articleBlocks.findIndex((block, index) => index > 4 && block.k === "sub");
  const splitAt = firstLaterSub > 0 ? firstLaterSub : Math.ceil(articleBlocks.length / 2);
  const articleBeforeVisual = secondaryMedia ? articleBlocks.slice(0, splitAt) : articleBlocks;
  const articleAfterVisual = secondaryMedia ? articleBlocks.slice(splitAt) : [];

  const shareStory = async () => {
    const url = window.location.href;
    const data = { title: s.title, text: s.dek, url };
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
    trackEvent("magazine_save", { story_slug: s.slug, state: next ? "saved" : "removed" });
  };

  return (
    <MagazineShell>
      <MagazineSeo
        title={`${s.title} | 4PLANET MAGAZINE`}
        description={s.dek}
        path={`/magazine/${s.slug}`}
        image={media.src}
        imageAlt={media.alt}
        section={s.lane}
        tags={s.tags}
        jsonLd={({ canonicalUrl, imageUrl }) => ({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: s.title,
          description: s.dek,
          image: [imageUrl],
          mainEntityOfPage: canonicalUrl,
          author: { "@type": "Organization", name: s.byline },
          publisher: { "@type": "Organization", name: "4PLANET MAGAZINE", url: new URL("/magazine", canonicalUrl).toString() },
          isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: new URL("/magazine", canonicalUrl).toString() },
          articleSection: s.category,
          keywords: s.tags.join(", "),
          about: s.tags.map((name) => ({ "@type": "Thing", name })),
        })}
      />

      <div className="mag-reading-progress" aria-hidden><span ref={progressRef} /></div>

      <article className={`mag-article-world mag-experience mag-experience--${experience.toLowerCase().replace(/_/g, "-")}`} data-longform={feature ? "true" : "false"}>
        <header className="mag-article-world-header">
          <div className="mag-article-world-kicker">
            <span>{template?.label ?? s.franchise.replace(/_/g, " ")}</span><span>·</span><span>{experienceContract.label}</span><span>·</span><span>{mode.label}</span><span>·</span><span>{readMins} MIN</span>{s.location ? <><span>·</span><span>{s.location}</span></> : null}
          </div>
          <h1>{s.title}</h1>
          <p className="mag-article-world-dek">{s.dek}</p>
          <div className="mag-article-world-meta">
            <div><span>BY {s.byline}</span><span>{editorialLabel(s.editorialType)}</span>{s.asOf ? <span>AS OF {s.asOf}</span> : null}</div>
            <div className="mag-reader-actions">
              <button type="button" aria-pressed={saved} onClick={toggleSave}>{saved ? "SAVED ✓" : "SAVE +"}</button>
              <button type="button" aria-pressed={readingSize === "large"} onClick={() => setReadingSize((value) => value === "standard" ? "large" : "standard")}>{readingSize === "large" ? "TEXT A" : "TEXT A+"}</button>
              <button type="button" onClick={shareStory}>SHARE ↗</button>
            </div>
          </div>
        </header>

        {experience === "JOURNEY_FEATURE" ? (
          <section className="mag-journey-gateway" aria-label="Journey feature introduction">
            <div><span>JOURNEY FEATURE</span><strong>{s.location ?? "A living place"}</strong></div>
            <div><span>{sectionCount} CHAPTERS</span><p>{experienceContract.promise}</p></div>
            <div className="mag-journey-pulse" aria-hidden><i /><i /><i /></div>
          </section>
        ) : null}

        <section className="mag-article-world-hero">
          <figure>
            <img src={media.src} alt={media.alt} />
            <figcaption><strong>{media.credit ? `${media.credit} · ` : ""}{media.alt}</strong><span>{s.imageContextNote ?? (s.imageRole === "DOCUMENTARY" ? "Documentary image." : "Context image; not evidence for the claims in this story.")}</span></figcaption>
          </figure>
        </section>

        {s.topics?.length ? <nav className="mag-article-topics" aria-label="Story topics">{s.topics.map((topicId) => { const topic = MAGAZINE_TOPICS.find((candidate) => candidate.id === topicId); return <Link key={topicId} to={`/magazine/topics/${topicId.toLowerCase()}`}>{topic?.label ?? topicId}</Link>; })}</nav> : null}

        <section className="mag-story-facts" aria-label="Story context">
          <div><span>FORM</span><strong>{feature ? "LONGFORM FEATURE" : experienceContract.label}</strong></div>
          <div><span>EVIDENCE</span><strong>{sourceState(attachedSources, s.editorialType)}</strong></div>
          <div><span>VISUAL</span><strong>{s.imageRole === "DOCUMENTARY" ? "DOCUMENTARY" : "CONTEXT / DISCLOSED"}</strong></div>
          <div><span>NEXT OBJECT</span><strong>{s.pathway?.kind?.replace(/_/g, " ") ?? "RELATED READING"}</strong></div>
        </section>

        {experience === "INTELLIGENCE_STORY" ? (
          <section className="mag-intelligence-strip" aria-label="Intelligence story inspection layer">
            <div><span>QUESTION</span><strong>{s.dek}</strong></div>
            <div><span>EVIDENCE BASE</span><strong>{attachedSources ? `${attachedSources} attached primary / published source${attachedSources > 1 ? "s" : ""}` : "4PLANET source workflow"}</strong></div>
            <div><span>CONTEXT</span><strong>{[s.location, ...s.tags.slice(0, 3)].filter(Boolean).join(" · ")}</strong></div>
            <div><span>LIMIT</span><strong>{s.reportingNote ?? "Interpretation remains bounded by the source and method described below."}</strong></div>
          </section>
        ) : null}

        {experience === "VISUAL_ESSAY" ? <div className="mag-visual-breath" aria-hidden><span>IMAGE FIRST / CONTEXT ATTACHED</span></div> : null}

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
              {sources.length ? <div className="mag-source-list">{sources.map((source, index) => <a className="mag-source-item" href={source.url} target="_blank" rel="noreferrer" key={source.url}><div><span className="mag-source-number">{String(index + 1).padStart(2, "0")}</span><strong>{source.label}</strong><span>{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ""}</span></div><b>OPEN SOURCE ↗</b></a>)}</div> : <div className="mag-source-list"><Link className="mag-source-item" to="/magazine/sources"><div><strong>4PLANET Sources & Method</strong><span>Organisational explainer source workflow</span></div><b>OPEN →</b></Link></div>}
              <div className="mag-trust-links"><Link to="/magazine/sources">SOURCES & METHOD →</Link><Link to="/magazine/corrections">CORRECTIONS →</Link></div>
            </div>
          </div>
        </section>

        {s.pathway ? <section className="mag-second-object" aria-labelledby="second-object-title"><div className="mag-second-object-inner"><p className="mono">ONE USEFUL NEXT OBJECT</p><h2 id="second-object-title">Keep the context. Go deeper.</h2><p className="mag-second-object-note">{template?.secondObjectRule}</p><Link to={s.pathway.to} onClick={() => trackMagazineSecondObject(s.slug, s.pathway!.to, s.pathway!.kind)}>{s.pathway.label} <span aria-hidden>→</span></Link></div></section> : null}

        <section className="mag-related-editorial" aria-labelledby="related-editorial-title">
          <header className="mag-related-editorial-head"><h2 id="related-editorial-title">Keep reading.</h2><div className="mag-end-tools"><button type="button" className="mag-share-button" onClick={toggleSave}>{saved ? "SAVED ✓" : "SAVE FOR LATER +"}</button><button type="button" className="mag-share-button" onClick={shareStory}>SHARE THIS STORY ↗</button></div></header>
          <div className="mag-related-editorial-grid">{more.map((story) => { const relatedFeature = featureForStory(story.slug); const relatedMedia = img(relatedFeature?.hero ?? story.image); return <Link className="mag-related-editorial-card" key={story.slug} to={`/magazine/${story.slug}`} onClick={() => { trackEvent("magazine_story_open", { story_slug: story.slug, content_type: story.editorialType.toLowerCase(), source_story: s.slug }); trackMagazineSecondObject(s.slug, `/magazine/${story.slug}`, "related_story"); }}><img src={relatedMedia.src} alt={relatedMedia.alt} loading="lazy" /><span>{story.category} · {experienceForStory(story).replace(/_/g, " ")} · {story.readMins} MIN</span><strong>{story.title}</strong></Link>; })}</div>
          {nextStory ? <Link className="mag-next-story" to={`/magazine/${nextStory.slug}`}>NEXT STORY — {nextStory.title} →</Link> : null}
        </section>
      </article>
    </MagazineShell>
  );
}
