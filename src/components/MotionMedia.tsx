import { useEffect, useRef, useState } from "react";

/**
 * MotionMedia — the reusable motion primitive for 4PLANET.
 * STILL FIRST → MOTION WHEN EARNED.
 *
 * - Always renders a high-quality poster still immediately (no layout jump).
 * - Loads the muted, playsInline, looping video lazily only when in/near the viewport.
 * - Pauses when scrolled offscreen (saves decode/battery).
 * - prefers-reduced-motion OR Save-Data OR no `src` → stays on the poster.
 * - Any load/error → graceful fallback to the poster.
 *
 * Wire a `src` (and optional `srcMobile`) when a rights-cleared video exists in the
 * permanent motion bank. Until then, omit `src` and it renders exactly as a still.
 */
export type MotionMediaProps = {
  poster: string;
  posterAlt?: string;
  src?: string;            // desktop/main encode (mp4/webm). Omit = still-only.
  srcMobile?: string;      // optional lighter mobile encode
  className?: string;
  style?: React.CSSProperties;
  height?: string;         // e.g. "100svh" or "min(70vh,700px)"
  objectPosition?: string;
  children?: React.ReactNode;   // overlay content (headlines etc.)
  overlay?: number;             // 0..1 dark scrim for text legibility
};

export function MotionMedia({
  poster, posterAlt = "", src, srcMobile, className, style,
  height = "100svh", objectPosition = "50% 50%", children, overlay = 0,
}: MotionMediaProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [failed, setFailed] = useState(false);

  const reduced = typeof window !== "undefined"
    && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // Save-Data / very slow connections → keep the still.
  const saveData = typeof navigator !== "undefined"
    && ((navigator as any).connection?.saveData
      || ["slow-2g", "2g"].includes((navigator as any).connection?.effectiveType));

  const canMotion = !!src && !reduced && !saveData && !failed;
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;
  const chosen = isMobile && srcMobile ? srcMobile : src;

  // Lazy-activate + pause offscreen via IntersectionObserver.
  useEffect(() => {
    if (!canMotion || !wrapRef.current) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver((entries) => {
      const inView = entries[0]?.isIntersecting;
      if (inView) setShowVideo(true);
      const v = videoRef.current;
      if (v) { if (inView) v.play?.().catch(() => {}); else v.pause?.(); }
    }, { rootMargin: "200px", threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, [canMotion]);

  return (
    <div ref={wrapRef} className={className}
      style={{ position: "relative", width: "100%", height, overflow: "hidden", ...style }}>
      <img src={poster} alt={posterAlt} loading="lazy"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
      {canMotion && showVideo && chosen && (
        <video ref={videoRef} muted loop playsInline preload="none" poster={poster}
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }}>
          <source src={chosen} />
        </video>
      )}
      {overlay > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(8,8,8,${overlay})` }} />}
      {children && <div style={{ position: "relative", height: "100%" }}>{children}</div>}
    </div>
  );
}

export default MotionMedia;
