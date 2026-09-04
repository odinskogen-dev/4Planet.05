import { Link } from "react-router-dom";
import { MagazineShell } from "@/components/magazine/MagazineShell";
import { Seo } from "@/components/Seo";
import "@/styles/magazine-atlas-public.css";

export function MagazineAtlas() {
  return (
    <MagazineShell>
      <Seo
        title="4PLANET ATLAS — Explore the planet behind the stories"
        description="An interactive 4PLANET view connecting place, active-fire detections and biodiversity context on one explorable Earth."
        path="/magazine/atlas"
      />
      <main className="mag-public-atlas">
        <header className="mag-public-atlas-head">
          <p>BUILT BY 4PLANET / PLANETARY INTELLIGENCE</p>
          <h1>The planet behind the story.</h1>
          <div>
            <p>ATLAS is 4PLANET’s interactive planetary interface. It brings spatial context into the same reading journey as species, ecosystems and reporting — without pretending that a map layer proves more than its source supports.</p>
            <p>This view opens with NASA Blue Marble imagery, active-fire detections and biodiversity-density context. Layers are different kinds of evidence; they should be read as layers, not merged into one claim.</p>
          </div>
        </header>
        <section className="mag-public-atlas-frame" aria-label="Interactive 4PLANET ATLAS">
          <iframe title="4PLANET ATLAS interactive globe" src="/atlas?embed=mag&l=bluemarble,fires,biodiv&z=1.65&c=5,18" allow="fullscreen" referrerPolicy="strict-origin-when-cross-origin" />
        </section>
        <nav className="mag-public-atlas-next" aria-label="Continue reading">
          <Link to="/magazine/topics/nature">FOLLOW NATURE →</Link>
          <Link to="/magazine/topics/ocean">FOLLOW OCEAN →</Link>
          <Link to="/magazine">BACK TO THE EDITION →</Link>
        </nav>
      </main>
    </MagazineShell>
  );
}
