import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { projects, services, gallery } from '@/lib/studio-content';
import { whatsapp } from '@/components/studio-shell';
import svcSocial from '@/assets/svc-social.webp';
import svcMotion from '@/assets/svc-motion.webp';
import svcWeb from '@/assets/svc-web.webp';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Words fill from grey to ink as the paragraph scrolls through the viewport. */
export function ManifestoSection() {
  const ref = useRef<HTMLElement>(null);
  const text = 'We help ambitious brands build authority, dominate their niche, and convert digital presence into scalable growth — through strategy you can feel, identities you remember and content built for how people actually watch.';
  const words = text.split(' ');
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>('.mf-word'));
    if (reduced()) { spans.forEach(s => s.classList.add('is-on')); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.8 - r.top) / (r.height * 0.9)));
      const n = Math.floor(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('is-on', i < n));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return <section ref={ref} className="mf-section" id="intro">
    <div className="mf-meta"><span className="eyebrow">(01) — Manifesto</span><span className="eyebrow">Est. Windhoek, NA</span></div>
    <p className="mf-text" aria-label={text}>{words.map((w, i) => <span key={i} className="mf-word" aria-hidden="true">{w} </span>)}</p>
    <div className="mf-stats">
      {[['10+', 'Brands, professional experience'], ['04', 'Disciplines, one direction'], ['∞', 'Scrolls worth stopping']].map(([n, l]) => <div key={l}><strong>{n}</strong><span>{l}</span></div>)}
    </div>
  </section>;
}

/** Full-bleed project cards that stick and stack; the previous card recedes. */
export function StackedWork() {
  const [selected, setSelected] = useState<number | null>(null);
  const project = selected === null ? null : projects[selected];
  const list = [...projects, { name: 'FEED STUDIES', category: 'Short-form video', image: gallery[0]!.image, alt: gallery[0]!.alt, title: 'Vertical stories, made to be watched twice.', description: 'A self-initiated short-form series exploring hooks, pacing and product storytelling for Reels and TikTok.' }];
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (reduced()) return;
    const cards = Array.from(wrap.current?.querySelectorAll<HTMLElement>('.sw-card') ?? []);
    let raf = 0;
    const update = () => {
      raf = 0;
      cards.forEach((c, i) => {
        const next = cards[i + 1]; if (!next) return;
        const r = next.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, 1 - r.top / window.innerHeight));
        c.style.setProperty('--sw-scale', String(1 - p * 0.08));
        c.style.setProperty('--sw-dim', String(p * 0.55));
      });
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return <section className="sw-section" id="selected-work">
    <div className="sw-head"><span className="eyebrow">(02) — Selected work</span><h2 className="split-title"><span>Different</span> <em>by design.</em></h2><Link to="/social-media-management-namibia" className="text-cta">All social work <ArrowUpRight /></Link></div>
    <div ref={wrap} className="sw-stack">{list.map((p, i) => <article key={p.name} className="sw-card" style={{ top: `calc(80px + ${i * 22}px)` }}>
      <button type="button" className="sw-media" data-cursor="view" onClick={() => setSelected(i)} aria-label={`View ${p.name} project`}><img src={p.image} alt={p.alt} loading="lazy" width={1440} height={1088} /></button>
      <div className="sw-info"><span className="sw-index">{String(i + 1).padStart(2, '0')}/{String(list.length).padStart(2, '0')}</span><h3>{p.name}</h3><span className="sw-cat">{p.category}</span><span className="sw-year">Concept · 2026</span></div>
    </article>)}</div>
    <Dialog open={selected !== null} onOpenChange={o => { if (!o) setSelected(null); }}><DialogContent className="project-dialog">{project && <><img src={list[selected!]!.image} alt={list[selected!]!.alt} /><div className="project-dialog-text"><span className="eyebrow">{list[selected!]!.category} / CONCEPT PROJECT</span><DialogTitle>{list[selected!]!.title}</DialogTitle><DialogDescription>{list[selected!]!.description}</DialogDescription><Button variant="studio" asChild><Link to="/contact">Create something together <ArrowUpRight /></Link></Button></div></>}</DialogContent></Dialog>
  </section>;
}

/** Bold, image-led service cards so visitors instantly see what CREVORA does. */
export function ServiceShowcase() {
  const imgs = [svcSocial, gallery[2]!.image, svcMotion, svcWeb];
  const chips = [['♥ 1.2K', 'Reels · TikTok'], ['Aa', 'Logo · Colour'], ['● REC', '4K · Motion'], ['98', 'Speed score']];
  return <section className="ss-section" id="services">
    <div className="ss-head"><span className="eyebrow">(03) — What we do</span><h2>Four services.<br /><em>One clear direction.</em></h2><Link to="/services" className="studio-button studio-button-outline inline-flex items-center">All services <ArrowUpRight size={16} /></Link></div>
    <div className="ss-grid">{services.map((s, i) => <Link key={s.title} to={s.to} className={`ss-card ss-card-${i}`}>
      <img src={imgs[i]} alt="" loading="lazy" width={1200} height={1200} />
      <span className="ss-shade" />
      <span className="ss-top"><span className="ss-num">0{i + 1}</span>{i === 0 ? <span className="ss-pill">Core focus</span> : <span className="ss-pill">{chips[i]![1]}</span>}</span>
      <span className="ss-float" aria-hidden="true">{chips[i]![0]}</span>
      <span className="ss-body"><h3>{s.title}</h3><span className="ss-tags">{s.tags.slice(0, 3).map(t => <span key={t}>{t}</span>)}</span></span>
      <span className="ss-arrow"><ArrowUpRight /></span>
    </Link>)}</div>
  </section>;
}

/** Closing statement with giant marquee type. */
export function BigCta() {
  return <section className="bc-section">
    <span className="eyebrow">(06) — Next</span>
    <a href={whatsapp} target="_blank" rel="noreferrer" className="bc-marquee" aria-label="Start a project on WhatsApp">
      <span className="bc-track">{[0, 1].map(k => <span key={k} aria-hidden="true">No noise. Just strategy that works <i>✺</i> No noise. Just strategy that works <i>✺</i> </span>)}</span>
    </a>
    <div className="bc-foot"><p>We focus on clarity, direction, and execution so your brand isn’t just visible, but truly chosen. Tell us about it — we reply within one working day.</p><div className="bc-actions"><Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp us <ArrowUpRight /></a></Button><Link to="/contact" className="text-cta">Or send a brief <ArrowUpRight /></Link></div></div>
  </section>;
}
