import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { pageHead } from '@/lib/studio-utils';

const sections = [
  { heading: 'Who we are', body: 'CREVORA is a digital and creative agency based in Windhoek, Namibia. This policy explains how we handle personal information shared through this website.' },
  { heading: 'Information we collect', body: 'When you submit the website contact form, we collect the details you choose to share: your name, company (if provided), email address, phone number, area of interest and message. We also record whether you agreed to this notice and when. The enquiry is stored in a PostgreSQL database so CREVORA can follow up.' },
  { heading: 'How we use and keep it', body: 'We use contact-form information to respond to your enquiry, prepare proposals and deliver agreed services. We keep it only as long as needed for those purposes. We do not sell your personal information.' },
  { heading: 'WhatsApp and other services', body: 'After submitting the form, you can choose to open a prepared WhatsApp message. If you continue to WhatsApp, your messages there are also processed by WhatsApp under its own privacy terms. Links to social platforms are governed by those platforms’ policies.' },
  { heading: 'Your rights', body: 'You may ask us to access, correct or delete the personal information we hold about you at any time by contacting hello@crevora.co.' },
];

export const Route = createFileRoute('/privacy-policy')({
  head: () => pageHead('Privacy Policy', 'How CREVORA collects, uses and protects personal information shared through this website.'),
  component: () => <LegalPage eyebrow="LEGAL" title="Privacy Policy" updated="26 October 2026" sections={sections} />,
});
