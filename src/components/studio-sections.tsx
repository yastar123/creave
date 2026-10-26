import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatDate } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';

export function ServicesSection({ full = false }: { full?: boolean }) {
  const { services } = useSiteContent();
  const [active, setActive] = useState<number | null>(0);
  return <section className="services-section section-pad" id="services">
    <div className="section-heading reveal"><span className="eyebrow">03 / CAPABILITIES</span><h2>Clear strategy.<br />Distinctive creativity.</h2><p>We connect the dots between your brand,<br className="desktop-break" /> your content, and your next customer.</p></div>
    <div className="service-list">{services.map((service, i) => <div className={`service-item ${active === i ? 'is-active' : ''}`} key={service.title}>
      <Button variant="nav" className="service-trigger" aria-expanded={active === i} aria-controls={`service-${i}`} onClick={() => setActive(active === i ? null : i)}><span className="service-number">0{i + 1}</span><span className="service-title">{service.title}{i === 0 && <span className="focus-label">Core focus</span>}</span><span className="service-icon">{active === i ? <Minus /> : <Plus />}</span></Button>
      {active === i && <div id={`service-${i}`} className="service-body"><p>{service.description}</p>{full && <p className="service-detail">{service.detail}</p>}<div className="service-tags">{service.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Button variant="nav" className="text-cta" asChild><Link to={service.to}>{'Explore the service'}<ArrowUpRight /></Link></Button></div>}
    </div>)}</div>
  </section>;
}

export function WorkSection() {
  const { projects } = useSiteContent();
  const [selected, setSelected] = useState<number | null>(null);
  const project = selected === null ? null : projects[selected];
  return <section className="work-section section-pad" id="selected-work">
    <div className="section-heading reveal"><span className="eyebrow">02 / SELECTED WORK</span><h2>Different by<br /><span>design.</span></h2><span className="section-note">Ideas made tangible.<br />A selection of concept work.</span></div>
    <div className="work-grid">{projects.map((p, i) => <article className="project-item reveal" key={p.name}><Button variant="nav" className="project-image-button" data-cursor="view" onClick={() => setSelected(i)} aria-label={`View ${p.name} concept project`}><img src={p.image} alt={p.alt} width={1440} height={1088} loading="lazy" /><span className="project-open"><ArrowUpRight /></span><span className="concept-label">CONCEPT PROJECT / 2026</span></Button><div className="project-caption"><div><span className="project-ordinal">0{i + 1} / CONCEPT EXPLORATION</span><h3>{p.name}</h3><span>{p.category}</span></div><Button variant="nav" size="icon" onClick={() => setSelected(i)} aria-label={`Open ${p.name} project`}><ArrowUpRight /></Button></div></article>)}</div>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="project-dialog">{project && <><img src={project.image} alt={project.alt} width={1440} height={1088} /><div className="project-dialog-text"><span className="eyebrow">{project.category} / CONCEPT PROJECT</span><DialogTitle>{project.title}</DialogTitle><DialogDescription>{project.description}</DialogDescription><Button variant="studio" asChild><Link to="/contact">Create something together <ArrowUpRight /></Link></Button></div></>}</DialogContent></Dialog>
  </section>;
}

export function ApproachSection() {
  return <section className="approach-section"><div className="approach-copy reveal"><span className="eyebrow">The CREVORA way</span><h2>Not more noise.<br /><span>More meaning.</span></h2><p>Your brand deserves more than another post on a feed. It deserves a clear voice, a considered strategy, and creative work that feels unmistakably you.</p><div className="approach-pillars">{[['Strategy first', 'Every idea starts with your audience and your business goals.'], ['Made for the feed', 'Short-form video and social content built for how people scroll.'], ['Brand-led', 'Consistent visuals and voice across every touchpoint.']].map(([t, d]) => <div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div><Button variant="studioLight" asChild><Link to="/about">Get to know us <ArrowUpRight /></Link></Button></div></section>;
}

export function ProcessSection() {
  const steps = [{ title: 'Let’s Talk', text: 'A relaxed first conversation about your business, your goals and what is holding your brand back.' }, { title: 'Discover & Plan', text: 'We study your audience, competitors and current channels, then shape a clear direction.' }, { title: 'Proposal & Agreement', text: 'You receive a concrete proposal with scope, timeline and investment — no surprises.' }, { title: 'Create & Collaborate', text: 'We produce strategy, content and design together with you, refining every detail along the way.' }, { title: 'Final Delivery', text: 'We launch, hand over and report — with clear next steps to keep your brand growing.' }];
  return <section className="process-section section-pad"><div className="section-heading reveal"><span className="eyebrow">04 — How we work</span><h2>Good starts with a good conversation.</h2></div><div className="process-grid reveal">{steps.map((step, i) => <div key={step.title} className="process-step reveal"><span className="process-number">0{i + 1}<ArrowRight size={16} /></span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>;
}

export function TrustedBy() {
  const { trustedBy } = useSiteContent();
  if (!trustedBy.length) return null;
  const loop = [...trustedBy, ...trustedBy];
  return <section className="trusted-section section-pad" aria-labelledby="trusted-title"><div className="trusted-head"><span className="eyebrow" id="trusted-title">Trusted by</span><span className="trusted-note">Businesses across Namibia</span></div><div className="trusted-marquee" aria-hidden="false"><ul className="trusted-list">{loop.map((c, i) => <li key={`${c.name}-${i}`} aria-hidden={i >= trustedBy.length}>{c.logo ? <img src={c.logo} alt={i < trustedBy.length ? c.name : ''} loading="lazy" /> : <span>{c.name}</span>}</li>)}</ul></div></section>;
}

export function JournalSection({ full = false }: { full?: boolean }) {
  const { articles } = useSiteContent();
  const list = full ? articles : articles.slice(0, 3);
  return <section className="journal-section section-pad"><div className="section-heading reveal"><span className="eyebrow">Journal</span><h2>Fresh perspectives.</h2>{!full && <Button variant="nav" className="text-cta" asChild><Link to="/journal">Explore the journal <ArrowUpRight /></Link></Button>}</div><div className="journal-grid reveal">{list.map((a, i) => <article className="journal-item" key={a.slug}><Link to="/journal/$slug" params={{ slug: a.slug }} className={`journal-art journal-art-${i % 3}`} aria-hidden="true" tabIndex={-1}>{i % 3 === 0 ? <><div className="art-focus" /><span>MAKE<br />THEM<br />STOP.</span><ArrowUpRight /></> : i % 3 === 1 ? <><span className="art-aa">Aa</span><div className="art-lines" /><span className="art-small">IDENTITY IS EVERYTHING.</span></> : <><span className="art-intent">Less.<br /><span>But better.</span></span><Plus /></>}</Link><div className="journal-meta"><span>{a.category}</span><time dateTime={a.date}>{formatDate(a.date)}</time></div><Button variant="nav" className="journal-title" asChild><Link to="/journal/$slug" params={{ slug: a.slug }}>{a.title}<ArrowUpRight /></Link></Button></article>)}</div></section>;
}
