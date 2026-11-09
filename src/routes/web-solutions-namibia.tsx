import { createFileRoute, Link } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { StudioShell, useConfiguredWhatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText, useCmsPageSections } from '@/components/cms-sections';
import { pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';
import { defaultWebsitePackages } from '@/lib/studio-content';
import { parseSocialMediaFaqs } from '@/lib/social-media-faqs';

export const Route = createFileRoute('/web-solutions-namibia')({
  head: () => pageHead('Crevora Web Business Solutions Namibia — High Performance SEO and Revenue', 'Crevora provides strategic business website design and development services for companies in Namibia — strategy-led websites that build trust and turn attention into business.'),
  component: Web,
});

function Web() {
  const [active, setActive] = useState<number | null>(0);
  const { services } = useSiteContent();
  const sections = useCmsPageSections();
  const whatsappUrl = useConfiguredWhatsapp();
  const websiteService = services.find(service => service.to === '/web-solutions-namibia');
  const packages = websiteService?.packages ?? defaultWebsitePackages;
  const faqs = parseSocialMediaFaqs(sections.find(section => section.id === 'faq')?.fields["items"] ?? '');
  const approach = sections.find(section => section.id === 'approach')?.fields;
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero">
      <span className="eyebrow"><CmsText sectionId="hero" field="eyebrow">BUSINESS WEBSITE DESIGN & DEVELOPMENT IN NAMIBIA</CmsText></span>
      <h1><CmsText sectionId="hero" field="headingStart">Websites that build</CmsText><br /><span><CmsText sectionId="hero" field="headingAccent">trust</CmsText></span> <CmsText sectionId="hero" field="headingEnd">— and business.</CmsText></h1>
      <p><CmsText sectionId="hero" field="body">A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made.</CmsText></p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="hero" field="buttonLabel">Request a private discussion</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="visual"><ServiceVisual kind="web" /></CmsPageBlock>
    <CmsPageBlock sectionId="intro"><section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow"><CmsText sectionId="intro" field="eyebrow">CREVORA — STRATEGIC CREATIVE AGENCY</CmsText></span>
        <div>
          <p><CmsText sectionId="intro" field="paragraph1">Crevora provides strategic business website design and development services for companies in Namibia.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph2">A business website is not just an online presence. It is where trust is built, credibility is proven, and real decisions are made. Our Business Website Solutions help brands clearly communicate who they are, what they offer, and why they matter. We focus on structure, messaging, and user experience so your website supports real business goals, not just looking good.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph3">From the first impression to the final action, we build websites that guide visitors, strengthen brand perception, and turn attention into meaningful engagement.</CmsText></p>
        </div>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="packages"><section className="sm-packages section-pad" id="packages">
      <div className="section-heading reveal">
        <span className="eyebrow"><CmsText sectionId="packages" field="eyebrow">WEBSITE PACKAGES</CmsText></span>
        <h2><CmsText sectionId="packages" field="headingStart">Choose the site</CmsText><br /><CmsText sectionId="packages" field="headingEnd">your business deserves.</CmsText></h2>
        <p><CmsText sectionId="packages" field="body">All website packages are strategy-led and tailored to each business’s goals, structure, and audience journey. All plans exclude VAT.</CmsText></p>
      </div>
      {packages.length ? <div className="sm-package-grid">
        {packages.map((pkg, i) => <article className={`sm-package ${pkg.featured ? 'is-featured' : ''}`} key={pkg.name}>
          {pkg.badge && <span className="sm-package-badge">{pkg.badge}</span>}
          <div className="sm-package-head">
            <span className="sm-package-tier">0{i + 1} / {pkg.name}</span>
            <div className="sm-package-price"><strong>{pkg.price}</strong>{pkg.period && <span>{pkg.period}</span>}</div>
            <p>{pkg.description}</p>
          </div>
          <div className="sm-package-body">
            <span className="sm-package-label">What you get</span>
            <ul>{pkg.features.map(f => <li key={f}>{f}</li>)}</ul>
            <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="packages" field="buttonLabel">Request private discussion</CmsText> <ArrowUpRight /></a></Button>
          </div>
        </article>)}
      </div> : <p className="sm-package-empty">Package details are being prepared. Contact us for a tailored plan.</p>}
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="faq"><section className="sm-faq section-pad">
      <div className="section-heading reveal">
        <span className="eyebrow"><CmsText sectionId="faq" field="eyebrow">EVERYTHING YOU NEED TO KNOW</CmsText></span>
        <h2><CmsText sectionId="faq" field="headingStart">Good questions,</CmsText><br /><CmsText sectionId="faq" field="headingEnd">clear answers.</CmsText></h2>
      </div>
      <div className="sm-faq-list">
        {faqs.map((faq, i) => <div className={`sm-faq-item ${active === i ? 'is-active' : ''}`} key={faq.q}>
          <Button variant="nav" className="sm-faq-trigger" aria-expanded={active === i} aria-controls={`web-faq-${i}`} onClick={() => setActive(active === i ? null : i)}>
            <span className="sm-faq-number">0{i + 1}</span>
            <span className="sm-faq-question">{faq.q}</span>
            <span className="sm-faq-icon">{active === i ? <Minus /> : <Plus />}</span>
          </Button>
          {active === i && <div id={`web-faq-${i}`} className="sm-faq-body">{faq.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
        </div>)}
      </div>
      <div className="sm-faq-cta reveal">
        <p><CmsText sectionId="faq" field="outro">Still deciding? Let’s talk about which package fits your business.</CmsText></p>
        <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="faq" field="buttonLabel">Chat via WhatsApp</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="approach"><section className="approach-section">
      <div className="approach-copy reveal">
        <span className="eyebrow"><CmsText sectionId="approach" field="eyebrow">Business Web Solutions</CmsText></span>
        <h2><CmsText sectionId="approach" field="headingStart">Built to last.</CmsText><br /><span><CmsText sectionId="approach" field="headingEnd">Designed to convert.</CmsText></span></h2>
        <p><CmsText sectionId="approach" field="body">Structure, messaging and user experience working together — so your website turns attention into trust, and trust into business.</CmsText></p>
        <div className="approach-pillars">{[
          [approach?.["item0Title"] ?? 'Strategy-led', approach?.["item0Body"] ?? 'Every page built around your business goals and audience journey.'],
          [approach?.["item1Title"] ?? 'No lock-in', approach?.["item1Body"] ?? 'Flexible platforms — you own your website and can move it anytime.'],
          [approach?.["item2Title"] ?? 'Full support', approach?.["item2Body"] ?? 'Priority post-launch support and content refinements included.'],
        ].map(([t, d]) => <div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div>
        <Button variant="studioLight" asChild><Link to="/contact"><CmsText sectionId="approach" field="buttonLabel">Start the conversation</CmsText> <ArrowUpRight /></Link></Button>
      </div>
    </section></CmsPageBlock>
  </StudioShell>;
}
