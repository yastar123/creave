import { Heart, MessageCircle, Play, TrendingUp, Gauge, Smartphone, Monitor, Search } from 'lucide-react';
import svcSocial from '@/assets/svc-social.webp';
import svcMotion from '@/assets/svc-motion.webp';
import svcWeb from '@/assets/svc-web.webp';
import { gallery } from '@/lib/studio-content';

type Kind = 'social' | 'identity' | 'motion' | 'web';

/** Visual showcase that illustrates each service with themed floating UI elements. */
export function ServiceVisual({ kind }: { kind: Kind }) {
  return <section className={`sv-section sv-${kind}`} aria-hidden="true">
    <div className="sv-stage">
      {kind === 'social' && <>
        <img className="sv-main" src={svcSocial} alt="" width={1200} height={1200} loading="lazy" />
        <div className="sv-chip sv-pos-1"><Heart size={16} fill="currentColor" /> 12.4K likes</div>
        <div className="sv-chip sv-pos-2"><MessageCircle size={16} /> “Saw this, need it.”</div>
        <div className="sv-card sv-pos-3"><span className="sv-label">Reach · 30 days</span><strong>+214%</strong><span className="sv-bars">{[30, 45, 38, 60, 72, 66, 90].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span></div>
        <div className="sv-chip sv-dark sv-pos-4"><Play size={14} fill="currentColor" /> Reel · 0:15</div>
        <div className="sv-tagrow sv-pos-5"><span>#strategy</span><span>#reels</span><span>#tiktok</span></div>
      </>}
      {kind === 'identity' && <>
        <img className="sv-main" src={gallery[2]!.image} alt="" width={1200} height={1200} loading="lazy" />
        <div className="sv-card sv-pos-1"><span className="sv-label">Palette</span><span className="sv-swatches"><i className="sw-ink" /><i className="sw-grey" /><i className="sw-line" /><i className="sw-paper" /></span></div>
        <div className="sv-card sv-type sv-pos-3"><span className="sv-label">Typeface</span><strong>Aa</strong><span>Geist · Display</span></div>
        <div className="sv-chip sv-dark sv-pos-2">✺ Logo system</div>
        <div className="sv-chip sv-pos-4">Guidelines · 48 pp</div>
      </>}
      {kind === 'motion' && <>
        <img className="sv-main" src={svcMotion} alt="" width={1200} height={1200} loading="lazy" />
        <div className="sv-chip sv-dark sv-pos-1"><span className="sv-rec" /> REC 00:00:24</div>
        <div className="sv-card sv-timeline sv-pos-3"><span className="sv-label">Timeline · 4K / 25fps</span><span className="sv-track">{Array.from({ length: 8 }).map((_, i) => <i key={i} />)}<b /></span></div>
        <div className="sv-chip sv-pos-2"><Play size={14} fill="currentColor" /> Motion graphics</div>
        <div className="sv-chip sv-pos-4">9:16 · 1:1 · 16:9</div>
      </>}
      {kind === 'web' && <>
        <img className="sv-main" src={svcWeb} alt="" width={1200} height={1200} loading="lazy" />
        <div className="sv-card sv-pos-1"><span className="sv-label"><Gauge size={14} /> Performance</span><strong>98</strong></div>
        <div className="sv-chip sv-pos-2"><Search size={14} /> SEO ready</div>
        <div className="sv-chip sv-dark sv-pos-4"><Monitor size={14} /> <Smartphone size={14} /> Responsive</div>
        <div className="sv-card sv-pos-3"><span className="sv-label"><TrendingUp size={14} /> Inquiries</span><strong>+3.1×</strong></div>
      </>}
    </div>
  </section>;
}
