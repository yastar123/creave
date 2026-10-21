import { useEffect, useRef, useState } from 'react';

/** Load near the viewport and play only while visible. */
export function ServiceVideo({ src, label, paused }: { src: string; label: string; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const loader = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setLoaded(true);
        loader.disconnect();
      }
    }, { rootMargin: '300px' });
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { threshold: 0.05 });
    loader.observe(video);
    observer.observe(video);
    return () => { loader.disconnect(); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video || !loaded) return;
    const sync = () => {
      if (paused || !visible || document.hidden) video.pause();
      else void video.play().catch(() => { /* Browser may require a user gesture. */ });
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => { document.removeEventListener('visibilitychange', sync); video.pause(); };
  }, [loaded, visible, paused]);

  return <video ref={ref} src={loaded ? src : undefined} muted loop playsInline preload="metadata" aria-label={label} />;
}