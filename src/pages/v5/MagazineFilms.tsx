import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import { trackEvent } from "@/analytics/Analytics";
import { PUBLISHED_FILMS, filmBySlug, relatedFilms, type FilmRecord, type FilmTopic } from "@/content/magazineFilms";
import "@/styles/magazine-films.css";
import "@/styles/magazine-films-gold-02.css";
import "@/styles/magazine-films-premium-03.css";
import "@/styles/magazine-films-premium-04.css";

type FilterId = "ALL" | FilmTopic;
type MazeLayout = "wide" | "portrait" | "small" | "compact" | "feature";

type Connection = {
  domain: "OCE4N_" | "E4RTH_" | "S4PIENS_" | "4CULTURE_";
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

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

const SAVED_KEY = "4planet-films-saved-v1";
const FEATURED_SLUGS = ["yanuni", "the-territory", "chasing-coral", "my-octopus-teacher", "breaking-boundaries", "the-biggest-little-farm"];

function accessLabel(film: FilmRecord) {
  if (film.access === "FULL_FREE") return "WATCH FREE";
  if (film.access === "STREAM") return "STREAM";
  if (film.access === "TRAILER") return "TRAILER";
  return "VIEW OPTIONS";
}

function runtimeMinutes(film: FilmRecord) {
  const value = Number.parseInt(film.runtime, 10);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function filmConnection(film: FilmRecord): Connection {
  if (film.topics.includes("OCEAN")) {
    return {
      domain: "OCE4N_",
      title: "See the ocean system around the story.",
      description: "Continue from the film into 4PLANET’s ocean reporting, places and living-system context.",
      href: "/magazine?topic=OCEAN",
      linkLabel: "EXPLORE OCEAN STORIES →",
    };
  }
  if (film.topics.includes("FOOD") || film.topics.includes("ENERGY")) {
    return {
      domain: "S4PIENS_",
      title: "Follow the human system behind the film.",
      description: "Food, energy, materials and infrastructure become more useful when the choices and consequences stay connected.",
      href: film.topics.includes("FOOD") ? "/magazine?topic=FOOD" : "/magazine?topic=CLIMATE",
      linkLabel: film.topics.includes("FOOD") ? "EXPLORE FOOD STORIES →" : "EXPLORE SYSTEM STORIES →",
    };
  }
  if (film.topics.includes("LAND_WILDLIFE")) {
    return {
      domain: "E4RTH_",
      title: "Continue into place, species and living systems.",
      description: "The film is one view of a larger ecological system. Keep following the places, species and pressures around it.",
      href: "/magazine?topic=NATURE",
      linkLabel: "EXPLORE NATURE STORIES →",
    };
  }
  return {
    domain: "4CULTURE_",
    title: "Keep the story moving.",
    description: "4PLANET FILMS sits inside the cultural layer: stories that make planetary change easier to see, remember and act on.",
    href: "/magazine",
    linkLabel: "OPEN 4PLANET MAGAZINE →",
  };
}

function readSavedFilms() {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]");
    return new Set<string>(Array.isArray(parsed) ? parsed.filter((value) => typeof value === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function useSavedFilms() {
  const [saved, setSaved] = useState<Set<string>>(() => readSavedFilms());
  const toggle = (slug: string) => {
    setSaved((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      window.localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      trackEvent("film_save_toggle", { film_slug: slug, saved: next.has(slug) });
      return next;
    });
  };
  return { saved, toggle };
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
        <small>{film.year} / OFFICIAL ART TEMPORARILY UNAVAILABLE</small>
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

function FilmCard({ film, index, saved, onSave }: { film: FilmRecord; index: number; saved: boolean; onSave: () => void }) {
  const layout = MAZE_LAYOUTS[index % MAZE_LAYOUTS.length];
  return (
    <article className={`mag-film-card mag-film-card--${layout}`} data-accent={film.accent} data-layout={layout} data-film-slug={film.slug}>
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
        <div className="mag-film-card-foot">
          <span>{film.director}</span>
          <div className="mag-film-card-actions">
            <button type="button" className="mag-film-card-save" aria-pressed={saved} onClick={onSave}>{saved ? "SAVED" : "SAVE +"}</button>
            <Link to={`/films/${film.slug}`} onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: "films_grid_cta" })}>OPEN FILM →</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function FilmRail({ title, eyebrow, films }: { title: string; eyebrow: string; films: FilmRecord[] }) {
  if (!films.length) return null;
  return (
    <section className="mag-film-lane" aria-label={title}>
      <header><div><p className="mag-films-eyebrow">{eyebrow}</p><h2>{title}</h2></div><span>{films.length} SELECTED</span></header>
      <div className="mag-film-lane-track">
        {films.map((film) => (
          <Link key={film.slug} className="mag-film-lane-card" data-accent={film.accent} to={`/films/${film.slug}`} onClick={() => trackEvent("film_open", { film_slug: film.slug, placement: `lane_${eyebrow.toLowerCase().replaceAll(" ", "_")}` })}>
            <div><FilmImage film={film} decorative /></div>
            <span>{accessLabel(film)} · {film.runtime}</span>
            <strong>{film.title}</strong>
          </Link>
        ))}
      </div>
    </section>
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { saved, toggle } = useSavedFilms();
  const availableFilters = FILTER_OPTIONS.filter((filter) => filter.id === "ALL" || PUBLISHED_FILMS.some((film) => film.topics.includes(filter.id as FilmTopic)));
  const requested = (searchParams.get("topic") || "ALL").toUpperCase() as FilterId;
  const active = availableFilters.some((filter) => filter.id === requested) ? requested : "ALL";
  const query = (searchParams.get("q") || "").trim();
  const savedOnly = searchParams.get("saved") === "1";
  const [searchValue, setSearchValue] = useState(query);

  useEffect(() => setSearchValue(query), [query]);

  const films = useMemo(() => {
    let next = active === "ALL" ? PUBLISHED_FILMS : PUBLISHED_FILMS.filter((film) => film.topics.includes(active));
    if (savedOnly) next = next.filter((film) => saved.has(film.slug));
    if (query) {
      const needle = query.toLowerCase();
      next = next.filter((film) => [film.title, film.director, film.focus, film.description, ...film.topics].join(" ").toLowerCase().includes(needle));
    }
    return next;
  }, [active, query, savedOnly, saved]);

  const featured = FEATURED_SLUGS.map((slug) => filmBySlug(slug)).filter((film): film is FilmRecord => Boolean(film));
  const free = PUBLISHED_FILMS.filter((film) => film.access === "FULL_FREE").slice(0, 10);
  const shorts = PUBLISHED_FILMS.filter((film) => runtimeMinutes(film) <= 30).slice(0, 10);
  const recent = [...PUBLISHED_FILMS].slice(-10).reverse();
  const showEditorialLanes = active === "ALL" && !query && !savedOnly;

  useEffect(() => {
    trackEvent("films_index_view", { published_films: PUBLISHED_FILMS.length, filter: active.toLowerCase(), query: query || undefined, saved_only: savedOnly });
  }, [active, query, savedOnly]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue.trim()) params.set("q", searchValue.trim());
    else params.delete("q");
    setSearchParams(params);
    trackEvent("film_search", { query: searchValue.trim() });
  };

  const toggleSavedOnly = () => {
    const params = new URLSearchParams(searchParams);
    if (savedOnly) params.delete("saved");
    else params.set("saved", "1");
    setSearchParams(params);
  };

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

        <section className="mag-film-discovery-tools" aria-label="Find a film">
          <form onSubmit={submitSearch} role="search">
            <label htmlFor="film-search">FIND A FILM</label>
            <div><input id="film-search" type="search" value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Title, director, ocean, food…" autoComplete="off" /><button type="submit">SEARCH →</button></div>
          </form>
          <button type="button" className={savedOnly ? "is-active" : ""} aria-pressed={savedOnly} onClick={toggleSavedOnly}>SAVED {saved.size}</button>
        </section>

        <nav className="mag-film-filter" aria-label="Film topics">
          {availableFilters.map((filter) => {
            const params = new URLSearchParams(searchParams);
            if (filter.id === "ALL") params.delete("topic");
            else params.set("topic", filter.id);
            return (
              <Link
                key={filter.id}
                className={active === filter.id ? "is-active" : ""}
                aria-current={active === filter.id ? "page" : undefined}
                to={`/films${params.toString() ? `?${params.toString()}` : ""}`}
                onClick={() => trackEvent("film_filter_use", { filter: filter.id.toLowerCase() })}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {showEditorialLanes ? (
          <section className="mag-film-editorial-lanes" aria-label="Curated ways into 4PLANET Films">
            <FilmRail eyebrow="FEATURED" title="Begin with these." films={featured} />
            <FilmRail eyebrow="WATCH FREE" title="Watch now." films={free} />
            <FilmRail eyebrow="SHORT FILMS" title="Thirty minutes or less." films={shorts} />
            <FilmRail eyebrow="NEW TO 4PLANET" title="Recently added." films={recent} />
          </section>
        ) : null}

        <section className="mag-film-selection" aria-labelledby="selection-title">
          <header className="mag-film-selection-head">
            <div><p className="mag-films-eyebrow">CURATED SELECTION / {films.length} {films.length === 1 ? "FILM" : "FILMS"}</p><h2 id="selection-title">{savedOnly ? "Your saved films." : query ? `Results for “${query}”.` : active === "ALL" ? "Explore the selection." : FILTER_OPTIONS.find((item) => item.id === active)?.label}</h2></div>
            <p>{query || savedOnly || active !== "ALL" ? "A focused view of the same curated selection. Clear the search or filters whenever you want the full editorial map." : "Selected for cinematic quality, relevance to a living planet and a clear route back to the people who made the work."}</p>
          </header>
          {films.length ? <div className="mag-film-grid">{films.map((film, index) => <FilmCard key={film.slug} film={film} index={index} saved={saved.has(film.slug)} onSave={() => toggle(film.slug)} />)}</div> : <div className="mag-film-empty"><h3>No films match this view.</h3><Link to="/films">RESET DISCOVERY →</Link></div>}
        </section>
      </main>
    </MagazineShell>
  );
}

export function MagazineFilmDetail() {
  const { slug } = useParams();
  const film = filmBySlug(slug);
  const related = film ? relatedFilms(film.slug, 4) : [];
  const { saved, toggle } = useSavedFilms();
  const [shareState, setShareState] = useState<"idle" | "shared" | "copied">("idle");

  useEffect(() => {
    if (film) trackEvent("film_open", { film_slug: film.slug, placement: "film_detail" });
  }, [film]);

  if (!film) return <Navigate to="/films" replace />;
  const connection = filmConnection(film);
  const isSaved = saved.has(film.slug);

  const share = async () => {
    const url = `${window.location.origin}/films/${film.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${film.title} — 4PLANET FILMS`, text: film.description, url });
        setShareState("shared");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setShareState("copied");
      }
      trackEvent("film_share", { film_slug: film.slug, method: navigator.share ? "native" : "clipboard" });
    } catch {
      setShareState("idle");
    }
  };

  return (
    <MagazineShell>
      <Seo title={`${film.title} — 4PLANET FILMS`} description={film.description} path={`/films/${film.slug}`} image={film.imageUrl} />
      <main className="mag-film-detail" data-film-slug={film.slug}>
        <Link className="mag-film-back" to="/films">← ALL FILMS</Link>

        <header className="mag-film-detail-head mag-film-detail-head--gold">
          <div className="mag-film-detail-title-block">
            <p className="mag-films-eyebrow">4PLANET FILMS / {film.focus}</p>
            <h1>{film.title}</h1>
            <p className="mag-film-detail-standfirst">{film.description}</p>
            <div className="mag-film-detail-meta"><span>{film.year}</span><span>{film.runtime}</span><span>{film.director}</span><span>{accessLabel(film)}</span></div>
          </div>
          <figure className="mag-film-key-art">
            <FilmImage film={film} eager />
            <figcaption>{film.imageCredit}. Rights remain with the film/rightsholder.</figcaption>
          </figure>
        </header>

        <section className="mag-film-primary-actions" aria-label={`${film.title} actions`}>
          <div><span>{film.platform}</span><strong>{accessLabel(film)}</strong></div>
          <a className="mag-film-watch" href={film.watchUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("film_watch_click", { film_slug: film.slug, access: film.access.toLowerCase(), platform: film.platform })}>{film.access === "FULL_FREE" ? "WATCH FILM →" : film.access === "TRAILER" ? "WATCH TRAILER →" : "OPEN WATCH ROUTE →"}</a>
          <button type="button" className="mag-film-save" aria-pressed={isSaved} onClick={() => toggle(film.slug)}>{isSaved ? "SAVED ✓" : "SAVE FILM +"}</button>
          <button type="button" className="mag-film-share" onClick={share}>{shareState === "copied" ? "LINK COPIED ✓" : shareState === "shared" ? "SHARED ✓" : "SHARE ↗"}</button>
        </section>

        {film.trailerId ? (
          <section className="mag-film-official-media" aria-labelledby="official-media-title">
            <header><p className="mag-films-eyebrow">OFFICIAL MEDIA</p><h2 id="official-media-title">Watch the trailer.</h2></header>
            <div className="mag-film-detail-media" aria-label={`${film.title} official trailer`}>
              <iframe src={`https://www.youtube-nocookie.com/embed/${film.trailerId}?rel=0`} title={`${film.title} official film or trailer`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
          </section>
        ) : null}

        <section className="mag-film-detail-body mag-film-detail-body--gold">
          <div className="mag-film-detail-story">
            <p className="mag-films-eyebrow">THE FILM</p>
            <p className="mag-film-dek">{film.description}</p>
            <div className="mag-film-themes" aria-label="Film themes">{film.topics.map((topic) => <Link key={topic} to={`/films?topic=${topic}`}>{topic.replace("LAND_WILDLIFE", "LAND + WILDLIFE").replaceAll("_", " ")}</Link>)}</div>
          </div>
          <aside className="mag-film-facts">
            <dl>
              <div><dt>DIRECTED BY</dt><dd>{film.director}</dd></div>
              <div><dt>YEAR / RUNTIME</dt><dd>{film.year} / {film.runtime}</dd></div>
              <div><dt>WATCH</dt><dd>{film.platform}</dd></div>
              <div><dt>CREDITS</dt><dd>{film.credit}</dd></div>
            </dl>
          </aside>
        </section>

        <section className="mag-film-why">
          <p className="mag-films-eyebrow">WHY 4PLANET SELECTED IT</p>
          <h2>{film.selectionNote}</h2>
        </section>

        <section className="mag-film-context" aria-labelledby="film-context-title">
          <div><p className="mag-films-eyebrow">{connection.domain} / CONTINUE THE STORY</p><h2 id="film-context-title">{connection.title}</h2><p>{connection.description}</p></div>
          <nav aria-label="Continue into 4PLANET"><Link to={connection.href}>{connection.linkLabel}</Link><Link to="/magazine/atlas">OPEN 4PLANET ATLAS →</Link></nav>
        </section>

        <section className="mag-film-provenance" aria-labelledby="film-source-title">
          <header><p className="mag-films-eyebrow">SOURCE / AVAILABILITY</p><h2 id="film-source-title">Back to the people who made it.</h2></header>
          <div>
            <p><strong>AVAILABILITY</strong>{film.availabilityNote}</p>
            <p><strong>EDITORIAL NOTE</strong>Description condensed from official film/distributor material for discovery. 4PLANET has not independently verified every claim made inside the film.</p>
            <a className="mag-film-source" href={film.sourceDescriptionUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("film_source_click", { film_slug: film.slug, source: film.sourceLabel })}>{film.sourceLabel} ↗</a>
          </div>
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
