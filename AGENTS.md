<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep one-shot heading choreography in StudioChoreography with an IntersectionObserver and reversible text wrappers; this avoids continuous scroll work and preserves accessible heading names.
- Keep the homepage service layout in BoldServices with CSS-driven alternating media/caption columns on desktop; on mobile every service stacks the same way — caption first (left-aligned), then its video (styles.css max-width 560px block).
- Keep service video visibility/loading in ServiceVideo; homepage service footage streams from licensed online sources (Mixkit) listed in src/assets/videos/SOURCES.md, because imported CDN pointers from the old project do not resolve.
- Keep the homepage opening in BoldHero as an unpinned full-bleed monochrome obsidian image (bundled locally) matching the black/white theme and first-viewport brand heading; this anchors the studio in inspectable work without adding scroll distance.
- Size the BoldHero opening to the visitor's full viewport height (100svh, no pixel cap) instead of a fixed height, so the first screen shows only the studio image and brand; add short-viewport type/padding steps rather than shrinking the hero.
- Keep the service-card scroll animation in BoldServices with a rAF-throttled scroll handler plus one-shot IntersectionObserver reveals, gated by a data attribute and disabled under reduced motion; captions may only drift away from their own footage frame so the layout never overlaps.
