import { createFileRoute } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/studio-utils';

const covers = [
  { label: 'Social Campaign Assets', text: 'Short-form video and motion assets made for Instagram, TikTok, Facebook and LinkedIn.' },
  { label: 'Brand Story & Explainer Videos', text: 'Simplifying your services or products through elegant motion design.' },
  { label: 'Advanced Motion Experiences', text: 'Interactive elements and motion assets designed specifically for website integration.' },
  { label: 'Custom Commercial Visuals', text: 'Premium 2D/3D motion graphics for professional presentations and campaigns.' },
  { label: 'Animated Brand Elements', text: 'Bringing your logo and brand assets to life through strategic movement.' },
];

const benefits = [
  'Stop the thumb-scroll on competitive social media feeds',
  'Increase information retention compared to static text or images',
  'Explain complex business logic quickly and clearly',
  'Project a modern, premium brand image that builds instant trust',
  'Drive higher conversion rates in your paid advertising campaigns',
];

const audience = [
  'Businesses launching new products or services in Namibia',
  'Companies looking to scale their social media engagement and reach',
  'Brands that want to simplify complex messages for their audience',
  'Marketing teams needing high-performance visual assets for ads',
];

export const Route = createFileRoute('/creative-visuals-motion-namibia')({
  head: () => pageHead('Crevora Visuals and Motion Agency Namibia — High-Impact Strategic Video Content and Motion Graphics', 'Crevora creates strategic creative visuals and motion graphics for businesses in Namibia that communicate clearly and support real marketing goals.'),
  component: CreativeVisualsMotion,
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

function CreativeVisualsMotion() {
  return <StudioShell>
    <section className="inner-hero">
      <span className="eyebrow">CREATIVE VISUALS & MOTION IN NAMIBIA</span>
      <h1>Creative visuals &<br /><span>motion</span> that communicate,<br />not just decorate.</h1>
      <p>Strategic creative visuals and motion graphics for businesses in Namibia — high-impact assets that make people stop, pay attention, and understand.</p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Discuss your vision <ArrowUpRight /></a></Button>
      </div>
    </section>

    <ServiceVisual kind="motion" />
    <section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">GOOD VISUALS DO MORE THAN LOOK GOOD</span>
        <div>
          <p>Good visuals don’t just look good. They make people stop, pay attention, and understand.</p>
          <p>In fast-moving digital environments, static content is easy to ignore. Motion and strong visuals help brands communicate messages faster, clearer, and with stronger impact.</p>
          <p>Crevora helps businesses in Namibia turn ideas, offers, and campaigns into high-impact visual and motion assets that support real marketing goals.</p>
        </div>
      </div>
    </section>

    <section className="sm-packages section-pad">
      <div className="section-heading reveal">
        <span className="eyebrow">WHAT THIS SERVICE COVERS</span>
        <h2>Built for<br />the <span>campaign.</span></h2>
        <p>Each creative project is built to support specific campaign objectives, platforms, and audience behavior.</p>
        <p>Our Creative Visual & Motion Production may include:</p>
      </div>
      <div className="sm-package-grid is-single">
        <article className="sm-package">
          <div className="sm-package-body">
            <ul>{covers.map(c => <li key={c.label}><strong>{c.label}</strong> — {c.text}</li>)}</ul>
          </div>
        </article>
      </div>
    </section>

    <List eyebrow="WHY MOTION MATTERS" title={<>Motion is the<br /><span>language</span> of engagement.</>} intro={['In today’s digital landscape, motion is the language of engagement.', 'High-quality motion graphics help you:']} items={benefits} />

    <List eyebrow="WHO THIS IS FOR" title={<>This service<br />is <span>ideal</span> for:</>} items={audience} outro="Let’s discuss your vision and how strategic motion graphics can transform your marketing results." />

    <section className="sm-faq section-pad">
      <div className="sm-faq-cta reveal">
        <p>Ready to make your brand move?</p>
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Chat via WhatsApp <ArrowUpRight /></a></Button>
      </div>
    </section>
  </StudioShell>;
}
