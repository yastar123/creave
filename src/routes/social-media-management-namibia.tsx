import { createFileRoute, Link } from '@tanstack/react-router';
import { ServiceVisual } from '@/components/service-visual';
import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { CmsPageBlock, CmsText } from '@/components/cms-sections';
import { pageHead } from '@/lib/studio-utils';

const packages = [
  {
    tier: 'Silver Foundation',
    price: 'N$ 9 900',
    period: '/month',
    note: 'Perfect for startups establishing a professional digital presence.',
    features: [
      '7 Strategic Narrative Videos (IG Reels & TikTok)',
      '5 Premium Brand Visuals (IG Feed)',
      '2 Platform Mirroring (IG & TikTok)',
      'Strategic Content Planning & Monthly Calendar',
      'Trend, Ideas & Audience Research',
      'Persuasive Scripting & Storytelling',
      'Community Management (DM & Comments response within 48h)',
      'SEO Caption Copywriting & Hashtag Strategy',
      'Performance Monitoring & Insight Reporting',
      '2 Revision Sessions',
    ],
  },
  {
    tier: 'Gold Growth',
    price: 'N$ 17 900',
    period: '/month',
    featured: true,
    note: 'Designed for ambitious brands ready to scale with a data-driven strategy.',
    features: [
      '12 Strategic Narrative Videos (IG Reels & TikTok)',
      '10 Premium Brand Visuals (IG Feed & Facebook)',
      '3 Platforms (IG, TikTok, Facebook)',
      'Strategic Ad Management (N$ 1 000 Ad Spend Included)',
      'Interactive Story Engagement Strategy (Polls, Q&A, CTA & Conversations)',
      'Audience Persona & Targeting Strategy',
      'Strategic Content Planning & Monthly Calendar',
      'Trend, Ideas & Audience Research',
      'Persuasive Scripting & Storytelling',
      'Community Management (DM & Comments response within 48h)',
      'SEO Caption Copywriting & Hashtag Strategy',
      'Performance Monitoring, Insight Reporting & Next-Month Optimization Plan',
      '3 Revision Sessions',
    ],
  },
  {
    tier: 'Platinum Transformation',
    price: 'Ask for pricing',
    period: '',
    note: 'The ultimate solution for market leaders seeking total brand transformation.',
    features: [
      '18 Strategic Narrative Videos (IG Reels & TikTok)',
      '2 High-Value Strategic Carousels (Multi-slide Brand Storytelling)',
      '10 Premium Brand Visuals (IG Feed & Facebook)',
      'Full Brand Positioning Strategy (USP, Brand Promise, Competitive Positioning)',
      'Brand Messaging Framework',
      'Storytelling Roadmap',
      'Advanced Community Management',
      'Influencer & UGC Collaboration Strategy',
      'Full Campaign Planning (Seasonal Activations, Strategic Giveaways, & Promotional Tie-ins)',
      '4 Revision Sessions',
    ],
  },
];

const faqs = [
  {
    q: 'Why does Crevora focus on video content with a human face?',
    a: 'We believe video is the most powerful content format because it combines visuals, sound, and message in one medium. But what truly makes it work is the human element.\n\nPeople buy from people. In the Namibian market especially, showing a real face is one of the fastest ways to build digital authority and genuine trust.\n\nIt doesn’t always have to be the business owner. A team member or brand ambassador can represent the brand just as effectively. Over time, we help shape a strong and consistent brand persona. A clear message delivered by a real person will always carry more weight than polished but faceless content.',
  },
  {
    q: 'What happens on a shooting day?',
    a: 'We arrive with a full plan: the month’s concepts, scripts and shot list ready. We capture everything in one focused session — talking-head videos, b-roll and visuals — so your team spends a few hours with us, not a full day, and we turn it into a month of content.',
  },
  {
    q: 'How do we plan your content?',
    a: 'Every month starts with research: your audience, current trends and your business goals. From there we build a strategic content calendar, write persuasive scripts, and align every post with a purpose — awareness, trust, or conversion.',
  },
  {
    q: 'Who owns the content we create?',
    a: 'You do. All content created for your brand — videos, visuals, captions and scripts — belongs to you, and you’re free to reuse it anywhere: your website, ads, presentations or other channels.',
  },
  {
    q: 'How do payments work?',
    a: 'Packages run on a simple monthly billing cycle. We begin each month with an invoice, and all plans exclude VAT. Payment confirms your slot for the month and production starts immediately after.',
  },
  {
    q: 'What happens after we move forward?',
    a: 'We start with discovery and alignment: a conversation about your goals, audience and brand. Then we define your strategy and creative direction, plan your first month of content, schedule the first shooting day, and begin publishing — with reporting and refinement every step of the way.',
  },
];

export const Route = createFileRoute('/social-media-management-namibia')({
  head: () => pageHead('Social Media 360 Agency Namibia — Full-Service Management & Strategic Content Growth', 'Crevora provides professional social media management services for businesses in Namibia — strategy-led content, community management and reporting that turn social media into a sustainable growth channel.'),
  component: Social,
});

function Social() {
  const [active, setActive] = useState<number | null>(0);
  return <StudioShell>
    <section className="inner-hero">
      <span className="eyebrow">SOCIAL MEDIA MANAGEMENT SERVICES IN NAMIBIA</span>
      <h1><CmsText sectionId="hero" field="headingStart">Strategy first.</CmsText><br /><CmsText sectionId="hero" field="headingEnd">Then <span>content.</span></CmsText></h1>
      <p><CmsText sectionId="hero" field="body">Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.</CmsText></p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Request a private discussion <ArrowUpRight /></a></Button>
      </div>
    </section>

    <ServiceVisual kind="social" />
    <section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">CREVORA — STRATEGIC CREATIVE AGENCY</span>
        <div>
          <p><CmsText sectionId="intro" field="paragraph1">Crevora provides professional social media management services for businesses in Namibia. Our Social Media 360° approach is a strategic social media marketing ecosystem designed to communicate your brand’s message to the right audience with clarity and intent.</CmsText></p>
          <p><CmsText sectionId="intro" field="paragraph2">We focus on building brand awareness, credibility, and trust while clearly positioning your brand’s value. We aren’t just publishing content for visibility; we implement data-driven social media marketing to ensure every post serves a purpose. Beyond reach and impressions, our social media management helps brands attract the right audience, nurture engaged communities, strengthen social proof, and turn social media marketing into a sustainable growth channel that supports long-term marketing efficiency and revenue growth.</CmsText></p>
        </div>
      </div>
    </section>

    <section className="sm-packages section-pad" id="packages">
      <div className="section-heading reveal">
        <span className="eyebrow">SOCIAL MEDIA MANAGEMENT PACKAGES</span>
        <h2><CmsText sectionId="packages" field="headingStart">Pick the pace</CmsText><br /><CmsText sectionId="packages" field="headingEnd">of your <span>growth.</span></CmsText></h2>
        <p><CmsText sectionId="packages" field="body">All packages are strategy-led and tailored to each brand’s objectives and audience. All plans exclude VAT.</CmsText></p>
      </div>
      <div className="sm-package-grid">
        {packages.map((pkg, i) => <article className={`sm-package ${pkg.featured ? 'is-featured' : ''}`} key={pkg.tier}>
          <div className="sm-package-head">
            <span className="sm-package-tier">0{i + 1} / {pkg.tier}</span>
            <div className="sm-package-price"><strong>{pkg.price}</strong>{pkg.period && <span>{pkg.period}</span>}</div>
            <p>{pkg.note}</p>
          </div>
          <div className="sm-package-body">
            <span className="sm-package-label">What you get</span>
            <ul>{pkg.features.map(f => <li key={f}>{f}</li>)}</ul>
            <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Request private discussion <ArrowUpRight /></a></Button>
          </div>
        </article>)}
      </div>
    </section>

    <section className="sm-faq section-pad">
      <div className="section-heading reveal">
        <span className="eyebrow">EVERYTHING YOU NEED TO KNOW</span>
        <h2><CmsText sectionId="faq" field="headingStart">Good questions,</CmsText><br /><CmsText sectionId="faq" field="headingEnd">clear <span>answers.</span></CmsText></h2>
      </div>
      <div className="sm-faq-list">
        {faqs.map((faq, i) => <div className={`sm-faq-item ${active === i ? 'is-active' : ''}`} key={faq.q}>
          <Button variant="nav" className="sm-faq-trigger" aria-expanded={active === i} aria-controls={`sm-faq-${i}`} onClick={() => setActive(active === i ? null : i)}>
            <span className="sm-faq-number">0{i + 1}</span>
            <span className="sm-faq-question">{faq.q}</span>
            <span className="sm-faq-icon">{active === i ? <Minus /> : <Plus />}</span>
          </Button>
          {active === i && <div id={`sm-faq-${i}`} className="sm-faq-body">{faq.a.split('\n\n').map(p => <p key={p}>{p}</p>)}</div>}
        </div>)}
      </div>
      <div className="sm-faq-cta reveal">
        <p>Still deciding? Let’s talk about which package fits your brand.</p>
        <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer">Chat via WhatsApp <ArrowUpRight /></a></Button>
      </div>
    </section>

    <section className="approach-section">
      <div className="approach-copy reveal">
        <span className="eyebrow">Social Media 360°</span>
        <h2><CmsText sectionId="approach" field="headingStart">No noise.</CmsText><br /><span><CmsText sectionId="approach" field="headingEnd">Strategy that works.</CmsText></span></h2>
        <p><CmsText sectionId="approach" field="body">Every post with a purpose, every video with a face, every month with a plan. That is how social media becomes a growth channel — not just a feed.</CmsText></p>
        <div className="approach-pillars">{[
          ['Strategy-led', 'Content planned around your business goals, not the algorithm of the week.'],
          ['Human-first', 'Faces build trust faster than graphics. We put people at the centre.'],
          ['Measured', 'Insight reporting and next-month optimization, every single month.'],
        ].map(([t, d]) => <div key={t}><strong>{t}</strong><span>{d}</span></div>)}</div>
        <Button variant="studioLight" asChild><Link to="/contact">Start the conversation <ArrowUpRight /></Link></Button>
      </div>
    </section>
  </StudioShell>;
}
