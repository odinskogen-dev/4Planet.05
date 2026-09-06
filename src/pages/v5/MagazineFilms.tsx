import { useEffect, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { PUBLISHED_FILMS, filmBySlug, relatedFilms, type FilmRecord, type FilmTopic } from "@/content/magazineFilms";
import "@/styles/magazine-films.css";
import "@/styles/magazine-films-gold-02.css";
import "@/styles/magazine-films-premium-03.css";

type FilterId = "ALL" | FilmTopic;
type MazeLayout = "wide" | "portrait" | "small" | "compact" | "feature";

const FILTER_OPTIONS: Array<{ id: FilterId; label: string }> = [
  { id: "ALL", label: "ALL" },
  { id: "OCEAN", label: "OCEAN" },
  { id: "LAND_WILDLIFE", label: "LAND + WILDLIFE" },
  { id: "FOOD", label: "FOOD" },
  { id: "CLIMATE", label: "CLIMATE" },
  { id: "ENERGY", label: "ENERGY" },
  { id: "SOLUTIONS", label: "SOLUTIONS" },
  { id: "PEOPLE", label: "PEOPLE" },
];

const MAZE_LAYOUTS: MazeLayout[] = [
  "wide", "portrait", "small", "small", "small", "compact", "feature", "portrait", "wide", "small", "compact", "feature",
];

function accessLabel(film: FilmRecord) {
  if (film.access === "FULL_FREE") return "WATCH FREE";
  if (film.access === "STREAM") return "STREAM";
  if (film.access === "TRAILER") return "TRAILER";
  return "VIEW OPTIONS";
}

function FilmImage({ film, eager = false, decorative = false }: { film: FilmRecord; eager?: boolean; decorative?: boolean }) {
  const [src, setSrc] = useState(film.imageUrl);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(film.imageUrl);
    setFailed(false);
  }, [film.imageUrl]);

  if (failed) {
    return (
      <div className="mag-film-image-fallback" aria-label={decorative ? undefined : `${film.title} film image unavailable`} aria-hidden={decorative || undefined}>
        <span>4PLANET FILMS</span>
        <strong>{film.title}</strong>
        <small>{film.year} / IMAGE TEMPORARILY UNAVAILABLE</small>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={decorative ? "" : film.imageAlt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (film.fallbackImageUrl && src !== film.fallbackImageUrl) setSrc(film.fallbackImageUrl);
        else setFailed(true);
      }}
    />
  );
}

function FilmCard({ film, index }: { film: FilmRecord; index: number }) {
  const layout = MAZE_LAYOUTS[index % MAZE_LAYOUTS.length];
  return (
    <article className={`mag-film-card mag-film-card--${layout}`} data-accent={film.accent} data-layout={layout}>
      <div className="mag-film-card-index"><span>{String(index + 1).padStart(2, "0")}</span><span>{film.focus}</span></div>
      <Link
        className="mag-film-card-media"
        to={`/films/${film.slug}`}
        aria-label={`Open ${film.title}`}
        onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: `films_grid_${layout}` })}
      >
        <FilmImage film={film} eager={index < 3} />
      </Link>
      <div className="mag-film-card-copy">
        <p className="mag-film-meta">{film.year} · {film.runtime} · {accessLabel(film)}</p>
        <h2><Link to={`/films/${film.slug}`} onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: "films_grid_title" })}>{film.title}</Link></h2>
        <p>{film.description}</p>
        <div className="mag-film-card-foot"><span>{film.director}</span><Link to={`/films/${film.slug}`} onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: "films_grid_cta" })}>OPEN FILM →</Link></div>
      </div>
    </article>
  );
}

function RelatedFilmCard({ film }: { film: FilmRecord }) {
  return (
    <Link className="mag-film-related-card" data-accent={film.accent} to={`/films/${film.slug}`} onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: "related_films" })}>
      <div className="mag-film-related-media"><FilmImage film={film} decorative /></div>
      <span>{film.focus}</span>
      <strong>{film.title}</strong>
      <small>{film.year} · {film.runtime}</small>
    </Link>
  );
}

export function MagazineFilmsIndex() {
  const [searchParams] = useSearchParams();
  const availableFilters = FILTER_OPTIONS.filter((filter) => filter.id === "ALL" || PUBLISHED_FILMS.some((film) => film.topics.includes(filter.id as FilmTopic)));
  const requested = (searchParams.get("topic") || "ALL").toUpperCase() as FilterId;
  const active = availableFilters.some((filter) => filter.id === requested) ? requested : "ALL";
  const films = active === "ALL" ? PUBLISHED_FILMS : PUBLISHED_FILMS.filter((film) => film.topics.includes(active));

  useEffect(() => {
    trackEvent("films_index_view", { published_films: PUBLISHED_FILMS.length, filter: active.toLowerCase() });
  }, [active]);

  return (
    <MagazineShell>
      <Seo
        title="4PLANET FILMS — Films worth your attention"
        description="A curated documentary selection about the living planet, people, systems, pressure and solutions — always linked back to the original filmmakers and distributors."
        path="/films"
        image={PUBLISHED_FILMS[0]?.imageUrl}
      />
      <main className="mag-films">
        <section className="mag-films-hero" aria-labelledby="films-title">
          <div>
            <p className="mag-films-eyebrow">4PLANET FILMS / CURATED FOR A LIVING PLANET</p>
            <h1 id="films-title">Films worth your attention.</h1>
          </div>
          <div className="mag-films-hero-note">
            <p>Documentaries that make the living world harder to ignore — and easier to understand.</p>
            <span>Curated by 4PLANET. Films remain with their filmmakers and distributors; availability can vary by country.</span>
          </div>
        </section>

        <nav className="mag-film-filter" aria-label="Film topics">
          {availableFilters.map((filter) => (
            <Link
              key={filter.id}
              className={active === filter.id ? "is-active" : ""}
              aria-current={active === filter.id ? "page" : undefined}
              to={filter.id === "ALL" ? "/films" : `/films?topic=${filter.id}`}
              onClick={() => trackEvent("film_filter_use", { filter: filter.id.toLowerCase() })}
            >
              {filter.label}
            </Link>
          ))}
        </nav>

        <section className="mag-film-selection" aria-labelledby="selection-title">
          <header className="mag-film-selection-head">
            <div><p className="mag-films-eyebrow">CURATED SELECTION / {PUBLISHED_FILMS.length} FILMS</p><h2 id="selection-title">Start here.</h2></div>
            <p>Selected for cinematic quality, relevance to a living planet and a clear route back to the people who made the work.</p>
          </header>
          <div className="mag-film-grid">{films.map((film, index) => <FilmCard key={film.slug} film={film} index={index} />)}</div>
        </section>
      </main>
    </MagazineShell>
  );
}

export function MagazineFilmDetail() {
  const { slug } = useParams();
  const film = filmBySlug(slug);
  const related = film ? relatedFilms(film.slug, 3) : [];

  useEffect(() => {
    if (film) trackEvent("film_open", { film_slug: film.slug, placement: "film_detail" });
  }, [film]);

  if (!film) return <Navigate to="/films" replace />;

  return (
    <MagazineShell>
      <Seo title={`${film.title} — 4PLANET FILMS`} description={film.description} path={`/films/${film.slug}`} image={film.imageUrl} />
      <main className="mag-film-detail">
        <Link className="mag-film-back" to="/films">← ALL FILMS</Link>
        <header className="mag-film-detail-head">
          <p className="mag-films-eyebrow">4PLANET FILMS / {film.focus}</p>
          <h1>{film.title}</h1>
          <div className="mag-film-detail-meta"><span>{film.year}</span><span>{film.runtime}</span><span>{film.director}</span><span>{film.platform}</span></div>
        </header>

        <figure className="mag-film-detail-media-wrap">
          <div className="mag-film-detail-media" aria-label={`${film.title} film media`}>
            {film.trailerId ? (
              <iframe src={`https://www.youtube-nocookie.com/embed/${film.trailerId}?rel=0`} title={`${film.title} official film or trailer`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : <FilmImage film={film} eager />}
          </div>
          <figcaption>{film.trailerId ? `Official ${film.access === "FULL_FREE" ? "film" : "trailer"} media. Card image comes from the linked film material.` : `${film.imageCredit}. Rights remain with the film/rightsholder.`}</figcaption>
        </figure>

        <section className="mag-film-detail-body">
          <div className="mag-film-detail-story">
            <p className="mag-films-eyebrow">THE FILM</p>
            <p className="mag-film-dek">{film.description}</p>
            <p>{film.credit}</p>
            <p className="mag-film-availability"><strong>AVAILABILITY</strong><br />{film.availabilityNote}</p>
            <p className="mag-film-source-note">Description condensed from official film/distributor material for discovery. 4PLANET has not independently verified every claim made inside the film.</p>
          </div>
          <aside className="mag-film-detail-actions">
            <span>{accessLabel(film)}</span>
            <a className="mag-film-watch" href={film.watchUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("film_watch_click", { film_slug: film.slug, access: film.access.toLowerCase(), platform: film.platform })}>{film.access === "FULL_FREE" ? "WATCH FILM →" : film.access === "TRAILER" ? "WATCH TRAILER →" : "OPEN WATCH ROUTE →"}</a>
            <a className="mag-film-source" href={film.sourceDescriptionUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("film_source_click", { film_slug: film.slug, source: film.sourceLabel })}>{film.sourceLabel} ↗</a>
          </aside>
        </section>

        <section className="mag-film-why">
          <p className="mag-films-eyebrow">WHY 4PLANET SELECTED IT</p>
          <h2>{film.selectionNote}</h2>
        </section>

        {related.length ? (
          <section className="mag-film-related" aria-labelledby="related-films-title">
            <header><p className="mag-films-eyebrow">KEEP DISCOVERING</p><h2 id="related-films-title">Related films.</h2></header>
            <div>{related.map((item) => <RelatedFilmCard key={item.slug} film={item} />)}</div>
          </section>
        ) : null}

        <nav className="mag-film-next" aria-label="More films">
          <Link to="/films">EXPLORE THE FULL SELECTION</Link>
          <Link to="/magazine">RETURN TO 4PLANET MAGAZINE</Link>
        </nav>
      </main>
    </MagazineShell>
  );
}
