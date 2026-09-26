/**
 * The prototype survives a reload.
 *
 * **sessionStorage, not localStorage.** The state includes committed transfers
 * stamped "Just now"; carrying those across days would make the prototype lie
 * about itself. Surviving a reload is the ask; surviving the tab closing is not.
 *
 * Restored state is untrusted input: it may have been written by a build with
 * different screens, and a blob that no longer fits is discarded rather than
 * half-applied, because a blank phone is a worse failure than a fresh start.
 */
import {
  TRANSFER_STATUSES,
  isRouteName,
  isTransferRoute,
  recipientOf,
  type Draft,
  type Route,
  type Transfer,
} from './flow';
import { CURRENCIES, PAYOUT } from './money';

const KEY = 'wu-flow';
/** Bump when the shape changes. An older blob is dropped, never migrated. */
const VERSION = 2;

type Stored = {
  stack: Route[];
  draft: Draft;
  transfers: Transfer[];
  cardFrozen: boolean;
  cardRevealed: boolean;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isCurrency = (v: unknown) =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(CURRENCIES, v);
const isMethod = (v: unknown) =>
  typeof v === 'string' && Object.prototype.hasOwnProperty.call(PAYOUT, v);

function parseTransfer(v: unknown): Transfer | null {
  if (!isRecord(v)) return null;
  if (typeof v.id !== 'string' || typeof v.reference !== 'string') return null;
  if (typeof v.recipientId !== 'string') return null;
  if (!isCurrency(v.sendCurrency) || !isCurrency(v.receiveCurrency)) return null;
  if (!isMethod(v.method)) return null;
  if (!(TRANSFER_STATUSES as readonly unknown[]).includes(v.status)) return null;
  if (typeof v.send !== 'number' || typeof v.receive !== 'number' || typeof v.fee !== 'number') {
    return null;
  }
  if (!Number.isFinite(v.send) || !Number.isFinite(v.receive) || !Number.isFinite(v.fee))
    return null;
  if (typeof v.placedAt !== 'string') return null;
  return {
    id: v.id,
    recipientId: recipientOf(v.recipientId).id,
    send: v.send,
    sendCurrency: v.sendCurrency as Transfer['sendCurrency'],
    receive: v.receive,
    receiveCurrency: v.receiveCurrency as Transfer['receiveCurrency'],
    fee: v.fee,
    method: v.method as Transfer['method'],
    status: v.status as Transfer['status'],
    reference: v.reference,
    placedAt: v.placedAt,
  };
}

function parseDraft(v: unknown): Draft | null {
  if (!isRecord(v)) return null;
  if (typeof v.amountStr !== 'string' || v.amountStr.length > 16) return null;
  if (!isCurrency(v.sendCurrency) || !isCurrency(v.receiveCurrency)) return null;
  if (!isMethod(v.method)) return null;
  if (typeof v.recipientId !== 'string') return null;
  return {
    amountStr: v.amountStr,
    sendCurrency: v.sendCurrency as Draft['sendCurrency'],
    receiveCurrency: v.receiveCurrency as Draft['receiveCurrency'],
    recipientId: recipientOf(v.recipientId).id,
    method: v.method as Draft['method'],
  };
}

/**
 * Two screens address a transfer by id. If that transfer did not survive
 * validation, the screen would render a detail view of nothing — so the stack
 * is truncated at the first entry that points nowhere rather than kept whole.
 */
function parseStack(v: unknown, transfers: Transfer[]): Route[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > 12) return null;
  const ids = new Set(transfers.map((t) => t.id));
  const out: Route[] = [];
  for (const entry of v) {
    if (!isRecord(entry) || !isRouteName(entry.name)) break;
    const name = entry.name;
    if (isTransferRoute(name)) {
      if (typeof entry.id !== 'string' || !ids.has(entry.id)) break;
      out.push({ name, id: entry.id });
    } else {
      out.push({ name });
    }
  }
  return out.length ? out : null;
}

export function save(s: Stored) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ v: VERSION, ...s }));
  } catch {
    /* private mode, or the quota is full — the session still works in memory */
  }
}

export function load(): Stored | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.v !== VERSION) return clearAndFail();

    const transfers = Array.isArray(parsed.transfers)
      ? parsed.transfers.map(parseTransfer).filter((t): t is Transfer => t !== null)
      : null;
    if (!transfers || transfers.length === 0) return clearAndFail();

    const draft = parseDraft(parsed.draft);
    if (!draft) return clearAndFail();

    const stack = parseStack(parsed.stack, transfers);
    if (!stack) return clearAndFail();

    return {
      stack,
      draft,
      transfers,
      cardFrozen: parsed.cardFrozen === true,
      cardRevealed: parsed.cardRevealed === true,
    };
  } catch {
    return clearAndFail();
  }
}

export function clear() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to do */
  }
}

function clearAndFail(): null {
  clear();
  return null;
}
