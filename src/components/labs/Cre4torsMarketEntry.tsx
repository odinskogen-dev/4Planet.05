import { Link, useLocation } from "react-router-dom";
import "@/styles/cre4tors-market-entry.css";

export function Cre4torsMarketEntry() {
  const { pathname } = useLocation();
  const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const onCre4torsHost = host === "cre4tors.com" || host === "www.cre4tors.com";
  const onCreatorSurface = pathname === "/cre4tors" || (pathname === "/" && onCre4torsHost);

  if (!onCreatorSurface) return null;

  return (
    <Link className="c4-market-entry" to="/market" aria-label="Open 4PLANET Market Creator Impact Gold">
      <span>NEW · GOLD 01</span>
      <strong>MARKET</strong>
      <b>ART × IMPACT ↗</b>
    </Link>
  );
}
