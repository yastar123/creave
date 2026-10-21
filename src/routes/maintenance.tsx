import { createFileRoute } from '@tanstack/react-router';
import brandLogo from '@/assets/CREVORA-NEW1.png.asset.json';
import { whatsapp } from '@/components/studio-shell';

export const Route = createFileRoute('/maintenance')({
  head: () => ({ meta: [{ title: 'We’ll be right back — CREVORA' }, { name: 'description', content: 'The CREVORA website is being updated. We’ll be back shortly.' }, { name: 'robots', content: 'noindex, nofollow' }, { property: 'og:title', content: 'We’ll be right back — CREVORA' }, { property: 'og:description', content: 'The CREVORA website is being updated.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: () => <main className="status-page"><img src={brandLogo.url} alt="CREVORA" width={1248} height={206} className="status-logo" /><span className="eyebrow">Scheduled maintenance</span><h1>We’re refining a few details.</h1><p>Our website is being updated and will be back shortly. Need us now? We’re on WhatsApp.</p><a className="status-cta" href={whatsapp} target="_blank" rel="noreferrer">Message us on WhatsApp</a></main>,
});
