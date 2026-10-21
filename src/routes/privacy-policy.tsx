import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { pageHead } from '@/lib/studio-content';

// Placeholder legal copy — replace with text reviewed by CREVORA.
const sections = [
  { heading: 'Who we are', body: 'CREVORA is a digital and creative agency based in Windhoek, Namibia. This policy explains how we handle personal information shared through this website.' },
  { heading: 'Information we collect', body: 'When you contact us, we receive the details you choose to share, such as your name, company, email address, phone number and message. We may also collect basic, anonymous usage data to understand how the website is used.' },
  { heading: 'How we use it', body: 'We use your information only to reply to your enquiry, prepare proposals and deliver agreed services. We do not sell your personal information.' },
  { heading: 'WhatsApp and third parties', body: 'If you contact us via WhatsApp, your messages are also processed by WhatsApp under its own privacy terms. Links to social platforms are governed by those platforms’ policies.' },
  { heading: 'Your rights', body: 'You may ask us to access, correct or delete the personal information we hold about you at any time by contacting hello@crevora.co.' },
];

export const Route = createFileRoute('/privacy-policy')({
  head: () => pageHead('Privacy Policy', 'How CREVORA collects, uses and protects personal information shared through this website.'),
  component: () => <LegalPage eyebrow="LEGAL" title="Privacy Policy" updated="1 October 2026" sections={sections} />,
});
