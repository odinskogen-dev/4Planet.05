import { useEffect, useMemo, useState } from "react";
import { T } from "@/styles/tokens";
import type { ResolvedSpeciesImage } from "@/species/media";

const mono: React.CSSProperties = {
  fontFamily: T.mono,
  fontSize: 10,
  letterSpacing: ".13em",
  textTransform: "uppercase",
};

const border = `1px solid ${T.line}`;

type MediaStatus = "IDLE" | "LOADING" | "ERROR" | "READY";

function metaLine(label: string, value?: string) {
  if (!value) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px minmax(0,1fr)", gap: 10, fontSize: 12.5, lineHeight: 1.45 }}>
      <span style={{ ...mono, color: T.dim }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function ResolvedSpeciesMediaGallery({
  scientificName,
  images,
  note,
  status,
  error,
}: {
  scientificName: string;
  images: ResolvedSpeciesImage[];
  note?: string | null;
  status: MediaStatus;
  error?: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => setActiveIndex(0), [images]);

  const active = useMemo(
    () => images[Math.min(activeIndex, Math.max(images.length - 1, 0))],
    [activeIndex, images],
  );

  return (
    <section style={{ marginTop: 42, borderTop: border, paddingTop: 26 }}>
      <div style={{ ...mono, color: T.dim }}>Resolved source images</div>
      <div style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55, color: T.dim, maxWidth: 860 }}>
        {status === "IDLE" && "No source image request has been made yet."}
        {status === "LOADING" && "Querying GBIF occurrence media…"}
        {status === "ERROR" && `Image source query failed · ${error ?? "Unknown error"}`}
        {status === "READY" && (note ?? "Source-linked images resolved.")}
      </div>

      {status === "READY" && active && (
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(280px,.85fr)", gap: 1, background: T.line, border }} className="stack-clean">
          <div style={{ background: "#F5F5F4", minHeight: 420 }}>
            <img
              src={active.previewUrl}
              alt={active.title ? `${scientificName} — ${active.title}` : scientificName}
              style={{ display: "block", width: "100%", height: "100%", minHeight: 420, objectFit: "cover" }}
              loading="lazy"
            />
          </div>
          <div style={{ background: "#fff", padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ ...mono, color: T.blue }}>Primary image</div>
              <div style={{ marginTop: 8, fontFamily: T.display, fontSize: 30, lineHeight: 1, letterSpacing: "-.03em" }}>
                {active.title || scientificName}
              </div>
            </div>
            {metaLine("Source", "GBIF occurrence media")}
            {metaLine("License", active.license)}
            {metaLine("Creator", active.creator)}
            {metaLine("Rights", active.rightsHolder)}
            {metaLine("Dataset", active.datasetName)}
            {metaLine("Publisher", active.publisher)}
            <div style={{ marginTop: "auto", display: "flex", flexWrap: "wrap", gap: 8 }}>
              <a href={active.sourceUrl} target="_blank" rel="noreferrer" style={{ ...mono, border, padding: "8px 10px", color: T.ink }}>
                OPEN OCCURRENCE ↗
              </a>
              <a href={active.identifier} target="_blank" rel="noreferrer" style={{ ...mono, border, padding: "8px 10px", color: T.ink }}>
                OPEN SOURCE IMAGE ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {status === "READY" && images.length > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginTop: 10 }}>
          {images.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveIndex(index)}
              style={{ textAlign: "left", border, padding: 0, background: index === activeIndex ? "#F5F5F4" : "#fff" }}
            >
              <img
                src={image.previewUrl}
                alt={image.title ? `${scientificName} thumbnail — ${image.title}` : `${scientificName} thumbnail`}
                style={{ display: "block", width: "100%", aspectRatio: "1 / 1", objectFit: "cover" }}
                loading="lazy"
              />
              <div style={{ padding: 10 }}>
                <div style={{ ...mono, color: T.dim }}>GBIF</div>
                <div style={{ marginTop: 6, fontSize: 12.5, lineHeight: 1.35 }}>
                  {image.title || `Occurrence ${image.occurrenceKey}`}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {status === "READY" && images.length === 0 && (
        <div style={{ marginTop: 18, border, padding: 20, background: "#F5F5F4", fontSize: 13.5, lineHeight: 1.55 }}>
          No source-linked image was resolved for this taxon yet. The profile can still exist without an image.
        </div>
      )}

      {status === "READY" && (
        <p style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: T.dim }}>
          Image licences can be more restrictive than the surrounding occurrence record. Source, creator and licence remain visible whenever supplied by the publisher.
        </p>
      )}
    </section>
  );
}

export default ResolvedSpeciesMediaGallery;
