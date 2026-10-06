import { LOCATIONS } from "@/data/locations";
import { RegistryIndex } from "@/components/RegistryIndex";

export const metadata = { title: "Locations — LIVING SYSTEMS INTELLIGENCE" };

export default function LocationsPage() {
  const items = Object.values(LOCATIONS).map((l) => ({
    id: l.id,
    name: l.name,
    sub: l.locationType,
    gloss: l.humanTranslation,
    href: `/locations/${l.id}`,
  }));
  return (
    <RegistryIndex
      nodeType="Location"
      title="Locations"
      intro="Spatial intelligence foundation — from planet to site. Places connect to the ecosystems they contain."
      items={items}
    />
  );
}
