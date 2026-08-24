import { Link, useParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { MAGAZINE_ARTICLE_TEMPLATES } from "@/content/magazineEngine";
import { MAGAZINE_TOPICS } from "@/content/magazineOperating";
import { experienceForStory } from "@/content/magazineExperience";
import { STORIES } from "@/content/stories";
import { img } from "@/content/imageRegistry";
import { NotFound } from "@/pages/system";
import "@/styles/magazine-hub.css";

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

export function MagazineTopicHub() {
  const { topic: raw } = useParams();
  const topic = MAGAZINE_TOPICS.find((item) => item.id.toLowerCase() === raw?.toLowerCase());
  if (!topic) return <NotFound />;
  const stories = STORIES.filter((story) => story.topics?.includes(topic.id));

  return (
    <MagazineShell>
      <Seo title={`${topic.label} — 4PLANET MAGAZINE`} description={`${topic.promise} Explore ${stories.length} current 4PLANET Magazine stories.`} path={`/magazine/topics/${topic.id.toLowerCase()}`} />
      <main className="mag-hub" style={{ "--hub-accent": topic.color } as React.CSSProperties}>
        <header className="mag-hub-hero">
          <p>TOPIC / {topic.id}</p><h1>{topic.label}</h1><span>{topic.promise}</span><div><strong>{stories.length}</strong><p>current stories in this topic</p></div>
        </header>
        {stories.length ? <StoryRail stories={stories} /> : <section className="mag-hub-empty"><h2>We have not earned this feed yet.</h2><p>The topic exists in the taxonomy, but we will not manufacture filler to make it look busy.</p></section>}
        <nav className="mag-hub-other" aria-label="Other Magazine topics"><p>OTHER THREADS</p><div>{MAGAZINE_TOPICS.filter((item) => item.id !== topic.id).map((item) => <Link key={item.id} to={`/magazine/topics/${item.id.toLowerCase()}`}>{item.label}</Link>)}</div></nav>
      </main>
    </MagazineShell>
  );
}

export function MagazineSeriesHub() {
  const { series: raw } = useParams();
  const series = MAGAZINE_ARTICLE_TEMPLATES.find((item) => item.id.toLowerCase().replaceAll("_", "-") === raw?.toLowerCase());
  if (!series) return <NotFound />;
  const stories = STORIES.filter((story) => story.franchise === series.id);
  const slug = series.id.toLowerCase().replaceAll("_", "-");

  return (
    <MagazineShell>
      <Seo title={`${series.label} — 4PLANET MAGAZINE`} description={series.readerJob} path={`/magazine/series/${slug}`} />
      <main className="mag-hub mag-hub--series">
        <header className="mag-hub-hero"><p>SERIES / {series.id.replaceAll("_", " ")}</p><h1>{series.label}</h1><span>{series.readerJob}</span><div><strong>{stories.length}</strong><p>stories using this editorial grammar</p></div></header>
        <section className="mag-hub-method"><p>THE PROMISE</p><h2>{series.visualRule}</h2><span>{series.trustRule}</span></section>
        {stories.length ? <StoryRail stories={stories} /> : <section className="mag-hub-empty"><h2>A format is not a quota.</h2><p>This series stays quiet until a story actually fits its editorial job.</p></section>}
        <nav className="mag-hub-other" aria-label="Other Magazine series"><p>OTHER SERIES</p><div>{MAGAZINE_ARTICLE_TEMPLATES.filter((item) => item.id !== series.id).map((item) => { const itemSlug = item.id.toLowerCase().replaceAll("_", "-"); return <Link key={item.id} to={`/magazine/series/${itemSlug}`}>{item.label}</Link>; })}</div></nav>
      </main>
    </MagazineShell>
  );
}
