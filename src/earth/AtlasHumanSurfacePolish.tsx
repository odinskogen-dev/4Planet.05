import { useEffect } from "react";

function surfaceKind(text: string) {
  const value = text.trim().toUpperCase();
  if (value.startsWith("NOW")) return "NOW";
  if (value.startsWith("WATCH")) return "WATCH";
  if (value.includes("COORDINATE")) return "COORDINATE";
  if (value.includes("MAP RECORD")) return "MAP_RECORD";
  if (value.includes("PLACE")) return "PLACE";
  if (value.includes("OBSERVATION")) return "OBSERVATION";
  if (value.includes("SIGNAL")) return "SIGNAL";
  if (value.includes("LIFE")) return "LIFE";
  return "OTHER";
}

/**
 * Presentation-only sidecar. It annotates the existing one shared context
 * surface; it does not create a second panel, copy the state model or own data.
 * This lets the polish layer reduce first-touch noise differently for a clicked
 * location versus NOW/WATCH without modifying global/shared product files.
 */
export function AtlasHumanSurfacePolish() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>(".ctx").forEach((panel) => {
        const kindText = panel.querySelector<HTMLElement>(".ctx-kind")?.textContent ?? "";
        panel.dataset.atlasSurface = surfaceKind(kindText);
      });
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
