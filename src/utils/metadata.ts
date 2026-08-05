import { useEffect } from "react";

type MetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  structuredData?: Record<string, unknown>;
};

const SITE_ORIGIN = "https://4planet.org";

const absoluteUrl = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
};

const ensureMeta = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
  return element;
};

export function usePageMetadata({
  title,
  description,
  canonicalPath,
  robots = "noindex,nofollow",
  ogImage,
  ogType = "website",
  structuredData,
}: MetadataInput) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const canonicalUrl = absoluteUrl(canonicalPath);
    const imageUrl = ogImage ? absoluteUrl(ogImage) : `${SITE_ORIGIN}/og-default.png`;

    const descriptionMeta = ensureMeta('meta[name="description"]', { name: "description", content: description });
    const robotsMeta = ensureMeta('meta[name="robots"]', { name: "robots", content: robots });
    const ogTitle = ensureMeta('meta[property="og:title"]', { property: "og:title", content: title });
    const ogDescription = ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    const ogTypeMeta = ensureMeta('meta[property="og:type"]', { property: "og:type", content: ogType });
    const ogUrl = ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    const ogImageMeta = ensureMeta('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    const ogImageAlt = ensureMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: title });
    const twitterCard = ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    const twitterTitle = ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    const twitterDescription = ensureMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    const twitterImage = ensureMeta('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let jsonLd = document.head.querySelector<HTMLScriptElement>('script[data-4planet-actor-jsonld="true"]');
    if (structuredData) {
      if (!jsonLd) {
        jsonLd = document.createElement("script");
        jsonLd.type = "application/ld+json";
        jsonLd.dataset["4planetActorJsonld"] = "true";
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(structuredData);
    }

    return () => {
      document.title = previousTitle;
      descriptionMeta.remove();
      robotsMeta.remove();
      ogTitle.remove();
      ogDescription.remove();
      ogTypeMeta.remove();
      ogUrl.remove();
      ogImageMeta.remove();
      ogImageAlt.remove();
      twitterCard.remove();
      twitterTitle.remove();
      twitterDescription.remove();
      twitterImage.remove();
      canonical?.remove();
      jsonLd?.remove();
    };
  }, [title, description, canonicalPath, robots, ogImage, ogType, structuredData]);
}
