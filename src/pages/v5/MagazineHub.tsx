import { Link, useParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { MAGAZINE_ARTICLE_TEMPLATES } from "@/content/magazineEngine";
import { MAGAZINE_TOPICS, type MagazineTopicId } from "@/content/magazineOperating";
import { MAGAZINE_SIGNALS } from "@/content/magazineSignals";
import { experienceForStory } from "@/content/magazineExperience";
import { STORIES } from "@/content/stories";
import { img, type ImageKey } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-hub.css";
import "@/styles/magazine-hub-gold-01.css";

const toSeriesSlug = (value: string) => value.toLowerCase().replace(/_/g, "-");

const HUB_SIGNAL_IMAGES: ImageKey[] = [
  "circularCityHero",
  "oce4nDomainHero",
  "cor4lHero",
  "foodHero",
  "clim4teHero",
  "cultureAnchor",
  "s4piensDomainHero",
  "amazoniaHero",
];

const RELATED_POSITIONS = [
  { x: "15%", y: "30%" },
  { x: "36%", y: "17%" },
  { x: "69%", y: "18%" },
  { x: "86%", y: "39%" },
  { x: "70%", y: "78%" },
  { x: "28%", y: "78%" },
] as const;

function StoryRail({ stories }: { stories: typeof STORIES }) {
  return (
    <div className="mag-hub-story-grid">
      {stories.map((story, index) => {
        const media = img(story.image);
        return (
          <Link key={story.slug} to={`/magazine/${story.slug}`} className={index === 0 ? "is-lead" : ""}>
            <div className="mag-hub-story-media"><img src={media.src} alt={media.alt} loading={index < 2 ? "eager" : "lazy"} /></div>
            <span>{story.category} · {experienceForStory(story).replace(/_/g, " ")} · {story.readMins} MIN</span>
            <h2>{story.title}</h2>
            <p>{story.dek}</p>
          </Link>
        );
      })}
    </div>
  );
}

function SignalRail({ signals }: { signals: typeof MAGAZINE_SIGNALS }) {
  return (
    <div className="mag-hub-signal-rail">
      {signals.slice(0, 8).map((signal, index) => {
        const media = img(HUB_SIGNAL_IMAGES[index % HUB_SIGNAL_IMAGES.length]);
        return (
          <Link className="mag-hub-signal-card" data-accent={signal.accent} key={signal.slug} to={`/magazine/signals/${signal.slug}`}>
            <img src={media.src} alt={media.alt} loading="lazy" />
            <div>
              <span>{signal.publisher} · {signal.publishedAt}</span>
              <strong>{signal.title}</strong>
              <p>{signal.dek}</p>
              <b>READ SIGNAL →</b>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function relatedTopicsFor(topicId: MagazineTopicId) {
  const score = new Map<MagazineTopicId, number>();
  const capture = (topics?: MagazineTopicId[]) => {
    if (!topics?.includes(topicId)) return;
    topics.forEach((candidate) => {
      if (candidate !== topicId) score.set(candidate, (score.get(candidate) ?? 0) + 1);
    });
  };
  STORIES.forEach((story) => capture(story.topics));
  MAGAZINE_SIGNALS.forEach((signal) => capture(signal.topics));
  return MAGAZINE_TOPICS
    .filter((candidate) => candidate.id !== topicId)
    .sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0))
    .slice(0, 6);
}

export function MagazineTopicHub() {
  const { topic: raw } = useParams();
  const topic = MAGAZINE_TOPICS.find((item) => item.id.toLowerCase() === raw?.toLowerCase());
  if (!topic) return <NotFound />;

  const stories = STORIES.filter((story) => story.topics?.includes(topic.id));
  const signals = MAGAZINE_SIGNALS.filter((signal) => signal.topics.includes(topic.id));
  const relatedTopics = relatedTopicsFor(topic.id);
  const relatedIds = new Set(relatedTopics.map((item) => item.id));
  const adjacentStories = STORIES
    .filter((story) => !story.topics?.includes(topic.id) && story.topics?.some((id) => relatedIds.has(id)))
    .slice(0, 3);

  return (
    <MagazineShell>
      <Seo
        title={`${topic.label} — 4PLANET MAGAZINE`}
        description={`${topic.promise} Explore current 4PLANET Magazine stories and source-bounded Planet Signals connected to ${topic.label}.`}
        path={`/magazine/topics/${topic.id.toLowerCase()}`}
      />
      <main className="mag-hub" style={{ "--hub-accent": topic.color } as React.CSSProperties}>
        <header className="mag-hub-hero">
          <p>TOPIC / {topic.id}</p>
          <h1>{topic.label}</h1>
          <span>{topic.promise}</span>
          <div className="mag-hub-hero-stats">
            <div className="mag-hub-hero-stat"><strong>{stories.length}</strong><p>full stories directly in this thread</p></div>
            <div className="mag-hub-hero-stat"><strong>{signals.length}</strong><p>source-bounded signals in this thread</p></div>
          </div>
          <div className="mag-hub-pulse" aria-hidden><i /><i /><i /></div>
        </header>

        <section className="mag-hub-thread-intro">
          <p>THREAD / LIVING PLANET</p>
          <h2>{topic.promise}</h2>
          <div><p>4PLANET Magazine uses topics as connective tissue, not isolated shelves. Stories, evidence and neighbouring subjects stay linked so a reader can move from one object into the wider living system.</p></div>
        </section>

        {stories.length ? (
          <section className="mag-hub-stories" aria-labelledby="topic-stories-title">
            <header className="mag-hub-section-head"><p>FULL STORIES</p><h2 id="topic-stories-title">In the {topic.label.toLowerCase()} thread.</h2></header>
            <StoryRail stories={stories} />
          </section>
        ) : adjacentStories.length ? (
          <section className="mag-hub-stories" aria-labelledby="topic-nearby-title">
            <header className="mag-hub-section-head"><p>CONNECTED READING</p><h2 id="topic-nearby-title">Start with the nearest live threads.</h2></header>
            <StoryRail stories={adjacentStories} />
          </section>
        ) : null}

        {signals.length ? (
          <section className="mag-hub-signals" aria-labelledby="topic-signals-title">
            <header className="mag-hub-section-head"><p>PLANET SIGNAL</p><h2 id="topic-signals-title">What is moving now.</h2></header>
            <SignalRail signals={signals} />
          </section>
        ) : null}

        {stories.length && adjacentStories.length ? (
          <section className="mag-hub-stories" aria-labelledby="topic-adjacent-title">
            <header className="mag-hub-section-head"><p>NEARBY THREADS</p><h2 id="topic-adjacent-title">Context does not stop at the category edge.</h2></header>
            <StoryRail stories={adjacentStories} />
          </section>
        ) : null}

        <nav className="mag-hub-related-biome" aria-label={`Topics connected to ${topic.label}`}>
          <p>CONNECTED THREADS / FOLLOW THE SYSTEM</p>
          <div className="mag-hub-related-core"><strong>{topic.label}</strong></div>
          {relatedTopics.map((item, index) => {
            const position = RELATED_POSITIONS[index];
            return (
              <Link
                className="mag-hub-related-link"
                style={{ "--rx": position.x, "--ry": position.y } as React.CSSProperties}
                key={item.id}
                to={`/magazine/topics/${item.id.toLowerCase()}`}
              >
                <strong>{item.label}</strong><small>{item.promise}</small>
              </Link>
            );
          })}
        </nav>
      </main>
    </MagazineShell>
  );
}

export function MagazineSeriesHub() {
  const { series: raw } = useParams();
  const series = MAGAZINE_ARTICLE_TEMPLATES.find((item) => toSeriesSlug(item.id) === raw?.toLowerCase());
  if (!series) return <NotFound />;
  const stories = STORIES.filter((story) => story.franchise === series.id);
  const slug = toSeriesSlug(series.id);

  return (
    <MagazineShell>
      <Seo title={`${series.label} — 4PLANET MAGAZINE`} description={series.readerJob} path={`/magazine/series/${slug}`} />
      <main className="mag-hub mag-hub--series">
        <header className="mag-hub-hero">
          <p>SERIES / {series.id.replace(/_/g, " ")}</p>
          <h1>{series.label}</h1>
          <span>{series.readerJob}</span>
          <div className="mag-hub-hero-stats"><div className="mag-hub-hero-stat"><strong>{stories.length}</strong><p>stories using this editorial grammar</p></div></div>
          <div className="mag-hub-pulse" aria-hidden><i /><i /><i /></div>
        </header>
        <section className="mag-hub-method"><p>THE PROMISE</p><h2>{series.visualRule}</h2><span>{series.trustRule}</span></section>
        {stories.length ? <StoryRail stories={stories} /> : <section className="mag-hub-empty"><h2>A format is not a quota.</h2><p>This series stays quiet until a story actually fits its editorial job.</p></section>}
        <nav className="mag-hub-other" aria-label="Other Magazine series"><p>OTHER SERIES</p><div>{MAGAZINE_ARTICLE_TEMPLATES.filter((item) => item.id !== series.id).map((item) => { const itemSlug = toSeriesSlug(item.id); return <Link key={item.id} to={`/magazine/series/${itemSlug}`}>{item.label}</Link>; })}</div></nav>
      </main>
    </MagazineShell>
  );
}
