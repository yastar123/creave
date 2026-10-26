import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';

export const Route = createFileRoute('/journal_/$slug')({
  loader: ({ params, context }) => {
    const article = context.siteContent.articles.find(a => a.slug === params.slug);
    if (!article) throw notFound();
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article;
    if (!a) return { meta: [{ title: 'Article not found — CREVORA' }, { name: 'robots', content: 'noindex' }] };
    return {
      meta: [{ title: `${a.title} — CREVORA Journal` }, { name: 'description', content: a.excerpt }, { property: 'og:title', content: a.title }, { property: 'og:description', content: a.excerpt }, { property: 'og:type', content: 'article' }, ...(a.image ? [{ property: 'og:image', content: a.image }, { name: 'twitter:image', content: a.image }] : []), { property: 'article:published_time', content: a.date }, { name: 'twitter:card', content: 'summary_large_image' }],
      scripts: [{ type: 'application/ld+json', children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: a.title, description: a.excerpt, datePublished: a.date, author: { '@type': 'Organization', name: a.author }, publisher: { '@type': 'Organization', name: 'CREVORA' } }) }],
    };
  },
  component: ArticlePage,
  notFoundComponent: () => <StudioShell><section className="inner-hero"><span className="eyebrow">JOURNAL</span><h1>Article not found.</h1><Button variant="studio" asChild><Link to="/journal">Back to the journal <ArrowUpRight /></Link></Button></section></StudioShell>,
  errorComponent: () => <StudioShell><section className="inner-hero"><h1>This article didn’t load.</h1><Button variant="studio" asChild><Link to="/journal">Back to the journal</Link></Button></section></StudioShell>,
});

function ArticlePage() {
  const { article: a } = Route.useLoaderData();
  const { articles } = useSiteContent();
  const related = [...articles.filter(x => x.slug !== a.slug && x.category === a.category), ...articles.filter(x => x.slug !== a.slug && x.category !== a.category)].slice(0, 2);
  return <StudioShell>
    <article>
      <header className="inner-hero article-hero"><Link to="/journal" className="article-back"><ArrowLeft size={14} /> Journal</Link><span className="eyebrow">{a.category} / <time dateTime={a.date}>{formatDate(a.date)}</time> / {a.author}</span><h1>{a.title}</h1><p>{a.excerpt}</p></header>
      {a.image && <figure className="article-cover"><img src={a.image} alt={a.imageAlt ?? ''} width={1440} height={1088} /></figure>}
      <div className="article-body section-pad">{a.body.map((p, i) => <p key={i}>{p}</p>)}
        <aside className="article-cta"><span className="eyebrow">Related service</span><Link to={a.related.to} className="text-cta">{a.related.label} <ArrowUpRight /></Link><Button variant="studio" asChild><Link to="/contact">Let’s talk about your brand <ArrowUpRight /></Link></Button></aside>
      </div>
    </article>
    <section className="section-pad article-related"><span className="eyebrow">Keep reading</span><ul>{related.map(r => <li key={r.slug}><Link to="/journal/$slug" params={{ slug: r.slug }}><span>{r.category}</span><strong>{r.title}</strong><ArrowUpRight /></Link></li>)}</ul></section>
  </StudioShell>;
}
