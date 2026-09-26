'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_RECIPIENT,
  FLOW_ROUTES,
  HOME_ROUTE,
  SEED_TRANSFERS,
  TABS,
  isTab,
  type Route,
  type Transfer,
} from '@/lib/flow';
import { quoteTransfer, trackingNumber } from '@/lib/money';
import { clear as clearStored, load, save } from '@/lib/persist';
import { Icon } from '@/components/ui/Icon';
import { FlowCtx, useFlow, type Draft, type FlowValue } from './context';
import {
  ActivityScreen,
  AmountScreen,
  CardScreen,
  HomeScreen,
  MethodScreen,
  RecipientScreen,
  ReviewScreen,
  SettingsScreen,
  SuccessScreen,
  TrackingScreen,
} from './screens';

const INITIAL_DRAFT: Draft = {
  amountStr: '250',
  sendCurrency: 'USD',
  receiveCurrency: DEFAULT_RECIPIENT.currency,
  recipientId: DEFAULT_RECIPIENT.id,
  method: DEFAULT_RECIPIENT.defaultMethod,
};

function parseAmount(s: string): number {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

const routeKey = (route: Route) => route.name + ('id' in route ? route.id : '');

/**
 * Restoring has to happen before the browser paints, or the visitor sees Home
 * for a frame and then the screen they were actually on. useLayoutEffect runs
 * after hydration and before paint; it just does not exist on the server.
 */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Figures the prototype reports about itself, measured on the server where the token file lives. */
export type PrototypeFacts = { tokenCount: number };

export function AppFlow({ facts }: { facts: PrototypeFacts }) {
  const [stack, setStack] = useState<Route[]>([HOME_ROUTE]);
  const [draft, setDraftState] = useState<Draft>(INITIAL_DRAFT);
  const [transfers, setTransfers] = useState<Transfer[]>(SEED_TRANSFERS);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);

  /**
   * The server renders the seed, so the first client render must render the
   * seed too or hydration mismatches. This flag stops that first render from
   * saving the seed over the state it is about to read back.
   */
  const [hydrated, setHydrated] = useState(false);

  useBeforePaint(() => {
    const saved = load();
    if (saved) {
      setStack(saved.stack);
      setDraftState(saved.draft);
      setTransfers(saved.transfers);
      setCardFrozen(saved.cardFrozen);
      setCardRevealed(saved.cardRevealed);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    save({ stack, draft, transfers, cardFrozen, cardRevealed });
  }, [hydrated, stack, draft, transfers, cardFrozen, cardRevealed]);

  const route = stack[stack.length - 1] ?? HOME_ROUTE;
  const amount = parseAmount(draft.amountStr);

  /**
   * Each screen remounts, so without this focus falls to <body> on every step.
   * Only a visitor's own navigation moves it — never the restore on load.
   */
  const screenRef = useRef<HTMLDivElement>(null);
  const focusNextScreen = useRef(false);
  useEffect(() => {
    if (!focusNextScreen.current) return;
    focusNextScreen.current = false;
    screenRef.current
      ?.querySelector<HTMLElement>('[data-screen-title]')
      ?.focus({ preventScroll: true });
  }, [stack]);

  function navigate(next: (current: Route[]) => Route[]) {
    focusNextScreen.current = true;
    setStack(next);
  }

  const quote = useMemo(
    () => quoteTransfer(amount, draft.sendCurrency, draft.receiveCurrency, draft.method),
    [amount, draft.sendCurrency, draft.receiveCurrency, draft.method]
  );

  const value: FlowValue = {
    route,
    amount,
    draft,
    transfers,
    quote,
    go: (next) => navigate((current) => (isTab(next) ? [next] : [...current, next])),
    back: () => navigate((current) => (current.length > 1 ? current.slice(0, -1) : current)),
    setDraft: (patch) => setDraftState((d) => ({ ...d, ...patch })),
    resetDraft: () => setDraftState(INITIAL_DRAFT),
    cardFrozen,
    cardRevealed,
    setCardFrozen,
    setCardRevealed,
    resetAll: () => {
      clearStored();
      navigate(() => [HOME_ROUTE]);
      setDraftState(INITIAL_DRAFT);
      setTransfers(SEED_TRANSFERS);
      setCardFrozen(false);
      setCardRevealed(false);
    },
    commit: () => {
      const createdAt = Date.now();
      const id = `t${createdAt}`;
      const transfer: Transfer = {
        id,
        recipientId: draft.recipientId,
        send: quote.send,
        sendCurrency: quote.sendCurrency,
        receive: quote.receive,
        receiveCurrency: quote.receiveCurrency,
        fee: quote.fee,
        method: quote.method,
        status: 'submitted',
        reference: trackingNumber(createdAt),
        placedAt: 'Just now',
      };
      setTransfers((list) => [transfer, ...list]);
      return id;
    },
  };

  return (
    <FlowCtx.Provider value={value}>
      <div className="scr">
        <StatusBar />
        <div
          key={routeKey(route)}
          ref={screenRef}
          className="scr__fade"
          style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        >
          <Screen route={route} facts={facts} />
        </div>
        {FLOW_ROUTES.has(route.name) ? null : <TabBar />}
      </div>
    </FlowCtx.Provider>
  );
}

function Screen({ route, facts }: { route: Route; facts: PrototypeFacts }) {
  switch (route.name) {
    case 'home':
      return <HomeScreen />;
    case 'card':
      return <CardScreen />;
    case 'activity':
      return <ActivityScreen />;
    case 'settings':
      return <SettingsScreen tokenCount={facts.tokenCount} />;
    case 'amount':
      return <AmountScreen />;
    case 'recipient':
      return <RecipientScreen />;
    case 'method':
      return <MethodScreen />;
    case 'review':
      return <ReviewScreen />;
    case 'success':
      return <SuccessScreen id={route.id} />;
    case 'tracking':
      return <TrackingScreen id={route.id} />;
  }
}

/**
 * The status bar, drawn with the same glyph shapes as the Figma Status Bar so
 * the chrome reads as ordinary. Everything takes `currentColor`, so the bar
 * inverts with the theme and no glyph carries a colour of its own.
 */
function StatusBar() {
  return (
    <div className="scr__statusbar">
      <span className="scr__time">9:41</span>
      <span className="scr__signal" aria-hidden="true">
        {/* cellular — four bars, the iOS ramp */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="3.5" rx="1" />
          <rect x="4.7" y="5.5" width="3" height="5.5" rx="1" />
          <rect x="9.4" y="3" width="3" height="8" rx="1" />
          <rect x="14.1" y="0" width="3" height="11" rx="1" />
        </svg>
        {/* wi-fi — three arcs and the dot */}
        <svg
          width="16"
          height="11"
          viewBox="0 0 16 11"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
        >
          <path d="M1.4 3.6a9.4 9.4 0 0 1 13.2 0" strokeWidth="1.7" />
          <path d="M4.1 6.5a5.6 5.6 0 0 1 7.8 0" strokeWidth="1.7" />
          <path d="M6.8 9.3a1.8 1.8 0 0 1 2.4 0" strokeWidth="1.9" />
        </svg>
        {/* battery — hull, charge, terminal */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect
            x="0.5"
            y="0.5"
            width="21"
            height="11"
            rx="3.4"
            stroke="currentColor"
            strokeOpacity="0.38"
          />
          <rect x="2" y="2" width="18" height="8" rx="2.2" fill="currentColor" />
          <path
            d="M23 4.2v3.6c.9-.3 1.4-.9 1.4-1.8s-.5-1.5-1.4-1.8Z"
            fill="currentColor"
            fillOpacity="0.4"
          />
        </svg>
      </span>
    </div>
  );
}

function TabBar() {
  const { route, go } = useFlow();
  return (
    <nav className="tabbar" aria-label="App sections">
      {TABS.map((tab) => (
        <button
          key={tab.route}
          type="button"
          aria-current={route.name === tab.route ? 'page' : undefined}
          onClick={() => go({ name: tab.route })}
        >
          <Icon name={tab.icon} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
