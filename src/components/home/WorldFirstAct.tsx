import { useCallback, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { T } from "@/styles/tokens";
import { SPECIES_PROFILES, speciesBySlug, type SpeciesProfile } from "@/data/species";
import { speciesMedia, hasShowableImage, type MediaRecord } from "@/data/speciesMedia";
import { MEDIA_MANIFEST } from "@/content/mediaManifest";
import { findMission } from "@/content/missions";
import "./world-first-act.css";

/**
 * WORLD-FIRST ACT — front-door encounter module (bounded Factory candidate).
 *
 * Product decision: the screen after the hero should let a person MEET the living
 * world, not read an explanation of 4PLANET. One organism at large scale, one
 * dominant act (open it in SPECIES), and a quiet typographic index of the other
 * lives — no product grid, no domain grid, no manifesto.
 *
 * Every visible fact is read from existing TEST KING truth: species profiles
 * (`@/data/species`), the SPECIES rights gate (`@/data/speciesMedia`), the media
 * rights manifest and existing mission content. Nothing is asserted about live
 * events, range, abundance, population trend or delivery. Image attribution,
 * licence and context limitation always travel with the photograph.
 *
 * NOT MOUNTED in this run: `src/pages/v5/Home.tsx` is outside the write scope.
 */

/** Curated opening roster: forest, ocean, sky, pollination — five lives, not a
 *  catalogue. Filtered against real profiles and the SPECIES rights gate, so a
 *  rights change removes a life rather than producing an unlicensed image.
 *  The jaguar opens: a wild documentary photograph with a named creator and an
 *  explicit CC licence, and the sharpest cut from the planet-scale hero above. */
const DEFAULT_ROSTER: readonly string[] = [
  "jaguar",
  "orca",
  "humpback-whale",
  "hyacinth-macaw",
  "western-honey-bee",
];

interface Life {
  profile: SpeciesProfile;
  media: MediaRecord;
  mobileSrc: string;
  missionHref: string | null;
  missionLabel: string | null;
}

/** Mobile variant, derived from the authoritative rights manifest by exact file
 *  match — never a guessed filename. */
function mobileVariant(localPath: string): string {
  if (!localPath) return "";
  const asset = Object.values(MEDIA_MANIFEST).find((entry) => entry.localPath === localPath);
  return asset?.localPathMobile ?? "";
}

function buildRoster(slugs: readonly string[]): Life[] {
  return slugs.flatMap<Life>((slug) => {
    const profile = speciesBySlug(slug);
    const media = speciesMedia(slug);
    if (!profile || !media || !hasShowableImage(slug)) return [];
    const mission = profile.missionSlug ? findMission(profile.missionSlug) : null;
    return [{
      profile,
      media,
      mobileSrc: mobileVariant(media.localPath),
      missionHref: mission ? `/missions/${mission.slug}` : null,
      missionLabel: mission ? mission.name : null,
    }];
  });
}

const pad = (value: number) => String(value).padStart(2, "0");

/** The credit line already carries the licence for manifest-backed assets; only
 *  append the licence record when it says something the credit does not. */
function licenceNote(media: MediaRecord): string {
  if (!media.licence) return "";
  const kind = media.licence.split(" (")[0];
  return media.attribution.includes(kind) ? "" : media.licence;
}

export interface WorldFirstActProps {
  /** Species slugs to offer, in order. Anything without a profile or a cleared
   *  image is dropped rather than rendered as a gap. */
  slugs?: readonly string[];
  /** Which life opens the encounter. Falls back to the first available. */
  initialSlug?: string;
}

export function WorldFirstAct({ slugs = DEFAULT_ROSTER, initialSlug }: WorldFirstActProps) {
  const lives = useMemo(() => buildRoster(slugs), [slugs]);
  const [selected, setSelected] = useState(() => {
    const found = lives.findIndex((life) => life.profile.slug === initialSlug);
    return found < 0 ? 0 : found;
  });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const select = useCallback((next: number) => {
    setSelected(next);
    tabRefs.current[next]?.focus();
  }, []);

  /** Warm the next photograph on intent, at the size that viewport will use. */
  const preload = useCallback((entry: Life) => {
    if (typeof window === "undefined") return;
    const narrow = entry.mobileSrc && window.matchMedia("(max-width: 1000px)").matches;
    const src = narrow ? entry.mobileSrc : entry.media.localPath;
    if (!src) return;
    const image = new window.Image();
    image.src = src;
  }, []);

  if (lives.length === 0) return null;

  const index = Math.min(selected, lives.length - 1);
  const life = lives[index];
  const { profile, media } = life;
  const tabId = (position: number) => `${baseId}-tab-${position}`;
  const panelId = `${baseId}-panel`;

  const onIndexKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = lives.length - 1;
    let next = -1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next < 0) return;
    event.preventDefault();
    select(next);
  };

  return (
    <section
      className="wfa"
      aria-label="Life on Earth"
      style={{
        "--wfa-accent": T.blue,
        "--wfa-display": T.display,
        "--wfa-sans": T.sans,
        "--wfa-mono": T.mono,
      } as React.CSSProperties}
    >
      <div className="wfa__grid">
        <div className="wfa__col">
          <p className="wfa__eyebrow">SPECIES_ · MEET LIFE</p>

          <div className="wfa__panel" id={panelId} role="tabpanel" aria-labelledby={tabId(index)} tabIndex={-1}>
            <div className="wfa__life" key={profile.slug}>
              {profile.group && <p className="wfa__group">{profile.group}</p>}
              <h2 className="wfa__name">{profile.commonName}</h2>
              <p className="wfa__sci">{profile.scientificName} · GBIF {profile.gbifKey}</p>
              {profile.intro && <p className="wfa__intro">{profile.intro}</p>}
              {profile.habitat && (
                <p className="wfa__where">
                  <span className="wfa__label">Where it lives</span>
                  {profile.habitat}
                </p>
              )}
              {profile.descriptorSource && (
                <p className="wfa__note">
                  Description · {profile.descriptorSource.source} · checked {profile.descriptorSource.checkedAt}
                </p>
              )}

              <div className="wfa__act">
                <Link className="wfa__cta" to={`/species/${profile.slug}`}>
                  MEET THE {profile.commonName.toUpperCase()} →
                </Link>
                {life.missionHref && life.missionLabel && (
                  <Link className="wfa__mission" to={life.missionHref}>
                    {life.missionLabel} MISSION →
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="wfa__index">
            <div className="wfa__index-head">
              <span>Lives in SPECIES</span>
              <span>{pad(index + 1)} / {pad(lives.length)}</span>
            </div>
            <div
              className="wfa__tabs"
              role="tablist"
              aria-orientation="vertical"
              aria-label="Choose a life"
              onKeyDown={onIndexKeyDown}
            >
              {lives.map((entry, position) => (
                <button
                  key={entry.profile.slug}
                  ref={(node) => { tabRefs.current[position] = node; }}
                  className="wfa__tab"
                  type="button"
                  role="tab"
                  id={tabId(position)}
                  aria-controls={panelId}
                  aria-selected={position === index}
                  tabIndex={position === index ? 0 : -1}
                  onClick={() => setSelected(position)}
                  onMouseEnter={() => preload(entry)}
                  onFocus={() => preload(entry)}
                >
                  <span className="wfa__tab-no">{pad(position + 1)}</span>
                  <span className="wfa__tab-name">{entry.profile.commonName}</span>
                  <span className="wfa__tab-sci">{entry.profile.scientificName}</span>
                </button>
              ))}
            </div>
            <Link className="wfa__all" to="/species">
              ALL {SPECIES_PROFILES.length} SPECIES →
            </Link>
          </div>
        </div>

        <figure className="wfa__media">
          <picture key={profile.slug}>
            {life.mobileSrc ? <source media="(max-width: 1000px)" srcSet={life.mobileSrc} /> : null}
            <img
              src={media.localPath}
              alt={`${profile.commonName} — ${profile.scientificName}`}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <figcaption className="wfa__rights">
            <span>
              {[profile.commonName.toUpperCase(), media.attribution, licenceNote(media)]
                .filter(Boolean)
                .join(" · ")}
            </span>
            {media.limitations && <span className="wfa__rights-limit">{media.limitations}</span>}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default WorldFirstAct;
