'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Icon } from './ui/Icon';
import { getServerSnapshot, getSnapshot, initTheme, subscribe, toggleTheme } from '@/lib/theme';

/**
 * A two-state switch, not a button that renames itself.
 *
 * Both states stay on the track — sun on the left, moon on the right — and the
 * thumb marks which one is active, so neither glyph is a claim about what a
 * click will do; each just names a side.
 *
 * The value comes from a shared store rather than local state, so every copy of
 * this control agrees. See lib/theme.ts. Hydration renders the server snapshot,
 * so the markup always matches and needs no hydration-warning escape hatch.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === 'dark';

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      className="themeswitch"
      data-state={isDark ? 'dark' : 'light'}
      onClick={toggleTheme}
    >
      <span className="themeswitch__thumb" aria-hidden="true" />
      <span className="themeswitch__slot" data-side="light">
        <Icon name="sun" />
      </span>
      <span className="themeswitch__slot" data-side="dark">
        <Icon name="moon" />
      </span>
    </button>
  );
}
