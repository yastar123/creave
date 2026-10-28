import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { StudioGallery } from '@/components/studio-gallery';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { pageHead } from '@/lib/studio-utils';

const direction = [
  ['Our Direction', 'We exist to help Namibian businesses move beyond noise and into authority. Our direction is clear: build brands that are trusted, chosen, and remembered in the digital space.'],
  ['Our Focus', 'We focus on strategy-led creativity. From Social Media 360 management to content-driven branding and digital execution, every decision we make supports long-term brand growth rather than short-term attention or empty metrics.'],
  ['Collaborate with Us', 'We collaborate with businesses that value clarity, strategy, and long-term growth. From strategic content to modern creative experiences, everything we create is designed to move brands forward with purpose.'],
];

export const Route = createFileRoute('/about')({
  head: () => pageHead('About Crevora — Strategic Creative Agency in Namibia', 'Crevora is a strategic creative agency built around content-led strategy, helping Namibian businesses lead through digital authority, trust, and long-term growth.'),
  component: About,
});

function About() {
  return <StudioShell>
    <CmsPageBlock sectionId="hero"><section className="inner-hero">
      <span className="eyebrow">ABOUT CREVORA</span>
      <h1><CmsText sectionId="hero" field="headlineStart">Building brands</CmsText><br />people <span><CmsText sectionId="hero" field="headlineAccent">trust,</CmsText></span><br /><CmsText sectionId="hero" field="headlineEnd">remember, and choose.</CmsText></h1>
      <p><CmsText sectionId="hero" field="body">Branding isn’t about being loud. It’s about clarity, consistency, and being the brand people choose when it matters.</CmsText></p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer"><CmsText sectionId="hero" field="buttonLabel">Start a conversation</CmsText> <ArrowUpRight /></a></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="intro"><section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">WHO WE ARE</span>
        <div>
          <p><CmsText sectionId="intro" field="paragraph1">Crevora is a strategic creative agency built around content-led strategy, helping businesses lead through digital authority.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph2">In today’s Namibian digital space, many businesses are visible, but very few are truly chosen. Brands post consistently, chase trends, and invest in content, yet still struggle to earn trust, be remembered, or convert attention into real business outcomes.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph3">At Crevora, we believe branding is not about being loud. It’s about being clear, consistent, and intentional. Instead of chasing short-term visibility, we focus on one core outcome: helping brands establish authority, shape perception, and communicate clearly with the audience that actually matters.</CmsText></p>
        </div>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="direction"><section className="approach-section">
      <div className="approach-copy reveal">
        <span className="eyebrow">OUR DIRECTION</span>
        <h2><CmsText sectionId="direction" field="headlineStart">Ready to build</CmsText><br /><span><CmsText sectionId="direction" field="headlineAccent">authority,</CmsText></span> <CmsText sectionId="direction" field="headlineEnd">not just attention?</CmsText></h2>
        <p><CmsText sectionId="direction" field="body">We don’t build content for attention. We build content for trust, recall, and long-term growth.</CmsText></p>
        <div className="approach-pillars">{direction.map(([t, d], i) => <div key={t}><strong><CmsText sectionId="direction" field={`item${i}Title`}>{t}</CmsText></strong><span><CmsText sectionId="direction" field={`item${i}Body`}>{d}</CmsText></span></div>)}</div>
        <Button variant="studioLight" asChild><Link to="/contact">Collaborate with us <ArrowUpRight /></Link></Button>
      </div>
    </section></CmsPageBlock>

    <CmsPageBlock sectionId="gallery"><StudioGallery /></CmsPageBlock>
  </StudioShell>;
}

