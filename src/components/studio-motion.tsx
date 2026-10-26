import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';

/** Local, compositor-only motion; native scroll and native cursor are never replaced. */
export function StudioMotion({ pathname }: { pathname: string }) {
  const cursor = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hero = document.querySelector<HTMLElement>('.home-hero');
    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const render = () => {
      frame = 0;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progress.current?.style.setProperty('--read-progress', String(total > 0 ? window.scrollY / total : 0));
      hero?.style.setProperty('--hero-scroll', `${Math.min(window.scrollY * .16, 100)}px`);
      hero?.style.setProperty('--hero-pan', `${fine ? (x / window.innerWidth - .5) * 18 : 0}px`);
      cursor.current?.style.setProperty('--cursor-x', `${x}px`);
      cursor.current?.style.setProperty('--cursor-y', `${y}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const move = (event: PointerEvent) => {
      x = event.clientX; y = event.clientY;
      const target = event.target instanceof Element ? event.target.closest('[data-cursor="view"]') : null;
      cursor.current?.classList.toggle('is-active', Boolean(target) && fine);
      schedule();
    };
    const hide = () => cursor.current?.classList.remove('is-active');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', hide);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', hide);
    };
  }, [pathname]);
  return <><div ref={progress} className="reading-progress" aria-hidden="true" /><div ref={cursor} className="project-cursor" aria-hidden="true"><ArrowUpRight /><span>Explore</span></div></>;
}