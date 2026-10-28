import type { CmsSection } from "./cms-shared";

const section = (
  id: string,
  type: CmsSection["type"],
  title: string,
  fields: Record<string, string> = {},
): CmsSection => ({ id, type, title, enabled: true, fields });

export const cmsPageDefaultSections: Record<string, CmsSection[]> = {
  home: [
    section("hero", "hero", "Home hero", {
      kicker: "Social media & high-conversion websites",
      heading: "Building brands people trust, remember, and choose.",
      body: "We engineer high-performance social media strategies, short-form video systems, and custom conversion websites that directly impact your bottom line.",
    }),
    section("services", "cards", "Services", { headingStart: "Our", headingAccent: "services." }),
    section("trusted", "text", "Trusted by", { heading: "Trusted by businesses across Namibia" }),
    section("industries", "cards", "Industry tabs", { heading: "One studio — adapted to your business" }),
    section("stats", "stats", "Studio statistics", { heading: "Real results, not just a portfolio." }),
    section("work", "gallery", "Selected work", { headingStart: "Different", headingAccent: "by design." }),
    section("why", "text", "Why CREVORA", { headingStart: "Not more noise.", headingAccent: "More meaning." }),
    section("process", "cards", "How we work", { heading: "Good starts with a good conversation." }),
    section("journal", "cards", "Latest journal articles", { heading: "Journal" }),
  ],
  about: [
    section("hero", "hero", "About hero", { eyebrow: "ABOUT CREVORA", headlineStart: "Building brands", headlineAccent: "trust,", headlineEnd: "remember, and choose.", body: "Branding isn’t about being loud. It’s about clarity, consistency, and being the brand people choose when it matters.", buttonLabel: "Start a conversation" }),
    section("intro", "text", "Who we are", { eyebrow: "WHO WE ARE", paragraph1: "Crevora is a strategic creative agency built around content-led strategy, helping businesses lead through digital authority.", paragraph2: "In today’s Namibian digital space, many businesses are visible, but very few are truly chosen. Brands post consistently, chase trends, and invest in content, yet still struggle to earn trust, be remembered, or convert attention into real business outcomes.", paragraph3: "At Crevora, we believe branding is not about being loud. It’s about being clear, consistent, and intentional. Instead of chasing short-term visibility, we focus on one core outcome: helping brands establish authority, shape perception, and communicate clearly with the audience that actually matters." }),
    section("direction", "cards", "Our direction", { eyebrow: "OUR DIRECTION", headlineStart: "Ready to build", headlineAccent: "authority,", headlineEnd: "not just attention?", body: "We don’t build content for attention. We build content for trust, recall, and long-term growth.", item0Title: "Our Direction", item0Body: "We exist to help Namibian businesses move beyond noise and into authority. Our direction is clear: build brands that are trusted, chosen, and remembered in the digital space.", item1Title: "Our Focus", item1Body: "We focus on strategy-led creativity. From Social Media 360 management to content-driven branding and digital execution, every decision we make supports long-term brand growth rather than short-term attention or empty metrics.", item2Title: "Collaborate with Us", item2Body: "We collaborate with businesses that value clarity, strategy, and long-term growth. From strategic content to modern creative experiences, everything we create is designed to move brands forward with purpose." }),
    section("gallery", "gallery", "Studio gallery", { heading: "Selected studio visuals" }),
  ],
  services: [
    section("hero", "hero", "Services hero", { eyebrow: "OUR CAPABILITIES", headingStart: "Your brand.", headingEnd: "Its next chapter.", body: "Strategy gives the work direction. Creativity makes it matter. Four connected services, one considered approach." }),
    section("showcase", "cards", "Service showcase", { heading: "Four connected services" }),
    section("services-list", "cards", "Services list", { eyebrow: "03 / CAPABILITIES", heading: "Clear strategy. Distinctive creativity.", body: "We connect the dots between your brand, your content, and your next customer." }),
    section("work", "gallery", "Selected work", { eyebrow: "02 / SELECTED WORK", heading: "Different by design.", items: "MORA\nSTRIDE\nFeed Studies" }),
  ],
  "social-media-management": [
    section("hero", "hero", "Social media hero", { eyebrow: "SOCIAL MEDIA MANAGEMENT SERVICES IN NAMIBIA", headingStart: "Strategy first.", headingEnd: "Then content.", body: "Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.", buttonLabel: "Chat via WhatsApp" }),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "Crevora provides professional social media management services for businesses in Namibia. Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.", paragraph2: "We focus on building brand awareness, credibility, and trust while clearly positioning your brand’s value. We aren’t just publishing content for visibility; we implement data-driven social media marketing to ensure every post serves a purpose. Beyond reach and impressions, our social media management helps brands attract the right audience, nurture engaged communities, strengthen social proof, and turn social media marketing into a sustainable growth channel that supports long-term marketing efficiency and revenue growth." }),
    section("packages", "cards", "Packages", { eyebrow: "SOCIAL MEDIA MANAGEMENT PACKAGES", headingStart: "Pick the pace", headingEnd: "of your growth.", body: "All packages are strategy-led and tailored to each brand’s objectives and audience. All plans exclude VAT." }),
    section("faq", "faq", "Frequently asked questions", { eyebrow: "EVERYTHING YOU NEED TO KNOW", headingStart: "Good questions,", headingEnd: "clear answers." }),
    section("approach", "cta", "Social Media 360°", { eyebrow: "Social Media 360°", headingStart: "No noise.", headingEnd: "Strategy that works.", body: "Every post with a purpose, every video with a face, every month with a plan. That is how social media becomes a growth channel — not just a feed." }),
  ],
  "brand-identity": [
    section("hero", "hero", "Brand identity hero", { eyebrow: "BRAND IDENTITY & VISUAL SYSTEMS IN NAMIBIA", headingStart: "Brand identity &", headingAccent: "visual systems", headingEnd: "for business.", body: "Crevora helps businesses in Namibia build clear, consistent, and scalable brand identity systems that support long-term growth." }),
    section("visual", "image-text", "Brand identity visual"),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "A strong brand identity is not just about logos or colors.", paragraph2: "It is a strategic foundation that shapes how your business is perceived, trusted, and remembered across every touchpoint." }),
    section("coverage", "cards", "What this service covers", { eyebrow: "WHAT THIS SERVICE COVERS" }),
    section("benefits", "cards", "Why brand identity matters", { eyebrow: "WHY BRAND IDENTITY MATTERS" }),
    section("audience", "cards", "Who this is for", { eyebrow: "WHO THIS IS FOR" }),
    section("approach", "cta", "Brand identity call to action", { body: "Ready to build a brand that lasts?" }),
  ],
  "creative-visuals": [
    section("hero", "hero", "Creative visuals hero", { eyebrow: "CREATIVE VISUALS & MOTION IN NAMIBIA", headingStart: "Creative visuals &", headingAccent: "motion", headingEnd: "that communicate, not just decorate.", body: "Strategic creative visuals and motion graphics for businesses in Namibia — high-impact assets that make people stop, pay attention, and understand." }),
    section("visual", "image-text", "Creative visuals image"),
    section("intro", "text", "Service introduction", { eyebrow: "GOOD VISUALS DO MORE THAN LOOK GOOD", paragraph1: "Good visuals don’t just look good. They make people stop, pay attention, and understand.", paragraph2: "In fast-moving digital environments, static content is easy to ignore. Motion and strong visuals help brands communicate messages faster, clearer, and with stronger impact.", paragraph3: "Crevora helps businesses in Namibia turn ideas, offers, and campaigns into high-impact visual and motion assets that support real marketing goals." }),
    section("packages", "cards", "Campaign packages", { eyebrow: "WHAT THIS SERVICE COVERS", headingStart: "Built for", headingEnd: "the campaign.", body: "Each creative project is built to support specific campaign objectives, platforms, and audience behavior." }),
    section("benefits", "cards", "Why motion matters", { eyebrow: "WHY MOTION MATTERS" }),
    section("audience", "cards", "Who this is for", { eyebrow: "WHO THIS IS FOR" }),
    section("approach", "cta", "Creative visuals call to action", { body: "Ready to make your brand move?" }),
  ],
  "web-solutions": [
    section("hero", "hero", "Web solutions hero", { eyebrow: "BUSINESS WEBSITE DESIGN & DEVELOPMENT IN NAMIBIA", headingStart: "Websites that build", headingAccent: "trust", headingEnd: "— and business.", body: "A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made." }),
    section("visual", "image-text", "Website visual"),
    section("intro", "text", "Service introduction", { eyebrow: "CREVORA — STRATEGIC CREATIVE AGENCY", paragraph1: "Crevora provides strategic business website design and development services for companies in Namibia.", paragraph2: "A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made. Our Business Website Solutions help brands clearly communicate who they are, what they offer, and why they matter. We focus on structure, messaging, and user experience so your website supports real business goals, not just looking good.", paragraph3: "From the first impression to the final action, we build websites that guide visitors, strengthen brand perception, and turn attention into meaningful engagement." }),
    section("packages", "cards", "Website packages", { eyebrow: "WEBSITE PACKAGES", headingStart: "Choose the site", headingEnd: "your business deserves.", body: "All website packages are strategy-led and tailored to each business’s goals, structure, and audience journey. All plans exclude VAT." }),
    section("faq", "faq", "Frequently asked questions", { eyebrow: "EVERYTHING YOU NEED TO KNOW", headingStart: "Good questions,", headingEnd: "clear answers." }),
    section("approach", "cta", "Web solutions call to action", { headingStart: "Built to last.", headingEnd: "Designed to convert.", body: "Structure, messaging and user experience working together — so your website turns attention into trust, and trust into business." }),
  ],
  "social-media-portfolio": [
    section("hero", "hero", "Social portfolio hero", { eyebrow: "SOCIAL MEDIA PORTFOLIO", headingStart: "Made for", headingEnd: "the feed.", body: "Short-form video, carousels and social content — shown the way your audience sees it. Sample work for now; real client content follows." }),
    section("gallery", "gallery", "Social media gallery"),
    section("cta", "cta", "Portfolio call to action", { eyebrow: "Want content like this?", buttonLabel: "Explore Social Media Marketing" }),
  ],
  work: [
    section("hero", "hero", "Work hero", { eyebrow: "OUR WORK", headingStart: "Work, presented", headingEnd: "with intent.", body: "A selection of identities, campaigns and social content." }),
    section("projects", "gallery", "Projects", { heading: "Selected projects" }),
  ],
  "case-studies": [
    section("hero", "hero", "Case study introduction", { heading: "Project details" }),
    section("facts", "stats", "Project facts", { items: "Client\nServices\nYear" }),
    section("story", "text", "Project story", { items: "The challenge\nOur approach\nThe outcome" }),
    section("gallery", "gallery", "Project gallery"),
    section("related", "cards", "Related projects", { eyebrow: "MORE WORK" }),
  ],
  journal: [
    section("hero", "hero", "Journal hero", { eyebrow: "THINKING OUT LOUD", headingStart: "Ideas worth", headingEnd: "a closer look.", body: "Observations, useful questions and fresh perspectives on building brands that connect." }),
    section("articles", "cards", "Journal articles", { heading: "Latest articles" }),
  ],
  "journal-articles": [
    section("hero", "hero", "Article introduction", { eyebrow: "JOURNAL", heading: "Article title" }),
    section("body", "text", "Article body"),
    section("related", "cards", "Related reading", { eyebrow: "KEEP READING" }),
  ],
  contact: [
    section("hero", "hero", "Contact hero", { eyebrow: "CONTACT CREVORA", headingStart: "Let’s talk about", headingEnd: "your brand.", body: "Reaching out doesn’t mean you have to be ready with everything figured out. Sometimes it starts with a question, an idea, or a problem you want to solve.", buttonLabel: "Start a private discussion" }),
    section("intro", "text", "No pressure", { eyebrow: "NO PRESSURE", paragraph1: "No pressure. No commitments. Just a discussion.", paragraph2: "If you’re exploring how to build stronger brand authority through strategy and content, we’re open to a private discussion." }),
    section("details", "contact", "Contact details", { headingStart: "Chat via", headingEnd: "WhatsApp." }),
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
