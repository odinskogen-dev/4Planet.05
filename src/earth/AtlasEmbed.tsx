import { Link } from "react-router-dom";
import { atlasEmbedHref, atlasHrefForView, type AtlasView } from "./atlasViewContract";
import "./atlas-embed.css";

/** Context-specific face of the same first-party /atlas renderer. */
export function AtlasEmbed({ view }: { view: AtlasView }) {
  const embed = atlasEmbedHref(view);
  const full = atlasHrefForView(view);
  if (!embed || !full) {
    return (
      <p className="atlas-embed-unavailable" role="status">
        {view.access === "PRIVATE"
          ? "This private map is held until a consented, tenant-scoped view is available."
          : "No defensible mapped context is available for this record."}
      </p>
    );
  }
  return (
    <section className="atlas-embed" data-testid="atlas-embed" aria-label={view.title}>
      <header className="atlas-embed__head">
        <span>4PLANET ATLAS / {view.kind}</span>
        <strong>{view.title}</strong>
      </header>
      <div className="atlas-embed__frame">
        <iframe
          src={embed}
          title={"Interactive ATLAS: " + view.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          allowFullScreen
        />
      </div>
      <div className="atlas-embed__foot">
        <p>{view.description ?? "Explore geographic context from the existing shared ATLAS."}</p>
        <Link to={full} aria-label={"Open " + view.title + " in full ATLAS"}>OPEN FULL ATLAS ↗</Link>
      </div>
      <p className="atlas-embed__limit">{view.limitation}</p>
    </section>
  );
}
