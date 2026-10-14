import { Link } from "react-router-dom";
import { atlasOrigin, nationBase } from "./NationApp";

export function NationFooter() {
  return (
    <footer className="n-footer">
      <div className="n-footer__brand">
        <span className="n-wordmark">4NATION<span>BETTER NATION</span></span>
        <p>Nonpartisan, source-grounded country intelligence. Facts, interpretation and uncertainty are kept apart. Missing data is shown as missing — never as zero.</p>
      </div>
      <nav aria-label="Footer">
        <a href="https://4planet.org/">4PLANET ↗</a>
        <a href={(atlasOrigin() || "") + "/atlas"}>ATLAS ↗</a>
        <Link to={`${nationBase()}/decisions`}>Public decisions</Link>
        <a href="https://id.4planet.org/">4PLANET ID ↗</a>
      </nav>
      <p className="n-footer__src n-mono">DATA: WORLD BANK WDI VIA UNESCO DATAHUB (CC BY-SA 4.0) · UNESCO / IOC-UNESCO (CC BY-SA 4.0) · NATURAL EARTH (PUBLIC DOMAIN) · NASA GIBS IN ATLAS</p>
    </footer>
  );
}
