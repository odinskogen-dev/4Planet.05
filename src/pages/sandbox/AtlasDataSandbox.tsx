import { useEffect, useState } from "react";
import PublicWorld from "@/earth/PublicWorld";
import {
  applyAtlasLabDefaultScene,
  installAtlasLabExtensions,
} from "@/sandbox/atlasLabRegistry";

// Install before PublicWorld/World reads the layer registry. This keeps the
// sandbox visually and behaviourally identical to ATLAS while production stays
// untouched on its own branch.
const LAB = installAtlasLabExtensions();

export default function AtlasDataSandbox() {
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    document.title = "ATLAS DATA LAB · 4PLANET";

    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex,nofollow,noarchive";
    document.head.appendChild(robots);

    applyAtlasLabDefaultScene();
    document.documentElement.dataset.atlasLab = "true";
    document.documentElement.dataset.atlasLabExtensions = String(LAB.extensionCount);

    setPrepared(true);
    return () => {
      robots.remove();
      delete document.documentElement.dataset.atlasLab;
      delete document.documentElement.dataset.atlasLabExtensions;
    };
  }, []);

  if (!prepared) {
    return <div style={{ position: "fixed", inset: 0, background: "#080808" }} />;
  }

  return <PublicWorld />;
}
