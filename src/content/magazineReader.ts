const SAVED_KEY = "4planet.magazine.saved.v1";
const RECENT_KEY = "4planet.magazine.recent.v1";
const RESUME_KEY = "4planet.magazine.resume.v1";

export interface MagazineRecentItem {
  slug: string;
  title: string;
  visitedAt: number;
}

export interface MagazineResumeItem extends MagazineRecentItem {
  progress: number;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* reader experience must survive storage denial */ }
}

export function savedStorySlugs(): string[] {
  const value = readJson<unknown>(SAVED_KEY, []);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 100) : [];
}

export function isStorySaved(slug: string) {
  return savedStorySlugs().includes(slug);
}

export function toggleSavedStory(slug: string) {
  const current = savedStorySlugs();
  const next = current.includes(slug) ? current.filter((item) => item !== slug) : [slug, ...current].slice(0, 100);
  writeJson(SAVED_KEY, next);
  return next.includes(slug);
}

export function recordMagazineRecent(slug: string, title: string) {
  const current = readJson<MagazineRecentItem[]>(RECENT_KEY, []);
  const cleaned = Array.isArray(current) ? current.filter((item) => item && item.slug !== slug && typeof item.slug === "string") : [];
  writeJson(RECENT_KEY, [{ slug, title, visitedAt: Date.now() }, ...cleaned].slice(0, 20));
}

export function recentMagazineStories(): MagazineRecentItem[] {
  const current = readJson<MagazineRecentItem[]>(RECENT_KEY, []);
  return Array.isArray(current) ? current.filter((item) => item && typeof item.slug === "string").slice(0, 20) : [];
}

export function recordMagazineResume(slug: string, title: string, progress: number) {
  if (progress < 8 || progress >= 90) {
    const current = readJson<MagazineResumeItem[]>(RESUME_KEY, []);
    if (Array.isArray(current)) writeJson(RESUME_KEY, current.filter((item) => item.slug !== slug));
    return;
  }
  const current = readJson<MagazineResumeItem[]>(RESUME_KEY, []);
  const cleaned = Array.isArray(current) ? current.filter((item) => item && item.slug !== slug) : [];
  writeJson(RESUME_KEY, [{ slug, title, progress: Math.round(progress), visitedAt: Date.now() }, ...cleaned].slice(0, 10));
}

export function resumeMagazineStories(): MagazineResumeItem[] {
  const current = readJson<MagazineResumeItem[]>(RESUME_KEY, []);
  return Array.isArray(current) ? current.filter((item) => item && typeof item.slug === "string" && item.progress > 0 && item.progress < 90).slice(0, 10) : [];
}
