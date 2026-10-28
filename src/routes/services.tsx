import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/studio-shell';
import { ServicesSection, WorkSection } from '@/components/studio-sections';
import { ServiceShowcase } from '@/components/studio-signature';
import { pageHead } from '@/lib/studio-utils';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
export const Route = createFileRoute('/services')({ head: () => pageHead('What We Do', 'Explore CREVORA’s four connected services: social media marketing, brand identity, creative content and motion, and web solutions.'), component: Services });
function Services() { return <StudioShell><CmsPageBlock sectionId="hero"><section className="inner-hero"><span className="eyebrow">OUR CAPABILITIES</span><h1><CmsText sectionId="hero" field="headingStart">Your brand.</CmsText><br /><CmsText sectionId="hero" field="headingEnd">Its next chapter.</CmsText></h1><p><CmsText sectionId="hero" field="body">Strategy gives the work direction. Creativity makes it matter. Four connected services, one considered approach.</CmsText></p></section></CmsPageBlock><CmsPageBlock sectionId="showcase"><ServiceShowcase /></CmsPageBlock><CmsPageBlock sectionId="services-list"><ServicesSection full /></CmsPageBlock><CmsPageBlock sectionId="work"><WorkSection /></CmsPageBlock></StudioShell>; }