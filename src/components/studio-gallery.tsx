import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useSiteContent } from '@/lib/site-content-context';
import { SiteMedia } from '@/components/site-media';
import { CmsText, useCmsPageSections } from '@/components/cms-sections';
import { parseCmsMediaOverrides, resolveCmsMedia } from '@/lib/cms-media-overrides';

export function StudioGallery() {
  const { gallery } = useSiteContent();
  const sections = useCmsPageSections();
  const gallerySection = sections.find(section => section.id === 'gallery')?.fields;
  const overrides = parseCmsMediaOverrides(gallerySection?.["mediaItems"]);
  const items = gallery.map(entry => resolveCmsMedia(entry, entry.title, overrides));
  const [selected, setSelected] = useState<number | null>(null);
  const item = selected === null ? null : items[selected];
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  // Desktop: vertical scroll drives a pinned horizontal film-strip.
  useEffect(() => {
    const el = pin.current, tr = track.current; if (!el || !tr) return;
    const mq = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let raf = 0;
    const size = () => { el.style.height = mq.matches ? `${tr.scrollWidth - window.innerWidth + window.innerHeight}px` : ''; };
    const update = () => {
      raf = 0; if (!mq.matches) { tr.style.transform = ''; return; }
      const r = el.getBoundingClientRect();
      const max = tr.scrollWidth - window.innerWidth;
      const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      tr.style.transform = `translate3d(${-p * max}px,0,0)`;
      el.style.setProperty('--gp', p.toFixed(3));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    const resize = () => { size(); on(); };
    resize();
    window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', resize);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <section className="explorations-section section-pad">
    <div className="exploration-heading reveal"><span className="eyebrow"><CmsText sectionId="gallery" field="eyebrow">THE STUDIO, IN EXPERIMENTS</CmsText></span><h2><CmsText sectionId="gallery" field="heading">Room for the unexpected.</CmsText></h2><span className="section-note"><CmsText sectionId="gallery" field="note">Visual studies. New directions. Always a work in progress.</CmsText></span></div>
    <div ref={pin} className="hs-pin"><div className="hs-sticky"><div className="hs-progress" aria-hidden="true"><span /></div><div ref={track} className="exploration-grid hs-track">{items.map((entry, index) => <figure className="exploration-item reveal" key={entry.title}><Button variant="nav" className="exploration-image" data-cursor="view" aria-label={`Explore ${entry.title}`} onClick={() => setSelected(index)}><SiteMedia src={entry.image} video={entry.video} alt={entry.alt} loading="lazy" /><span className="exploration-index">0{index + 1}</span><ArrowUpRight /></Button><figcaption><strong>{entry.title}</strong><span>{entry.category}</span></figcaption></figure>)}<div className="hs-end" aria-hidden="true"><span>More</span><em>soon.</em></div></div></div></div>
    <p className="gallery-note">Independent concept explorations by CREVORA.</p>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}><DialogContent className="project-dialog">{item && <><SiteMedia src={item.image} video={item.video} alt={item.alt} /><div className="project-dialog-text"><span className="eyebrow">STUDIO EXPLORATION / {item.category}</span><DialogTitle>{item.title}</DialogTitle><DialogDescription>An independent CREVORA concept study in {item.category.toLowerCase()}.</DialogDescription><Button variant="studio" asChild><Link to="/contact">Explore a new direction <ArrowUpRight /></Link></Button></div></>}</DialogContent></Dialog>
  </section>;
}