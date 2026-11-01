import { createFileRoute } from '@tanstack/react-router';
import { SiteImage } from '@/components/site-image';
import { CmsPageBlock, CmsPageContent, CmsText } from '@/components/cms-sections';
import { usePublicCmsGlobals } from '@/lib/cms-client';
import { defaultCmsGlobals } from '@/lib/cms-shared';

export const Route = createFileRoute('/maintenance')({
  head: () => ({ meta: [{ title: 'We’ll be right back — CREVORA' }, { name: 'description', content: 'The CREVORA website is being updated. We’ll be back shortly.' }, { name: 'robots', content: 'noindex, nofollow' }, { property: 'og:title', content: 'We’ll be right back — CREVORA' }, { property: 'og:description', content: 'The CREVORA website is being updated.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Maintenance,
});

function Maintenance() {
  const globals = usePublicCmsGlobals().data?.globals ?? defaultCmsGlobals;
  const configuredLogo = globals.settings["logo"] ?? defaultCmsGlobals.settings["logo"]!;
  const logo = (configuredLogo.startsWith("/") && !configuredLogo.startsWith("//")) || /^https?:\/\//i.test(configuredLogo)
    ? configuredLogo
    : defaultCmsGlobals.settings["logo"]!;
  const configuredWhatsapp = globals.settings["whatsapp"] ?? "";
  const whatsappUrl = /^https?:\/\//i.test(configuredWhatsapp) ? configuredWhatsapp : "https://wa.me/264815781719";

  return <CmsPageContent pageId="maintenance"><CmsPageBlock sectionId="status"><main className="status-page"><SiteImage src={logo} alt="CREVORA" width={260} height={44} className="status-logo" /><span className="eyebrow"><CmsText sectionId="status" field="eyebrow">Scheduled maintenance</CmsText></span><h1><CmsText sectionId="status" field="heading">We’re refining a few details.</CmsText></h1><p><CmsText sectionId="status" field="body">Our website is being updated and will be back shortly. Need us now? We’re on WhatsApp.</CmsText></p><a className="status-cta" href={whatsappUrl} target="_blank" rel="noreferrer"><CmsText sectionId="status" field="buttonLabel">Message us on WhatsApp</CmsText></a></main></CmsPageBlock></CmsPageContent>;
}
