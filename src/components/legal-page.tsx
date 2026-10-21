import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';

export function LegalPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: { heading: string; body: string }[] }) {
  return <StudioShell>
    <header className="inner-hero"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>Last updated: {updated}</p></header>
    <div className="article-body legal-body section-pad">
      {sections.map(s => <section key={s.heading}><h2>{s.heading}</h2><p>{s.body}</p></section>)}
      <aside className="article-cta"><span className="eyebrow">Questions?</span><Button variant="studio" asChild><Link to="/contact">Contact CREVORA <ArrowUpRight /></Link></Button></aside>
    </div>
  </StudioShell>;
}
