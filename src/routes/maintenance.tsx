import { createFileRoute } from '@tanstack/react-router';
import { whatsapp } from '@/components/studio-shell';
import { CmsPageBlock, CmsPageContent, CmsText } from '@/components/cms-sections';

export const Route = createFileRoute('/maintenance')({
  head: () => ({ meta: [{ title: 'We’ll be right back — CREVORA' }, { name: 'description', content: 'The CREVORA website is being updated. We’ll be back shortly.' }, { name: 'robots', content: 'noindex, nofollow' }, { property: 'og:title', content: 'We’ll be right back — CREVORA' }, { property: 'og:description', content: 'The CREVORA website is being updated.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: () => <CmsPageContent pageId="maintenance"><CmsPageBlock sectionId="status"><main className="status-page"><img src="/logo.svg" alt="CREVORA" width={260} height={44} className="status-logo" /><span className="eyebrow"><CmsText sectionId="status" field="eyebrow">Scheduled maintenance</CmsText></span><h1><CmsText sectionId="status" field="heading">We’re refining a few details.</CmsText></h1><p><CmsText sectionId="status" field="body">Our website is being updated and will be back shortly. Need us now? We’re on WhatsApp.</CmsText></p><a className="status-cta" href={whatsapp} target="_blank" rel="noreferrer"><CmsText sectionId="status" field="buttonLabel">Message us on WhatsApp</CmsText></a></main></CmsPageBlock></CmsPageContent>,
});
