import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Play } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';
import { SiteMedia } from '@/components/site-media';
import { useCmsPageSections } from '@/components/cms-sections';
import { parseCmsMediaOverrides, resolveCmsMedia } from '@/lib/cms-media-overrides';

export const Route = createFileRoute('/social-media-portfolio')({
  head: () => pageHead('Social Media Portfolio — Reels, TikTok & Content', 'Short-form video, Instagram and TikTok content created by CREVORA for brands in Namibia.'),
  component: SocialPortfolio,
});

const platforms = ['Instagram Reels', 'TikTok', 'Instagram Feed', 'YouTube Shorts', 'Carousel'];

function SocialPortfolio() {
  const { gallery } = useSiteContent();
  const sections = useCmsPageSections();
  const overrides = parseCmsMediaOverrides(sections.find(section => section.id === 'gallery')?.fields["mediaItems"]);
  const items = gallery.map(entry => resolveCmsMedia(entry, entry.title, overrides));
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero"><span className="eyebrow">SOCIAL MEDIA PORTFOLIO</span><h1><CmsText sectionId="hero" field="headingStart">Made for</CmsText><br /><CmsText sectionId="hero" field="headingEnd">the feed.</CmsText></h1><p><CmsText sectionId="hero" field="body">Short-form video, carousels and social content — shown the way your audience sees it. Sample work for now; real client content follows.</CmsText></p></section></CmsPageBlock>
    <CmsPageBlock sectionId="gallery"><section className="phone-wall section-pad" aria-label="Social media work">{items.map((g, i) => <figure key={g.title} className={`phone-frame phone-frame-${i % 3} reveal`}>
      <div className="phone-screen"><SiteMedia src={g.image} video={g.video} alt={g.alt} loading="lazy" /><span className="phone-play" aria-hidden="true"><Play size={18} /></span></div>
      <figcaption><strong>{g.title}</strong><span>{platforms[i % platforms.length]}</span></figcaption>
    </figure>)}</section></CmsPageBlock>
    <CmsPageBlock sectionId="cta"><section className="section-pad article-related"><span className="eyebrow"><CmsText sectionId="cta" field="eyebrow">Want content like this?</CmsText></span><Button variant="studio" asChild><Link to="/social-media-management-namibia"><CmsText sectionId="cta" field="buttonLabel">Explore Social Media Marketing</CmsText> <ArrowUpRight /></Link></Button></section></CmsPageBlock>
  </StudioShell>;
}
