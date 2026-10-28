import { createFileRoute, Link } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { pageHead } from '@/lib/studio-utils';

const packages = [
  {
    tier: 'Silver Website',
    price: 'N$ 12 900',
    period: 'one-time',
    note: 'A clean, professional website to build trust and help small businesses get online.',
    features: [
      'Complete Website Setup Up to 5 Pages (Home, About, Services, Contact, Portfolio/Projects)',
      'Mobile & Tablet Responsive',
      'Free Domain (.com, .net, .cc, .store) & secure hosting for 1 Year',
      'Basic SEO Setup & Google Search Integration',
      'Modern Design with Motion',
      'SSL Certificate for secure browsing',
      'WhatsApp Instant Chat, Email & Social Media Integration',
      'Fast Loading Speed',
      'Flexible, No-Lock-In Platforms',
      '1 Premium Strategic Hero Banner',
      'Easy Content Dashboard',
      '30-Day Post-Launch Priority Support',
      '2 Complimentary Content Refinements (within 30 days of launch)',
    ],
  },
  {
    tier: 'Gold Growth',
    price: 'N$ 18 900',
    period: 'one-time',
    featured: true,
    badge: 'Most Popular',
    note: 'For businesses ready to scale and turn their website into a marketing engine.',
    features: [
      'Complete Website Setup Up to 7 Pages',
      'Professional Product/Service Catalog (Perfect for Car Dealers, Property Listings, or Portfolios)',
      'Free Domain (.com, .net, .cc, .store) & secure hosting for 1 Year',
      'Mobile & Tablet Responsive',
      'Custom Business Email Setup (Up to 5 @yourbrand.com)',
      'Automated ticketing system for professional customer service (If Required)',
      'Website Live Chat Integration (If Required)',
      'Real-Time Reporting Page',
      'Full Website Copywriting',
      'Advanced SEO Strategy & Google Search Integration',
      'Modern Design with Interactive Elements & Advanced Motion Experience',
      'SSL Certificate for secure browsing',
      'WhatsApp Instant Chat, Email & Social Media Integration',
      'Fast Loading Speed',
      'Flexible, No-Lock-In Platforms',
      '2 Premium Strategic Hero Banner',
      'Easy Content Dashboard',
      '60-Day Post-Launch Priority Support',
      '3 Complimentary Content Refinements (within 30 days of launch)',
    ],
  },
  {
    tier: 'Bespoke Web Solutions',
    price: 'Price on request',
    period: '',
    note: 'Custom-built websites for businesses with complex needs and long-term growth goals.',
    features: [
      'Unlimited Pages & Sections',
      'Unlimited Professional Email Accounts',
      'Custom-Built Business Logic',
      'Complex System Integration',
      'Priority Security & Advanced Maintenance',
      'Backup & Recovery Setup',
      'Third-Party API & Software Connectivity',
      'Custom Admin Training & Documentation',
      'Future-Proof Scalable Architecture',
      'Custom Marketplace & Platform Solutions',
    ],
  },
];

const faqs = [
  {
    q: 'What types of businesses need a website, and what is its real function?',
    a: 'Any business that wants to be taken seriously needs a website. This includes service-based businesses, professionals, growing brands, and companies that rely on trust before a customer makes a decision.\n\nA website functions as your digital headquarters. It explains your business clearly, builds credibility, answers key questions, and supports your sales or inquiry process. While social media creates attention, your website provides structure, clarity, and confidence for people who want to learn more before taking action.\n\nIn short, a website turns interest into trust, and trust into meaningful business conversations.',
  },
  {
    q: 'Do you provide after-sales support?',
    a: 'Yes. Every package includes post-launch priority support — 30 days on Silver, 60 days on Gold, and ongoing support arrangements on Bespoke builds. After that period, we remain available for content refinements, updates and maintenance so your website keeps performing long after launch.',
  },
  {
    q: 'Who owns the website and its assets?',
    a: 'You do. Once the project is complete and settled, you own the website, its content, and its assets — domain, design files and copy. We build on flexible, no-lock-in platforms so nothing about your website is held hostage.',
  },
  {
    q: 'Can I move my website to another hosting provider in the future?',
    a: 'Yes. Our platforms are flexible and portable by design. If you ever decide to change hosting providers, your website and its data can be moved with you — no lock-in contracts, no technical barriers, and no penalty for leaving.',
  },
  {
    q: 'How do payments work?',
    a: 'Website packages are a one-time investment, with all prices excluding VAT. Work begins after the project is confirmed, and any third-party costs (such as domain renewals or hosting after the first year) are quoted transparently before they apply.',
  },
  {
    q: 'What is the next step if I’m interested?',
    a: 'Start with a private discussion. We talk through your goals, your audience and the structure your website needs, then recommend the package that fits — or scope a bespoke build if your requirements go beyond it. From there we move into discovery, design and launch.',
  },
];

export const Route = createFileRoute('/web-solutions-namibia')({
  head: () => pageHead('Crevora Web Business Solutions Namibia — High Performance SEO and Revenue', 'Crevora provides strategic business website design and development services for companies in Namibia — strategy-led websites that build trust and turn attention into business.'),
  component: Web,
});

function Web() {
  const [active, setActive] = useState<number | null>(0);
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero">
      <span className="eyebrow">BUSINESS WEBSITE DESIGN & DEVELOPMENT IN NAMIBIA</span>
      <h1><CmsText sectionId="hero" field="headingStart">Websites that build</CmsText><br /><span><CmsText sectionId="hero" field="headingAccent">trust</CmsText></span> <CmsText sectionId="hero" field="headingEnd">— and business.</CmsText></h1>
      <p><CmsText sectionId="hero" field="body">A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made.</CmsText></p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer"><CmsText sectionId="hero" field="buttonLabel">Request a private discussion</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="visual"><ServiceVisual kind="web" /></CmsPageBlock>
    <CmsPageBlock sectionId="intro"><section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">CREVORA — STRATEGIC CREATIVE AGENCY</span>
        <div>
          <p><CmsText sectionId="intro" field="paragraph1">Crevora provides strategic business website design and development services for companies in Namibia.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph2">A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made. Our Business Website Solutions help brands clearly communicate who they are, what they offer, and why they matter. We focus on structure, messaging, and user experience so your website supports real business goals, not just looking good.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph3">From the first impression to the final action, we build websites that guide visitors, strengthen brand perception, and turn attention into meaningful engagement.</CmsText></p>
        </div>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="packages"><section className="sm-packages section-pad" id="packages">
      <div className="section-heading reveal">
        <span className="eyebrow">WEBSITE PACKAGES</span>
        <h2><CmsText sectionId="packages" field="headingStart">Choose the site</CmsText><br /><CmsText sectionId="packages" field="headingEnd">your business deserves.</CmsText></h2>
        <p><CmsText sectionId="packages" field="body">All website packages are strategy-led and tailored to each business’s goals, structure, and audience journey. All plans exclude VAT.</CmsText></p>
      </div>
      <div className="sm-package-grid">
        {packages.map((pkg, i) => <article className={`sm-package ${pkg.featured ? 'is-featured' : ''}`} key={pkg.tier}>
          {pkg.badge && <span className="sm-package-badge">{pkg.badge}</span>}
          <div className="sm-package-head">
            <span className="sm-package-tier">0{i + 1} / {pkg.tier}</span>
            <div className="sm-package-price"><strong>{pkg.price}</strong>{pkg.period && <span>{pkg.period}</span>}</div>
            <p>{pkg.note}</p>
          </div>
          <div className="sm-package-body">
            <span className="sm-package-label">What you get</span>
            <ul>{pkg.features.map(f => <li key={f}>{f}</li>)}</ul>
            <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Request private discussion <ArrowUpRight /></a></Button>
          </div>
        </article>)}
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="faq"><section className="sm-faq section-pad">
      <div className="section-heading reveal">
        <span className="eyebrow">EVERYTHING YOU NEED TO KNOW</span>
        <h2><CmsText sectionId="faq" field="headingStart">Good questions,</CmsText><br /><CmsText sectionId="faq" field="headingEnd">clear answers.</CmsText></h2>
      </div>
      <div className="sm-faq-list">
        {faqs.map((faq, i) => <div className={`sm-faq-item ${active === i ? 'is-active' : ''}`} key={faq.q}>
          <Button variant="nav" className="sm-faq-trigger" aria-expanded={active === i} aria-controls={`web-faq-${i}`} onClick={() => setActive(active === i ? null : i)}>
            <span className="sm-faq-number">0{i + 1}</span>
            <span className="sm-faq-question">{faq.q}</span>
            <span className="sm-faq-icon">{active === i ? <Minus /> : <Plus />}</span>
          </Button>
          {active === i && <div id={`web-faq-${i}`} className="sm-faq-body">{faq.a.split('\n\n').map(p => <p key={p}>{p}</p>)}</div>}
        </div>)}
      </div>
      <div className="sm-faq-cta reveal">
        <p>Still deciding? Let’s talk about which package fits your business.</p>
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Chat via WhatsApp <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="approach"><section className="approach-section">
      <div className="approach-copy reveal">
        <span className="eyebrow">Business Web Solutions</span>
        <h2><CmsText sectionId="approach" field="headingStart">Built to last.</CmsText><br /><span><CmsText sectionId="approach" field="headingEnd">Designed to convert.</CmsText></span></h2>
        <p><CmsText sectionId="approach" field="body">Structure, messaging and user experience working together — so your website turns attention into trust, and trust into business.</CmsText></p>
        <div className="approach-pillars">{[
          ['Strategy-led', 'Every page built around your business goals and audience journey.'],
          ['No lock-in', 'Flexible platforms — you own your website and can move it anytime.'],
          ['Full support', 'Priority post-launch support and content refinements included.'],
        ].map(([t, d]) => <div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div>
        <Button variant="studioLight" asChild><Link to="/contact">Start the conversation <ArrowUpRight /></Link></Button>
      </div>
    </section></CmsPageBlock>
  </StudioShell>;
}
