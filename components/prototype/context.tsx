'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { Draft, Route, Transfer } from '@/lib/flow';
import type { Quote } from '@/lib/money';

/** Declared in lib/flow.ts so lib/persist.ts can name it without importing a
 *  component; re-exported here because everything in this folder asks for it
 *  from the provider it belongs to. */
export type { Draft };

export type FlowValue = {
  route: Route;
  go: (r: Route) => void;
  back: () => void;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  amount: number;
  quote: Quote;
  transfers: Transfer[];
  commit: () => string;
  resetDraft: () => void;
  /** Card state lives here, not in the screen, so it survives switching tabs. */
  cardFrozen: boolean;
  cardRevealed: boolean;
  setCardFrozen: (v: boolean) => void;
  setCardRevealed: (v: boolean) => void;
  /** Throws away the stored session and returns to the seed. Persistence
   *  without a way out traps a visitor inside state they did not mean to keep. */
  resetAll: () => void;
};

/** Lives in its own module so AppFlow and the screens never import each other. */
export const FlowCtx = createContext<FlowValue | null>(null);

export function useFlow(): FlowValue {
  const v = useContext(FlowCtx);
  if (!v) throw new Error('useFlow must be used inside AppFlow');
  return v;
}

/**
 * Every screen names itself with this, and AppFlow moves focus here after a
 * screen change so keyboard and screen-reader users land on the new screen.
 */
export function ScreenTitle({
  children,
  align = 'center',
}: {
  children: ReactNode;
  align?: 'center' | 'start';
}) {
  return (
    <h2
      className={`scr__navtitle${align === 'start' ? ' scr__navtitle--start' : ''}`}
      tabIndex={-1}
      data-screen-title
    >
      {children}
    </h2>
  );
}

/** A screen inside the send flow: back, title, close. */
export function NavBar({
  title,
  onBack,
  onClose,
}: {
  title: string;
  onBack?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="scr__nav">
      {onBack ? (
        <button type="button" className="scr__navbtn" onClick={onBack} aria-label="Back">
          <Icon name="arrow-left" />
        </button>
      ) : (
        <span className="scr__navspacer" aria-hidden="true" />
      )}
      <ScreenTitle>{title}</ScreenTitle>
      {onClose ? (
        <button type="button" className="scr__navbtn" onClick={onClose} aria-label="Close">
          <Icon name="close" />
        </button>
      ) : (
        <span className="scr__navspacer" aria-hidden="true" />
      )}
    </div>
  );
}

/** A tab's own screen: the title sits at the start, with an optional trailing slot. */
export function TabHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <div className="scr__nav">
      <ScreenTitle align="start">{title}</ScreenTitle>
      {trailing}
    </div>
  );
}
