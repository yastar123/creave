export const socialMediaFaqs = [
  {
    q: "Why does Crevora focus on video content with a human face?",
    a: "We believe video is the most powerful content format because it combines visuals, sound, and message in one medium. But what truly makes it work is the human element.\n\nPeople buy from people. In the Namibian market especially, showing a real face is one of the fastest ways to build digital authority and genuine trust.\n\nIt doesn’t always have to be the business owner. A team member or brand ambassador can represent the brand just as effectively. Over time, we help shape a strong and consistent brand persona. A clear message delivered by a real person will always carry more weight than polished but faceless content.",
  },
  {
    q: "What happens on a shooting day?",
    a: "We arrive with a full plan: the month’s concepts, scripts and shot list ready. We capture everything in one focused session — talking-head videos, b-roll and visuals — so your team spends a few hours with us, not a full day, and we turn it into a month of content.",
  },
  {
    q: "How do we plan your content?",
    a: "Every month starts with research: your audience, current trends and your business goals. From there we build a strategic content calendar, write persuasive scripts, and align every post with a purpose — awareness, trust, or conversion.",
  },
  {
    q: "Who owns the content we create?",
    a: "You do. All content created for your brand — videos, visuals, captions and scripts — belongs to you, and you’re free to reuse it anywhere: your website, ads, presentations or other channels.",
  },
  {
    q: "How do payments work?",
    a: "Packages run on a simple monthly billing cycle. We begin each month with an invoice, and all plans exclude VAT. Payment confirms your slot for the month and production starts immediately after.",
  },
  {
    q: "What happens after we move forward?",
    a: "We start with discovery and alignment: a conversation about your goals, audience and brand. Then we define your strategy and creative direction, plan your first month of content, schedule the first shooting day, and begin publishing — with reporting and refinement every step of the way.",
  },
] as const;

export const webSolutionsFaqs = [
  {
    q: "What types of businesses need a website, and what is its real function?",
    a: "Any business that wants to be taken seriously needs a website. This includes service-based businesses, professionals, growing brands, and companies that rely on trust before a customer makes a decision.\n\nA website functions as your digital headquarters. It explains your business clearly, builds credibility, answers key questions, and supports your sales or inquiry process. While social media creates attention, your website provides structure, clarity, and confidence for people who want to learn more before taking action.\n\nIn short, a website turns interest into trust, and trust into meaningful business conversations.",
  },
  {
    q: "Do you provide after-sales support?",
    a: "Yes. Every package includes post-launch priority support — 30 days on Silver, 60 days on Gold, and ongoing support arrangements on Bespoke builds. After that period, we remain available for content refinements, updates and maintenance so your website keeps performing long after launch.",
  },
  {
    q: "Who owns the website and its assets?",
    a: "You do. Once the project is complete and settled, you own the website, its content, and its assets — domain, design files and copy. We build on flexible, no-lock-in platforms so nothing about your website is held hostage.",
  },
  {
    q: "Can I move my website to another hosting provider in the future?",
    a: "Yes. Our platforms are flexible and portable by design. If you ever decide to change hosting providers, your website and its data can be moved with you — no lock-in contracts, no technical barriers, and no penalty for leaving.",
  },
  {
    q: "How do payments work?",
    a: "Website packages are a one-time investment, with all prices excluding VAT. Work begins after the project is confirmed, and any third-party costs (such as domain renewals or hosting after the first year) are quoted transparently before they apply.",
  },
  {
    q: "What is the next step if I’m interested?",
    a: "Start with a private discussion. We talk through your goals, your audience and the structure your website needs, then recommend the package that fits — or scope a bespoke build if your requirements go beyond it. From there we move into discovery, design and launch.",
  },
] as const;

export type SocialMediaFaq = { q: string; paragraphs: string[] };

export function serializeSocialMediaFaqs(faqs: readonly { q: string; a: string }[]) {
  return faqs.map(({ q, a }) => [q, ...a.split(/\n\s*\n/)].join("|")).join("\n");
}

export function parseSocialMediaFaqs(value: string): SocialMediaFaq[] {
  return value.split("\n").flatMap((line) => {
    const [q, ...paragraphs] = line.split("|").map((part) => part.trim());
    if (!q || paragraphs.length === 0 || paragraphs.some((paragraph) => !paragraph)) return [];
    return [{ q, paragraphs }];
  });
}
