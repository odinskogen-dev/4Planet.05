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
import "@/styles/global.css";
import "@/styles/species-source-first-read-v01.css";
import "@/styles/responsive-footer.css";
import "@/styles/gold-human-craft.css";
import "@/styles/premium-completion.css";

function AtlasProductSwitcher() {
  const { pathname, search } = useLocation();
  if (!pathname.startsWith("/atlas") || isAtlasEmbedKind(new URLSearchParams(search).get("embed"))) return null;
  return (
    <div style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
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
      <AtlasEmbedRuntime />
      <AtlasProductSwitcher />
      <PublicCompletionBridge />
      <AppRoutes />
    </BrowserRouter>
  );
}
