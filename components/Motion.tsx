'use client';

import { useEffect } from 'react';

/**
 * Every piece of scroll-driven motion on the marketing page, in one place.
 *
 * It renders nothing. It attaches observers, and it is the only thing that
 * decides whether motion happens at all: under `prefers-reduced-motion` it
 * returns before adding a single class, so the reveal never fires, the header
 * never slides and the photographs sit at their exact crop. That is a stronger
 * guarantee than shortening durations in CSS, because there is no state left
 * over to shorten.
 */
export function Motion() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    const root = document.documentElement;
    root.classList.add('js-parallax');

    /* ---- the header drops in, once, on load ----
       Two frames of delay, not zero: the class has to land in a paint after the
       one that applied the starting transform, or the browser collapses both
       into a single style resolution and there is nothing to transition. */
    const header = document.querySelector('.mkt-header');
    let headerFrame = 0;
    if (header) {
      headerFrame = requestAnimationFrame(() => {
        headerFrame = requestAnimationFrame(() => header.classList.add('is-in'));
      });
    }

    /* ---- reveal ---- */
    const revealTargets = Array.from(document.querySelectorAll('[data-reveal]'));
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));

    /* ---- parallax ---- */
    const shots = Array.from(document.querySelectorAll<HTMLElement>('.media__shot'));
    const travel =
      parseFloat(getComputedStyle(root).getPropertyValue('--wu-ref-motion-travel-parallax')) || 72;
    const visible = new Set<HTMLElement>();

    let frame = 0;
    function tick() {
      frame = 0;
      const vh = window.innerHeight;
      for (const el of visible) {
        const box = el.getBoundingClientRect();
        // -1 when the band is entering from the bottom, +1 when it is leaving
        // at the top; 0 when its centre is on the centre of the viewport.
        const centre = box.top + box.height / 2;
        const progress = Math.max(-1, Math.min(1, (vh / 2 - centre) / (vh / 2 + box.height / 2)));
        el.style.setProperty('--p', `${(progress * travel) / 2}px`);
      }
      if (visible.size) frame = requestAnimationFrame(tick);
    }

    const bandObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else visible.delete(el);
        }
        if (visible.size && frame === 0) frame = requestAnimationFrame(tick);
      },
      { threshold: 0 }
    );
    shots.forEach((el) => bandObserver.observe(el));

    const onMotionChange = () => {
      if (reduced.matches) {
        root.classList.remove('js-parallax');
        shots.forEach((el) => el.style.removeProperty('--p'));
      }
    };
    reduced.addEventListener('change', onMotionChange);

    return () => {
      revealObserver.disconnect();
      bandObserver.disconnect();
      reduced.removeEventListener('change', onMotionChange);
      if (frame) cancelAnimationFrame(frame);
      if (headerFrame) cancelAnimationFrame(headerFrame);
      header?.classList.remove('is-in');
      root.classList.remove('js-parallax');
    };
  }, []);

  return null;
}
