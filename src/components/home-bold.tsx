import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Target, Sparkles, PenTool, Gauge, Pause, Play } from 'lucide-react';
import heroImage from '@/assets/hero-obsidian.webp';
import { useSiteContent } from '@/lib/site-content-context';
import { useConfiguredWhatsapp } from '@/components/studio-shell';
import { ServiceVideo } from '@/components/service-video';
import { SiteImage } from '@/components/site-image';
import { SiteMedia } from '@/components/site-media';
import { Button } from '@/components/ui/button';
import { useCmsPageSections } from '@/components/cms-sections';
import { homepageServiceMediaFields } from '@/lib/cms-page-defaults';
import { parseCmsMediaOverrides, resolveCmsMedia } from '@/lib/cms-media-overrides';

/** Full-bleed project-led opening, without scroll-pinned phases. */
export function BoldHero() {
  const { projects } = useSiteContent();
  const sections = useCmsPageSections();
  const hero = sections.find(section => section.id === 'hero')?.fields;
  const featuredProject = projects[0];
  return <section className="hv-hero home-hero hv-dark" aria-labelledby="hv-hero-title">
    <SiteMedia className="hv-hero-cover" src={hero?.["image"] || heroImage} video={hero?.["video"]} alt={hero?.["imageAlt"] || 'Sculpted obsidian forms in monochrome light'} loading="eager" />
    <div className="hv-hero-masthead">
      <div className="hv-hero-meta"><span>{hero?.["metaLabel"] ?? 'Independent creative studio'}</span><span>{hero?.["metaLocation"] ?? 'Windhoek, Namibia'}</span></div>
      <p className="hv-hero-kicker">{hero?.["kicker"] ?? 'Social media & high-conversion websites'}</p>
      <h1 id="hv-hero-title">{hero?.["heading"] ?? 'Building brands people trust, remember, and choose.'}</h1>
      <p className="hv-hero-blurb">{hero?.["body"] ?? 'We engineer high-performance social media strategies, short-form video systems, and custom conversion websites that directly impact your bottom line.'}</p>
    </div>
    <div className="hv-hero-bottom">
      <div className="hv-hero-intro">
        <span>{hero?.["bottomLabel"] ?? 'Social media. Identity. Content. Digital.'}</span>
      </div>
      <div className="hv-hero-links">
        <Button asChild variant="ghost" className="hv-hero-link"><Link to="/contact">{hero?.["buttonLabel"] ?? 'Start a conversation'} <ArrowUpRight /></Link></Button>
        {featuredProject && <Button asChild variant="ghost" className="hv-hero-project"><Link to="/work/$slug" params={{ slug: featuredProject.slug }}><span>{featuredProject.name} <small>{featuredProject.category} · Portfolio</small></span><ArrowUpRight /></Link></Button>}
      </div>
    </div>
  </section>;
}

/** Staggered editorial service columns, with captions outside the imagery. */
export function BoldServices() {
  const { services } = useSiteContent();
  const sections = useCmsPageSections();
  const serviceSection = sections.find(section => section.id === 'services')?.fields;
  const serviceOverrides = parseCmsMediaOverrides(serviceSection?.["mediaItems"]);
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
    <div className="hv-head"><span className="hv-eyebrow">{serviceSection?.["eyebrow"] ?? 'What we do'}</span><h2 id="hv-services-title">{serviceSection?.["headingStart"] ?? 'Our'} <em>{serviceSection?.["headingAccent"] ?? 'services.'}</em></h2><div className="hv-svc-actions"><Button variant="ghost" size="icon" className="hv-video-toggle" aria-label={paused ? 'Play service videos' : 'Pause service videos'} title={paused ? 'Play videos' : 'Pause videos'} onClick={() => setPaused(value => !value)}>{paused ? <Play /> : <Pause />}</Button><Link to="/services" className="hv-svc-all">{serviceSection?.["buttonLabel"] ?? 'All services'} <ArrowUpRight size={20} /></Link></div></div>
    <div className="hv-svc-grid" data-card-motion="on" ref={gridRef}>{[0, 1].map(column => <div className="hv-svc-column" key={column}>
      {services.map((s, i) => {
        if (i % 2 !== column) return null;
        const visual = visuals[i % visuals.length]!;
        const mediaFields = homepageServiceMediaFields[s.to];
        const override = resolveCmsMedia(s, [s.to, s.title], serviceOverrides);
        const serviceOverride = serviceOverrides.find(item => item.key === s.to || item.key === s.title);
        const sectionImage = mediaFields ? serviceSection?.[mediaFields.image] : undefined;
        const sectionVideo = mediaFields ? serviceSection?.[mediaFields.video] : undefined;
        const hasSectionMedia = Boolean(sectionImage || sectionVideo);
        const image = sectionImage || (serviceOverride && "image" in serviceOverride ? override.image : s.image);
        const video = sectionVideo || (hasSectionMedia
          ? ""
          : serviceOverride && "video" in serviceOverride
            ? override.video
            : s.video || visual.video);
        return <Link key={s.title} to={s.to} className="hv-scard">
          <div className="hv-scard-media">
            {video
              ? <ServiceVideo src={video} poster={image} label={visual.label} paused={paused} />
              : image
                ? <SiteImage src={image} alt="" loading="lazy" />
                : <ServiceVideo src={visual.video} label={visual.label} paused={paused} />}
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
  const { trustedBy } = useSiteContent();
  const sections = useCmsPageSections();
  if (!trustedBy.length) return null;
  const trustedSection = sections.find(section => section.id === 'trusted');
  const loop = [...trustedBy, ...trustedBy].map(client => {
    const media = resolveCmsMedia({ image: client.logo }, client.name, parseCmsMediaOverrides(trustedSection?.fields["mediaItems"]));
    return { ...client, logo: media.image };
  });
  const heading = trustedSection?.fields["heading"];
  return <section className="hv-trusted hv-dark" aria-labelledby="hv-trusted-title">
    <div className="hv-head hv-head-sm"><h2 id="hv-trusted-title">{heading ?? 'Trusted by businesses across Namibia'}</h2><p>{trustedSection?.fields["note"] ?? 'Businesses across Namibia'}</p></div>
    <div className="hv-marquee"><ul>{loop.map((c, i) => <li key={i} aria-hidden={i >= trustedBy.length}>{c.logo ? <SiteImage src={c.logo} alt="" loading="lazy" /> : null}<span>{c.name}</span></li>)}</ul></div>
  </section>;
}

/** Why CREVORA: big numbered statements on black. */
export function BoldWhy() {
  const sections = useCmsPageSections();
  const whatsappUrl = useConfiguredWhatsapp();
  const fields = sections.find(section => section.id === 'why')?.fields;
  const items = [
    [Target, 'Strategy first', 'Every idea starts with your audience and your business goals.'],
    [Sparkles, 'Made for the feed', 'Short-form content built for how people actually scroll.'],
    [PenTool, 'Brand-led', 'Consistent visuals and voice across every touchpoint.'],
    [Gauge, 'Measured', 'Clear reporting so you see what works — and what’s next.'],
  ] as const;
  return <section className="hv-why hv-dark">
    <div className="hv-head"><span className="hv-eyebrow">{fields?.["eyebrow"] ?? 'Why CREVORA'}</span><h2>{fields?.["headingStart"] ?? 'Not more noise.'} <em>{fields?.["headingAccent"] ?? 'More meaning.'}</em></h2></div>
    <div className="hv-why-grid">{items.map(([Icon, title, body], i) => <div key={title} className="hv-why-card">
      <span className="hv-why-top"><span className="hv-why-num">0{i + 1}</span><Icon size={28} strokeWidth={1.5} /></span>
      <h3>{fields?.[`item${i}Title`] ?? title}</h3><p>{fields?.[`item${i}Body`] ?? body}</p>
    </div>)}</div>
    <div className="hv-why-cta"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="hv-btn hv-btn-light">{fields?.["buttonLabel"] ?? 'Book a discovery call'} <ArrowRight size={18} /></a></div>
  </section>;
}
