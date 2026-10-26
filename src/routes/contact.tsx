import { createFileRoute } from '@tanstack/react-router';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import * as z from 'zod';
import { StudioShell, whatsapp } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/studio-utils';
import { useSiteContent } from '@/lib/site-content-context';

type FieldKey = 'name' | 'company' | 'email' | 'phone' | 'interest' | 'message' | 'privacyConsent';

const schema = z.object({
  name: z.string().trim().min(2, 'Please tell us your name.').max(100, 'Please keep this under 100 characters.'),
  company: z.string().trim().max(120, 'Please keep this under 120 characters.'),
  email: z.string().trim().min(1, 'Please enter your email address.').email('That email address doesn’t look right.').max(255, 'Please keep this under 255 characters.'),
  phone: z.string().trim().min(7, 'Please enter a phone number.').max(20, 'Please keep this under 20 characters.').regex(/^[+0-9()\s-]+$/, 'Use numbers, spaces, +, – or ( ) only.'),
  interest: z.string().min(1, 'Please choose what you’d like to talk about.'),
  message: z.string().trim().min(10, 'Tell us a little more — at least 10 characters.').max(1000, 'Please keep this under 1000 characters.'),
  whatsappOk: z.boolean(),
  privacyConsent: z.boolean().refine(value => value, 'Please agree to the privacy notice before submitting.'),
});

function Field({ label, error, children }: { label: string; error?: string | undefined; children: ReactNode }) {
  return <label>{label}{children}{error && <span className="contact-error">{error}</span>}</label>;
}

export const Route = createFileRoute('/contact')({
  head: () => pageHead('Let’s Talk About Your Brand', 'Start a private discussion with CREVORA in Namibia about social media, branding, websites and creative work — on WhatsApp, by email, or through the contact form.'),
  component: Contact,
});

function Contact() {
  const { services } = useSiteContent();
  const [form, setForm] = useState(() => ({ name: '', company: '', email: '', phone: '', interest: services[0]?.title ?? '', message: '', whatsappOk: true, privacyConsent: false }));
  const [hp, setHp] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(prev => { const next = { ...prev }; delete next[key as FieldKey]; return next; });
    setStatus('idle');
    setSubmitError('');
    setWhatsappUrl('');
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hp) { setStatus('sent'); return; }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<FieldKey, string>> = {};
      for (const issue of parsed.error.issues) { const key = String(issue.path[0] ?? '') as FieldKey; if (!(key in next)) next[key] = issue.message; }
      setErrors(next);
      setStatus('error');
      return;
    }
    const v = parsed.data;
    setStatus('sending');
    setSubmitError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...v, honeypot: hp }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        setSubmitError(result?.error ?? 'We could not save your enquiry right now. Please try again shortly.');
        setStatus('error');
        return;
      }

      const text = [
        `Hi CREVORA! I’m ${v.name}.`,
        v.company && `Brand / Company: ${v.company}`,
        `Email: ${v.email}`,
        `Phone: ${v.phone}`,
        `Interested in: ${v.interest}`,
        '',
        v.message,
        '',
        `Open to being contacted via WhatsApp: ${v.whatsappOk ? 'Yes' : 'No'}`,
      ].filter(Boolean).join('\n');
      setWhatsappUrl(`https://wa.me/264815781719?text=${encodeURIComponent(text)}`);
      setStatus('sent');
    } catch {
      setSubmitError('We could not save your enquiry right now. Please try again shortly.');
      setStatus('error');
    }
  }

  return <StudioShell>
    <section className="inner-hero">
      <span className="eyebrow">CONTACT CREVORA</span>
      <h1>Let’s talk about<br />your <span>brand.</span></h1>
      <p>Reaching out doesn’t mean you have to be ready with everything figured out. Sometimes it starts with a question, an idea, or a problem you want to solve.</p>
      <div className="hero-actions">
        <Button variant="studio" asChild><a href="#discussion">Start a private discussion <ArrowUpRight /></a></Button>
      </div>
    </section>

    <section className="sm-intro section-pad">
      <div className="sm-intro-grid">
        <span className="eyebrow">NO PRESSURE</span>
        <div>
          <p>No pressure. No commitments. Just a discussion.</p>
          <p>If you’re exploring how to build stronger brand authority through strategy and content, we’re open to a private discussion.</p>
        </div>
      </div>
    </section>

    <section className="contact-layout section-pad" id="discussion">
      <div className="contact-info">
        <h2>Chat via<br />WhatsApp.</h2>
        <div className="contact-links">
          <a href="mailto:hello@crevora.co">hello@crevora.co <ArrowUpRight className="inline" size={18} /></a>
          <a href="tel:+264815781719">+264 81 578 1719</a>
          <span>Mon – Fri: 08:00 – 19:00</span>
          <Button variant="studio" asChild><a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Chat via WhatsApp <ArrowUpRight /></a></Button>
        </div>
        <p>Serving businesses across Namibia and international markets.</p>
      </div>

      <form className="contact-form" onSubmit={submit} noValidate>
        <div className="hp-field" aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} /></label></div>
        <Field label="Your full name" error={errors.name}>
          <input required maxLength={100} autoComplete="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Who are we talking to?" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Brand / Company" error={errors.company}>
          <input maxLength={120} autoComplete="organization" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your brand/company name" aria-invalid={!!errors.company} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input required type="email" maxLength={255} autoComplete="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Phone" error={errors.phone}>
          <input required type="tel" maxLength={20} autoComplete="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+264" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Select your primary interest" error={errors.interest}>
          <select value={form.interest} onChange={e => set('interest', e.target.value)}>
            {services.length ? services.map(s => <option key={s.to}>{s.title}</option>) : <option value="">No services available</option>}
          </select>
        </Field>
        <Field label="Description — tell us about your brand goals, challenges, or ideas you’re currently exploring" error={errors.message}>
          <textarea required maxLength={1000} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Share a bit about your brand, what you’re trying to achieve, or what feels unclear right now. There’s no need to have everything figured out." aria-invalid={!!errors.message} />
        </Field>
        <label className="contact-consent"><input type="checkbox" checked={form.whatsappOk} onChange={e => set('whatsappOk', e.target.checked)} /> I’m open to being contacted via WhatsApp</label>
        <label className="contact-consent contact-privacy-consent">
          <input type="checkbox" checked={form.privacyConsent} onChange={e => set('privacyConsent', e.target.checked)} aria-invalid={!!errors.privacyConsent} aria-describedby={errors.privacyConsent ? 'privacy-consent-error' : undefined} />
          <span>I agree that CREVORA may store my details and message to respond to this enquiry. Read the <a href="/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>.</span>
        </label>
        {errors.privacyConsent && <span id="privacy-consent-error" className="contact-error">{errors.privacyConsent}</span>}
        <p className="contact-form-note">Your enquiry is stored in PostgreSQL so CREVORA can follow up. After it is saved, you can continue to WhatsApp to send your message.</p>
        {status !== 'sent' && <Button variant="studio" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Saving your enquiry…' : 'Save enquiry'} <ArrowUpRight /></Button>}
        <div role="status" aria-live="polite">
          {status === 'sent' && <p className="form-message form-message-success">Thank you! Your enquiry has been saved. Continue to WhatsApp to review and send your message.</p>}
          {status === 'error' && <p className="form-message form-message-error">{Object.keys(errors).length ? 'Please check the highlighted fields and try again.' : submitError || 'Something went wrong. Please try again, or chat with us directly on WhatsApp.'}</p>}
        </div>
        {status === 'sent' && whatsappUrl && <Button variant="studio" asChild><a href={whatsappUrl} target="_blank" rel="noreferrer">Continue to WhatsApp <ArrowUpRight /></a></Button>}
      </form>
    </section>
  </StudioShell>;
}
