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
import FourBrand from "@/pages/v5/FourBrand";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";
import "@/styles/identity-polish.css";

function canonicalHost() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase().replace(/^www\./, "");
}

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  const atlasHost = canonicalHost() === "4planetatlas.com";
  if (!atlasHost && !pathname.startsWith("/atlas")) return null;
  return (
    <div style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
  );
}

function ProductSurface() {
  const { pathname } = useLocation();
  const partnerHost = canonicalHost() === "partners.4planet.org";
  const fourBrandPath = pathname === "/4brand" || pathname === "/brands/value" || pathname === "/brands/analyse";
  if (fourBrandPath || (partnerHost && pathname === "/")) return <FourBrand />;
  return <AppRoutes />;
}

export default function App() {
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
        <ProductSurface />
      </FourPlanetIdentityProvider>
    </BrowserRouter>
  );
}
