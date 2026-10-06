import { notFound } from "next/navigation";
import { getNodeIntel, idsFor } from "@/lib/intelligence";
import { NodeIntelligence } from "@/components/NodeIntelligence";
import { DependencyPathway } from "@/components/DependencyPathway";

const KIND = "human-systems";
export function generateStaticParams() {
  return idsFor(KIND).map((id) => ({ id }));
}
export function generateMetadata({ params }: { params: { id: string } }) {
  const intel = getNodeIntel(KIND, params.id);
  return intel ? { title: `${intel.title} — LIVING SYSTEMS INTELLIGENCE` } : {};
}
export default function Page({ params }: { params: { id: string } }) {
  const intel = getNodeIntel(KIND, params.id);
  if (!intel) notFound();
  return (
    <NodeIntelligence intel={intel} backHref="/human-systems" backLabel="Human Systems">
      <DependencyPathway systemId={params.id} />
    </NodeIntelligence>
  );
}
