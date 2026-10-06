import { THREATS, DRIVERS } from "@/data/nodes";
import { speciesByThreat } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Threats — LIVING SYSTEMS INTELLIGENCE" };

export default function ThreatsPage() {
  const items = Object.values(THREATS).map((t) => {
    const n = speciesByThreat(t.id).length;
    return {
      id: t.id,
      name: t.name,
      sub: t.category,
      gloss: `${t.humanTranslation} Driver: ${DRIVERS[t.driver].name}.`,
      href: `/threats/${t.id}`,
      meta: n ? `${n} species` : undefined,
    };
  });
  return (
    <RegistryIndex
      nodeType="Threat"
      title="Threats"
      intro="Each threat is an intelligence object: what it pressures, the driver behind it, and the solutions that address it."
      items={items}
    />
  );
}
