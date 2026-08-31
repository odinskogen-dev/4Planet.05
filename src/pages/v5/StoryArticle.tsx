import { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { PublicShell } from "@/components/layout/PublicShell";
import { MagazineSeo } from "@/components/MagazineSeo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry, trackMagazineSecondObject, trackMagazineShare } from "@/analytics/MagazineAnalytics";
import { Section } from "@/components/ui";
import { CinematicImage, Reveal } from "@/components/Cinematic";
import { Editorial } from "@/components/Editorial";
import { storyBySlug, relatedStories } from "@/content/stories";
import { MAGAZINE_STORY_MODES } from "@/content/magazineOperating";
import { MAGAZINE_ARTICLE_TEMPLATES } from "@/content/magazineEngine";
import { img } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-article.css";
import "@/styles/magazine-article-gold.css";

const display: React.CSSProperties = { fontFamily: T.display, fontWeight: 500, letterSpacing: "-.03em" };
const DEPTH_THRESHOLDS = [25, 50, 75, 90] as const;

export function StoryArticle() {
  const { slug } = useParams();
  const s = slug ? storyBySlug(slug) : undefined;
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!s) return;

    trackMagazineEntry("article", s.slug);
    const seen = new Set<number>();
    let completed = false;
    const engagedTimer = window.setTimeout(() => {
      trackEvent("magazine_engaged_read", {
        story_slug: s.slug,
        content_type: s.editorialType.toLowerCase(),
        engaged_seconds: 30,
      });
    }, 30_000);

    const measureDepth = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const depth = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (progressRef.current) progressRef.current.style.width = `${depth}%`;

      DEPTH_THRESHOLDS.forEach((threshold) => {
        if (depth >= threshold && !seen.has(threshold)) {
          seen.add(threshold);
          trackEvent("magazine_read_depth", {
            story_slug: s.slug,
            content_type: s.editorialType.toLowerCase(),
            depth_percent: threshold,
          });
        }
      });

      if (depth >= 90 && !completed) {
        completed = true;
        trackEvent("magazine_read_complete", {
          story_slug: s.slug,
          content_type: s.editorialType.toLowerCase(),
        });
      }
    };

    window.addEventListener("scroll", measureDepth, { passive: true });
    measureDepth();

    return () => {
      window.clearTimeout(engagedTimer);
      window.removeEventListener("scroll", measureDepth);
    };
  }, [s]);

  if (!s) return <NotFound />;
  const more = relatedStories(s, 3);
  const nextStory = more[0];
  const media = img(s.image);
  const mode = MAGAZINE_STORY_MODES[s.mode];
  const template = MAGAZINE_ARTICLE_TEMPLATES.find((candidate) => candidate.id === s.franchise);

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
      // Sharing is an enhancement; reading must never depend on clipboard access.
    }
  };

  return (
    <PublicShell>
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
          publisher: { "@type": "Organization", name: "4PLANET_", url: new URL("/", canonicalUrl).toString() },
          isPartOf: { "@type": "CreativeWorkSeries", name: "4PLANET MAGAZINE", url: new URL("/magazine", canonicalUrl).toString() },
          articleSection: s.lane,
          keywords: s.tags.join(", "),
          about: s.tags.map((name) => ({ "@type": "Thing", name })),
        })}
      />

      <div className="mag-reading-progress" aria-hidden><span ref={progressRef} /></div>

      <article className="mag-article">
        <header className="mag-article-head">
          <Reveal>
            <div className="mag-article-identity">
              <Link to="/magazine" className="mono link">4PLANET MAGAZINE</Link>
              <span className="mono">{template?.label ?? s.franchise.replace(/_/g, " ")} · {mode.label} · {s.readMins} MIN</span>
            </div>
            <h1 style={display}>{s.title}</h1>
            <p className="mag-article-dek">{s.dek}</p>
            <div className="mag-byline-row">
              <div>
                <span className="mono">BY</span>
                <strong>{s.byline}</strong>
              </div>
              <span className="mono">{s.editorialType.replace(/_/g, " ")}</span>
            </div>
            <div className="mag-article-meta-row">
              <span className="mono">{s.lane}</span>
              <span className="mono">{s.editorialType === "ORGANISATIONAL_EXPLAINER" ? "ORGANISATIONAL CONTENT — NOT INDEPENDENT EDITORIAL" : "EDITORIAL CONTENT"}</span>
              <button type="button" className="mag-share-button" onClick={shareStory}>SHARE ↗</button>
            </div>
          </Reveal>
        </header>

        <CinematicImage meta={media} height="min(82vh, 920px)" caption={`${media.credit ? `${media.credit} · ` : ""}${media.alt}`} accent={T.blue} />

        <Section pad="clamp(54px,8vw,118px)">
          <div className="mag-article-reading-column">
            <Editorial blocks={s.blocks} />
          </div>
        </Section>

        <section className="mag-how-we-know" aria-labelledby="how-we-know-title">
          <div className="mag-how-we-know-inner">
            <div>
              <p className="mono mag-trust-kicker">HOW WE KNOW</p>
              <h2 id="how-we-know-title">Trust belongs inside the story.</h2>
            </div>
            <div className="mag-trust-copy">
              <p>{template?.trustRule ?? "Material public claims should remain traceable to source objects, and corrections stay visible rather than disappearing into silent edits."}</p>
              <p className="mag-trust-context">This page is {s.editorialType === "ORGANISATIONAL_EXPLAINER" ? "4PLANET-owned explanatory content" : "Magazine editorial content"}. Its content type remains visible so product, partner and independent editorial claims do not borrow credibility from one another.</p>
              <div className="mag-trust-links">
                <Link to="/magazine/sources">SOURCES & METHOD →</Link>
                <Link to="/magazine/corrections">CORRECTIONS →</Link>
              </div>
            </div>
          </div>
        </section>

        {s.pathway ? (
          <section className="mag-second-object" aria-labelledby="second-object-title">
            <div className="mag-second-object-inner">
              <p className="mono">ONE USEFUL NEXT STEP</p>
              <h2 id="second-object-title">Go deeper without starting over.</h2>
              <p className="mag-second-object-note">{template?.secondObjectRule}</p>
              <Link
                to={s.pathway.to}
                onClick={() => trackMagazineSecondObject(s.slug, s.pathway!.to, s.pathway!.kind)}
              >
                {s.pathway.label} <span aria-hidden>→</span>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mag-end-rail" aria-label="Article actions">
          <div className="mag-end-rail-inner">
            <div>
              <span className="mono">FINISHED THIS STORY?</span>
              <strong>Do one useful thing more.</strong>
            </div>
            <div className="mag-end-actions">
              <button type="button" onClick={shareStory}>SHARE THIS STORY ↗</button>
              {nextStory ? (
                <Link
                  to={`/magazine/${nextStory.slug}`}
                  onClick={() => trackMagazineSecondObject(s.slug, `/magazine/${nextStory.slug}`, "related_story")}
                >
                  NEXT: {nextStory.title} →
                </Link>
              ) : <Link to="/magazine">BACK TO MAGAZINE →</Link>}
            </div>
          </div>
        </section>

        <section className="mag-related" aria-labelledby="related-title">
          <div className="mag-related-head">
            <p className="mono">KEEP READING</p>
            <h2 id="related-title">Related by subject, not popularity.</h2>
          </div>
          <div className="mag-related-grid">
            {more.map((m) => {
              const relatedMedia = img(m.image);
              return (
                <Link
                  key={m.slug}
                  to={`/magazine/${m.slug}`}
                  onClick={() => {
                    trackEvent("magazine_story_open", { story_slug: m.slug, content_type: m.editorialType.toLowerCase(), source_story: s.slug });
                    trackMagazineSecondObject(s.slug, `/magazine/${m.slug}`, "related_story");
                  }}
                  className="mag-related-card"
                >
                  <div className="mag-related-media"><img src={relatedMedia.src} alt={relatedMedia.alt} loading="lazy" /></div>
                  <div className="mag-related-copy">
                    <span className="mono">{m.franchise.replace(/_/g, " ")} · {m.readMins} MIN</span>
                    <strong>{m.title}</strong>
                    <p>{m.dek}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </article>
    </PublicShell>
  );
}
