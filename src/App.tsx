import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/router";
import { ScrollToTop } from "@/components/ScrollToTop";
import "@/styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
