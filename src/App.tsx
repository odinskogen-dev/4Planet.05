import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { Analytics } from "@/analytics/Analytics";
import { ProductRouteAnalytics } from "@/analytics/ProductRouteAnalytics";
import { PublicCompletionBridge } from "@/components/PublicCompletionBridge";
import { AtlasReturnCameraAuthority } from "@/earth/AtlasReturnCameraAuthority";
import PartnersHub from "@/pages/partners/PartnersHub";
import FourBrand from "@/pages/partners/FourBrand";
import { OdinCreatorPage } from "@/pages/v5/CreatorMarket";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";

function isPartnersHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "partners.4planet.org" || host === "4planet-partners.pages.dev" || host.endsWith(".4planet-partners.pages.dev");
}

// Canonical public host for the 4BRAND company intelligence surface.
function isFourBrandsHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4brands.org" || host === "www.4brands.org";
}

function isFourBrandPath() {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  return path === "/4brand" || path.startsWith("/4brand/");
}

function isCreatorHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "cre4tor.com" || host === "www.cre4tor.com" || host === "cre4tor.4planet.org";
}

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/atlas")) return null;
  return (
    <div className="atlas-product-switcher" style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
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

export default function App() {
  if (isFourBrandsHost()) return <FourBrand />;
  if (isPartnersHost()) return isFourBrandPath() ? <FourBrand /> : <PartnersHub />;

  return (
    <BrowserRouter>
      {isCreatorHost() ? <OdinCreatorPage /> : <StandardApp />}
    </BrowserRouter>
  );
}
