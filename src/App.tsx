import { BrowserRouter, Link, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
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

function LegalIdentityBar() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/atlas")) return null;
  return (
    <div style={{ background: "#000", color: "rgba(255,255,255,.72)", borderTop: "1px solid rgba(255,255,255,.14)", padding: "18px clamp(20px,5vw,72px) 22px" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap", fontSize: 11.5, lineHeight: 1.6 }}>
        <span>SKOG COMMUNICATIONS AS · ORG.NO. 923 003 789 · Sandakerveien 52, 0477 Oslo, Norway · Current legal operator of the 4Planet release candidate.</span>
        <span style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link to="/company" style={{ color: "inherit" }}>Company</Link>
          <Link to="/contact" style={{ color: "inherit" }}>Contact</Link>
          <Link to="/trust" style={{ color: "inherit" }}>Trust & policies</Link>
          <Link to="/privacy" style={{ color: "inherit" }}>Privacy</Link>
        </span>
      </div>
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
      <LegalIdentityBar />
    </BrowserRouter>
  );
}
