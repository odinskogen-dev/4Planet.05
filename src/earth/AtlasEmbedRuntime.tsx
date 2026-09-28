import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isAtlasEmbedKind } from "./atlasViewContract";

type EmbeddedMap = {
  resize: () => void;
  triggerRepaint?: () => void;
  getContainer?: () => HTMLElement;
};

/**
 * The existing World/MapLibre instance remains the renderer. An embedded
 * WebKit viewport can initialise before its lazy iframe has non-zero layout:
 * resize only, without a second camera, URL or data-source authority.
 */
export function AtlasEmbedRuntime() {
  const { pathname, search } = useLocation();
  const embedded = pathname === "/atlas" &&
    isAtlasEmbedKind(new URLSearchParams(search).get("embed"));

  useEffect(() => {
    if (!embedded || typeof window === "undefined") return;
    const target = window as typeof window & { __4planet_map?: EmbeddedMap };
    let disposed = false;
    let attempts = 0;
    let observed: HTMLElement | null = null;
    let observer: ResizeObserver | null = null;
    let polling: number | null = null;

    function resize() {
      if (disposed) return false;
      const map = target.__4planet_map;
      const element = map?.getContainer?.();
      if (!element || element.getBoundingClientRect().width < 32 ||
          element.getBoundingClientRect().height < 32) return false;
      try { map?.resize(); map?.triggerRepaint?.(); return true; }
      catch { return false; }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") requestAnimationFrame(resize);
    };
    const onResize = () => { requestAnimationFrame(resize); };

    const connect = () => {
      if (disposed || !resize()) return;
      const element = target.__4planet_map?.getContainer?.();
      if (element && element !== observed && typeof ResizeObserver !== "undefined") {
        observer?.disconnect();
        observed = element;
        observer = new ResizeObserver(onResize);
        observer.observe(element);
      }
      if (polling !== null) { window.clearInterval(polling); polling = null; }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.addEventListener("pageshow", onResize);
    document.addEventListener("visibilitychange", onVisible);
    polling = window.setInterval(() => {
      attempts += 1;
      connect();
      if (attempts >= 60 && polling !== null) {
        window.clearInterval(polling); polling = null;
      }
    }, 50);
    requestAnimationFrame(connect);
    return () => {
      disposed = true;
      if (polling !== null) window.clearInterval(polling);
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.removeEventListener("pageshow", onResize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [embedded]);

  if (!embedded) return null;
  return <style>{[
    ".atlas-product-identity,.atlas-product-switcher{display:none!important}",
    ".world .atlas-panel,.world .lens-rail,.world .search-line,.world .site-menu,.world .status-strip{display:none!important}",
    ".world .ctx{max-width:min(100vw,440px)}",
  ].join("")}</style>;
}
