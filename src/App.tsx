import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import "@/styles/global.css";
import "@/styles/living-systems-s05.css";
import "@/styles/responsive-footer.css";
import "@/styles/one-interface-universe.css";

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/atlas")) return null;
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
      <AtlasProductSwitcher />
      <AppRoutes />
    </BrowserRouter>
  );
}
