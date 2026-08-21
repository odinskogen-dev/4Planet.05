import { useLocation } from "react-router-dom";
import "@/styles/cre4tors-market-entry.css";

const CRE4TORS_HOSTS = new Set(["cre4tors.com", "www.cre4tors.com"]);
const MARKET_HOSTS = new Set(["4planetmarket.com", "www.4planetmarket.com"]);

export function Cre4torsMarketEntry() {
  const { pathname } = useLocation();
  const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const onCre4torsHost = CRE4TORS_HOSTS.has(host);
  const onMarketHost = MARKET_HOSTS.has(host);
  const onCreatorSurface = pathname === "/cre4tors" || (pathname === "/" && onCre4torsHost);
  const onMarketSurface = pathname === "/market" || (pathname === "/" && onMarketHost);

  if (onCreatorSurface) {
    const marketHref = onCre4torsHost ? "https://4planetmarket.com" : "/market";
    return (
      <a className="c4-market-entry" href={marketHref} aria-label="Open 4MARKET Creator Impact Gold">
        <span>4PLANET · GOLD 01</span>
        <strong>4MARKET_</strong>
        <b>ART × IMPACT ↗</b>
      </a>
    );
  }

  if (onMarketSurface) {
    const creatorsHref = onMarketHost ? "https://cre4tors.com" : "/cre4tors";
    return (
      <a className="c4-market-entry" href={creatorsHref} aria-label="Open CRE4TORS creator operating system">
        <span>MAKE · PUBLISH · EARN</span>
        <strong>CRE4TORS_</strong>
        <b>CREATOR ENGINE ↗</b>
      </a>
    );
  }

  return null;
}
