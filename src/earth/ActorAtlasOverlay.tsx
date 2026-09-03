import { Link, useLocation } from "react-router-dom";
import { ACTORS, actorById } from "@/data/actors";
import { T } from "@/styles/tokens";
import "@/styles/actors.css";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 9.5,
  letterSpacing: ".11em",
  textTransform: "uppercase",
};

function atlasHref(actorId: string, geoId: string, longitude: number, latitude: number, zoom: number) {
  const params = new URLSearchParams({
    mode: "actors",
    entity: actorId,
    actorGeo: geoId,
    c: `${longitude},${latitude}`,
    z: String(zoom),
  });
  return `/atlas?${params.toString()}`;
}

export function ActorAtlasOverlay() {
  const location = useLocation();
  if (location.pathname !== "/atlas") return null;
  const params = new URLSearchParams(location.search);
  if (params.get("mode") !== "actors") return null;

  const selected = actorById(params.get("entity")) ?? ACTORS[0];
  const selectedGeoId = params.get("actorGeo") ?? selected.geographies[0].id;

  return (
    <aside className="actor-atlas-overlay" aria-label="Actor Mode private beta">
      <div className="actor-atlas-inner">
        <div className="actor-atlas-head">
          <div>
            <div style={{ ...mono, color: T.blue }}>ATLAS_ · ACTOR MODE</div>
            <h2>Who is working where?</h2>
          </div>
          <Link to="/atlas" className="actor-atlas-close">CLOSE</Link>
        </div>
        <div className="actor-atlas-disclosure">
          <strong>PRIVATE BETA — NOT PUBLIC.</strong> The existing ATLAS engine remains underneath this source-aware context layer. Headquarters, operating regions and programme geography are separate concepts. A camera reference is not proof of an exact field site.
        </div>

        <nav className="actor-atlas-list" aria-label="Private beta actors">
          {ACTORS.map((actor) => {
            const geo = actor.geographies[0];
            return (
              <a
                key={actor.id}
                href={atlasHref(actor.id, geo.id, geo.longitude, geo.latitude, geo.zoom)}
                aria-current={actor.id === selected.id}
              >
                <span style={{ ...mono, color: actor.id === selected.id ? "inherit" : T.blue }}>{actor.actorTypeLabel}</span>
                <strong style={{ display: "block", marginTop: 7 }}>{actor.name}</strong>
              </a>
            );
          })}
        </nav>

        <section className="actor-atlas-selected">
          <div style={{ ...mono, color: T.blue }}>{selected.id} · {selected.status}</div>
          <h3>{selected.name}</h3>
          <p>{selected.introduction}</p>
          <div className="actor-atlas-geos">
            {selected.geographies.map((geo) => (
              <div className="actor-atlas-geo" key={geo.id} style={{ borderColor: selectedGeoId === geo.id ? T.blue : undefined }}>
                <div style={{ ...mono, color: geo.role === "HEADQUARTERS_REFERENCE" ? "#8A6500" : T.blue }}>{geo.role.replaceAll("_", " ")}</div>
                <strong style={{ display: "block", marginTop: 8 }}>{geo.label}</strong>
                <p>{geo.description}</p>
                <a href={atlasHref(selected.id, geo.id, geo.longitude, geo.latitude, geo.zoom)} aria-current={selectedGeoId === geo.id}>CENTRE EXISTING ATLAS HERE →</a>
              </div>
            ))}
          </div>
          <div className="actor-atlas-footer">
            <Link className="actor-button actor-button-primary" to={`/actors/${selected.slug}`}>OPEN PROFILE →</Link>
            <Link className="actor-button" to="/actors">ALL ORGANISATIONS →</Link>
          </div>
        </section>
      </div>
    </aside>
  );
}
