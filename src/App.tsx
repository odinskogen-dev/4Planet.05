import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProductNav } from "@/product/ProductNav";
import "@/styles/global.css";
import "@/styles/responsive-footer.css";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ProductNav />
      <AppRoutes />
    </BrowserRouter>
  );
}
