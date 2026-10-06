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
        <div className="home-kicker planet-hero__kicker">4Planet_ For a Living Planet</div>
        <h1><span>Everything you love</span>{" "}<span>is connected.</span></h1>
        <p>4Planet helps you understand the living planet, see how human systems affect it and find credible ways to help.</p>
        <div className="planet-hero__actions">
          <Link to="/atlas" className="home-brand-button">Explore the planet</Link>
          <Link to="/join" className="home-brand-button">Join us</Link>
        </div>
      </div>
    </section>
  );
}
