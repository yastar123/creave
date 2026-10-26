import chromeAsset from "@/assets/crevora-chrome.jpg.asset.json";

const chrome = chromeAsset.url;

export const formatDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — CREVORA` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — CREVORA` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: chrome },
      { name: "twitter:image", content: chrome },
    ],
  };
}
