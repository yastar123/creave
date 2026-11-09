import { createFileRoute, Link } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { StudioShell, useConfiguredWhatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';
import { parseSocialMediaFaqs } from '@/lib/social-media-faqs';
import { useCmsPageSections } from '@/components/cms-sections';

export const Route = createFileRoute('/social-media-management-namibia')({
  head: () => pageHead('Social Media 360 Agency Namibia — Full-Service Management & Strategic Content Growth', 'Crevora provides professional social media management services for businesses in Namibia — strategy-led content, community management and reporting that turn social media into a sustainable growth channel.'),
  component: Social,
});

function Social() {
  const [active, setActive] = useState<number | null>(0);
  const { services } = useSiteContent();
  const whatsappUrl = useConfiguredWhatsapp();
  const packages = services.find(service => service.to === '/social-media-management-namibia')?.packages ?? [];
  const faqItems = parseSocialMediaFaqs(
    useCmsPageSections().find(section => section.id === 'faq')?.fields["items"] ?? '',
  );
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero">
      <span className="eyebrow"><CmsText sectionId="hero" field="eyebrow">SOCIAL MEDIA MANAGEMENT SERVICES IN NAMIBIA</CmsText></span>
      <h1><CmsText sectionId="hero" field="headingStart">Strategy first.</CmsText><br /><CmsText sectionId="hero" field="headingEnd">Then <span>content.</span></CmsText></h1>
      <p><CmsText sectionId="hero" field="body">Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.</CmsText></p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="hero" field="buttonLabel">Request a private discussion</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="visual"><ServiceVisual kind="social" /></CmsPageBlock>
    <CmsPageBlock sectionId="intro"><section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow"><CmsText sectionId="intro" field="eyebrow">CREVORA — STRATEGIC CREATIVE AGENCY</CmsText></span>
        <div>
          <p><CmsText sectionId="intro" field="paragraph1">Crevora provides professional social media management services for businesses in Namibia. Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph2">We focus on building brand awareness, credibility, and trust while clearly positioning your brand’s value. We aren’t just publishing content for visibility; we implement data-driven social media marketing to ensure every post serves a purpose. Beyond reach and impressions, our social media management helps brands attract the right audience, nurture engaged communities, strengthen social proof, and turn social media marketing into a sustainable growth channel that supports long-term marketing efficiency and revenue growth.</CmsText></p>
        </div>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="packages"><section className="sm-packages section-pad" id="packages">
      <div className="section-heading reveal">
        <span className="eyebrow"><CmsText sectionId="packages" field="eyebrow">SOCIAL MEDIA MANAGEMENT PACKAGES</CmsText></span>
        <h2><CmsText sectionId="packages" field="headingStart">Pick the pace</CmsText><br /><CmsText sectionId="packages" field="headingEnd">of your <span>growth.</span></CmsText></h2>
        <p><CmsText sectionId="packages" field="body">All packages are strategy-led and tailored to each brand’s objectives and audience. All plans exclude VAT.</CmsText></p>
      </div>
      {packages.length ? <div className="sm-package-grid">
        {packages.map((pkg, i) => <article className={`sm-package ${pkg.featured ? 'is-featured' : ''}`} key={`${pkg.name}-${i}`}>
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
        <h2><CmsText sectionId="faq" field="headingStart">Good questions,</CmsText><br /><CmsText sectionId="faq" field="headingEnd">clear <span>answers.</span></CmsText></h2>
      </div>
      <div className="sm-faq-list">
        {faqItems.map((faq, i) => <div className={`sm-faq-item ${active === i ? 'is-active' : ''}`} key={faq.q}>
          <Button variant="nav" className="sm-faq-trigger" aria-expanded={active === i} aria-controls={`sm-faq-${i}`} onClick={() => setActive(active === i ? null : i)}>
            <span className="sm-faq-number">0{i + 1}</span>
            <span className="sm-faq-question">{faq.q}</span>
            <span className="sm-faq-icon">{active === i ? <Minus /> : <Plus />}</span>
          </Button>
          {active === i && <div id={`sm-faq-${i}`} className="sm-faq-body">{faq.paragraphs.map(p => <p key={p}>{p}</p>)}</div>}
        </div>)}
      </div>
      <div className="sm-faq-cta reveal">
        <p><CmsText sectionId="faq" field="outro">Still deciding? Let’s talk about which package fits your brand.</CmsText></p>
        <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="faq" field="buttonLabel">Chat via WhatsApp</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="approach"><section className="approach-section">
      <div className="approach-copy reveal">
        <span className="eyebrow"><CmsText sectionId="approach" field="eyebrow">Social Media 360°</CmsText></span>
        <h2><CmsText sectionId="approach" field="headingStart">No noise.</CmsText><br /><span><CmsText sectionId="approach" field="headingEnd">Strategy that works.</CmsText></span></h2>
        <p><CmsText sectionId="approach" field="body">Every post with a purpose, every video with a face, every month with a plan. That is how social media becomes a growth channel — not just a feed.</CmsText></p>
        <div className="approach-pillars">{[
          ['Strategy-led', 'Content planned around your business goals, not the algorithm of the week.'],
          ['Human-first', 'Faces build trust faster than graphics. We put people at the centre.'],
          ['Measured', 'Insight reporting and next-month optimization, every single month.'],
        ].map(([t, d], i) => <div key={t}><strong><CmsText sectionId="approach" field={`item${i}Title`}>{t}</CmsText></strong><span><CmsText sectionId="approach" field={`item${i}Body`}>{d}</CmsText></span></div>)}</div>
        <Button variant="studioLight" asChild><Link to="/contact"><CmsText sectionId="approach" field="buttonLabel">Start the conversation</CmsText> <ArrowUpRight /></Link></Button>
      </div>
    </section></CmsPageBlock>
  </StudioShell>;
}
