/**
 * The opening can be asked for, not only given.
 *
 * A DOM event rather than a context: the trigger lives in the nav and the
 * overlay lives beside it in the root layout, so a provider would have to wrap
 * both and exist only to carry one boolean. The event costs nothing on the
 * server and nothing to the pages that never fire it.
 */
export const INTRO_REPLAY = 'wu:intro-replay';

export function replayIntro() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INTRO_REPLAY));
}
