import { useEffect } from 'react';

/** One-shot typography choreography; no scroll polling or animation dependency. */
export function StudioChoreography({ pathname }: { pathname: string }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const headings = Array.from(document.querySelectorAll<HTMLElement>('main section h2:not([data-no-choreo]), .footer-call h2'));
    const restorations: (() => void)[] = [];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-typeset-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    headings.forEach(heading => {
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) {
        if (walker.currentNode instanceof Text) nodes.push(walker.currentNode);
      }
      const originalLabel = heading.getAttribute('aria-label');
      heading.setAttribute('aria-label', heading.textContent?.replace(/\s+/g, ' ').trim() ?? '');
      heading.classList.add('motion-heading');
      let index = 0;
      nodes.forEach(node => {
        const fragment = document.createDocumentFragment();
        const replacements: Node[] = [];
        (node.textContent ?? '').split(/(\s+)/).filter(Boolean).forEach(part => {
          if (/^\s+$/.test(part)) {
            const space = document.createTextNode(part);
            fragment.append(space);
            replacements.push(space);
            return;
          }
          const mask = document.createElement('span');
          mask.className = 'motion-word-mask';
          mask.setAttribute('aria-hidden', 'true');
          const word = document.createElement('span');
          word.className = 'motion-word';
          word.textContent = part;
          word.style.setProperty('--word-delay', `${Math.min(index++, 10) * 45}ms`);
          mask.append(word);
          fragment.append(mask);
          replacements.push(mask);
        });
        node.replaceWith(fragment);
        restorations.push(() => {
          const first = replacements[0];
          if (first?.parentNode) first.parentNode.insertBefore(node, first);
          replacements.forEach(replacement => replacement.parentNode?.removeChild(replacement));
        });
      });
      restorations.push(() => {
        heading.classList.remove('motion-heading', 'is-typeset-visible');
        if (originalLabel === null) heading.removeAttribute('aria-label');
        else heading.setAttribute('aria-label', originalLabel);
      });
      observer.observe(heading);
    });
    return () => { observer.disconnect(); restorations.forEach(restore => restore()); };
  }, [pathname]);
  return null;
}