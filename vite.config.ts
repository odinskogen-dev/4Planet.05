import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isPartnersRelease =
  process.env.PARTNERS_BUILD === "1" ||
  process.env.GITHUB_WORKFLOW === "4PLANET Partners Gold Release";

const partnersIsolation = {
  name: "4planet-partners-isolated-entry",
  transformIndexHtml(html: string) {
    if (!isPartnersRelease) return html;
    return html
      .replace('<script src="/atlas-return-camera-lock-v68.js"></script>', "")
      .replace('/src/main.tsx', '/src/partners-main.tsx');
  },
  generateBundle(this: any) {
    if (!isPartnersRelease) return;
    const ids = [...this.getModuleIds()].map(String).sort();
    const forbidden = ids.filter((id) =>
      id.includes("/node_modules/maplibre-gl/") ||
      id.includes("/node_modules/react-router/") ||
      id.includes("/node_modules/react-router-dom/") ||
      id.endsWith("/src/App.tsx") ||
      id.includes("/src/routes/router.tsx"),
    );
    if (forbidden.length) {
      this.error(`PARTNERS_ISOLATION_FAIL forbidden modules reached public artifact:\n${forbidden.join("\n")}`);
    }
    this.emitFile({
      type: "asset",
      fileName: "partners-module-graph.txt",
      source: [
        "4PLANET PARTNERS RELEASE MODULE GRAPH",
        "ISOLATION=PASS",
        ...ids,
      ].join("\n"),
    });
  },
};

export default defineConfig({
  plugins: [react(), partnersIsolation],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
