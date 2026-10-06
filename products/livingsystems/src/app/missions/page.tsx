import { MISSIONS } from "@/data/nodes";
import { speciesByMission } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Missions — LIVING SYSTEMS INTELLIGENCE" };

export default function MissionsPage() {
  const items = Object.values(MISSIONS).map((m) => {
    const n = speciesByMission(m.id).length;
    return {
      id: m.id,
      name: m.code,
      sub: m.name,
      gloss: m.humanTranslation,
      href: `/missions/${m.id}`,
      meta: n ? `${n} species` : undefined,
    };
  });
  return (
    <RegistryIndex
      nodeType="Mission"
      title="Missions"
      intro="Missions are intelligence objects, not marketing pages — each connects to the species, ecosystems, threats and solutions it focuses on."
      items={items}
    />
  );
}
