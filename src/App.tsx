import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
import LabsOverview from "@/pages/labs/LabsOverview";
import "@/styles/global.css";
import "@/styles/responsive-footer.css";

function AtlasProductSwitcher() {
  const { pathname } = useLocation();
  if (!pathname.startsWith("/atlas")) return null;
  return (
    <div style={{ position: "fixed", top: 14, left: 14, zIndex: 90 }}>
      <ProductSwitcher dark />
    </div>
  );
}

function isLabsHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.toLowerCase() === "labs.4planet.org";
}

export default function App() {
  if (isLabsHost()) return <LabsOverview />;

  return (
    <BrowserRouter>
      <ScrollToTop />
      <ContextRetained />
      <AtlasProductSwitcher />
      <AppRoutes />
    </BrowserRouter>
  );
}
