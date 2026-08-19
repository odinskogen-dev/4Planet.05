import { useEffect, useState } from "react";
import PublicWorld from "@/earth/PublicWorld";
import { hardenAtlasLegacyLayerMetadata } from "@/sandbox/atlasLabCompatibility";
import { installAtlasLabExtensions } from "@/sandbox/atlasLabRegistry";
import { applyAtlasLabSceneFromUrl } from "@/sandbox/atlasLabScenes";
import "@/sandbox/atlasLabOverrides.css";

// Harden inherited metadata and install extensions before PublicWorld/World reads
// the registry. Production stays untouched on its own branch.
const HARDENING = hardenAtlasLegacyLayerMetadata();
const LAB = installAtlasLabExtensions();

export default function AtlasDataSandbox() {
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    document.title = "ATLAS DATA LAB · 4PLANET";

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    const scene = applyAtlasLabSceneFromUrl();
    document.documentElement.dataset.atlasLab = "true";
    document.documentElement.dataset.atlasLabExtensions = String(LAB.extensionCount);
    document.documentElement.dataset.atlasLabScene = scene.id;
    document.documentElement.dataset.atlasLabLegendRepairs = String(HARDENING.repairedLegends);

    setPrepared(true);
    return () => {
      robots.remove();
      delete document.documentElement.dataset.atlasLab;
      delete document.documentElement.dataset.atlasLabExtensions;
      delete document.documentElement.dataset.atlasLabScene;
      delete document.documentElement.dataset.atlasLabLegendRepairs;
    };
  }, []);

  if (!prepared) {
    return <div style={{ position: "fixed", inset: 0, background: "#080808" }} />;
  }

  return <PublicWorld />;
}
