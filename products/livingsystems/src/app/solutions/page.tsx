import { SOLUTIONS } from "@/data/nodes";
import { speciesBySolution } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Solutions — LIVING SYSTEMS INTELLIGENCE" };

export default function SolutionsPage() {
  const items = Object.values(SOLUTIONS).map((s) => {
    const n = speciesBySolution(s.id).length;
    const addresses = s.addressesThreats.length;
    const meta = [addresses ? `${addresses} threat${addresses > 1 ? "s" : ""}` : null, n ? `${n} species` : null]
      .filter(Boolean)
      .join(" · ");
    return { id: s.id, name: s.name, gloss: s.humanTranslation, href: `/solutions/${s.id}`, meta: meta || undefined };
  });
  return (
    <RegistryIndex
      nodeType="Solution"
      title="Solutions"
      intro="Pathways for restoration and resilience, each linked to the threats it addresses and the species and ecosystems it supports."
      items={items}
    />
  );
}
