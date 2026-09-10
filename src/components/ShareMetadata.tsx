import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import manifestJson from "@/content/shareMeta.json";

type ShareMeta = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  canonicalPath?: string;
  robots?: string;
};

type ShareManifest = {
  siteName: string;
  origin: string;
  locale: string;
  defaultRoute: string;
  routes: Record<string, ShareMeta>;
  prefixFallbacks: Record<string, string>;
};

const manifest = manifestJson as ShareManifest;

function normalisePath(pathname: string) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function resolveMeta(pathname: string): ShareMeta {
  const path = normalisePath(pathname);
  const exact = manifest.routes[path];
  if (exact) return exact;

  const prefix = Object.keys(manifest.prefixFallbacks)
    .filter((candidate) => path.startsWith(candidate))
    .sort((a, b) => b.length - a.length)[0];

  if (prefix) {
    const fallbackRoute = manifest.prefixFallbacks[prefix];
    const fallback = manifest.routes[fallbackRoute];
    if (fallback) return fallback;
  }

  return manifest.routes[manifest.defaultRoute];
}

function absoluteUrl(value: string) {
  try {
    return new URL(value, manifest.origin).toString();
  } catch {
    return value;
  }
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.content = value;
}

function setCanonical(value: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.rel = "canonical";
    document.head.appendChild(node);
  }
  node.href = value;
}

export function ShareMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = normalisePath(pathname);
    const meta = resolveMeta(path);
    const canonicalPath = meta.canonicalPath || path;
    const canonical = absoluteUrl(canonicalPath === "/" ? "/" : `${canonicalPath}/`.replace(/\/$/, ""));
    const image = absoluteUrl(meta.image);

    document.title = meta.title;
    setMeta("name", "description", meta.description);
    setMeta("name", "robots", meta.robots || "index,follow,max-image-preview:large");
    setCanonical(canonical);

    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", manifest.siteName);
    setMeta("property", "og:locale", manifest.locale);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.description);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:secure_url", image);
    setMeta("property", "og:image:alt", meta.imageAlt);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", meta.title);
    setMeta("name", "twitter:description", meta.description);
    setMeta("name", "twitter:image", image);
    setMeta("name", "twitter:image:alt", meta.imageAlt);
  }, [pathname]);

  return null;
}
