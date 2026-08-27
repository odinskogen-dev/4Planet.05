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

export function MagazineSeo({ title, description, path, image, imageAlt, section, tags, jsonLd }: MagazineSeoProps) {
  return (
    <Seo
      title={title}
      description={description}
      path={path}
      image={image}
      imageAlt={imageAlt}
      type="article"
      siteName="4PLANET MAGAZINE"
      locale="en_GB"
      section={section}
      tags={tags}
      jsonLd={jsonLd}
    />
  );
}
