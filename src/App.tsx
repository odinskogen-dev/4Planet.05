import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import { Analytics } from "@/analytics/Analytics";
import { ProductRouteAnalytics } from "@/analytics/ProductRouteAnalytics";
import { PublicCompletionBridge } from "@/components/PublicCompletionBridge";
import { AtlasReturnCameraAuthority } from "@/earth/AtlasReturnCameraAuthority";
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/atlas")) return null;
  return (
    <div className="atlas-product-switcher" style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
