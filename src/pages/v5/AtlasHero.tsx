import { Link } from "react-router-dom";
import { img } from "@/content/imageRegistry";

/**
 * Founder-selected LOST GOLD donor: build/market-sale-01-poster.
 * Brand invitation first; the shared ATLAS is the primary product handoff.
 */
const still = img("heroEarth");

export function AtlasHero() {
  return (
    <section className="planet-hero">
      <img
        src={still.src}
        alt={still.alt}
        decoding="async"
        className="earth-breathe"
      />
      <div aria-hidden className="earth-atmos" />
      <div aria-hidden className="planet-hero__scrim" />

      <div className="planet-hero__content">
        <div className="home-kicker planet-hero__kicker">4PLANET_ For a Living Planet</div>
        <h1>Everything you love is connected.</h1>
        <p>Explore one living planet — its places, species, pressures and the relationships that keep life going.</p>
        <div className="planet-hero__actions">
          <Link to="/atlas" className="home-brand-button">EXPLORE THE PLANET</Link>
          <Link to="/join" className="home-brand-button">JOIN US</Link>
        </div>
      </div>
    </section>
  );
}
