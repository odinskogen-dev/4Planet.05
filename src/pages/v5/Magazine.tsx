import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { trackMagazineEntry } from "@/analytics/MagazineAnalytics";
import { STORIES, type Story } from "@/content/stories";
import { FOUNDING_EDITION } from "@/content/magazineEditorial";
import { MAGAZINE_TOPICS, type MagazineTopicId } from "@/content/magazineOperating";
import { img } from "@/content/imageRegistry";
import "@/styles/magazine.css";
import "@/styles/magazine-home.css";
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
          <span>{story.category}</span>
          <span>·</span>
          <span>{storyStatus(story)}</span>
          <span>·</span>
          <span>{story.readMins} MIN</span>
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
  const selectedTopic = MAGAZINE_TOPICS.find((topic) => topic.id === topicParam);
  const feed = selectedTopic ? STORIES.filter((story) => story.topics?.includes(selectedTopic.id)) : STORIES;
  const hero = img("m4gazineHero");

  useEffect(() => {
    trackMagazineEntry("home");
  }, []);

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
          </div>
        </section>

        <section className="mag-topic-river" aria-label="Magazine topics">
          <div className="mag-topic-river-inner">
            <Link className={`mag-topic-pill ${!selectedTopic ? "is-active" : ""}`} to="/magazine">ALL</Link>
            {MAGAZINE_TOPICS.map((topic) => (
              <Link
                key={topic.id}
                className={`mag-topic-pill ${selectedTopic?.id === topic.id ? "is-active" : ""}`}
                style={{ "--topic-color": topic.color } as React.CSSProperties}
                to={`/magazine?topic=${topic.id}`}
              >
                {topic.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="mag-feed-shell" aria-labelledby="latest-title">
          <header className="mag-feed-head">
            <div>
              <p className="mag-feed-kicker">{selectedTopic ? `TOPIC / ${selectedTopic.label}` : "LATEST / FOUNDING FEED"}</p>
              <h2 id="latest-title">{selectedTopic ? selectedTopic.label : "Worth your attention."}</h2>
            </div>
            <p>{selectedTopic ? selectedTopic.promise : "A deliberately mixed front page: field work beside biology, engineering beside culture, long reads beside quick signals. The layout is asymmetric by design but stable on every visit."}</p>
          </header>

          {feed.length > 0 ? (
            <div className="mag-story-mosaic" data-filtered={selectedTopic ? "true" : "false"}>
              {feed.map((story, index) => <StoryTile key={story.slug} story={story} index={index} />)}
            </div>
          ) : (
            <div className="mag-feed-empty">
              <h3>Nothing here until it is worth publishing.</h3>
              <Link to="/magazine">RETURN TO ALL STORIES →</Link>
            </div>
          )}
        </section>

        <section className="mag-engineering-band" aria-labelledby="engineering-title">
          <div className="mag-engineering-inner">
            <p className="mag-feed-kicker">ENGINEERING THE LIVING WORLD / WITHOUT ENGINEERING IT TO DEATH</p>
            <h2 id="engineering-title">The tools are getting stranger. Good.</h2>
            <p className="mag-engineering-copy">Air filters that remember biodiversity. Computer vision that turns thousands of coral photographs into a monitoring surface. Roads that may one day warn cars about wildlife before impact. This is where design, field biology and engineering become one editorial beat.</p>
            <div className="mag-engineering-tags">
              <Link to="/magazine?topic=INNOVATION">INNOVATION</Link>
              <Link to="/magazine?topic=TECHNOLOGY">TECHNOLOGY</Link>
              <Link to="/magazine?topic=DESIGN">DESIGN</Link>
              <Link to="/magazine?topic=SCIENCE">SCIENCE</Link>
            </div>
          </div>
        </section>

        <section id="topics" className="mag-topic-index" aria-labelledby="topic-index-title">
          <header className="mag-topic-index-head">
            <p className="mag-topic-eyebrow">TOPICS / FOLLOW YOUR CURIOSITY</p>
            <h2 id="topic-index-title">Thirteen ways in.</h2>
            <p>Topics are a reader-facing layer over the same source-aware story graph. Pick one interest; the rest of the planet stays connected underneath.</p>
          </header>
          <div className="mag-topic-grid">
            {MAGAZINE_TOPICS.map((topic) => (
              <Link key={topic.id} className="mag-topic-card" to={`/magazine?topic=${topic.id}`} style={{ "--topic-color": topic.color } as React.CSSProperties}>
                <div>
                  <strong>{topic.label}</strong>
                  <span>{topic.promise}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mag-feed-shell" aria-labelledby="editorial-lab-title">
          <header className="mag-feed-head">
            <div>
              <p className="mag-feed-kicker">EDITORIAL LAB / NOT THE PUBLIC FEED</p>
              <h2 id="editorial-lab-title">What we are still earning.</h2>
            </div>
            <p>Pre-publication records live here instead of masquerading as finished articles. Source, rights and editorial gates stay visible until the story is actually ready.</p>
          </header>
          <div className="mag-editorial-lab-grid">
            {FOUNDING_EDITION.items.slice(0, 4).map((item) => (
              <article key={item.id} className="mag-editorial-lab-card">
                <span>{String(item.order).padStart(2, "0")} / {item.status.replace(/_/g, " ")}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <Link to={`/magazine/stories/${item.id}`}>OPEN WORKING RECORD →</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </MagazineShell>
  );
}
