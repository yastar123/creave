import type { CmsSection } from "./cms-shared";
import {
  serializeSocialMediaFaqs,
  socialMediaFaqs,
  webSolutionsFaqs,
} from "./social-media-faqs";

const section = (
  id: string,
  type: CmsSection["type"],
  title: string,
  fields: Record<string, string> = {},
): CmsSection => ({ id, type, title, enabled: true, fields });

export const homepageServiceMediaFields: Record<string, { image: string; video: string }> = {
  "/social-media-management-namibia": { image: "serviceSocialImage", video: "serviceSocialVideo" },
  "/brand-identity-namibia": { image: "serviceIdentityImage", video: "serviceIdentityVideo" },
  "/creative-visuals-motion-namibia": { image: "serviceMotionImage", video: "serviceMotionVideo" },
  "/web-solutions-namibia": { image: "serviceWebImage", video: "serviceWebVideo" },
};

const homepageServiceMediaDefaults = Object.fromEntries(
  Object.values(homepageServiceMediaFields).flatMap(({ image, video }) => [[image, ""], [video, ""]]),
);
const mediaOverrides = { mediaItems: "[]" };

export const cmsPageDefaultSections: Record<string, CmsSection[]> = {
  home: [
    section("hero", "hero", "Home hero", {
      metaLabel: "Independent creative studio",
      metaLocation: "Windhoek, Namibia",
      kicker: "Social media & high-conversion websites",
      heading: "Building brands people trust, remember, and choose.",
      body: "We engineer high-performance social media strategies, short-form video systems, and custom conversion websites that directly impact your bottom line.",
      buttonLabel: "Start a conversation",
      bottomLabel: "Social media. Identity. Content. Digital.",
      image: "",
      video: "",
      imageAlt: "Sculpted obsidian forms in monochrome light",
    }),
    section("services", "cards", "Services", {
      eyebrow: "What we do",
      headingStart: "Our",
      headingAccent: "services.",
      buttonLabel: "All services",
      ...homepageServiceMediaDefaults,
      ...mediaOverrides,
    }),
    section("trusted", "text", "Trusted by", {
      heading: "Trusted by businesses across Namibia",
      note: "Businesses across Namibia",
      ...mediaOverrides,
    }),
    section("industries", "cards", "Industry tabs", {
      heading: "One studio — adapted to your business",
      body: "Find out how CREVORA fits your brand, audience and goals.",
      buttonLabel: "Discover possibilities",
      coverImage: "",
      coverVideo: "",
      imageAlt: "Creative work adapted for different industries",
      ...mediaOverrides,
    }),
    section("stats", "stats", "Studio statistics", {
      heading: "Real results, not just a portfolio.",
      body: "10+ brands. 4 disciplines. 1 clear direction.",
      note: "Based on professional experience across Namibian and international brands.",
    }),
    section("work", "gallery", "Selected work", {
      eyebrow: "(02) — Selected work",
      headingStart: "Different",
      headingAccent: "by design.",
      buttonLabel: "All social work",
      coverImage: "",
      coverVideo: "",
      ...mediaOverrides,
    }),
    section("why", "text", "Why CREVORA", {
      eyebrow: "Why CREVORA",
      headingStart: "Not more noise.",
      headingAccent: "More meaning.",
      item0Title: "Strategy first",
      item0Body: "Every idea starts with your audience and your business goals.",
      item1Title: "Made for the feed",
      item1Body: "Short-form content built for how people actually scroll.",
      item2Title: "Brand-led",
      item2Body: "Consistent visuals and voice across every touchpoint.",
      item3Title: "Measured",
      item3Body: "Clear reporting so you see what works — and what’s next.",
      buttonLabel: "Book a discovery call",
    }),
    section("process", "cards", "How we work", {
      eyebrow: "04 — How we work",
      heading: "Good starts with a good conversation.",
      item0Title: "Let’s Talk",
      item0Body: "A relaxed first conversation about your business, your goals and what is holding your brand back.",
      item1Title: "Discover & Plan",
      item1Body: "We study your audience, competitors and current channels, then shape a clear direction.",
      item2Title: "Proposal & Agreement",
      item2Body: "You receive a concrete proposal with scope, timeline and investment — no surprises.",
      item3Title: "Create & Collaborate",
      item3Body: "We produce strategy, content and design together with you, refining every detail along the way.",
      item4Title: "Final Delivery",
      item4Body: "We launch, hand over and report — with clear next steps to keep your brand growing.",
    }),
    section("journal", "cards", "Latest journal articles", { eyebrow: "Journal", heading: "Fresh perspectives.", buttonLabel: "Explore the journal", ...mediaOverrides }),
  ],
  about: [
    section("hero", "hero", "About hero", { eyebrow: "ABOUT CREVORA", headlineStart: "Building brands", headlineAccent: "trust,", headlineEnd: "remember, and choose.", body: "Branding isn’t about being loud. It’s about clarity, consistency, and being the brand people choose when it matters.", buttonLabel: "Start a conversation" }),
    section("intro", "text", "Who we are", { eyebrow: "WHO WE ARE", paragraph1: "Crevora is a strategic creative agency built around content-led strategy, helping businesses lead through digital authority.", paragraph2: "In today’s Namibian digital space, many businesses are visible, but very few are truly chosen. Brands post consistently, chase trends, and invest in content, yet still struggle to earn trust, be remembered, or convert attention into real business outcomes.", paragraph3: "At Crevora, we believe branding is not about being loud. It’s about being clear, consistent, and intentional. Instead of chasing short-term visibility, we focus on one core outcome: helping brands establish authority, shape perception, and communicate clearly with the audience that actually matters." }),
    section("direction", "cards", "Our direction", { eyebrow: "OUR DIRECTION", headlineStart: "Ready to build", headlineAccent: "authority,", headlineEnd: "not just attention?", body: "We don’t build content for attention. We build content for trust, recall, and long-term growth.", buttonLabel: "Collaborate with us", item0Title: "Our Direction", item0Body: "We exist to help Namibian businesses move beyond noise and into authority. Our direction is clear: build brands that are trusted, chosen, and remembered in the digital space.", item1Title: "Our Focus", item1Body: "We focus on strategy-led creativity. From Social Media 360 management to content-driven branding and digital execution, every decision we make supports long-term brand growth rather than short-term attention or empty metrics.", item2Title: "Collaborate with Us", item2Body: "We collaborate with businesses that value clarity, strategy, and long-term growth. From strategic content to modern creative experiences, everything we create is designed to move brands forward with purpose." }),
    section("gallery", "gallery", "Studio gallery", { eyebrow: "THE STUDIO, IN EXPERIMENTS", heading: "Room for the unexpected.", note: "Visual studies. New directions. Always a work in progress.", ...mediaOverrides }),
  ],
  services: [
    section("hero", "hero", "Services hero", { eyebrow: "OUR CAPABILITIES", headingStart: "Your brand.", headingEnd: "Its next chapter.", body: "Strategy gives the work direction. Creativity makes it matter. Four connected services, one considered approach." }),
    section("showcase", "cards", "Service showcase", { eyebrow: "(03) — What we do", heading: "Four services. One clear direction.", buttonLabel: "All services", coreFocusLabel: "Core focus", ...mediaOverrides }),
    section("services-list", "cards", "Services list", { eyebrow: "03 / CAPABILITIES", heading: "Clear strategy. Distinctive creativity.", body: "We connect the dots between your brand, your content, and your next customer.", buttonLabel: "Explore the service", coreFocusLabel: "Core focus" }),
    section("work", "gallery", "Selected work", { eyebrow: "02 / SELECTED WORK", heading: "Different by design.", items: "MORA\nSTRIDE\nFeed Studies", ...mediaOverrides }),
  ],
  "social-media-management": [
    section("hero", "hero", "Social media hero", { eyebrow: "SOCIAL MEDIA MANAGEMENT SERVICES IN NAMIBIA", headingStart: "Strategy first.", headingEnd: "Then content.", body: "Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.", buttonLabel: "Request a private discussion" }),
    section("visual", "image-text", "Social media visual", { image: "", video: "", imageAlt: "Social media service visual" }),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "Crevora provides professional social media management services for businesses in Namibia. Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.", paragraph2: "We focus on building brand awareness, credibility, and trust while clearly positioning your brand’s value. We aren’t just publishing content for visibility; we implement data-driven social media marketing to ensure every post serves a purpose. Beyond reach and impressions, our social media management helps brands attract the right audience, nurture engaged communities, strengthen social proof, and turn social media marketing into a sustainable growth channel that supports long-term marketing efficiency and revenue growth." }),
    section("packages", "cards", "Packages", { eyebrow: "SOCIAL MEDIA MANAGEMENT PACKAGES", headingStart: "Pick the pace", headingEnd: "of your growth.", body: "All packages are strategy-led and tailored to each brand’s objectives and audience. All plans exclude VAT.", buttonLabel: "Request private discussion" }),
    section("faq", "faq", "Frequently asked questions", {
      eyebrow: "EVERYTHING YOU NEED TO KNOW",
      headingStart: "Good questions,",
      headingEnd: "clear answers.",
      items: serializeSocialMediaFaqs(socialMediaFaqs),
      outro: "Still deciding? Let’s talk about which package fits your brand.",
      buttonLabel: "Chat via WhatsApp",
    }),
    section("approach", "cta", "Social Media 360°", { eyebrow: "Social Media 360°", headingStart: "No noise.", headingEnd: "Strategy that works.", body: "Every post with a purpose, every video with a face, every month with a plan. That is how social media becomes a growth channel — not just a feed.", buttonLabel: "Chat via WhatsApp", item0Title: "Strategy-led", item0Body: "Content planned around your business goals, not the algorithm of the week.", item1Title: "Human-first", item1Body: "Faces build trust faster than graphics. We put people at the centre.", item2Title: "Measured", item2Body: "Insight reporting and next-month optimization, every single month." }),
  ],
  "brand-identity": [
    section("hero", "hero", "Brand identity hero", { eyebrow: "BRAND IDENTITY & VISUAL SYSTEMS IN NAMIBIA", headingStart: "Brand identity &", headingAccent: "visual systems", headingEnd: "for business.", body: "Crevora helps businesses in Namibia build clear, consistent, and scalable brand identity systems that support long-term growth.", buttonLabel: "Request a private discussion" }),
    section("visual", "image-text", "Brand identity visual", { image: "", video: "", imageAlt: "Brand identity visual showcase" }),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "A strong brand identity is not just about logos or colors.", paragraph2: "It is a strategic foundation that shapes how your business is perceived, trusted, and remembered across every touchpoint." }),
    section("coverage", "cards", "What this service covers", { eyebrow: "WHAT THIS SERVICE COVERS", headingStart: "Built around", headingAccent: "goals.", paragraph0: "Every brand identity project is built around your business goals, market position, and growth stage.", paragraph1: "This is not a one-size-fits-all solution.", item0: "Brand positioning & core brand narrative", item1: "Brand purpose, values, and tone of voice", item2: "Logo system (primary, secondary, variations)", item3: "Color palette & typography direction", item4: "Visual identity framework", item5: "Brand usage & consistency guidelines", item6: "Applications for digital, social media, and website use", item7: "Scalable identity system for future growth", outro: "Every element is crafted to support how your brand operates and grows." }),
    section("benefits", "cards", "Why brand identity matters", { eyebrow: "WHY BRAND IDENTITY MATTERS", headingAccent: "repetition.", paragraph0: "Strong brands are not built by visuals alone.", paragraph1: "They are built through clarity, consistency, and repetition.", paragraph2: "A well-defined brand identity helps you:", item0: "Build trust faster with your audience", item1: "Look professional and credible at first glance", item2: "Stand out in competitive markets", item3: "Create consistency across teams and platforms", item4: "Support marketing, content, and sales efforts", item5: "Grow without constantly redesigning or rebranding" }),
    section("audience", "cards", "Who this is for", { eyebrow: "WHO THIS IS FOR", headingAccent: "ideal", item0: "Businesses building a serious long-term brand", item1: "Companies preparing to scale or expand", item2: "Brands struggling with inconsistent visuals and messaging", item3: "Founders who want clarity, not guesswork", item4: "Businesses tired of redesigning without real direction", outro: "If your brand feels unclear, inconsistent, or easily forgotten, a brand identity system creates the structure you need." }),
    section("approach", "cta", "Brand identity call to action", { eyebrow: "Brand identity", body: "Ready to build a brand that lasts?", buttonLabel: "Chat via WhatsApp" }),
  ],
  "creative-visuals": [
    section("hero", "hero", "Creative visuals hero", { eyebrow: "CREATIVE VISUALS & MOTION IN NAMIBIA", headingStart: "Creative visuals &", headingAccent: "motion", headingEnd: "that communicate, not just decorate.", body: "Strategic creative visuals and motion graphics for businesses in Namibia — high-impact assets that make people stop, pay attention, and understand.", buttonLabel: "Discuss your vision" }),
    section("visual", "image-text", "Creative visuals image", { image: "", video: "", imageAlt: "Creative visuals and motion showcase" }),
    section("intro", "text", "Service introduction", { eyebrow: "GOOD VISUALS DO MORE THAN LOOK GOOD", paragraph1: "Good visuals don’t just look good. They make people stop, pay attention, and understand.", paragraph2: "In fast-moving digital environments, static content is easy to ignore. Motion and strong visuals help brands communicate messages faster, clearer, and with stronger impact.", paragraph3: "Crevora helps businesses in Namibia turn ideas, offers, and campaigns into high-impact visual and motion assets that support real marketing goals." }),
    section("packages", "cards", "Campaign packages", { eyebrow: "WHAT THIS SERVICE COVERS", headingStart: "Built for", headingEnd: "the campaign.", body: "Each creative project is built to support specific campaign objectives, platforms, and audience behavior.", item0Title: "Social Campaign Assets", item0Body: "Short-form video and motion assets made for Instagram, TikTok, Facebook and LinkedIn.", item1Title: "Brand Story & Explainer Videos", item1Body: "Simplifying your services or products through elegant motion design.", item2Title: "Advanced Motion Experiences", item2Body: "Interactive elements and motion assets designed specifically for website integration.", item3Title: "Custom Commercial Visuals", item3Body: "Premium 2D/3D motion graphics for professional presentations and campaigns.", item4Title: "Animated Brand Elements", item4Body: "Bringing your logo and brand assets to life through strategic movement." }),
    section("benefits", "cards", "Why motion matters", { eyebrow: "WHY MOTION MATTERS", headingAccent: "language", paragraph0: "In today’s digital landscape, motion is the language of engagement.", paragraph1: "High-quality motion graphics help you:", item0: "Stop the thumb-scroll on competitive social media feeds", item1: "Increase information retention compared to static text or images", item2: "Explain complex business logic quickly and clearly", item3: "Project a modern, premium brand image that builds instant trust", item4: "Drive higher conversion rates in your paid advertising campaigns" }),
    section("audience", "cards", "Who this is for", { eyebrow: "WHO THIS IS FOR", headingAccent: "ideal", item0: "Businesses launching new products or services in Namibia", item1: "Companies looking to scale their social media engagement and reach", item2: "Brands that want to simplify complex messages for their audience", item3: "Marketing teams needing high-performance visual assets for ads", outro: "Let’s discuss your vision and how strategic motion graphics can transform your marketing results." }),
    section("approach", "cta", "Creative visuals call to action", { eyebrow: "Creative visuals & motion", body: "Ready to make your brand move?", buttonLabel: "Chat via WhatsApp" }),
  ],
  "web-solutions": [
    section("hero", "hero", "Web solutions hero", { eyebrow: "BUSINESS WEBSITE DESIGN & DEVELOPMENT IN NAMIBIA", headingStart: "Websites that build", headingAccent: "trust", headingEnd: "— and business.", body: "A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made.", buttonLabel: "Request a private discussion" }),
    section("visual", "image-text", "Website visual", { image: "", video: "", imageAlt: "Website design showcase" }),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "Crevora provides strategic business website design and development services for companies in Namibia.", paragraph2: "A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made. Our Business Website Solutions help brands clearly communicate who they are, what they offer, and why they matter. We focus on structure, messaging, and user experience so your website supports real business goals, not just looking good.", paragraph3: "From the first impression to the final action, we build websites that guide visitors, strengthen brand perception, and turn attention into meaningful engagement." }),
    section("packages", "cards", "Website packages", { eyebrow: "WEBSITE PACKAGES", headingStart: "Choose the site", headingEnd: "your business deserves.", body: "All website packages are strategy-led and tailored to each business’s goals, structure, and audience journey. All plans exclude VAT.", buttonLabel: "Request private discussion" }),
    section("faq", "faq", "Frequently asked questions", {
      eyebrow: "EVERYTHING YOU NEED TO KNOW",
      headingStart: "Good questions,",
      headingEnd: "clear answers.",
      items: serializeSocialMediaFaqs(webSolutionsFaqs),
      outro: "Still deciding? Let’s talk about which package fits your business.",
      buttonLabel: "Chat via WhatsApp",
    }),
    section("approach", "cta", "Web solutions call to action", {
      eyebrow: "Business Web Solutions",
      headingStart: "Built to last.",
      headingEnd: "Designed to convert.",
      body: "Structure, messaging and user experience working together — so your website turns attention into trust, and trust into business.",
      item0Title: "Strategy-led",
      item0Body: "Every page built around your business goals and audience journey.",
      item1Title: "No lock-in",
      item1Body: "Flexible platforms — you own your website and can move it anytime.",
      item2Title: "Full support",
      item2Body: "Priority post-launch support and content refinements included.",
      buttonLabel: "Start the conversation",
    }),
  ],
  "social-media-portfolio": [
    section("hero", "hero", "Social portfolio hero", { eyebrow: "SOCIAL MEDIA PORTFOLIO", headingStart: "Made for", headingEnd: "the feed.", body: "Short-form video, carousels and social content — shown the way your audience sees it. Sample work for now; real client content follows." }),
    section("gallery", "gallery", "Social media gallery", mediaOverrides),
    section("cta", "cta", "Portfolio call to action", { eyebrow: "Want content like this?", buttonLabel: "Explore Social Media Marketing" }),
  ],
  work: [
    section("hero", "hero", "Work hero", { eyebrow: "OUR WORK", headingStart: "Work, presented", headingEnd: "with intent.", body: "A selection of identities, campaigns and social content." }),
    section("projects", "gallery", "Projects", { heading: "Selected projects", ...mediaOverrides }),
  ],
  "case-studies": [
    section("hero", "hero", "Case study introduction", { heading: "Project details", ...mediaOverrides }),
    section("facts", "stats", "Project facts", { items: "Client\nServices\nYear" }),
    section("story", "text", "Project story", { items: "The challenge\nOur approach\nThe outcome" }),
    section("gallery", "gallery", "Project gallery", mediaOverrides),
    section("related", "cards", "Related projects", { eyebrow: "MORE WORK" }),
  ],
  journal: [
    section("hero", "hero", "Journal hero", { eyebrow: "THINKING OUT LOUD", headingStart: "Ideas worth", headingEnd: "a closer look.", body: "Observations, useful questions and fresh perspectives on building brands that connect." }),
    section("articles", "cards", "Journal articles", { eyebrow: "Journal", heading: "Latest articles", ...mediaOverrides }),
  ],
  "journal-articles": [
    section("hero", "hero", "Article introduction", { eyebrow: "JOURNAL", heading: "Article title", ...mediaOverrides }),
    section("body", "text", "Article body"),
    section("related", "cards", "Related reading", { eyebrow: "KEEP READING" }),
  ],
  contact: [
    section("hero", "hero", "Contact hero", { eyebrow: "CONTACT CREVORA", headingStart: "Let’s talk about", headingEnd: "your brand.", body: "Reaching out doesn’t mean you have to be ready with everything figured out. Sometimes it starts with a question, an idea, or a problem you want to solve.", buttonLabel: "Start a private discussion" }),
    section("intro", "text", "No pressure", { eyebrow: "NO PRESSURE", paragraph1: "No pressure. No commitments. Just a discussion.", paragraph2: "If you’re exploring how to build stronger brand authority through strategy and content, we’re open to a private discussion." }),
    section("details", "contact", "Contact details", { headingStart: "Chat via", headingEnd: "WhatsApp.", buttonLabel: "Chat via WhatsApp" }),
    section("form", "contact", "Contact form"),
  ],
  "privacy-policy": [
    section("policy", "text", "Privacy policy", { heading: "Privacy Policy", items: "Who we are|CREVORA is a digital and creative agency based in Windhoek, Namibia.\nInformation we collect|We collect the details you choose to share through the contact form.\nHow we use and keep it|We use contact-form information to respond to enquiries and deliver agreed services.\nWhatsApp and other services|WhatsApp processes messages under its own privacy terms.\nYour rights|You may request access, correction or deletion of your information." }),
  ],
  terms: [
    section("terms", "text", "Terms of service", { heading: "Terms of Service", items: "Using this website|The content is provided for general information about CREVORA and its services.\nProjects and proposals|Each project is governed by a separate written proposal and agreement.\nIntellectual property|Website text, visuals, logos and portfolio material belong to CREVORA or its clients.\nLiability|We aim to keep the website accurate, complete and available.\nGoverning law|These terms are governed by the laws of the Republic of Namibia." }),
  ],
  maintenance: [
    section("status", "cta", "Maintenance notice", { eyebrow: "SCHEDULED MAINTENANCE", heading: "We’re refining a few details.", body: "Our website is being updated and will be back shortly. Need us now? We’re on WhatsApp.", buttonLabel: "Message us on WhatsApp" }),
  ],
};

export function getCmsPageDefaultSections(pageId: string): CmsSection[] {
  return (cmsPageDefaultSections[pageId] ?? []).map((item) => ({
    ...item,
    fields: { ...item.fields },
  }));
}
