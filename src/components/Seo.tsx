import { useEffect } from "react";

const DEFAULT_TITLE = "4PLANET_ — For a Living Planet";
const DEFAULT_DESCRIPTION = "4PLANET is a system for ecological action — built to make participation understandable, trustworthy, measurable and easy.";

type JsonLdContext = {
  canonicalUrl: string;
  imageUrl: string;
};

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  robots?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  jsonLd?: JsonLd | ((context: JsonLdContext) => JsonLd);
}

function publicOrigin(): string {
  const configured = import.meta.env.VITE_PUBLIC_SITE_ORIGIN?.trim();
  const origin = configured || window.location.origin;
  return origin.replace(/\/$/, "");
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function removeMeta(attribute: "name" | "property", key: string) {
  document.head.querySelectorAll(`meta[${attribute}="${key}"]`).forEach((node) => node.remove());
}

function upsertCanonical(url: string) {
  let node = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  node.setAttribute("href", url);
}

function removeJsonLd() {
  document.getElementById("4planet-page-jsonld")?.remove();
}

function clearArticleMetadata() {
  ["article:published_time", "article:modified_time", "article:section", "article:author", "article:tag"].forEach((key) => {
    removeMeta("property", key);
  });
}

function appendArticleTag(tag: string) {
  const node = document.createElement("meta");
  node.setAttribute("property", "article:tag");
  node.setAttribute("content", tag);
  document.head.appendChild(node);
}

function resetDefaultMetadata() {
  document.title = DEFAULT_TITLE;
  upsertMeta("name", "description", DEFAULT_DESCRIPTION);
  upsertMeta("name", "robots", "index,follow,max-image-preview:large");
  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", "4PLANET_");
  upsertMeta("property", "og:title", DEFAULT_TITLE);
  upsertMeta("property", "og:description", DEFAULT_DESCRIPTION);
  upsertMeta("name", "twitter:title", DEFAULT_TITLE);
  upsertMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
  removeMeta("property", "og:image:alt");
  removeMeta("name", "twitter:image:alt");
  clearArticleMetadata();
  document.head.querySelector('link[rel="canonical"]')?.remove();
  removeJsonLd();
}

export function Seo({
  title,
  description,
  path,
  image = "/og.png",
  imageAlt = "4PLANET — For a Living Planet",
  type = "website",
  robots = "index,follow,max-image-preview:large",
  siteName = "4PLANET_",
  locale = "en_GB",
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const origin = publicOrigin();
    const canonicalUrl = new URL(path, `${origin}/`).toString();
    const imageUrl = new URL(image, `${origin}/`).toString();

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:site_name", siteName);
    upsertMeta("property", "og:locale", locale);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:image:alt", imageAlt);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertMeta("name", "twitter:image:alt", imageAlt);
    upsertCanonical(canonicalUrl);

    clearArticleMetadata();
    if (type === "article") {
      if (publishedTime) upsertMeta("property", "article:published_time", publishedTime);
      if (modifiedTime) upsertMeta("property", "article:modified_time", modifiedTime);
      if (section) upsertMeta("property", "article:section", section);
      if (author) upsertMeta("property", "article:author", author);
      tags.forEach(appendArticleTag);
    }

    removeJsonLd();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = "4planet-page-jsonld";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(
        typeof jsonLd === "function" ? jsonLd({ canonicalUrl, imageUrl }) : jsonLd,
      );
      document.head.appendChild(script);
    }

    return resetDefaultMetadata;
  }, [author, description, image, imageAlt, jsonLd, locale, modifiedTime, path, publishedTime, robots, section, siteName, tags, title, type]);

  return null;
}
