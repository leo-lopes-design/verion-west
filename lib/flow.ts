import type { CurrencyCode, PayoutMethod } from './money';

export type Recipient = {
  id: string;
  name: string;
  place: string;
  country: string;
  currency: CurrencyCode;
  defaultMethod: PayoutMethod;
  initials: string;
};

/** The person using the app — Marcos, the sender persona in lib/personas.ts. */
export const ACCOUNT_HOLDER = { name: 'Marcos Almeida', initials: 'MA' };

/** Where a new send starts, and the fallback for an id that no longer exists. */
export const DEFAULT_RECIPIENT: Recipient = {
  id: 'r1',
  name: 'Maria Silva',
  place: 'São Paulo',
  country: 'Brazil',
  currency: 'BRL',
  defaultMethod: 'cash',
  initials: 'MS',
};

export const RECIPIENTS: Recipient[] = [
  DEFAULT_RECIPIENT,
  {
    id: 'r2',
    name: 'John Pereira',
    place: 'Lisbon',
    country: 'Portugal',
    currency: 'EUR',
    defaultMethod: 'bank',
    initials: 'JP',
  },
  {
    id: 'r3',
    name: 'Ana Costa',
    place: 'Miami',
    country: 'United States',
    currency: 'USD',
    defaultMethod: 'wallet',
    initials: 'AC',
  },
  {
    id: 'r4',
    name: 'Diego Ramos',
    place: 'Guadalajara',
    country: 'Mexico',
    currency: 'MXN',
    defaultMethod: 'cash',
    initials: 'DR',
  },
  {
    id: 'r5',
    name: 'Grace Okafor',
    place: 'Manchester',
    country: 'United Kingdom',
    currency: 'GBP',
    defaultMethod: 'bank',
    initials: 'GO',
  },
];

export const TRANSFER_STATUSES = ['submitted', 'processing', 'ready', 'delivered'] as const;

export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

export type Transfer = {
  id: string;
  recipientId: string;
  send: number;
  sendCurrency: CurrencyCode;
  receive: number;
  receiveCurrency: CurrencyCode;
  fee: number;
  method: PayoutMethod;
  status: TransferStatus;
  reference: string;
  placedAt: string;
};

export const SEED_TRANSFERS: Transfer[] = [
  {
    id: 't1',
    recipientId: 'r1',
    send: 250,
    sendCurrency: 'USD',
    receive: 1348.2,
    receiveCurrency: 'BRL',
    fee: 5.4,
    method: 'cash',
    status: 'delivered',
    reference: '8472 1193 04',
    placedAt: 'Yesterday, 6:12 PM',
  },
  {
    id: 't2',
    recipientId: 'r2',
    send: 480,
    sendCurrency: 'USD',
    receive: 439.51,
    receiveCurrency: 'EUR',
    fee: 4.08,
    method: 'bank',
    status: 'processing',
    reference: '5590 2284 71',
    placedAt: 'Today, 2:32 PM',
  },
  {
    id: 't3',
    recipientId: 'r4',
    send: 120,
    sendCurrency: 'USD',
    receive: 2166.3,
    receiveCurrency: 'MXN',
    fee: 3.84,
    method: 'cash',
    status: 'ready',
    reference: '3318 7742 90',
    placedAt: 'Today, 9:04 AM',
  },
];

export const STATUS_LABEL: Record<TransferStatus, string> = {
  submitted: 'Submitted',
  processing: 'Processing',
  ready: 'Ready to collect',
  delivered: 'Delivered',
};

export const STATUS_TONE: Record<TransferStatus, 'info' | 'success' | 'warning'> = {
  submitted: 'info',
  processing: 'info',
  ready: 'warning',
  delivered: 'success',
};

/** How far along the timeline each status sits. */
export const STATUS_STEP: Record<TransferStatus, number> = {
  submitted: 0,
  processing: 1,
  ready: 2,
  delivered: 3,
};

export const TIMELINE_STEPS = [
  { title: 'Transfer submitted', when: 'Payment authorised' },
  { title: 'Funds converted', when: 'Rate locked at submission' },
  { title: 'Ready to collect', when: 'Recipient notified' },
  { title: 'Delivered', when: 'Collected by recipient' },
];

/* ---------------- routing ---------------- */

/**
 * Every screen in the prototype, written once. The Route type, the restore
 * guard in lib/persist.ts and the screen count on /app all derive from it.
 */
export const ROUTE_NAMES = [
  'home',
  'card',
  'activity',
  'settings',
  'amount',
  'recipient',
  'method',
  'review',
  'success',
  'tracking',
] as const;

export type RouteName = (typeof ROUTE_NAMES)[number];

/** The screens that show one transfer, and so carry its id. */
type TransferRouteName = 'success' | 'tracking';

/** Every other screen needs nothing but its name. */
export type PlainRouteName = Exclude<RouteName, TransferRouteName>;

export type Route = { name: PlainRouteName } | { name: TransferRouteName; id: string };

export const HOME_ROUTE: Route = { name: 'home' };

export function isRouteName(value: unknown): value is RouteName {
  return typeof value === 'string' && (ROUTE_NAMES as readonly string[]).includes(value);
}

export function isTransferRoute(name: RouteName): name is TransferRouteName {
  return name === 'success' || name === 'tracking';
}

/**
 * The in-progress send.
 *
 * It lives here rather than beside the provider because the persistence layer
 * has to name this shape, and `lib/` must never import from `components/`.
 */
export type Draft = {
  amountStr: string;
  sendCurrency: CurrencyCode;
  receiveCurrency: CurrencyCode;
  recipientId: string;
  method: PayoutMethod;
};

export const TABS: {
  route: PlainRouteName;
  label: string;
  icon: 'wallet' | 'card' | 'clock' | 'shield';
}[] = [
  { route: 'home', label: 'Home', icon: 'wallet' },
  { route: 'card', label: 'Card', icon: 'card' },
  { route: 'activity', label: 'Activity', icon: 'clock' },
  { route: 'settings', label: 'Settings', icon: 'shield' },
];

/** A tab resets the stack; every other screen is pushed onto it. */
export function isTab(route: Route): boolean {
  return TABS.some((tab) => tab.route === route.name);
}

/** Routes that belong to the send flow — the tab bar steps aside for these. */
export const FLOW_ROUTES = new Set<RouteName>([
  'amount',
  'recipient',
  'method',
  'review',
  'success',
]);

export function recipientOf(id: string): Recipient {
  return RECIPIENTS.find((r) => r.id === id) ?? DEFAULT_RECIPIENT;
}
