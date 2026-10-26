import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, ArrowLeft, Sparkles, Layers, Clapperboard, MonitorSmartphone, Target, PenTool, Gauge, MessageCircle } from 'lucide-react';
import heroImg from '@/assets/hero-obsidian.webp';
import svcSocial from '@/assets/svc-social.webp';
import svcMotion from '@/assets/svc-motion.webp';
import svcWeb from '@/assets/svc-web.webp';
import { useSiteContent } from '@/lib/site-content-context';
import { whatsapp } from '@/components/studio-shell';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Bell-shaped visibility for a phase centred on c with half-width w. */
const phase = (p: number, start: number, end: number, fade = 0.06) => clamp(Math.min((p - start) / fade, (end - p) / fade));

/** Runs cb with 0..1 progress of the element scrolling through its sticky range. */
function useScrollProgress(ref: React.RefObject<HTMLElement | null>, cb: (p: number, el: HTMLElement) => void) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const range = r.height - window.innerHeight;
      cb(range > 0 ? clamp(-r.top / range) : 0, el);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
}

/** Pinned full-bleed hero: copy changes in phases, then the image shrinks into a rounded card. */
export function PinnedHero() {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, (p, el) => {
    if (reduced()) p = 0;
    el.style.setProperty('--ph1', String(p < 0.05 ? 1 : phase(p, -1, 0.24)));
    const p2 = phase(p, 0.28, 0.52); el.style.setProperty('--ph2', String(p2)); el.classList.toggle('p2-on', p2 > 0.5);
    el.style.setProperty('--ph3', String(phase(p, 0.56, 0.76)));
    // Frame rounds/shrinks in step with the copy phases so content and wrapper change together.
    const sh = clamp((p - 0.04) / 0.72); el.style.setProperty('--shrink', String(sh));
    const frame = el.querySelector<HTMLElement>('.lh-frame'); if (frame) { const g = Math.min(72, window.innerWidth * 0.04); frame.style.clipPath = `inset(${sh * 7}% ${sh * g}px round ${sh * 36}px)`; }
  });
  const cards = [['Strategy-led', 'social media that builds trust and brings real inquiries'], ['Organic short-form', 'video for Reels & TikTok, made to be watched twice'], ['One team', 'for identity, content, motion and web — no hand-offs']];
  return <section ref={ref} className="lh-hero" aria-label="CREVORA introduction">
    <div className="lh-sticky">
      <div className="lh-frame"><img src={heroImg} alt="A sculptural obsidian form lit softly against deep black" width={1920} height={1088} fetchPriority="high" /><span className="lh-veil" /></div>
      <div className="lh-copy lh-p1"><span className="lh-kicker">Strategic marketing agency · Windhoek</span><h1>Building brands people trust, remember, and choose.</h1></div>
      <div className="lh-copy lh-p2"><p className="lh-lead">An independent creative studio connecting <strong>social media, branding, content and digital</strong> — so your brand isn’t just visible, but truly chosen.</p>
        <div className="lh-glass-row">{cards.map(([b, t]) => <div key={b} className="lh-glass"><strong>{b}</strong> {t}</div>)}</div>
        <Link to="/contact" className="lh-btn">Start a project <ArrowRight size={16} /></Link></div>
      <div className="lh-copy lh-p3"><p className="lh-lead">CREVORA works with ambitious Namibian businesses — from first idea to launch — with professional experience across 10+ brands.</p><span className="lh-made">Made in Namibia ✺</span></div>
    </div>
  </section>;
}

/** Centred two-tone heading followed by a horizontal rounded-card carousel of the four services. */
export function ServiceCarousel() {
  const { services, gallery } = useSiteContent();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState(false);
  const imgs = [svcSocial, gallery[2]?.image ?? gallery[0]?.image, svcMotion, svcWeb];
  const step = () => { const el = track.current; const card = el?.children[0] as HTMLElement | undefined; return card ? card.offsetWidth + 16 : 0; };
  const go = (d: number) => {
    const el = track.current; if (!el) return;
    if (pinned) { window.scrollBy({ top: d * step(), behavior: 'smooth' }); return; }
    el.scrollBy({ left: d * step(), behavior: 'smooth' });
  };
  const onScroll = () => { const el = track.current; const s = step(); if (el && s) setIdx(Math.round(el.scrollLeft / s)); };

  // Scroll-driven carousel: section pins while vertical scroll moves the cards from first to last.
  useEffect(() => {
    const sec = section.current, el = track.current; if (!sec || !el) return;
    let raf = 0, max = 0, on = false;
    const measure = () => {
      max = el.scrollWidth - el.clientWidth;
      on = !reduced() && max > 0;
      setPinned(on);
      const stick = sec.firstElementChild as HTMLElement;
      sec.style.setProperty('--svc-h', `${stick.offsetHeight}px`);
      sec.style.height = on ? `${Math.max(window.innerHeight, stick.offsetHeight) + max}px` : '';
      update();
    };
    const update = () => {
      raf = 0; if (!on) return;
      const r = sec.getBoundingClientRect();
      const stickTop = Math.min(0, window.innerHeight - (sec.firstElementChild as HTMLElement).offsetHeight);
      el.scrollLeft = clamp((stickTop - r.top) / max) * max;
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    measure();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('scroll', tick); window.removeEventListener('resize', measure); cancelAnimationFrame(raf); sec.style.height = ''; };
  }, []);

  return <section ref={section} className={`lh-section lh-svc ${pinned ? 'is-pinned' : ''}`} id="services">
    <div className="lh-svc-sticky">
    <h2 className="lh-title">More than an agency. <span>Strategy, content and digital — in one creative team.</span></h2>
    <div ref={track} className="lh-carousel" onScroll={onScroll}>{services.map((s, i) => <Link key={s.title} to={s.to} className="lh-scard">
      <span className="lh-scard-head"><strong>0{i + 1} · {s.title}.</strong> <span>{s.description.split('.')[0]}.</span></span>
      <span className="lh-scard-media">{imgs[i] && <img src={imgs[i]} alt="" width={1200} height={1200} loading="lazy" />}{i === 0 && <span className="lh-badge">Core focus</span>}</span>
      <ul>{s.tags.slice(0, 3).map(b => <li key={b}><strong>{b.split(' ')[0]}</strong> {b.split(' ').slice(1).join(' ')}</li>)}</ul>
    </Link>)}</div>
    <div className="lh-controls"><button type="button" onClick={() => go(-1)} aria-label="Previous service"><ArrowLeft size={16} /></button><span className="lh-dots">{services.map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</span><button type="button" onClick={() => go(1)} aria-label="Next service"><ArrowRight size={16} /></button></div>
    <div className="lh-center"><Link to="/services" className="lh-btn">Explore all services <ArrowRight size={16} /></Link></div>
    </div>
  </section>;
}

/** Oversized statement whose colour fills in as it scrolls into view. */
export function FillStatement() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduced()) { el.style.setProperty('--fill', '100%'); return; }
    let raf = 0;
    const update = () => { raf = 0; const r = el.getBoundingClientRect(); const p = clamp((window.innerHeight * 0.9 - r.top) / (window.innerHeight * 0.6)); el.style.setProperty('--fill', `${p * 100}%`); };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf); };
  }, []);
  return <section ref={ref} className="lh-fill"><h2 data-no-choreo>Built for brands<br />that want to grow.</h2><p>Clarity, direction, execution.</p></section>;
}

/** Rounded image card with pill tabs that swap the scene per industry. */
export function IndustryTabs() {
  const { gallery } = useSiteContent();
  const tabs = gallery.map((item) => [item.title, item.image] as const);
  const [t, setT] = useState(0);
  if (!tabs.length) return null;
  return <section className="lh-section">
    <div className="lh-tabcard">{tabs.map(([, src], i) => <img key={i} src={src} alt="" loading="lazy" className={i === t ? 'on' : ''} />)}<span className="lh-veil" />
      <h2>One studio — adapted to your business</h2>
      <div className="lh-pills" role="tablist">{tabs.map(([n], i) => <button key={n} role="tab" aria-selected={i === t} className={i === t ? 'on' : ''} onClick={() => setT(i)}>{n}</button>)}</div>
    </div>
    <div className="lh-row"><p>Find out how CREVORA fits your brand, audience and goals.</p><a href={whatsapp} target="_blank" rel="noreferrer" className="lh-btn">Discover possibilities <ArrowRight size={16} /></a></div>
  </section>;
}

export function StatsBlock() {
  return <section className="lh-stats"><h2>Real results, not just a portfolio.<br /><span>10+ brands. 4 disciplines.<br />1 clear direction.</span></h2><p>Based on professional experience across Namibian and international brands.</p></section>;
}

export function WhyCards() {
  const items = [[Target, 'Strategy first.', 'Every idea starts with your audience and your business goals.'], [Sparkles, 'Made for the feed.', 'Short-form content built for how people actually scroll.'], [PenTool, 'Brand-led.', 'Consistent visuals and voice across every touchpoint.'], [Gauge, 'Measured.', 'Clear reporting so you see what works and what is next.']] as const;
  return <section className="lh-section"><p className="lh-eyebrow">Why CREVORA stands apart</p>
    <div className="lh-why">{items.map(([Icon, t, d]) => <div key={t}><span className="lh-why-tile"><Icon size={40} strokeWidth={1.2} /></span><p><strong>{t}</strong> {d}</p></div>)}</div>
  </section>;
}

export function GrowthPanel() {
  const feats = [[Layers, 'Four services, one team'], [MessageCircle, 'Reply within one working day'], [Clapperboard, 'In-house content & motion'], [MonitorSmartphone, 'Web built to convert']] as const;
  return <section className="lh-section"><div className="lh-panel"><span className="lh-eyebrow">CREVORA</span><h2>Engineered for growth</h2>
    <div className="lh-feats">{feats.map(([Icon, t]) => <div key={t}><Icon size={18} /><span>{t}</span></div>)}</div>
    <a href={whatsapp} target="_blank" rel="noreferrer" className="lh-btn">Book a discovery call <ArrowRight size={16} /></a>
  </div></section>;
}
