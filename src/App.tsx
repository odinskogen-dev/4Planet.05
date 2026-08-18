import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes, LabsHostRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ContextRetained } from "@/product/ContextRetained";
import { ProductSwitcher } from "@/product/ProductSwitcher";
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

function ProductSurface() {
  const isLabsHost = window.location.hostname.toLowerCase() === "labs.4planet.org";

  if (isLabsHost) {
    return <LabsHostRoutes />;
  }

  return (
    <>
      <ContextRetained />
      <AtlasProductSwitcher />
      <AppRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ProductSurface />
    </BrowserRouter>
  );
}
