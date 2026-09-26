import { Route, Routes } from "react-router-dom";
import { SandboxActorGoldPage, SandboxGoldIndex, SandboxGoldObjectPage, SandboxGoldStoryPage } from "@/pages/labs/SandboxGoldReview";

export default function SandboxGoldRoutes() {
  return (
    <Routes>
      <Route index element={<SandboxGoldIndex />} />
      <Route path="species/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="place/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="living-system/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="actor/:slug" element={<SandboxActorGoldPage />} />
      <Route path="solution/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="signal/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="proof/:slug" element={<SandboxGoldObjectPage />} />
      <Route path="magazine/:slug" element={<SandboxGoldStoryPage />} />
      <Route path="*" element={<SandboxGoldIndex />} />
    </Routes>
  );
}
