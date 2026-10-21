import { socials, legalLinks } from '@/lib/studio-content';
import { SocialIcon } from '@/components/social-icon';
import brandLogo from '@/assets/CREVORA-NEW1.png.asset.json';
import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight, ChevronDown, Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StudioMotion } from '@/components/studio-motion';
import { StudioFx } from '@/components/studio-fx';
import { StudioChoreography } from '@/components/studio-choreography';

export const whatsapp = 'https://wa.me/264815781719?text=Hi%20CREVORA%2C%20I%27d%20love%20to%20talk%20about%20my%20brand.';
const nav = [{ title: 'Services', to: '/services' }, { title: 'About', to: '/about' }, { title: 'Journal', to: '/journal' }, { title: 'Contact', to: '/contact' }] as const;
const serviceMenu = [
  { index: '01', title: 'Social Media Marketing & Branding', note: 'Core focus — strategy, short-form video, management', to: '/social-media-management-namibia' },
  { index: '02', title: 'Brand Identity & Visual', note: 'Logo systems, guidelines, rebranding', to: '/brand-identity-namibia' },
  { index: '03', title: 'Creative Content & Motion', note: 'Campaign assets, video and motion', to: '/creative-visuals-motion-namibia' },
  { index: '04', title: 'Web & Digital Solutions', note: 'Business websites and landing pages', to: '/web-solutions-namibia' },
] as const;

export function StudioShell({ children, darkHeader = false }: { children: ReactNode; darkHeader?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const location = useLocation();
  const openServices = () => { window.clearTimeout(closeTimer.current); setServicesOpen(true); };
  const closeServices = () => { window.clearTimeout(closeTimer.current); closeTimer.current = window.setTimeout(() => setServicesOpen(false), 140); };
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);
  useEffect(() => { setServicesOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Auto-tag repeated cards/images so every page gets staggered entrances, not only hand-marked blocks.
    const auto = document.querySelectorAll<HTMLElement>('main section h2, main .service-item, main .process-step, main .journal-item, main .sm-package, main .sm-faq-item, main img');
    auto.forEach(el => {
      if (el.closest('.home-hero, .reveal:not(.is-visible)') && !el.matches('img')) return;
      if (el.matches('img')) { if (!el.closest('.home-hero')) el.parentElement?.classList.add('img-reveal'); return; }
      el.classList.add('reveal');
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 80}ms`);
    });
    document.querySelector('.footer-wordmark')?.classList.add('reveal');
    const items = document.querySelectorAll('.reveal, .img-reveal');
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
    const bar = document.querySelector<HTMLElement>('.scroll-progress');
    const onScroll = () => { if (!bar) return; const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); };
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const overlay = document.querySelector<HTMLElement>('.menu-overlay');
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab' || !overlay) return;
      const elements = Array.from(overlay.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
      const first = elements[0]; const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', key); };
  }, [open]);

  return <div className="studio-site">
    <StudioMotion pathname={location.pathname} />
    <StudioFx pathname={location.pathname} />
    <StudioChoreography pathname={location.pathname} />
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className={`studio-header ${darkHeader ? 'on-dark' : ''} ${servicesOpen ? 'menu-open' : ''}`} data-scrolled={scrolled || undefined}>
      <Link to="/" className="wordmark" aria-label="CREVORA home"><img className="brand-logo" src={brandLogo.url} alt="CREVORA" width={1248} height={206} /></Link>
      <span className="header-studio-note">Independent minds.<br />Intentional work.</span>
      <nav className="desktop-nav" aria-label="Main navigation">
        {nav.map(item => item.to === '/services' ? <div key={item.to} className={`nav-services ${servicesOpen ? 'is-open' : ''}`} onMouseEnter={openServices} onMouseLeave={closeServices} onFocusCapture={openServices} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) closeServices(); }} onKeyDown={event => { if (event.key === 'Escape') setServicesOpen(false); }}>
          <Button variant="nav" asChild><Link to={item.to} aria-current={location.pathname === item.to ? 'page' : undefined} aria-expanded={servicesOpen} aria-haspopup="true"><span className="roll" data-text={item.title}><span className="roll-label">{item.title}</span></span><ChevronDown className="nav-caret" /></Link></Button>
          <div className="services-menu" role="group" aria-label="Service pages">
            <span className="services-menu-label">Our capabilities</span>
            <ul className="services-menu-list">{serviceMenu.map(entry => <li key={entry.to}><Link to={entry.to} onClick={() => setServicesOpen(false)}><span className="services-menu-index">{entry.index}</span><span className="services-menu-text"><strong>{entry.title}</strong><span>{entry.note}</span></span><ArrowUpRight size={16} /></Link></li>)}</ul>
            <Link className="services-menu-all" to="/services" onClick={() => setServicesOpen(false)}>Explore all services <ArrowUpRight size={14} /></Link>
          </div>
        </div> : <Button key={item.to} variant="nav" asChild><Link to={item.to} aria-current={location.pathname === item.to ? 'page' : undefined}><span className="roll" data-text={item.title}><span className="roll-label">{item.title}</span></span>{item.to === '/contact' && <ArrowUpRight size={14} />}</Link></Button>)}
      </nav>
      <Button className="mobile-menu-toggle" variant="nav" size="icon" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu /></Button>
    </header>
    {open && <div className="menu-overlay" role="dialog" aria-modal="true" aria-label="Navigation menu">
      <div className="menu-top"><Link to="/" className="wordmark" onClick={() => setOpen(false)}><img className="brand-logo" src={brandLogo.url} alt="CREVORA" width={1248} height={206} /></Link><Button variant="nav" size="icon" aria-label="Close menu" autoFocus onClick={() => setOpen(false)}><X /></Button></div>
      <nav aria-label="Mobile navigation">{[{ title: 'Home', to: '/' } as const, ...nav].map((item, index) => <Link key={item.to} to={item.to} onClick={() => setOpen(false)}><span className="menu-index">0{index + 1}</span>{item.title}<ArrowUpRight /></Link>)}</nav>
      <div className="menu-services"><span className="menu-services-label">Capabilities</span>{serviceMenu.map(entry => <Link key={entry.to} to={entry.to} onClick={() => setOpen(false)}>{entry.title}<ArrowUpRight size={16} /></Link>)}</div>
      <div className="menu-bottom"><span>Social-first creative agency.<br />Windhoek, Namibia.</span><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Say hello on WhatsApp</a></div>
    </div>}
    <div className="scroll-progress" aria-hidden="true" />
    <main id="main-content" key={location.pathname} className="page-enter">{children}</main>
    <a className="whatsapp-fab" href={whatsapp} target="_blank" rel="noreferrer" aria-label="Chat with CREVORA on WhatsApp"><MessageCircle size={20} /><span>WhatsApp</span></a>
    <footer className="studio-footer">
      <div className="footer-top"><span className="eyebrow"><span className="status-dot" /> Taking on new projects</span><span className="footer-location">Partnering with Namibian businesses through strategic digital marketing, branding, and creative solutions.<br />Serving businesses across Namibia and international markets.</span></div>
      <div className="footer-call reveal"><h2>Let’s make<br /><span>something matter.</span></h2><Button variant="round" asChild><Link to="/contact" aria-label="Start a conversation"><ArrowUpRight /></Link></Button></div>
      <div className="footer-middle"><a className="footer-email" href="mailto:hello@crevora.co">hello@crevora.co <ArrowUpRight size={24} /></a><a className="footer-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> +264 81 578 1719</a><span className="footer-whatsapp">Mon – Fri: 08:00 – 19:00</span></div>
      <div className="footer-nav"><div>{nav.map(item => <Link key={item.to} to={item.to}>{item.title}</Link>)}<Link to="/social-media-management-namibia">Social Media Marketing</Link><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></div><ul className="footer-socials" aria-label="CREVORA on social media">{socials.map(x => <li key={x.name}><a href={x.url} target="_blank" rel="noreferrer" aria-label={`CREVORA on ${x.name}`}><SocialIcon name={x.name} /></a></li>)}</ul><span>Independent studio. Intentional work. Windhoek, Namibia.</span></div>
      <div className="footer-marquee" aria-hidden="true"><div className="footer-marquee-track">{[0,1].map(i => <span key={i}>Strategy <em>meets</em> craft — Brands <em>that</em> stay — </span>)}</div></div>
      <div className="footer-wordmark" aria-hidden="true"><img className="footer-brand-logo" src={brandLogo.url} alt="" width={1248} height={206} loading="lazy" /></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} CREVORA. All rights reserved.</span><nav className="footer-legal" aria-label="Legal">{legalLinks.map(l => <Link key={l.to} to={l.to}>{l.title}</Link>)}</nav><Button variant="nav" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <ArrowUpRight size={14} /></Button></div>
    </footer>
  </div>;
}
