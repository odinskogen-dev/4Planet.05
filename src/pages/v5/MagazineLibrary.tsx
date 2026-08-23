import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { STORIES, type Story } from "@/content/stories";
import { MAGAZINE_SIGNALS } from "@/content/magazineSignals";
import { img } from "@/content/imageRegistry";
import { isStorySaved, recentMagazineStories, resumeMagazineStories, savedStorySlugs, toggleSavedStory } from "@/content/magazineReader";
import "@/styles/magazine-library.css";

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function storyText(story: Story) {
  return normalize([story.title, story.dek, story.category, story.lane, story.location, ...(story.tags ?? []), ...(story.topics ?? [])].filter(Boolean).join(" "));
}

function StoryRow({ story, onSave }: { story: Story; onSave?: () => void }) {
  const media = img(story.image);
  const saved = isStorySaved(story.slug);
  return (
    <article className="mag-library-row">
      <Link className="mag-library-row-image" to={`/magazine/${story.slug}`}><img src={media.src} alt={media.alt} loading="lazy" /></Link>
      <div className="mag-library-row-copy">
        <div><span>{story.category}</span><span>{story.readMins} MIN</span></div>
        <h2><Link to={`/magazine/${story.slug}`}>{story.title}</Link></h2>
        <p>{story.dek}</p>
        <div className="mag-library-row-actions">
          <Link to={`/magazine/${story.slug}`}>READ →</Link>
          <button type="button" onClick={() => { toggleSavedStory(story.slug); onSave?.(); }}>{saved ? "SAVED ✓" : "SAVE +"}</button>
        </div>
      </div>
    </article>
  );
}

export function MagazineSearch() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const normalized = normalize(query);
  const results = useMemo(() => {
    if (!normalized) return STORIES;
    const terms = normalized.split(" ").filter(Boolean);
    return STORIES
      .map((story) => ({ story, score: terms.reduce((score, term) => score + (storyText(story).includes(term) ? 1 : 0), 0) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.story);
  }, [normalized]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (query.trim()) next.set("q", query.trim()); else next.delete("q");
    const timer = window.setTimeout(() => setParams(next, { replace: true }), 120);
    return () => window.clearTimeout(timer);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MagazineShell>
      <Seo title="Search — 4PLANET MAGAZINE" description="Search 4PLANET Magazine by story, topic, place, species, actor and idea." path="/magazine/search" robots="noindex,follow" />
      <main className="mag-library">
        <header className="mag-library-hero"><p>SEARCH</p><h1>Find the thread.</h1><span>Stories are indexed by subject, place, topic and connected living-planet context — not only keywords in a headline.</span></header>
        <section className="mag-search-box">
          <label htmlFor="mag-search-input">SEARCH STORIES</label>
          <input id="mag-search-input" type="search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="orca, cities, AI, food, coral…" />
          <p>{results.length} {results.length === 1 ? "story" : "stories"}{normalized ? ` matching “${query.trim()}”` : " in the current magazine"}.</p>
        </section>
        <section className="mag-library-list">{results.map((story) => <StoryRow key={story.slug} story={story} />)}</section>
        {!results.length ? <div className="mag-library-empty"><h2>No filler result.</h2><p>Try a broader topic. We would rather show nothing than pretend an unrelated story is a match.</p></div> : null}
      </main>
    </MagazineShell>
  );
}

export function MagazineSaved() {
  const [, rerender] = useState(0);
  const slugs = savedStorySlugs();
  const stories = slugs.map((slug) => STORIES.find((story) => story.slug === slug)).filter((story): story is Story => Boolean(story));
  const resumes = resumeMagazineStories().map((item) => ({ ...item, story: STORIES.find((story) => story.slug === item.slug) })).filter((item) => item.story);
  const recents = recentMagazineStories().map((item) => ({ ...item, story: STORIES.find((story) => story.slug === item.slug) })).filter((item) => item.story).slice(0, 6);

  return (
    <MagazineShell>
      <Seo title="Saved — 4PLANET MAGAZINE" description="Your locally saved and recently read 4PLANET Magazine stories." path="/magazine/saved" robots="noindex,nofollow" />
      <main className="mag-library">
        <header className="mag-library-hero"><p>YOUR READING</p><h1>Keep what mattered.</h1><span>Saved and recent reading stays in this browser. No account is required and this local list is not scientific or editorial truth.</span></header>
        {resumes.length ? <section className="mag-resume"><div className="mag-library-section-head"><p>CONTINUE</p><h2>Pick up the thread.</h2></div><div className="mag-resume-grid">{resumes.map(({ story, progress }) => <Link key={story!.slug} to={`/magazine/${story!.slug}`}><span>{progress}% READ</span><strong>{story!.title}</strong><i><b style={{ width: `${progress}%` }} /></i></Link>)}</div></section> : null}
        <section><div className="mag-library-section-head"><p>SAVED</p><h2>{stories.length ? "Your reading list." : "Nothing saved yet."}</h2></div>{stories.length ? <div className="mag-library-list">{stories.map((story) => <StoryRow key={story.slug} story={story} onSave={() => rerender((value) => value + 1)} />)}</div> : <div className="mag-library-empty"><p>Use SAVE on any article. It stays local to this browser.</p><Link to="/magazine">BROWSE MAGAZINE →</Link></div>}</section>
        {recents.length ? <section className="mag-recent"><div className="mag-library-section-head"><p>RECENT</p><h2>Recently opened.</h2></div><div className="mag-recent-grid">{recents.map(({ story }) => <Link key={story!.slug} to={`/magazine/${story!.slug}`}>{story!.title}</Link>)}</div></section> : null}
      </main>
    </MagazineShell>
  );
}

export function MagazineArchive() {
  return (
    <MagazineShell>
      <Seo title="Archive — 4PLANET MAGAZINE" description="Browse the current 4PLANET Magazine archive and source-backed Planet Signals." path="/magazine/archive" />
      <main className="mag-library">
        <header className="mag-library-hero"><p>ARCHIVE / FOUNDING EDITION</p><h1>Everything worth keeping.</h1><span>A chronological archive will grow from one source-aware content graph. Today it contains full stories and the fast Planet Signal desk.</span></header>
        <section><div className="mag-library-section-head"><p>FULL STORIES</p><h2>{STORIES.length} stories.</h2></div><div className="mag-library-list">{STORIES.map((story) => <StoryRow key={story.slug} story={story} />)}</div></section>
        <section className="mag-signal-archive"><div className="mag-library-section-head"><p>PLANET SIGNAL</p><h2>{MAGAZINE_SIGNALS.length} bounded signals.</h2></div><div className="mag-signal-archive-grid">{MAGAZINE_SIGNALS.map((signal) => <Link key={signal.slug} data-accent={signal.accent} to={`/magazine/signals/${signal.slug}`}><span>{signal.publisher} · {signal.publishedAt}</span><strong>{signal.title}</strong><p>{signal.dek}</p></Link>)}</div></section>
      </main>
    </MagazineShell>
  );
}
