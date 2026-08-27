import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { T } from "@/styles/tokens";
import type { ImageMeta } from "@/content/imageRegistry";

/**
 * Full-bleed cinematic image band — edge to edge, generous height, deliberate crop.
 * This is the antidote to thin bordered image strips. Content (caption / overlaid
 * copy) sits inside the same frame so a picture always feels composed, never dropped in.
 */
export function CinematicImage({
  meta, height = "min(78vh, 760px)", overlay = 0, position, caption, credit, priority, children, align = "end", accent, fallback,
}: {
  meta?: ImageMeta;
  height?: string;
  overlay?: number;            // 0..1 dark scrim for legibility of overlaid copy
  position?: string;
  caption?: string;
  credit?: string;
  priority?: boolean;
  children?: ReactNode;        // overlaid copy, if any
  align?: "start" | "center" | "end";
  accent?: string;
  fallback?: ImageMeta;        // shown if the primary image fails to load (e.g. not-yet-dropped detail)
}) {
  const [err, setErr] = useState(false);
  const active = err && fallback ? fallback : meta;
  const dead = err && !fallback;
  const ok = active && !dead;
  return (
    <section style={{ position: "relative", width: "100%", height, overflow: "hidden", background: T.ink }}>
      {ok && (
        <picture>
          {active!.srcMobile && <source media="(max-width: 640px)" srcSet={active!.srcMobile} />}
          <img
            src={active!.src} alt={active!.alt} loading={priority ? "eager" : "lazy"} decoding="async"
            onError={() => setErr(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: position ?? active!.objectPosition ?? "50% 50%" }}
          />
        </picture>
      )}
      {overlay > 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(8,8,8,${overlay * 0.5}) 0%, rgba(8,8,8,${overlay * 0.15}) 42%, rgba(8,8,8,${overlay}) 100%)` }} />
      )}
      {accent && <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 96, height: 4, background: accent, zIndex: 2 }} />}
      {children && (
        <div style={{ position: "absolute", inset: 0, zIndex: 2, display: "flex", flexDirection: "column", justifyContent: align === "center" ? "center" : align === "start" ? "flex-start" : "flex-end" }}>
          <div style={{ maxWidth: 1320, width: "100%", margin: "0 auto", padding: "clamp(28px,5vw,72px) clamp(20px,5vw,72px)" }}>{children}</div>
        </div>
      )}
      {/* v25: image captions removed as noise. Only credit (e.g. NASA) shown, in brand blue. */}
      {credit && (
        <div className="mono" aria-hidden style={{ position: "absolute", left: "clamp(20px,5vw,72px)", bottom: 18, zIndex: 2, fontSize: 10.5, letterSpacing: ".12em", color: "#2E2EFF" }}>
          {credit}
        </div>
      )}
    </section>
  );
}

/** Scroll-reveal wrapper: subtle fade + rise as an act enters. Honours reduced-motion. */
export function Reveal({ children, delay = 0, y = 22, as = "div", style, className }:
  { children: ReactNode; delay?: number; y?: number; as?: "div" | "section"; style?: CSSProperties; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(true); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  const Tag = as as "div";
  return (
    <Tag ref={ref as never} className={className}
      style={{ opacity: shown ? 1 : 0, transform: shown ? "none" : `translateY(${y}px)`, transition: `opacity .7s cubic-bezier(.22,.61,.36,1) ${delay}ms, transform .7s cubic-bezier(.22,.61,.36,1) ${delay}ms`, ...style }}>
      {children}
    </Tag>
  );
}
