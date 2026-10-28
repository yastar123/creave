import { createFileRoute } from '@tanstack/react-router';
import { LegalPage } from '@/components/legal-page';
import { pageHead } from '@/lib/studio-utils';

// Placeholder legal copy — replace with text reviewed by CREVORA.
const sections = [
  { heading: 'Using this website', body: 'By using this website you agree to these terms. The content is provided for general information about CREVORA and its services.' },
  { heading: 'Projects and proposals', body: 'Every project is governed by a separate written proposal and agreement that defines scope, timeline, deliverables and fees. Nothing on this website is a binding offer.' },
  { heading: 'Intellectual property', body: 'All text, visuals, logos and portfolio material on this website belong to CREVORA or its clients and may not be reused without permission.' },
  { heading: 'Liability', body: 'We aim to keep information accurate and up to date, but we cannot guarantee that the website is always complete, error-free or available.' },
  { heading: 'Governing law', body: 'These terms are governed by the laws of the Republic of Namibia.' },
];

export const Route = createFileRoute('/terms')({
  head: () => pageHead('Terms of Service', 'The terms that apply when you use the CREVORA website.'),
  component: () => <LegalPage pageId="terms" eyebrow="LEGAL" title="Terms of Service" updated="1 October 2026" sections={sections} />,
});
