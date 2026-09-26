/**
 * One theme, however many controls.
 *
 * The toggle is mounted twice — in the site nav and inside the phone's Settings
 * screen — and on /app both are on screen at once. The DOM attribute is the
 * single source of truth and every control subscribes to it, so there is no
 * second copy of the state to fall out of step.
 */

export type Theme = 'light' | 'dark';

const KEY = 'wu-theme';
const listeners = new Set<() => void>();

function current(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Cached so getSnapshot returns a stable value between real changes. */
let snapshot: Theme | null = null;

export function subscribe(onChange: () => void): () => void {
  if (snapshot === null) snapshot = current();
  listeners.add(onChange);

  // another tab flipping the theme should move this one too
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    const next: Theme = e.newValue === 'dark' ? 'dark' : 'light';
    apply(next, false);
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onStorage);
  };
}

export function getSnapshot(): Theme {
  if (snapshot === null) snapshot = current();
  return snapshot;
}

/** The server has no DOM and no localStorage; the no-flash script fixes up the
 *  attribute before paint, and the first client snapshot reads the real value. */
export function getServerSnapshot(): Theme {
  return 'light';
}

function apply(next: Theme, persist: boolean) {
  if (snapshot === next) return;
  snapshot = next;
  document.documentElement.setAttribute('data-theme', next);
  if (persist) {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* private mode — the change still holds for this session */
    }
  }
  listeners.forEach((l) => l());
}

export function setTheme(next: Theme) {
  apply(next, true);
}

export function toggleTheme() {
  setTheme(getSnapshot() === 'dark' ? 'light' : 'dark');
}

/**
 * Called once on mount: settle the initial value from storage or the OS.
 *
 * This always stamps the attribute, even when the value has not changed. Going
 * through `apply` would early-return on a fresh light-OS load — snapshot starts
 * as 'light' because the attribute is absent — and leave `<html>` unmarked. The
 * page still renders light off `:root`, but the media-query fallback is then
 * free to paint dark if the OS flips mid-session while the control still reads
 * light. An unmarked root is not a neutral state; it is an unowned one.
 */
export function initTheme() {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  const initial: Theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

  snapshot = initial;
  document.documentElement.setAttribute('data-theme', initial);
  listeners.forEach((l) => l());
}
