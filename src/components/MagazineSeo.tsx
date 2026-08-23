import { useEffect } from "react";
import { Seo } from "@/components/Seo";

interface MagazineSeoProps {
  title: string;
  description: string;
  path: string;
  image: string;
  imageAlt: string;
  section: string;
  tags: string[];
  jsonLd: Record<string, unknown> | ((context: { canonicalUrl: string; imageUrl: string }) => Record<string, unknown>);
}

function addMeta(property: string, content: string) {
  const node = document.createElement("meta");
  node.dataset.magazineSeo = "true";
  node.setAttribute("property", property);
  node.setAttribute("content", content);
  document.head.appendChild(node);
}

export function MagazineSeo({ title, description, path, image, imageAlt, section, tags, jsonLd }: MagazineSeoProps) {
  useEffect(() => {
    document.head.querySelectorAll('[data-magazine-seo="true"]').forEach((node) => node.remove());
    addMeta("og:site_name", "4PLANET MAGAZINE");
    addMeta("og:locale", "en_GB");
    addMeta("og:image:alt", imageAlt);
    addMeta("article:section", section);
    tags.forEach((tag) => addMeta("article:tag", tag));

    return () => {
      document.head.querySelectorAll('[data-magazine-seo="true"]').forEach((node) => node.remove());
    };
  }, [imageAlt, section, tags]);

  return (
    <Seo
      title={title}
      description={description}
      path={path}
      image={image}
      type="article"
      jsonLd={jsonLd}
    />
  );
}
