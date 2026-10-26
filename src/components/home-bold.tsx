import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Target, Sparkles, PenTool, Gauge, Pause, Play } from 'lucide-react';
import heroImage from '@/assets/hero-obsidian.webp';
import { services, trustedBy } from '@/lib/studio-content';
import { whatsapp } from '@/components/studio-shell';
import { ServiceVideo } from '@/components/service-video';
import { Button } from '@/components/ui/button';

/** Full-bleed project-led opening, without scroll-pinned phases. */
export function BoldHero() {
  return <section className="hv-hero home-hero hv-dark" aria-labelledby="hv-hero-title">
    <img className="hv-hero-cover" src={heroImage} alt="Sculpted obsidian forms in monochrome light" fetchPriority="high" />
    <div className="hv-hero-masthead">
      <div className="hv-hero-meta"><span>Independent creative studio</span><span>Windhoek, Namibia</span></div>
      <p className="hv-hero-kicker">Social media &amp; high-conversion websites</p>
      <h1 id="hv-hero-title">Building brands people trust, remember, and choose.</h1>
      <p className="hv-hero-blurb">We engineer high-performance social media strategies, short-form video systems, and custom conversion websites that directly impact your bottom line.</p>
    </div>
    <div className="hv-hero-bottom">
      <div className="hv-hero-intro">
        <span>Social media. Identity. Content. Digital.</span>
      </div>
      <div className="hv-hero-links">
        <Button asChild variant="ghost" className="hv-hero-link"><Link to="/contact">Start a conversation <ArrowUpRight /></Link></Button>
        <Button asChild variant="ghost" className="hv-hero-project"><Link to="/work/$slug" params={{ slug: 'mora' }}><span>MORA <small>Brand identity · Concept project</small></span><ArrowUpRight /></Link></Button>
      </div>
    </div>
  </section>;
}

/** Staggered editorial service columns, with captions outside the imagery. */
export function BoldServices() {
  const [paused, setPaused] = useState(true);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPaused(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll<HTMLElement>('.hv-scard'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) { grid.removeAttribute('data-card-motion'); return; }
    cards.forEach((card, index) => card.style.setProperty('--d', `${Math.min(index, 3) * 120}ms`));
    const enter = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      enter.unobserve(entry.target);
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    cards.forEach(card => enter.observe(card));
    let frame = 0;
    const paint = () => {
      frame = 0;
      const viewport = window.innerHeight;
      cards.forEach(card => {
        const box = card.getBoundingClientRect();
        if (box.bottom < 0 || box.top > viewport) return;
        const progress = Math.max(-1, Math.min(1, (box.top + box.height / 2 - viewport / 2) / viewport));
        card.style.setProperty('--drift', `${(-progress * 30).toFixed(2)}px`);
        card.style.setProperty('--drift-soft', `${(progress * 14).toFixed(2)}px`);
      });
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      enter.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  const visuals = [
    { video: 'https://assets.mixkit.co/videos/43270/43270-720.mp4', label: 'Social media messaging on a smartphone' },
    { video: 'https://assets.mixkit.co/videos/50598/50598-720.mp4', label: 'Graphic designer choosing typography colors' },
    { video: 'https://assets.mixkit.co/videos/41292/41292-720.mp4', label: 'Creative video editing in a production studio' },
    { video: 'https://assets.mixkit.co/videos/1735/1735-720.mp4', label: 'Developer building a website on a laptop' },
  ];
  return <section className="hv-svc hv-light" id="services" aria-labelledby="hv-services-title">
    <div className="hv-head"><span className="hv-eyebrow">What we do</span><h2 id="hv-services-title">Our <em>services.</em></h2><div className="hv-svc-actions"><Button variant="ghost" size="icon" className="hv-video-toggle" aria-label={paused ? 'Play service videos' : 'Pause service videos'} title={paused ? 'Play videos' : 'Pause videos'} onClick={() => setPaused(value => !value)}>{paused ? <Play /> : <Pause />}</Button><Link to="/services" className="hv-svc-all">All services <ArrowUpRight size={20} /></Link></div></div>
    <div className="hv-svc-grid" data-card-motion="on" ref={gridRef}>{[0, 1].map(column => <div className="hv-svc-column" key={column}>
      {services.map((s, i) => {
        if (i % 2 !== column) return null;
        const visual = visuals[i];
        if (!visual) return null;
        return <Link key={s.title} to={s.to} className="hv-scard">
          <div className="hv-scard-media">
            <ServiceVideo src={visual.video} label={visual.label} paused={paused} />
            <span className="hv-scard-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
          </div>
          <div className="hv-scard-body"><span className="hv-scard-num">0{i + 1}</span><h3>{s.short.split('\n').map((line, n) => <span key={n}>{line}</span>)}</h3></div>
        </Link>;
      })}
    </div>)}</div>
  </section>;
}

/** Black band with large white logos. */
export function BoldTrusted() {
  if (!trustedBy.length) return null;
  const loop = [...trustedBy, ...trustedBy];
  return <section className="hv-trusted hv-dark" aria-labelledby="hv-trusted-title">
    <div className="hv-head hv-head-sm"><h2 id="hv-trusted-title">Trusted by businesses across Namibia</h2></div>
    <div className="hv-marquee"><ul>{loop.map((c, i) => <li key={i} aria-hidden={i >= trustedBy.length}>{c.logo ? <img src={c.logo} alt={i < trustedBy.length ? c.name : ''} loading="lazy" /> : null}<span>{c.name}</span></li>)}</ul></div>
  </section>;
}

/** Why CREVORA: big numbered statements on black. */
export function BoldWhy() {
  const items = [[Target, 'Strategy first', 'Every idea starts with your audience and your business goals.'], [Sparkles, 'Made for the feed', 'Short-form content built for how people actually scroll.'], [PenTool, 'Brand-led', 'Consistent visuals and voice across every touchpoint.'], [Gauge, 'Measured', 'Clear reporting so you see what works — and what’s next.']] as const;
  return <section className="hv-why hv-dark">
    <div className="hv-head"><span className="hv-eyebrow">Why CREVORA</span><h2>Not more noise. <em>More meaning.</em></h2></div>
    <div className="hv-why-grid">{items.map(([Icon, t, d], i) => <div key={t} className="hv-why-card">
      <span className="hv-why-top"><span className="hv-why-num">0{i + 1}</span><Icon size={28} strokeWidth={1.5} /></span>
      <h3>{t}</h3><p>{d}</p>
    </div>)}</div>
    <div className="hv-why-cta"><a href={whatsapp} target="_blank" rel="noreferrer" className="hv-btn hv-btn-light">Book a discovery call <ArrowRight size={18} /></a></div>
  </section>;
}
