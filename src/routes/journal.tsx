import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { articles, journalCategories, formatDate, pageHead } from '@/lib/studio-content';

const PER_PAGE = 6;
type Search = { category?: string | undefined; page?: number | undefined };

export const Route = createFileRoute('/journal')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    category: typeof s['category'] === 'string' && journalCategories.includes(s['category']) ? s['category'] : undefined,
    page: Number(s['page']) > 1 ? Math.floor(Number(s['page'])) : undefined,
  }),
  head: () => pageHead('Journal — Ideas Worth Sharing', 'Perspectives from CREVORA on social media strategy, brand identity and creative content for businesses in Namibia.'),
  component: Journal,
});

function Journal() {
  const { category, page = 1 } = Route.useSearch();
  const filtered = category ? articles.filter(a => a.category === category) : articles;
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const list = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return <StudioShell>
    <section className="inner-hero"><span className="eyebrow">THINKING OUT LOUD</span><h1>Ideas worth<br />a closer look.</h1><p>Observations, useful questions and fresh perspectives on building brands that connect.</p></section>
    <section className="journal-section section-pad">
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
    </section>
  </StudioShell>;
}
