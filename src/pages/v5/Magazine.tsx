import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry } from "@/analytics/MagazineAnalytics";
import { STORIES, type Story } from "@/content/stories";
import { MAGAZINE_LANES, MAGAZINE_TOPICS, type MagazineLane, type MagazineTopicId } from "@/content/magazineOperating";
import { MAGAZINE_SIGNALS } from "@/content/magazineSignals";
import { experienceForStory } from "@/content/magazineExperience";
import { featureForStory, featureReadMins } from "@/content/magazineFeatures";
import { img, type ImageKey } from "@/content/imageRegistry";
import "@/styles/magazine.css";
import "@/styles/magazine-home.css";
import "@/styles/magazine-home-closure.css";
import "@/styles/magazine-world.css";

const MOSAIC_SIZES = ["lead", "portrait", "small", "wide", "compact", "small", "feature", "portrait", "small", "wide", "compact", "feature"] as const;
const MOSAIC_COLORS = ["", "ink", "", "", "blue", "", "", "", "", "", "", ""] as const;
const HOME_STORY_LIMIT = 12;
const HOME_SIGNAL_LIMIT = 4;

/* Kept as explicit fallback art direction; the longform feature layer now leads. */
const HOME_STORY_IMAGE_OVERRIDES: Partial<Record<string, ImageKey>> = {
  "sea-pen-instead-of-tank": "rewildMarineHero",
  "the-four-domains": "heroEarth",
};

/* Planet Signals use a separate visual bank from longform story heroes. */
const SIGNAL_IMAGES: ImageKey[] = [
  "foodHero",
  "en3rgyHero",
  "f4shionHero",
  "artHero",
];

function storyStatus(story: Story) {
  if (story.editorialType === "SOURCE_REPORTED_EDITORIAL") return "SOURCE-REPORTED";
  if (story.editorialType === "ORGANISATIONAL_EXPLAINER") return "4PLANET EXPLAINER";
  if (story.editorialType === "PARTNER_SUBMITTED") return "PARTNER-SUBMITTED";
  return "EDITORIAL";
}

function storyImageKey(story: Story): ImageKey {
  return featureForStory(story.slug)?.hero ?? HOME_STORY_IMAGE_OVERRIDES[story.slug] ?? story.image;
}

function safeImageFallback(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget;
  const fallback = img("heroEarth").src;
  if (target.src.endsWith(fallback)) return;
  target.src = fallback;
}

function StoryTile({ story, index }: { story: Story; index: number }) {
  const media = img(storyImageKey(story));
  const size = MOSAIC_SIZES[index % MOSAIC_SIZES.length];
  const colour = MOSAIC_COLORS[index % MOSAIC_COLORS.length];
  const experience = experienceForStory(story).replace(/_/g, " ");
  const readMins = featureReadMins(story.slug, story.readMins);
  const className = [
    "mag-story-tile",
    `mag-story-tile--${size}`,
    colour ? `mag-story-tile--${colour}` : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={className}>
      <div className="mag-story-tile-index">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{story.location ?? story.lane}</span>
      </div>
      <Link
        className="mag-story-media"
        to={`/magazine/${story.slug}`}
        onClick={() => trackEvent("magazine_story_open", { story_slug: story.slug, content_type: story.editorialType.toLowerCase(), placement: `mosaic_${size}` })}
      >
        <img src={media.src} alt={media.alt} loading={index < 3 ? "eager" : "lazy"} decoding="async" onError={safeImageFallback} />
      </Link>
      <div className="mag-story-copy">
        <div className="mag-story-kicker">
          <span>{story.category}</span><span>·</span><span>{storyStatus(story)}</span><span>·</span><span>{experience}</span><span>·</span><span>{readMins} MIN</span>
        </div>
        <h3><Link to={`/magazine/${story.slug}`}>{story.title}</Link></h3>
        <p>{story.dek}</p>
      </div>
    </article>
  );
}

function SignalTile({ index }: { index: number }) {
  const signal = MAGAZINE_SIGNALS[index];
  const media = img(SIGNAL_IMAGES[index % SIGNAL_IMAGES.length]);
  const layout = index === 0 ? "lead" : "compact";

  return (
    <Link
      className={`mag-signal-card mag-signal-card--${layout}`}
      data-accent={signal.accent}
      to={`/magazine/signals/${signal.slug}`}
    >
      <img className="mag-signal-card-media" src={media.src} alt={media.alt} loading="lazy" decoding="async" onError={safeImageFallback} />
      <div className="mag-signal-card-copy">
        <span>{String(index + 1).padStart(2, "0")} / {signal.publisher}</span>
        <h3>{signal.title}</h3>
        <p>{signal.dek}</p>
        <b>READ SIGNAL →</b>
      </div>
    </Link>
  );
}

function StoryStream() {
  const stories = STORIES.slice(0, 10);
  return (
    <section className="mag-story-stream" aria-labelledby="stream-title">
      <header className="mag-story-stream-head">
        <p className="mag-feed-kicker">KEEP MOVING / EDITORIAL STREAM</p>
        <h2 id="stream-title">More from the living world.</h2>
      </header>
      <div className="mag-story-stream-viewport">
        <div className="mag-story-stream-track">
          {[0, 1].map((copy) => (
            <div className="mag-story-stream-group" key={copy} aria-hidden={copy === 1 ? "true" : undefined}>
              {stories.map((story) => {
                const media = img(storyImageKey(story));
                const readMins = featureReadMins(story.slug, story.readMins);
                return (
                  <Link className="mag-story-stream-card" to={`/magazine/${story.slug}`} key={`${copy}-${story.slug}`} tabIndex={copy === 1 ? -1 : undefined}>
                    <img src={media.src} alt={copy === 1 ? "" : media.alt} loading="lazy" decoding="async" onError={safeImageFallback} />
                    <span>{story.category} · {readMins} MIN</span>
                    <strong>{story.title}</strong>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Magazine() {
  const [searchParams] = useSearchParams();
  const topicParam = searchParams.get("topic")?.toUpperCase() as MagazineTopicId | undefined;
  const laneParam = searchParams.get("lane")?.toUpperCase() as MagazineLane | undefined;
  const selectedTopic = MAGAZINE_TOPICS.find((topic) => topic.id === topicParam);
  const selectedLane = MAGAZINE_LANES.find((lane) => lane.id === laneParam);
  const feed = selectedTopic
    ? STORIES.filter((story) => story.topics?.includes(selectedTopic.id))
    : selectedLane
      ? STORIES.filter((story) => story.lane === selectedLane.id)
      : STORIES;
  const hero = img("m4gazineHero");
  const currentLabel = selectedTopic?.label ?? selectedLane?.id;
  const currentPromise = selectedTopic?.promise ?? selectedLane?.promise;
  const visibleStories = currentLabel ? feed : feed.slice(0, HOME_STORY_LIMIT);
  const visibleSignals = MAGAZINE_SIGNALS.slice(0, HOME_SIGNAL_LIMIT);
  const recurringVisual = img("cultureDomainHero");

  useEffect(() => { trackMagazineEntry("home"); }, []);

  return (
    <MagazineShell>
      <Seo
        title="4PLANET MAGAZINE — Nature, people, engineering and what works"
        description="A living-planet magazine about nature, field operators, science, engineering, design, culture and solutions — with sources and uncertainty inside the product."
        path="/magazine"
        image={hero.src}
      />

      <main className="mag-home">
        <section className="mag-home-hero" aria-labelledby="magazine-title">
          <div>
            <p className="mag-home-hero-kicker">4PLANET MAGAZINE / FOR A LIVING PLANET</p>
            <h1 id="magazine-title">The world is alive. So is the story.</h1>
          </div>
          <div className="mag-home-hero-aside">
            <figure className="mag-home-hero-visual">
              <img src={hero.src} alt={hero.alt} loading="eager" decoding="async" onError={safeImageFallback} />
              <figcaption>4CULTURE_ / EDITORIAL SYSTEM</figcaption>
            </figure>
            <p>Nature without nostalgia. Technology without hype. Culture with consequence.</p>
            <span>Animals, people, places and the ideas being built around a living planet — reported with curiosity, sources and room for uncertainty.</span>
          </div>
        </section>

        <section className="mag-topic-river" aria-label="Magazine topics">
          <div className="mag-topic-river-inner">
            <Link className={`mag-topic-pill ${!selectedTopic && !selectedLane ? "is-active" : ""}`} to="/magazine">ALL</Link>
            {MAGAZINE_TOPICS.map((topic) => (
              <Link key={topic.id} className={`mag-topic-pill ${selectedTopic?.id === topic.id ? "is-active" : ""}`} style={{ "--topic-color": topic.color } as React.CSSProperties} to={`/magazine?topic=${topic.id}`}>{topic.label}</Link>
            ))}
          </div>
        </section>

        <section className="mag-feed-shell" aria-labelledby="latest-title">
          <header className="mag-feed-head">
            <div><p className="mag-feed-kicker">{currentLabel ? `TOPIC / ${currentLabel}` : "CURRENT EDITION"}</p><h2 id="latest-title">{currentLabel ?? "Worth your attention."}</h2></div>
            <p>{currentPromise ?? "Field reporting, living systems, engineering, culture and practical ideas — edited into one calm front page rather than an endless feed."}</p>
          </header>
          {visibleStories.length > 0 ? <div className="mag-story-mosaic" data-filtered={currentLabel ? "true" : "false"}>{visibleStories.map((story, index) => <StoryTile key={story.slug} story={story} index={index} />)}</div> : <div className="mag-feed-empty"><h3>Nothing here until it is worth publishing.</h3><Link to="/magazine">RETURN TO ALL STORIES →</Link></div>}
          {!currentLabel && STORIES.length > HOME_STORY_LIMIT ? (
            <div className="mag-home-more">
              <p>The front page is edited, not exhaustive. The archive keeps the full source-aware record.</p>
              <Link to="/magazine/archive">ALL STORIES + SIGNALS →</Link>
            </div>
          ) : null}
        </section>

        {!currentLabel ? (
          <section className="mag-signal-desk" aria-labelledby="signal-title">
            <header className="mag-signal-desk-head"><div><p className="mag-feed-kicker">PLANET SIGNAL / FAST, SOURCE-BOUNDED</p><h2 id="signal-title">Signals worth watching.</h2></div><p>One source. One useful observation. One reason it matters. One explicit limit against reading more into it than the evidence supports.</p></header>
            <div className="mag-signal-desk-grid">
              {visibleSignals.map((_, index) => <SignalTile key={MAGAZINE_SIGNALS[index].slug} index={index} />)}
            </div>
            <Link className="mag-signal-archive-link" to="/magazine/archive">ALL PLANET SIGNALS →</Link>
          </section>
        ) : null}

        {!currentLabel ? (
          <section className="mag-feed-shell mag-franchise-section" aria-labelledby="series-title">
            <header className="mag-feed-head"><div><p className="mag-feed-kicker">RECURRING EDITORIAL</p><h2 id="series-title">Reasons to come back.</h2></div><p>Recognisable formats, different material. The story chooses the form; the Magazine keeps the standard.</p></header>
            <figure className="mag-franchise-visual">
              <img src={recurringVisual.src} alt={recurringVisual.alt} loading="lazy" decoding="async" onError={safeImageFallback} />
              <figcaption>FIELD / SYSTEMS / CULTURE / ACTION</figcaption>
            </figure>
            <div className="mag-franchise-rail">
              <Link to="/magazine/series/from-the-field"><span>FIELD / PEOPLE / PLACE</span><strong>From the Field</strong></Link>
              <Link to="/magazine/series/the-living-world"><span>SPECIES / ECOSYSTEMS</span><strong>The Living World</strong></Link>
              <Link to="/magazine/series/planet-explained"><span>SYSTEMS / EVIDENCE</span><strong>Planet Explained</strong></Link>
              <Link to="/magazine/series/what-works"><span>SOLUTIONS / LIMITS</span><strong>What Works</strong></Link>
            </div>
          </section>
        ) : null}

        {!currentLabel ? (
          <section className="mag-engineering-band" aria-labelledby="engineering-title">
            <div className="mag-engineering-inner">
              <p className="mag-feed-kicker">ENGINEERING / THE LIVING WORLD</p>
              <h2 id="engineering-title">The tools are getting stranger. Good.</h2>
              <p className="mag-engineering-copy">Air filters that remember biodiversity. Computer vision that turns coral photographs into monitoring surfaces. Roads that may warn drivers about wildlife before impact. Technology is interesting when it meets a real place, person or consequence.</p>
              <div className="mag-engineering-tags"><Link to="/magazine/topics/innovation">INNOVATION</Link><Link to="/magazine/topics/technology">TECHNOLOGY</Link><Link to="/magazine/topics/design">DESIGN</Link><Link to="/magazine/topics/science">SCIENCE</Link></div>
            </div>
          </section>
        ) : null}

        <section id="topics" className="mag-topic-index" aria-labelledby="topic-index-title">
          <header className="mag-topic-index-head"><p className="mag-topic-eyebrow">TOPICS / FOLLOW YOUR CURIOSITY</p><h2 id="topic-index-title">Find a way in.</h2><p>Reader-facing topics over one shared source-aware story graph.</p></header>
          <div className="mag-topic-grid">{MAGAZINE_TOPICS.map((topic) => <Link key={topic.id} className="mag-topic-card" to={`/magazine/topics/${topic.id.toLowerCase()}`}><div><strong>{topic.label}</strong><span>{topic.promise}</span></div></Link>)}</div>
        </section>

        {!currentLabel ? <StoryStream /> : null}

        {!currentLabel ? (
          <section className="mag-atlas-embed" aria-labelledby="atlas-live-title">
            <header className="mag-atlas-embed-head">
              <div>
                <p className="mag-feed-kicker">BUILT BY 4PLANET / PLANETARY INTELLIGENCE</p>
                <h2 id="atlas-live-title">Meet 4PLANET ATLAS.</h2>
              </div>
              <p>ATLAS is the interactive planetary interface we built to connect place, living systems and change on one explorable Earth. This live view opens with Blue Marble, active-fire detections and biodiversity density selected.</p>
            </header>
            <div className="mag-atlas-frame">
              <iframe
                title="4PLANET ATLAS interactive globe"
                src="/atlas?embed=mag&l=bluemarble,fires,biodiv&z=1.65&c=5,18"
                loading="lazy"
                allow="fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
              />
              <div className="mag-atlas-layer-strip" aria-hidden>
                <span>BLUE MARBLE</span><span>ACTIVE FIRES</span><span>BIODIVERSITY</span>
              </div>
            </div>
            <a className="mag-atlas-open" href="https://king-test.4planet-05.pages.dev/atlas?l=bluemarble,fires,biodiv" target="_blank" rel="noreferrer">ENTER FULL 4PLANET ATLAS →</a>
          </section>
        ) : null}
      </main>
    </MagazineShell>
  );
}
