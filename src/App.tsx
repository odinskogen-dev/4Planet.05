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

function hostIs(...hosts: string[]) {
  if (typeof window === "undefined") return false;
  return hosts.includes(window.location.hostname.toLowerCase());
}

function isFourBrandsHost() {
  return hostIs("4brands.org", "www.4brands.org");
}

function isLegacyFourBrandHost() {
  return hostIs("4brand.org", "www.4brand.org");
}

function isFourBrandsSandbox() {
  const path = normalisedPath();
  return path === FOURBRANDS_SANDBOX || path.startsWith(`${FOURBRANDS_SANDBOX}/`);
}

function isLegacyFourBrandsPath() {
  const path = normalisedPath();
  return path === "/4brand" || path.startsWith("/4brand/") || path === "/4brands" || path.startsWith("/4brands/");
}

function CanonicalFourBrandsRedirect() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    let path = normalisedPath();
    path = path.replace(/^\/4brands?(?=\/|$)/, "") || "/";
    const allowed = ["/", "/overview", "/money", "/value", "/decisions"];
    if (!allowed.includes(path)) path = "/";
    window.location.replace(`https://4brands.org${path === "/" ? "/" : path}${window.location.search}${window.location.hash}`);
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f5f2", color: "#111", fontFamily: "system-ui, sans-serif" }}>
      <a href="https://4brands.org" style={{ color: "inherit" }}>Continue to 4BRANDS</a>
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
  if (isLegacyFourBrandHost() || isLegacyFourBrandsPath()) return <CanonicalFourBrandsRedirect />;
  if (isFourBrandsHost() || isFourBrandsSandbox()) return <FourBrandLive />;

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
