import type { StorySource } from "@/content/stories";
import "@/styles/magazine-story-sources.css";

export function StorySources({ sources }: { sources: StorySource[] }) {
  if (!sources.length) return null;
  return (
    <section className="mag-story-sources" aria-labelledby="story-sources-title">
      <div className="mag-story-sources__inner">
        <header className="mag-story-sources__head">
          <div><p>THE EVIDENCE</p><h2 id="story-sources-title">Sources inside the story.</h2></div>
          <span>Every source below says exactly what it supports — and what it does not. A record, observation or survey result is not silently upgraded into a population, causal or impact claim.</span>
        </header>
        <div className="mag-story-sources__list">
          {sources.map((source, index) => (
            <article className="mag-story-source" key={source.url}>
              <span className="mag-story-source__index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <span className="mag-story-source__meta">{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ""}</span>
                <h3>{source.label}</h3>
                <a className="mag-story-source__open" href={source.url} target="_blank" rel="noreferrer">OPEN PRIMARY SOURCE ↗</a>
              </div>
              <div className="mag-story-source__copy">
                <strong>Supports</strong>
                <span>{source.supports}</span>
                {source.limitation ? <small>Limit: {source.limitation}</small> : null}
                <small>Checked {source.checkedAt}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
