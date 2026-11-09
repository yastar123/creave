import heroObsidian from "@/assets/hero-obsidian.webp";
import socialVisual from "@/assets/svc-social.webp";
import motionVisual from "@/assets/svc-motion.webp";
import webVisual from "@/assets/svc-web.webp";

const legacyImageSources: Record<string, string> = {
  "hero-obsidian.webp": heroObsidian,
  "svc-social.webp": socialVisual,
  "svc-motion.webp": motionVisual,
  "svc-web.webp": webVisual,
};

export function resolveSiteImageSource(source: string) {
  const path = source.split(/[?#]/, 1)[0] ?? "";
  const legacyFilename = path.match(/\/src\/assets\/([^/]+)$/)?.[1];
  return legacyFilename ? legacyImageSources[legacyFilename] ?? source : source;
}
