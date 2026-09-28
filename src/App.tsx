import { lazy, Suspense, type ReactNode } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { Analytics } from "@/analytics/Analytics";
import { ProductRouteAnalytics } from "@/analytics/ProductRouteAnalytics";
import { PublicCompletionBridge } from "@/components/PublicCompletionBridge";
import { AtlasReturnCameraAuthority } from "@/earth/AtlasReturnCameraAuthority";
import { AtlasEmbedRuntime } from "@/earth/AtlasEmbedRuntime";
import { isAtlasEmbedKind } from "@/earth/atlasViewContract";
import IdentityApp from "@/pages/identity/IdentityApp";

import { OdinCreatorPage } from "@/pages/v5/CreatorMarket";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";

// Standalone product hosts do not belong in the ATLAS/4PLANET entry bundle.
const PartnersHub = lazy(() => import("@/pages/partners/PartnersHub"));
const NationPage = lazy(() => import("@/pages/nation/NationPage"));
const FourBrand = lazy(() => import("@/pages/partners/FourBrand"));

function isPartnersHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "partners.4planet.org" || host === "4planet-partners.pages.dev" || host.endsWith(".4planet-partners.pages.dev");
}

function isNationHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4nation.org" || host === "www.4nation.org" || host === "4planet-nation.pages.dev" || host.endsWith(".4planet-nation.pages.dev");
}

function isFourBrandsHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4brands.org" || host === "www.4brands.org";
}

function isFourBrandPath() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/4brand" || path.startsWith("/4brand/") || path === "/4brands" || path.startsWith("/4brands/");
}

function isIdentitySurface() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname;
  return host === "id.4planet.org" || path === "/id" || path.startsWith("/id/") || path === "/auth/4planet/callback" || path === "/oauth/consent";
}

function isCreatorHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "cre4tor.com" || host === "www.cre4tor.com" || host === "cre4tor.4planet.org";
}

function AtlasProductSwitcher() {
  const { pathname, search } = useLocation();
  if (!pathname.startsWith("/atlas") || isAtlasEmbedKind(new URLSearchParams(search).get("embed"))) return null;
  return (
    <div className="atlas-product-switcher" style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
  );
}

function MeasuredStandalone({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <Analytics />
      <ProductRouteAnalytics />
      <Suspense fallback={<main role="status" style={{ padding: 24, minHeight: "100svh" }}>Loading product…</main>}>{children}</Suspense>
    </BrowserRouter>
  );
}

function StandardApp() {
  return (
    <>
      <ScrollToTop />
      <ContextRetained />
      <Analytics />
      <ProductRouteAnalytics />
      <AtlasReturnCameraAuthority />
      <AtlasEmbedRuntime />
      <AtlasProductSwitcher />
      <PublicCompletionBridge />
      <AppRoutes />
      <style>{`
        @media(max-width:720px){
          .atlas-product-switcher{display:none!important}
          .world:has(.site-menu) .atlas-panel,
          .world:has(.site-menu) .lens-rail,
          .world:has(.site-menu) .maplibregl-ctrl-top-left,
          .world:has(.site-menu) .maplibregl-ctrl-top-right,
          .world:has(.site-menu) .maplibregl-ctrl-bottom-left,
          .world:has(.site-menu) .maplibregl-ctrl-bottom-right{opacity:0!important;pointer-events:none!important}
          .world:has(.site-menu) .site-menu{max-height:calc(100svh - 76px);overflow-y:auto;overscroll-behavior:contain}
        }
      `}</style>
    </>
  );
}

function isFirstPartyAtlasEmbedRoute() {
  if (typeof window === "undefined") return false;
  return window.location.pathname === "/atlas" &&
    isAtlasEmbedKind(new URLSearchParams(window.location.search).get("embed"));
}

export default function App() {
  if (isIdentitySurface()) return <IdentityApp />;

  // Standalone hosts must not recursively render their homepage inside /atlas iframes.
  if (isFirstPartyAtlasEmbedRoute() || (isNationHost() && window.location.pathname === "/atlas")) return <BrowserRouter><StandardApp /></BrowserRouter>;
  if (isNationHost()) return <MeasuredStandalone><NationPage /></MeasuredStandalone>;
  if (isFourBrandsHost() || isFourBrandPath()) return <MeasuredStandalone><FourBrand /></MeasuredStandalone>;
  if (isPartnersHost()) return <MeasuredStandalone><PartnersHub /></MeasuredStandalone>;
  if (isCreatorHost()) return <MeasuredStandalone><OdinCreatorPage /></MeasuredStandalone>;

  return (
    <BrowserRouter>
      <StandardApp />
    </BrowserRouter>
  );
}
