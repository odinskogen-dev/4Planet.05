import { ECOSYSTEMS } from "@/data/nodes";
import { speciesByEcosystem } from "@/lib/intelligence";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Ecosystems — LIVING SYSTEMS INTELLIGENCE" };

export default function EcosystemsPage() {
  const items = Object.values(ECOSYSTEMS).map((e) => {
    const n = speciesByEcosystem(e.id).length;
    return {
      id: e.id,
      name: e.name,
      sub: e.flagship ? "Flagship" : undefined,
      gloss: e.flagship ? e.shortDefinition ?? e.humanTranslation : e.humanTranslation,
      href: `/ecosystems/${e.id}`,
      meta: e.flagship
        ? "Flagship Living System Case"
        : n
        ? `${n} species`
        : undefined,
    };
  });
  // Surface the flagship living system first.
  items.sort((a, b) => (b.sub === "Flagship" ? 1 : 0) - (a.sub === "Flagship" ? 1 : 0));
  return (
    <RegistryIndex
      nodeType="Ecosystem"
      title="Ecosystems"
      intro="Living systems are the centre of the platform. Open one to see the species, functions, services, threats and solutions that run through it."
      items={items}
    />
  );
}
