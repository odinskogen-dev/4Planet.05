import { FUNCTIONS } from "@/data/nodes";
import { speciesByFunction } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Ecological Functions — LIVING SYSTEMS INTELLIGENCE" };

export default function FunctionsPage() {
  const items = Object.values(FUNCTIONS).map((f) => {
    const n = speciesByFunction(f.id).length;
    return {
      id: f.id,
      name: f.name,
      gloss: f.humanTranslation,
      href: `/functions/${f.id}`,
      meta: n ? `${n} species` : undefined,
    };
  });
  return (
    <RegistryIndex
      nodeType="Ecological Function"
      title="Functions"
      intro="The roles species play in living systems. Functions are core assets — the same function is shared by every species that performs it."
      items={items}
    />
  );
}
