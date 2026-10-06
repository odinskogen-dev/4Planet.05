import { notFound } from "next/navigation";
import { getNodeIntel, idsFor } from "@/lib/intelligence";
import { NodeIntelligence } from "@/components/NodeIntelligence";

const KIND = "ecosystems";

export function generateStaticParams() {
  return idsFor(KIND)
    .filter((id) => id !== "EC_AMAZON_RAINFOREST")
    .map((id) => ({ id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const intel = getNodeIntel(KIND, params.id);
  return intel ? { title: `${intel.title} — LIVING SYSTEMS INTELLIGENCE` } : {};
}

export default function Page({ params }: { params: { id: string } }) {
  const intel = getNodeIntel(KIND, params.id);
  if (!intel) notFound();
  return <NodeIntelligence intel={intel} backHref="/ecosystems" backLabel="Ecosystems" />;
}
