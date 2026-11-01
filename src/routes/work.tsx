import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { SiteMedia } from '@/components/site-media';
import { useCmsPageSections } from '@/components/cms-sections';
import { parseCmsMediaOverrides, resolveCmsMedia } from '@/lib/cms-media-overrides';

export const Route = createFileRoute('/work')({
  head: () => pageHead('Our Work — Selected Projects', 'Selected branding, social media and creative work by CREVORA, a creative agency in Windhoek, Namibia.'),
  component: Work,
});

function Work() {
  const { projects } = useSiteContent();
  const sections = useCmsPageSections();
  const overrides = parseCmsMediaOverrides(sections.find(section => section.id === 'projects')?.fields["mediaItems"]);
  const items = projects.map(project => resolveCmsMedia(project, [project.slug, project.name], overrides));
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero"><span className="eyebrow">OUR WORK</span><h1><CmsText sectionId="hero" field="headingStart">Work, presented</CmsText><br /><CmsText sectionId="hero" field="headingEnd">with intent.</CmsText></h1><p><CmsText sectionId="hero" field="body">A selection of identities, campaigns and social content.</CmsText> <Link to="/social-media-portfolio" className="text-cta">See the social media portfolio <ArrowUpRight size={14} /></Link></p></section></CmsPageBlock>
    <CmsPageBlock sectionId="projects"><section className="work-index section-pad">{items.map((p, i) => <article key={p.slug} className={`work-index-item work-index-${i % 3} reveal`}>
      <Link to="/work/$slug" params={{ slug: p.slug }} className="work-index-media"><SiteMedia src={p.image} video={p.video} alt={p.alt} loading={i === 0 ? 'eager' : 'lazy'} /></Link>
      <div className="work-index-caption"><span>0{i + 1} / {p.year}</span><h2><Link to="/work/$slug" params={{ slug: p.slug }}>{p.name}</Link></h2><span>{p.category}</span></div>
    </article>)}</section></CmsPageBlock>
  </StudioShell>;
}
