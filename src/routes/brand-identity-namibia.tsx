import { createFileRoute } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/studio-utils';

const covers = [
  'Brand positioning & core brand narrative',
  'Brand purpose, values, and tone of voice',
  'Logo system (primary, secondary, variations)',
  'Color palette & typography direction',
  'Visual identity framework',
  'Brand usage & consistency guidelines',
  'Applications for digital, social media, and website use',
  'Scalable identity system for future growth',
];

const benefits = [
  'Build trust faster with your audience',
  'Look professional and credible at first glance',
  'Stand out in competitive markets',
  'Create consistency across teams and platforms',
  'Support marketing, content, and sales efforts',
  'Grow without constantly redesigning or rebranding',
];

const audience = [
  'Businesses building a serious long-term brand',
  'Companies preparing to scale or expand',
  'Brands struggling with inconsistent visuals and messaging',
  'Founders who want clarity, not guesswork',
  'Businesses tired of redesigning without real direction',
];

export const Route = createFileRoute('/brand-identity-namibia')({
  head: () => pageHead('Crevora Strategic Branding Agency Namibia — Comprehensive Visual Identity and Brand Authority', 'Crevora helps businesses in Namibia build clear, consistent, and scalable brand identity systems that support long-term growth.'),
  component: BrandIdentity,
});

function List({ eyebrow, title, intro, items, outro }: { eyebrow: string; title: React.ReactNode; intro?: string[]; items: string[]; outro?: string }) {
  return <section className="sm-packages section-pad">
    <div className="section-heading reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {intro?.map(p => <p key={p}>{p}</p>)}
    </div>
    <div className="sm-package-grid is-single">
      <article className="sm-package">
        <div className="sm-package-body">
          <ul>{items.map(f => <li key={f}>{f}</li>)}</ul>
        </div>
      </article>
    </div>
    {outro && <div className="sm-faq-cta reveal"><p>{outro}</p></div>}
  </section>;
}

function BrandIdentity() {
  return <StudioShell>
    <section className="inner-hero">
      <span className="eyebrow">BRAND IDENTITY & VISUAL SYSTEMS IN NAMIBIA</span>
      <h1>Brand identity &<br /><span>visual systems</span> for business.</h1>
      <p>Crevora helps businesses in Namibia build clear, consistent, and scalable brand identity systems that support long-term growth.</p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Request a private discussion <ArrowUpRight /></a></Button>
      </div>
    </section>

    <ServiceVisual kind="identity" />
    <section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">CREVORA — STRATEGIC CREATIVE AGENCY</span>
        <div>
          <p>A strong brand identity is not just about logos or colors.</p>
          <p>It is a strategic foundation that shapes how your business is perceived, trusted, and remembered across every touchpoint.</p>
        </div>
      </div>
    </section>

    <List eyebrow="WHAT THIS SERVICE COVERS" title={<>Built around<br />your <span>goals.</span></>} intro={['Every brand identity project is built around your business goals, market position, and growth stage.', 'This is not a one-size-fits-all solution.']} items={covers} outro="Every element is crafted to support how your brand operates and grows." />

    <List eyebrow="WHY BRAND IDENTITY MATTERS" title={<>Clarity, consistency,<br /><span>repetition.</span></>} intro={['Strong brands are not built by visuals alone.', 'They are built through clarity, consistency, and repetition.', 'A well-defined brand identity helps you:']} items={benefits} />

    <List eyebrow="WHO THIS IS FOR" title={<>This service<br />is <span>ideal</span> for:</>} items={audience} outro="If your brand feels unclear, inconsistent, or easily forgotten, a brand identity system creates the structure you need." />

    <section className="sm-faq section-pad">
      <div className="sm-faq-cta reveal">
        <p>Ready to build a brand that lasts?</p>
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Chat via WhatsApp <ArrowUpRight /></a></Button>
      </div>
    </section>
  </StudioShell>;
}
