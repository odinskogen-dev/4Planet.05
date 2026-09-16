import { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ShareMetadata } from "@/components/ShareMetadata";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { Analytics } from "@/analytics/Analytics";
import { ProductRouteAnalytics } from "@/analytics/ProductRouteAnalytics";
import { PublicCompletionBridge } from "@/components/PublicCompletionBridge";
import { AtlasReturnCameraAuthority } from "@/earth/AtlasReturnCameraAuthority";
import { FourPlanetIdentityProvider } from "@/auth/FourPlanetIdentity";
import FourBrandLive from "@/pages/partners/FourBrandsLive";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";
import "@/styles/identity-polish.css";

const FOURBRANDS_SANDBOX = "/sandbox/4brands-company-twin";

function normalisedPath() {
  if (typeof window === "undefined") return "/";
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

function isFourBrandHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4brand.org" || host === "www.4brand.org";
}

function isLegacyFourBrandsHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4brands.org" || host === "www.4brands.org";
}

function isFourBrandPath() {
  const path = normalisedPath();
  return path === "/4brand" || path.startsWith("/4brand/") || path === FOURBRANDS_SANDBOX || path.startsWith(`${FOURBRANDS_SANDBOX}/`);
}

function isLegacyFourBrandsPath() {
  const path = normalisedPath();
  return path === "/4brands" || path.startsWith("/4brands/");
}

function LegacyFourBrandsRedirect({ toStandalone = false }: { toStandalone?: boolean }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = normalisedPath().replace(/^\/4brands(?=\/|$)/, "/4brand");
    const destination = `${path}${window.location.search}${window.location.hash}`;
    if (toStandalone) {
      window.location.replace(`https://4brand.org${destination === "/" ? "" : destination}`);
      return;
    }
    window.location.replace(destination);
  }, [toStandalone]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f4f4ef", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <a href={toStandalone ? "https://4brand.org" : "/4brand"} style={{ color: "inherit" }}>Continue to 4BRAND</a>
    </main>
  );
}

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  const atlasHost = typeof window !== "undefined" && window.location.hostname.toLowerCase().replace(/^www\./, "") === "4planetatlas.com";
  if (!atlasHost && !pathname.startsWith("/atlas")) return null;
  return (
    <div style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
  );
}

export default function App() {
  if (isLegacyFourBrandsHost()) return <LegacyFourBrandsRedirect toStandalone />;
  if (isLegacyFourBrandsPath()) return <LegacyFourBrandsRedirect />;
  if (isFourBrandHost() || isFourBrandPath()) return <FourBrandLive />;

  return (
    <BrowserRouter>
      <FourPlanetIdentityProvider>
        <ShareMetadata />
        <ScrollToTop />
        <ContextRetained />
        <Analytics />
        <ProductRouteAnalytics />
        <AtlasReturnCameraAuthority />
        <AtlasProductSwitcher />
        <PublicCompletionBridge />
        <AppRoutes />
      </FourPlanetIdentityProvider>
    </BrowserRouter>
  );
}
