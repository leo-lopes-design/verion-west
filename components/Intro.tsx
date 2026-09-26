'use client';

import { useCallback, useEffect, useState } from 'react';
import { Mark } from '@/components/Mark';
import { INTRO_REPLAY } from '@/lib/intro';

/**
 * The opening. Not a loader — there is nothing to load.
 *
 * Every route here is statically prerendered and Next prefetches its links, so
 * a progress indicator would be measuring work that does not exist. This demo
 * spends a whole page arguing that a hypothesis must never be dressed as a
 * fact; a spinner pretending to wait would be the same lie in motion. So it is
 * named what it is — a title beat — and it holds for a fixed, short time
 * because it is theatre, declared as theatre.
 *
 * The interference is drawn, not filmed. The three reference textures are a
 * 27MB glitch plate, a 10MB geometric plate and a grain plate; none of them can
 * go into a web page, and none of them could theme or respond to a motion
 * preference. What they gave is a vocabulary — chromatic salt-and-pepper grain,
 * dense horizontal banding, a tracking tear that smears a slice sideways, and
 * rainbow fringing at the edges — which is rebuilt in SVG turbulence and
 * gradients that cost a few hundred bytes.
 *
 * It costs the viewer something, so it is bounded in every direction:
 *   · once per browser tab (sessionStorage), never again on navigation
 *   · skippable with any key, click or scroll
 *   · absent entirely under `prefers-reduced-motion` — including when asked for
 *     by hand, because a stated preference outranks a click on a logo
 *   · `?intro=0` suppresses the automatic opening, which is how the QA suites
 *     get past it; an explicit replay still plays, so the replay is testable
 *
 * It renders as an overlay and never unmounts the page beneath, so screenshots
 * and geometry probes still find what they came for.
 */

const SEEN = 'wu-intro-seen';

/* Assembly 750ms, then it rests, then it leaves. The hold is not motion — it is
   the only place in this system where somebody waits for something that is not
   loading, and the four exits above are what it costs. */
const HOLD = 2000;
const EXIT = 400;

type Phase = 'hidden' | 'playing' | 'leaving';

export function Intro() {
  const [phase, setPhase] = useState<Phase>('hidden');
  /* Bumped on every run so React remounts the subtree and the CSS animations
     restart from zero. Without it a second play would find them already at
     their end state and show a static mark. */
  const [run, setRun] = useState(0);

  const play = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setRun((n) => n + 1);
    setPhase('playing');
  }, []);

  /* The clock lives in an effect keyed on the run, not inside play(): Strict
     Mode's double mount would clear timers set there and strand the overlay. */
  useEffect(() => {
    if (phase !== 'playing') return;
    const hold = window.setTimeout(() => setPhase('leaving'), HOLD);
    return () => window.clearTimeout(hold);
  }, [phase, run]);

  /* Automatic opening: once per tab, and never when QA asked for quiet. */
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('intro') === '0') return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN) === '1';
    } catch {
      /* private mode — show it, it is one beat */
    }
    if (seen) return;
    try {
      sessionStorage.setItem(SEEN, '1');
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the decision reads sessionStorage, which the server render cannot, so it has to happen after hydration
    play();
  }, [play]);

  /* Asked for by hand, from the mark in the nav. */
  useEffect(() => {
    window.addEventListener(INTRO_REPLAY, play);
    return () => window.removeEventListener(INTRO_REPLAY, play);
  }, [play]);

  /* Skipping is a separate beat: it cuts the hold, never the exit. */
  useEffect(() => {
    if (phase !== 'playing') return;
    const skip = () => setPhase('leaving');
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('wheel', skip);
    };
  }, [phase]);

  /* `leaving` is its own beat with its own clock, so a skip and a full run
     leave by the same door. */
  useEffect(() => {
    if (phase !== 'leaving') return;
    const gone = window.setTimeout(() => setPhase('hidden'), EXIT);
    return () => window.clearTimeout(gone);
  }, [phase, run]);

  if (phase === 'hidden') return null;

  return (
    /* Not aria-hidden: the Mark inside is an image named "Verion West", which is
       what a screen-reader user should hear. It takes no focus and traps nothing. */
    <div key={run} className="intro" data-phase={phase}>
      <div className="intro__mark">
        <Mark tone="inverse" />
      </div>
      <p className="intro__skip" aria-hidden="true">
        Press any key to skip
      </p>

      {/* The signal, in four layers. Decorative and inert — no pointer events,
          nothing readable, nothing announced. */}
      <span className="intro__bloom" aria-hidden="true" />
      <span className="intro__scan" aria-hidden="true" />
      <span className="intro__grain" aria-hidden="true" />
      <span className="intro__tear" aria-hidden="true" />
    </div>
  );
}
