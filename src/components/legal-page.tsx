import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText, useCmsPageSections } from '@/components/cms-sections';

function LegalContent({ pageId, eyebrow, title, updated, sections }: {
  pageId: 'privacy-policy' | 'terms';
  eyebrow: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  const sectionId = pageId === 'terms' ? 'terms' : 'policy';
  const cmsSection = useCmsPageSections().find((section) => section.id === sectionId);
  const cmsItems = (cmsSection?.fields.items ?? '')
    .split('\n')
    .map((line) => {
      const divider = line.indexOf('|');
      return divider < 0 ? { heading: '', body: line.trim() } : {
        heading: line.slice(0, divider).trim(),
        body: line.slice(divider + 1).trim(),
      };
    })
    .filter((item) => item.heading || item.body);
  const contentSections = cmsItems.length ? cmsItems : sections;

  return <StudioShell>
    <CmsPageBlock sectionId={sectionId}>
      <header className="inner-hero"><span className="eyebrow">{eyebrow}</span><h1><CmsText sectionId={sectionId} field="heading">{title}</CmsText></h1><p>Last updated: {updated}</p></header>
      <div className="article-body legal-body section-pad">
        {contentSections.map((section, index) => <section key={`${section.heading}-${index}`}>
          {section.heading && <h2>{section.heading}</h2>}
          <p>{section.body}</p>
        </section>)}
        <aside className="article-cta"><span className="eyebrow">Questions?</span><Button variant="studio" asChild><Link to="/contact">Contact CREVORA <ArrowUpRight /></Link></Button></aside>
      </div>
    </CmsPageBlock>
  </StudioShell>;
}

export function LegalPage(props: { pageId: 'privacy-policy' | 'terms'; eyebrow: string; title: string; updated: string; sections: { heading: string; body: string }[] }) {
  return <LegalContent {...props} />;
}
