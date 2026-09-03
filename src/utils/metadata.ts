import { useEffect } from "react";

type MetadataInput = {
  title: string;
  description: string;
  canonicalPath: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
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
  structuredData,
}: MetadataInput) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const descriptionMeta = ensureMeta('meta[name="description"]', { name: "description", content: description });
    const robotsMeta = ensureMeta('meta[name="robots"]', { name: "robots", content: robots });
    const ogTitle = ensureMeta('meta[property="og:title"]', { property: "og:title", content: title });
    const ogDescription = ensureMeta('meta[property="og:description"]', { property: "og:description", content: description });
    const ogType = ensureMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    const ogUrl = ensureMeta('meta[property="og:url"]', { property: "og:url", content: `https://4planet.org${canonicalPath}` });

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://4planet.org${canonicalPath}`;

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
      ogType.remove();
      ogUrl.remove();
      canonical?.remove();
      jsonLd?.remove();
    };
  }, [title, description, canonicalPath, robots, structuredData]);
}
