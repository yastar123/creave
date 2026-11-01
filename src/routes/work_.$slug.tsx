import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { useSiteContent } from '@/lib/site-content-context';
import { SiteMedia } from '@/components/site-media';
import { useCmsPageSections } from '@/components/cms-sections';
import { parseCmsMediaOverrides, resolveCmsMedia } from '@/lib/cms-media-overrides';

export const Route = createFileRoute('/work_/$slug')({
  loader: ({ params, context }) => {
    const project = context.siteContent.projects.find(p => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    if (!p) return { meta: [{ title: 'Project not found — CREVORA' }, { name: 'robots', content: 'noindex' }] };
    return { meta: [{ title: `${p.name} — ${p.category} — CREVORA` }, { name: 'description', content: p.description }, { property: 'og:title', content: `${p.name} — CREVORA` }, { property: 'og:description', content: p.description }, { property: 'og:type', content: 'article' }, { name: 'twitter:card', content: 'summary_large_image' }] };
  },
  component: ProjectPage,
  notFoundComponent: () => <StudioShell><section className="inner-hero"><span className="eyebrow">OUR WORK</span><h1>Project not found.</h1><Button variant="studio" asChild><Link to="/work">See all work <ArrowUpRight /></Link></Button></section></StudioShell>,
  errorComponent: () => <StudioShell><section className="inner-hero"><h1>This project didn’t load.</h1><Button variant="studio" asChild><Link to="/work">See all work</Link></Button></section></StudioShell>,
});

function ProjectPage() {
  const { project: p } = Route.useLoaderData();
  const { projects } = useSiteContent();
  const sections = useCmsPageSections();
  const overrides = parseCmsMediaOverrides(sections.find(section => section.id === 'hero')?.fields["mediaItems"]);
  const galleryOverrides = parseCmsMediaOverrides(sections.find(section => section.id === 'gallery')?.fields["mediaItems"]);
  const project = resolveCmsMedia(p, [p.slug, p.name], overrides);
  const gallery = p.gallery.map((item, index) => resolveCmsMedia(item, [`${p.slug}:gallery:${index + 1}`, `${p.slug}:gallery:${index}`, p.slug], galleryOverrides));
  const others = projects.filter(x => x.slug !== p.slug).slice(0, 2);
  return <StudioShell>
    <header className="inner-hero"><Link to="/work" className="article-back"><ArrowLeft size={14} /> All work</Link><span className="eyebrow">{p.category}</span><h1>{p.name}</h1><p>{p.title} {p.description}</p></header>
    <div className="case-cover"><SiteMedia src={project.image} video={project.video} alt={project.alt} loading="eager" /></div>
    <section className="case-facts section-pad"><dl><div><dt>Client</dt><dd>{p.client}</dd></div><div><dt>Services</dt><dd>{p.services.join(', ')}</dd></div><div><dt>Year</dt><dd>{p.year}</dd></div></dl>
      <div className="case-story">{[['The challenge', p.challenge], ['Our approach', p.approach], ['The outcome', p.result]].map(([t, d]) => <div key={t} className="reveal"><h2>{t}</h2><p>{d}</p></div>)}</div>
    </section>
    <section className="case-gallery section-pad">{gallery.map((g, i) => <SiteMedia key={i} src={g.image} video={g.video} alt={g.alt} loading="lazy" />)}</section>
    <section className="section-pad article-related"><span className="eyebrow">More work</span><ul>{others.map(o => <li key={o.slug}><Link to="/work/$slug" params={{ slug: o.slug }}><span>{o.category}</span><strong>{o.name}</strong><ArrowUpRight /></Link></li>)}</ul><Button variant="studio" asChild><Link to="/contact">Start a project <ArrowUpRight /></Link></Button></section>
  </StudioShell>;
}
