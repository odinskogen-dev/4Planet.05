import { useMemo } from "react";
import LabsOverview from "./LabsOverviewCurrent";
import LabsProjectDetailV5 from "./LabsProjectDetailV5";
import { projectBySlug } from "./labsProjection";
import "./labsV4.css";
import "./labsV4Root.css";

function isLabsHost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.toLowerCase() === "labs.4planet.org";
}

function currentSlug() {
  if (typeof window === "undefined") return "";
  if (isLabsHost()) return window.location.pathname.replace(/^\/+|\/+$/g, "");
  const query = new URLSearchParams(window.location.search).get("project");
  return query?.replace(/^\/+|\/+$/g, "") ?? "";
}

export default function LabsV4() {
  const slug = useMemo(currentSlug, []);
  const project = projectBySlug(slug);

  if (!slug) return <LabsOverview />;
  if (project) return <LabsProjectDetailV5 project={project} />;
  return <LabsOverview />;
}
