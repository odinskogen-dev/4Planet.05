import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { FILM_CANDIDATES, PUBLISHED_FILMS, filmBySlug, type PublishedFilm } from "@/content/magazineFilms";
import "@/styles/magazine-films.css";

const FILTERS = ["ALL", "OCEAN", "AMAZONIA", "FOOD", "CLIMATE", "SOLUTIONS"] as const;

function FilmImage({ film, eager = false }: { film: PublishedFilm; eager?: boolean }) {
  if (!film.imageUrl) {
    return (
      <div className="mag-film-image-fallback" aria-label={`${film.title} official film material`}>
        <span>4PLANET FILMS</span>
        <strong>{film.title}</strong>
        <small>{film.year} / {film.focus}</small>
      </div>
    );
  }
  return <img src={film.imageUrl} alt={`${film.title} — official trailer image`} loading={eager ? "eager" : "lazy"} decoding="async" />;
}

function FilmCard({ film, index }: { film: PublishedFilm; index: number }) {
  return (
    <article className={`mag-film-card ${index === 0 ? "mag-film-card--lead" : ""}`}>
      <div className="mag-film-card-index"><span>{String(index + 1).padStart(2, "0")}</span><span>{film.focus}</span></div>
      <Link className="mag-film-card-media" to={`/films/${film.slug}`} aria-label={`Open ${film.title}`}>
        <FilmImage film={film} eager={index < 2} />
      </Link>
      <div className="mag-film-card-copy">
        <p className="mag-film-meta">{film.year} · {film.runtime} · {film.access === "FULL_FREE" ? "WATCH FREE" : "WATCH / TRAILER"}</p>
        <h2><Link to={`/films/${film.slug}`}>{film.title}</Link></h2>
        <p>{film.description}</p>
        <div className="mag-film-card-foot"><span>{film.director}</span><Link to={`/films/${film.slug}`}>OPEN FILM →</Link></div>
      </div>
    </article>
  );
}

export function MagazineFilmsIndex() {
  const [searchParams] = useSearchParams();
  const active = (searchParams.get("topic") || "ALL").toUpperCase();
  const films = active === "ALL" ? PUBLISHED_FILMS : PUBLISHED_FILMS.filter((film) => film.focus.includes(active));

  return (
    <MagazineShell>
      <Seo
        title="4PLANET FILMS — Films worth your attention"
        description="A curated selection of documentary films about the living planet, people, systems, pressure and solutions — linked back to the original filmmakers and distributors."
        path="/films"
      />
      <main className="mag-films">
        <section className="mag-films-hero" aria-labelledby="films-title">
          <div>
            <p className="mag-films-eyebrow">4PLANET FILMS / CURATED FOR A LIVING PLANET</p>
            <h1 id="films-title">Films worth your attention.</h1>
          </div>
          <div className="mag-films-hero-note">
            <p>Documentaries that make the living world harder to ignore — and easier to understand.</p>
            <span>4PLANET does not re-host these films. We curate, contextualise and point you to the filmmakers or original distributors. Availability can vary by country.</span>
          </div>
        </section>

        <nav className="mag-film-filter" aria-label="Film topics">
          {FILTERS.map((filter) => <Link key={filter} className={active === filter ? "is-active" : ""} to={filter === "ALL" ? "/films" : `/films?topic=${filter}`}>{filter}</Link>)}
        </nav>

        <section className="mag-film-selection" aria-labelledby="selection-title">
          <header className="mag-film-selection-head">
            <div><p className="mag-films-eyebrow">SELECTION 01 / {PUBLISHED_FILMS.length} FILMS</p><h2 id="selection-title">Start here.</h2></div>
            <p>Selected for cinematic quality, relevance to a living planet and a clear route back to the people who made the work.</p>
          </header>
          {films.length ? <div className="mag-film-grid">{films.map((film, index) => <FilmCard key={film.slug} film={film} index={index} />)}</div> : <div className="mag-film-empty"><strong>No selection in this lane yet.</strong><Link to="/films">VIEW ALL FILMS →</Link></div>}
        </section>

        <section className="mag-films-method">
          <p className="mag-films-eyebrow">WHY THIS EXISTS</p>
          <div><h2>Important films already exist. Distribution is part of the work.</h2><p>4PLANET FILMS is a discovery layer inside 4PLANET Magazine: a small, edited selection rather than an endless feed. Each film stays with its creator or distributor. Our job is to help people find it, understand why it matters and connect the story to the wider living planet.</p></div>
        </section>

        <section className="mag-film-research-note">
          <span>RESEARCH POOL</span><strong>{FILM_CANDIDATES.length} qualified candidates</strong><p>The first ten are published. The wider candidate pool spans oceans, forests, wildlife, food, climate, energy, materials, Indigenous stewardship, restoration and practical solutions.</p>
        </section>
      </main>
    </MagazineShell>
  );
}

export function MagazineFilmDetail() {
  const { slug } = useParams();
  const film = filmBySlug(slug);
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

        <section className="mag-film-detail-media" aria-label={`${film.title} film media`}>
          {film.trailerId ? (
            <iframe src={`https://www.youtube-nocookie.com/embed/${film.trailerId}?rel=0`} title={`${film.title} official trailer`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          ) : <FilmImage film={film} eager />}
        </section>

        <section className="mag-film-detail-body">
          <div className="mag-film-detail-story">
            <p className="mag-films-eyebrow">THE FILM</p>
            <p className="mag-film-dek">{film.description}</p>
            <p>{film.credit}</p>
            <p className="mag-film-source-note">Synopsis condensed from official film/distributor material for discovery. 4PLANET has not independently verified every claim made inside the film.</p>
          </div>
          <aside className="mag-film-detail-actions">
            <span>{film.access === "FULL_FREE" ? "FULL FILM / FREE" : "WATCH AT ORIGINAL SOURCE"}</span>
            <a className="mag-film-watch" href={film.watchUrl} target="_blank" rel="noreferrer">{film.access === "FULL_FREE" ? "WATCH FILM →" : "OPEN FILM →"}</a>
            <a className="mag-film-source" href={film.sourceDescriptionUrl} target="_blank" rel="noreferrer">{film.sourceLabel} ↗</a>
          </aside>
        </section>

        <section className="mag-film-why">
          <p className="mag-films-eyebrow">WHY 4PLANET SELECTED IT</p>
          <h2>{film.selectionNote}</h2>
        </section>

        <nav className="mag-film-next" aria-label="More films">
          <Link to="/films">EXPLORE THE FULL SELECTION</Link>
          <Link to="/magazine">RETURN TO 4PLANET MAGAZINE</Link>
        </nav>
      </main>
    </MagazineShell>
  );
}
