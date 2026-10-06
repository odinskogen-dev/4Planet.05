import { SERVICES } from "@/data/nodes";
import { speciesByService } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Ecosystem Services — LIVING SYSTEMS INTELLIGENCE" };

export default function ServicesPage() {
  const items = Object.values(SERVICES).map((v) => {
    const n = speciesByService(v.id).length;
    return {
      id: v.id,
      name: v.name,
      gloss: v.humanTranslation,
      href: `/services/${v.id}`,
      meta: n ? `${n} species` : undefined,
    };
  });
  return (
    <RegistryIndex
      nodeType="Ecosystem Service"
      title="Services"
      intro="The benefits living systems provide to nature and society, supported by ecological functions and flowing to recipients."
      items={items}
    />
  );
}
