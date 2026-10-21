import { createFileRoute } from '@tanstack/react-router';
import { StudioShell } from '@/components/studio-shell';
import { ServicesSection, WorkSection } from '@/components/studio-sections';
import { ServiceShowcase } from '@/components/studio-signature';
import { pageHead } from '@/lib/studio-content';
export const Route = createFileRoute('/services')({ head: () => pageHead('What We Do', 'Explore CREVORA’s four connected services: social media marketing, brand identity, creative content and motion, and web solutions.'), component: Services });
function Services() { return <StudioShell><section className="inner-hero"><span className="eyebrow">OUR CAPABILITIES</span><h1>Your brand.<br />Its next chapter.</h1><p>Strategy gives the work direction. Creativity makes it matter. Four connected services, one considered approach.</p></section><ServiceShowcase /><ServicesSection full /><WorkSection /></StudioShell>; }