import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry } from "@/analytics/MagazineAnalytics";
import { STORIES, type Story } from "@/content/stories";
import { FOUNDING_EDITION } from "@/content/magazineEditorial";
import { MAGAZINE_LANES, MAGAZINE_TOPICS, type MagazineLane, type MagazineTopicId } from "@/content/magazineOperating";
import { MAGAZINE_SIGNALS } from "@/content/magazineSignals";
import { experienceForStory } from "@/content/magazineExperience";
import { img } from "@/content/imageRegistry";
import "@/styles/magazine.css";
import "@/styles/magazine-home.css";
import "@/styles/magazine-home-closure.css";
import "@/styles/magazine-world.css";

const MOSAIC_SIZES = ["lead", "portrait", "wide", "compact", "small", "signal", "small", "feature", "compact", "small", "wide", "small", "signal"] as const;
const MOSAIC_COLORS = ["", "ink", "", "yellow", "", "blue", "pink", "", "orange", "", "green", "violet", ""] as const;

function storyStatus(story: Story) {
  if (story.editorialType === "SOURCE_REPORTED_EDITORIAL") return "SOURCE-REPORTED";
  if (story.editorialType === "ORGANISATIONAL_EXPLAINER") return "4PLANET EXPLAINER";
  if (story.editorialType === "PARTNER_SUBMITTED") return "PARTNER-SUBMITTED";
  return "EDITORIAL";
}

function StoryTile({ story, index }: { story: Story; index: number }) {
  const media = img(story.image);
  const size = MOSAIC_SIZES[index % MOSAIC_SIZES.length];
  const colour = MOSAIC_COLORS[index % MOSAIC_COLORS.length];
  const textOnly = size === "signal" || (index + 1) % 6 === 0;
  const experience = experienceForStory(story).replace(/_/g, " ");
  const className = [
    "mag-story-tile",
    `mag-story-tile--${size}`,
    colour ? `mag-story-tile--${colour}` : "",
    textOnly ? "mag-story-tile--text-only" : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={className}>
      <div className="mag-story-tile-index">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{story.location ?? story.lane}</span>
      </div>
      {!textOnly ? (
        <Link
          className="mag-story-media"
          to={`/magazine/${story.slug}`}
          onClick={() => trackEvent("magazine_story_open", { story_slug: story.slug, content_type: story.editorialType.toLowerCase(), placement: `mosaic_${size}` })}
        >
          <img src={media.src} alt={media.alt} loading={index < 3 ? "eager" : "lazy"} />
        </Link>
      ) : null}
      <div className="mag-story-copy">
        <div className="mag-story-kicker">
          <span>{story.category}</span><span>·</span><span>{storyStatus(story)}</span><span>·</span><span>{experience}</span><span>·</span><span>{story.readMins} MIN</span>
        </div>
        <h3><Link to={`/magazine/${story.slug}`}>{story.title}</Link></h3>
        <p>{story.dek}</p>
        {story.reportingNote ? <p className="mag-story-source-note">Reporting basis visible inside story.</p> : null}
      </div>
    </article>
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
            <p className="mag-home-hero-kicker">FOUNDING EDITION / LIVE DEVELOPMENT</p>
            <h1 id="magazine-title">The world is alive. So is the story.</h1>
          </div>
          <div className="mag-home-hero-aside">
            <p>Nature without nostalgia. Technology without hype. Culture without the side-eye.</p>
            <span>4PLANET Magazine follows animals, people, places and the ideas being engineered around a living planet — calmly, precisely and with enough optimism to stay curious.</span>
            <div className="mag-home-count"><strong>{STORIES.length + MAGAZINE_SIGNALS.length}</strong><span>source-aware editorial objects in this working edition</span></div>
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
            <div><p className="mag-feed-kicker">{currentLabel ? `FEED / ${currentLabel}` : "LATEST / FOUNDING FEED"}</p><h2 id="latest-title">{currentLabel ?? "Worth your attention."}</h2></div>
            <p>{currentPromise ?? "A deliberately mixed front page: field work beside biology, engineering beside culture, long reads beside quick signals. The layout is asymmetric by design but stable on every visit."}</p>
          </header>
          {feed.length > 0 ? <div className="mag-story-mosaic" data-filtered={currentLabel ? "true" : "false"}>{feed.map((story, index) => <StoryTile key={story.slug} story={story} index={index} />)}</div> : <div className="mag-feed-empty"><h3>Nothing here until it is worth publishing.</h3><Link to="/magazine">RETURN TO ALL STORIES →</Link></div>}
        </section>

        {!currentLabel ? (
          <section className="mag-signal-desk" aria-labelledby="signal-title">
            <header className="mag-signal-desk-head"><div><p className="mag-feed-kicker">PLANET SIGNAL / FAST, SOURCE-BOUNDED</p><h2 id="signal-title">Twelve things moving now.</h2></div><p>A signal is deliberately smaller than an article: one source, one useful observation, one reason it matters and one boundary against over-reading it.</p></header>
            <div className="mag-signal-desk-grid">
              {MAGAZINE_SIGNALS.map((signal, index) => <Link key={signal.slug} className="mag-signal-card" data-accent={signal.accent} to={`/magazine/signals/${signal.slug}`}><span>{String(index + 1).padStart(2, "0")} / {signal.publisher}</span><h3>{signal.title}</h3><p>{signal.dek}</p><b>READ SIGNAL →</b></Link>)}
            </div>
            <Link className="mag-signal-archive-link" to="/magazine/archive">OPEN FULL ARCHIVE →</Link>
          </section>
        ) : null}

        <section className="mag-engineering-band" aria-labelledby="engineering-title">
          <div className="mag-engineering-inner">
            <p className="mag-feed-kicker">ENGINEERING THE LIVING WORLD / WITHOUT ENGINEERING IT TO DEATH</p>
            <h2 id="engineering-title">The tools are getting stranger. Good.</h2>
            <p className="mag-engineering-copy">Air filters that remember biodiversity. Computer vision that turns thousands of coral photographs into a monitoring surface. Roads that may one day warn cars about wildlife before impact. This is where design, field biology and engineering become one editorial beat.</p>
            <div className="mag-engineering-tags"><Link to="/magazine?topic=INNOVATION">INNOVATION</Link><Link to="/magazine?topic=TECHNOLOGY">TECHNOLOGY</Link><Link to="/magazine?topic=DESIGN">DESIGN</Link><Link to="/magazine?topic=SCIENCE">SCIENCE</Link></div>
          </div>
        </section>

        <section className="mag-experience-index" aria-labelledby="experience-title">
          <header><p>FOUR READING MODES / ONE MAGAZINE</p><h2 id="experience-title">The story chooses the form.</h2><span>Most pieces should be quiet and readable. Richer modes are reserved for material that earns them.</span></header>
          <div><Link to="/magazine/why-4planet-exists"><span>ARTICLE</span><strong>Read without interface theatre.</strong></Link><Link to="/magazine/amazonia-more-than-a-forest"><span>VISUAL ESSAY</span><strong>Let the image carry information.</strong></Link><Link to="/magazine/air-filter-biodiversity-time-machine"><span>INTELLIGENCE STORY</span><strong>Inspect evidence and mechanism.</strong></Link><Link to="/magazine/five-am-bay-of-biscay"><span>JOURNEY FEATURE</span><strong>Move through place and time.</strong></Link></div>
        </section>

        <section id="topics" className="mag-topic-index" aria-labelledby="topic-index-title">
          <header className="mag-topic-index-head"><p className="mag-topic-eyebrow">TOPICS / FOLLOW YOUR CURIOSITY</p><h2 id="topic-index-title">Thirteen ways in.</h2><p>Topics are a reader-facing layer over the same source-aware story graph. Pick one interest; the rest of the planet stays connected underneath.</p></header>
          <div className="mag-topic-grid">{MAGAZINE_TOPICS.map((topic) => <Link key={topic.id} className="mag-topic-card" to={`/magazine?topic=${topic.id}`} style={{ "--topic-color": topic.color } as React.CSSProperties}><div><strong>{topic.label}</strong><span>{topic.promise}</span></div></Link>)}</div>
        </section>

        <section className="mag-feed-shell" aria-labelledby="editorial-lab-title">
          <header className="mag-feed-head"><div><p className="mag-feed-kicker">EDITORIAL LAB / NOT THE PUBLIC FEED</p><h2 id="editorial-lab-title">What we are still earning.</h2></div><p>Pre-publication records live here instead of masquerading as finished articles. Source, rights and editorial gates stay visible until the story is actually ready.</p></header>
          <div className="mag-editorial-lab-grid">{FOUNDING_EDITION.items.slice(0, 4).map((item) => <article key={item.id} className="mag-editorial-lab-card"><span>{String(item.order).padStart(2, "0")} / {item.status.replace(/_/g, " ")}</span><h3>{item.title}</h3><p>{item.summary}</p><Link to={`/magazine/stories/${item.id}`}>OPEN WORKING RECORD →</Link></article>)}</div>
        </section>
      </main>
    </MagazineShell>
  );
}
