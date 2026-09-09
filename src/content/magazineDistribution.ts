import type { Story } from "@/content/stories";

export interface MagazineDistributionPacket {
  canonicalPath: string;
  shareTitle: string;
  shareText: string;
  searchSnippet: string;
  socialShort: string;
  socialLong: string;
  newsletterSubject: string;
  newsletterIntro: string;
  entityTags: string[];
}

function sentence(text: string, max: number) {
  if (text.length <= max) return text;
  const slice = text.slice(0, Math.max(0, max - 1));
  const cut = slice.lastIndexOf(" ");
  return `${(cut > max * .65 ? slice.slice(0, cut) : slice).trim()}…`;
}

/**
 * One truth object → bounded channel-native packaging.
 * This deliberately does not publish anything and never invents a new claim.
 */
export function buildDistributionPacket(story: Story): MagazineDistributionPacket {
  const canonicalPath = `/magazine/${story.slug}`;
  return {
    canonicalPath,
    shareTitle: story.title,
    shareText: sentence(story.dek, 180),
    searchSnippet: sentence(story.dek, 155),
    socialShort: `${sentence(story.title, 90)} — ${sentence(story.dek, 140)}`,
    socialLong: `${story.title}\n\n${sentence(story.dek, 260)}\n\nRead on 4PLANET MAGAZINE.`,
    newsletterSubject: sentence(story.title, 70),
    newsletterIntro: sentence(story.dek, 220),
    entityTags: story.tags.slice(0, 6),
  };
}
