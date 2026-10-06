import { HUMAN_SYSTEMS } from "@/data/humanSystems";
import { dependenciesFrom } from "@/data/dependencies";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Human Systems — LIVING SYSTEMS INTELLIGENCE" };

export default function HumanSystemsPage() {
  const items = Object.values(HUMAN_SYSTEMS).map((h) => {
    const n = dependenciesFrom(h.id).length;
    return {
      id: h.id,
      name: h.name,
      gloss: h.humanTranslation,
      href: `/human-systems/${h.id}`,
      meta: n ? `${n} dependencies` : undefined,
    };
  });
  return (
    <RegistryIndex
      nodeType="Human System"
      title="Human Systems"
      intro="The systems civilization runs on — and how they depend on living systems. Open one to see what it relies on and what it is vulnerable to."
      items={items}
    />
  );
}
