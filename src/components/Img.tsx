import { useState, type CSSProperties } from "react";
import { TechnicalGridField } from "@/components/TechnicalGridField";
import { T } from "@/styles/tokens";
import type { ImageMeta } from "@/content/imageRegistry";

// Documentary image with reserved aspect ratio, intentional focal point, lazy loading,
// and a refined technical-grid fallback if the asset is missing or fails to load.
export function Img({ meta, accent, ratio, caption, priority, dark, style, className }: {
  meta?: ImageMeta;
  accent?: string;
  ratio?: string;
  caption?: string;
  priority?: boolean;
  dark?: boolean;
  style?: CSSProperties;
  className?: string;
}) {
  const [err, setErr] = useState(false);
  const ar = ratio ?? meta?.aspectRatio ?? "3/2";
  const acc = accent ?? T.blue;
  const frame: CSSProperties = {
    position: "relative", width: "100%", aspectRatio: ar, overflow: "hidden",
    border: `1px solid ${dark ? T.lineOnDark : T.line}`, background: dark ? "transparent" : T.paper, ...style,
  };
  if (!meta || err) {
    return (
      <figure className={className} style={{ margin: 0 }}>
        <TechnicalGridField dark={dark} accent={acc} variant="large" style={frame} />
        {caption && <figcaption className="mono" style={{ fontSize: 10.5, color: T.faint, letterSpacing: ".1em", marginTop: 8 }}>{caption}</figcaption>}
      </figure>
    );
  }
  return (
    <figure className={className} style={{ margin: 0 }}>
      <div style={frame}>
        <picture>
          {meta.srcMobile && <source media="(max-width: 640px)" srcSet={meta.srcMobile} />}
          <img
            src={meta.src} alt={meta.alt}
            loading={priority ? "eager" : "lazy"} decoding="async"
            onError={() => setErr(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: meta.objectPosition ?? "50% 50%", display: "block" }}
          />
        </picture>
        <div aria-hidden style={{ position: "absolute", top: 0, left: 0, width: 64, height: 3, background: acc }} />
      </div>
      {caption && <figcaption className="mono" style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,.55)" : T.faint, letterSpacing: ".1em", marginTop: 8 }}>{caption}</figcaption>}
    </figure>
  );
}
