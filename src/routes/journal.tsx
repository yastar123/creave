import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { formatDate, pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';

const PER_PAGE = 6;
type Search = { category?: string | undefined; page?: number | undefined };

export const Route = createFileRoute('/journal')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s['category'] === 'string' && s['category'].length <= 120 ? s['category'] : undefined,
    page: Number(s['page']) > 1 ? Math.floor(Number(s['page'])) : undefined,
  }),
  head: () => pageHead('Journal — Ideas Worth Sharing', 'Perspectives from CREVORA on social media strategy, brand identity and creative content for businesses in Namibia.'),
  component: Journal,
});

function Journal() {
  const { category, page = 1 } = Route.useSearch();
  const { articles } = useSiteContent();
  const journalCategories = Array.from(new Set(articles.map((article) => article.category)));
  const filtered = category ? articles.filter(a => a.category === category) : articles;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const list = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero"><span className="eyebrow">THINKING OUT LOUD</span><h1><CmsText sectionId="hero" field="headingStart">Ideas worth</CmsText><br /><CmsText sectionId="hero" field="headingEnd">a closer look.</CmsText></h1><p><CmsText sectionId="hero" field="body">Observations, useful questions and fresh perspectives on building brands that connect.</CmsText></p></section></CmsPageBlock>
    <CmsPageBlock sectionId="articles"><section className="journal-section section-pad">
      <nav className="journal-filters" aria-label="Filter articles by category">
        <Link to="/journal" search={{}} className="journal-filter" data-active={!category}>All</Link>
        {journalCategories.map(c => <Link key={c} to="/journal" search={{ category: c }} className="journal-filter" data-active={category === c}>{c}</Link>)}
      </nav>
      {list.length === 0 ? <p className="journal-empty">No articles in this category yet.</p> :
        <div className="journal-grid">{list.map(a => <article className="journal-item" key={a.slug}>
          <Link to="/journal/$slug" params={{ slug: a.slug }} className="journal-cover" tabIndex={-1} aria-hidden="true"><img src={a.image} alt="" width={1440} height={1088} loading="lazy" /></Link>
          <div className="journal-meta"><span>{a.category}</span><time dateTime={a.date}>{formatDate(a.date)}</time></div>
          <Button variant="nav" className="journal-title" asChild><Link to="/journal/$slug" params={{ slug: a.slug }}>{a.title}<ArrowUpRight /></Link></Button>
          <p className="journal-excerpt">{a.excerpt}</p>
        </article>)}</div>}
      {pages > 1 && <nav className="journal-pagination" aria-label="Pagination">
        {current > 1 ? <Link to="/journal" search={{ category, page: current - 1 }} aria-label="Previous page"><ArrowLeft size={16} /> Previous</Link> : <span />}
        <span>Page {current} of {pages}</span>
        {current < pages ? <Link to="/journal" search={{ category, page: current + 1 }} aria-label="Next page">Next <ArrowRight size={16} /></Link> : <span />}
      </nav>}
    </section></CmsPageBlock>
  </StudioShell>;
}
