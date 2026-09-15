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
import FourBrand from "@/pages/partners/FourBrand";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";
import "@/styles/identity-polish.css";

function isFourBrandsHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "4brands.org" || host === "www.4brands.org";
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
  if (isFourBrandsHost()) return <FourBrand />;

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
