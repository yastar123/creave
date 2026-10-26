import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/studio-shell';
import { StackedWork } from '@/components/studio-signature';
import { ProcessSection, JournalSection } from '@/components/studio-sections';
import { IndustryTabs, StatsBlock } from '@/components/luminous-home';
import { BoldHero, BoldServices, BoldTrusted, BoldWhy } from '@/components/home-bold';
import { pageHead } from '@/lib/studio-utils';

export const Route = createFileRoute('/')({
  head: () => {
    const head = pageHead('Social Media, Branding & Creative Studio in Namibia', 'CREVORA is an independent creative agency in Windhoek, Namibia. We bring together social media strategy, branding, content and digital experiences.');
    return { meta: head.meta.filter(tag => tag.property !== 'og:image' && tag.name !== 'twitter:image') };
  },
  component: Index,
});

function Index() {
  return <StudioShell darkHeader>
    <div className="lh-page">
      <BoldHero />
      <BoldServices />
      <BoldTrusted />
      <IndustryTabs />
      <StatsBlock />
      <StackedWork />
      <BoldWhy />
      <ProcessSection />
      <JournalSection />
    </div>
  </StudioShell>;
}
