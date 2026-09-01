import { Navigate, useParams } from "react-router-dom";
import { EcosystemGoldExperience } from "@/components/ecosystem/EcosystemGoldExperience";
import { ECOSYSTEM_GOLD_PROFILES } from "@/ecosystems/goldProfiles";

export default function EcosystemGold() {
  const { slug } = useParams();
  const profile = slug ? ECOSYSTEM_GOLD_PROFILES[slug] : undefined;
  if (!profile) return <Navigate to="/404" replace />;
  return <EcosystemGoldExperience profile={profile} />;
}