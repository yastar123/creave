import { useEffect, useState } from 'react';
import Lenis from 'lenis';

// Module-level: survives route remounts so the intro plays once and the curtain only on client navigation.
let booted = false;
let lenis: Lenis | null = null;

/** Preloader + magnetic buttons + scroll-linked image parallax and ticker skew. Compositor-only. */
export function StudioFx({ pathname }: { pathname: string }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<'count' | 'exit' | 'done'>(booted ? 'done' : 'count');
  const [showCurtain] = useState(booted);
  // Pin the curtain to the page this shell mounted for; the outgoing shell must not replay it.
  const [mountPath] = useState(pathname);

  useEffect(() => {
    booted = true;
    if (lenis || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, syncTouch: true, syncTouchLerp: 0.09, touchMultiplier: 1 });
    const raf = (t: number) => { lenis?.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }, []);
  useEffect(() => { lenis?.scrollTo(0, { immediate: true }); }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (phase === 'done' || reduce) { setPhase('done'); root.classList.remove('is-intro'); return; }
    root.classList.add('is-intro');
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1500, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setPhase('exit'); root.classList.remove('is-intro'); setTimeout(() => setPhase('done'), 1100); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => { const t = setTimeout(() => document.documentElement.classList.add('fx-ready'), 1300); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const images = Array.from(document.querySelectorAll<HTMLElement>('.project-image-button img, .exploration-image img, .fx-parallax'));
    const ticker = document.querySelector<HTMLElement>('.studio-ticker');
    let last = window.scrollY, velocity = 0, frame = 0;
    const loop = () => {
      const y = window.scrollY;
      velocity += ((y - last) - velocity) * 0.12;
      last = y;
      const vh = window.innerHeight;
      for (const img of images) {
        const r = img.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', `${(p * -7).toFixed(2)}%`);
      }
      ticker?.style.setProperty('--skew', `${Math.max(-8, Math.min(8, velocity * 0.25)).toFixed(2)}deg`);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    // Inertial blend-mode cursor dot that swells over interactive elements.
    const dot = document.querySelector<HTMLElement>('.fx-dot');
    let tx = -100, ty = -100, cx = -100, cy = -100, dotFrame = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX; ty = e.clientY;
      const t = e.target instanceof Element ? e.target : null;
      dot?.classList.toggle('is-link', Boolean(t?.closest('a, button')) && !t?.closest('[data-cursor="view"]'));
      dot?.classList.toggle('is-hidden', Boolean(t?.closest('[data-cursor="view"]')));
    };
    const dotLoop = () => { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; dot?.style.setProperty('transform', `translate3d(${cx}px, ${cy}px, 0)`); dotFrame = requestAnimationFrame(dotLoop); };
    if (fine && dot) { window.addEventListener('pointermove', onMove, { passive: true }); dotFrame = requestAnimationFrame(dotLoop); }

    const magnets = fine ? Array.from(document.querySelectorAll<HTMLElement>('.studio-button, .studio-round-button, .whatsapp-fab, .project-open')) : [];
    const handlers = magnets.map(el => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.3}px`);
        el.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
      };
      const leave = () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); };
      el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
      return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(dotFrame); window.removeEventListener('pointermove', onMove); handlers.forEach(h => h()); };
  }, [pathname]);

  const curtain = showCurtain ? <div className="fx-curtain" aria-hidden="true">{[0,1,2,3,4].map(i => <i key={i} style={{ animationDelay: `${i * 55}ms` }} />)}<span>{mountPath === '/' ? 'Home' : mountPath.slice(1).split('-')[0]}</span></div> : null;
  if (phase === 'done') return <><div className="fx-grain" aria-hidden="true" /><div className="fx-dot" aria-hidden="true"><span /></div>{curtain}</>;
  return <>
    <div className="fx-grain" aria-hidden="true" /><div className="fx-dot" aria-hidden="true"><span /></div>
    <div className={`fx-loader ${phase === 'exit' ? 'is-exit' : ''}`} aria-hidden="true">
      <div className="fx-loader-top"><span>CREVORA®</span><span>Independent creative studio</span><span>Windhoek — NA</span></div>
      <div className="fx-loader-word"><span>Make</span> <em>them</em> <span>stop.</span></div>
      <div className="fx-loader-bottom"><div className="fx-loader-bar" style={{ transform: `scaleX(${count / 100})` }} /><span className="fx-loader-count">{String(count).padStart(3, '0')}</span></div>
    </div>
  </>;
}
