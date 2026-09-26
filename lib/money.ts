/**
 * Fictional pricing for a fictional service. Rates and fees are invented and
 * frozen — nothing here talks to a market. They exist so the prototype can
 * recompute in front of you instead of showing a screenshot of a number.
 */

export type CurrencyCode = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'MXN';

export type Currency = {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  /** Units of this currency per 1 USD. */
  perUsd: number;
};

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  BRL: { code: 'BRL', name: 'Brazilian real', symbol: 'R$', locale: 'pt-BR', perUsd: 5.4348 },
  USD: { code: 'USD', name: 'US dollar', symbol: '$', locale: 'en-US', perUsd: 1 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE', perUsd: 0.9215 },
  GBP: { code: 'GBP', name: 'British pound', symbol: '£', locale: 'en-GB', perUsd: 0.7864 },
  MXN: { code: 'MXN', name: 'Mexican peso', symbol: 'MX$', locale: 'es-MX', perUsd: 18.21 },
};

export const CURRENCY_LIST = Object.values(CURRENCIES);

export type PayoutMethod = 'cash' | 'bank' | 'wallet';

export const PAYOUT: Record<
  PayoutMethod,
  {
    label: string;
    blurb: string;
    eta: string;
    percent: number;
    flat: number;
    icon: 'cash' | 'bank' | 'wallet';
  }
> = {
  cash: {
    label: 'Cash pickup',
    blurb: 'They collect at a partner agent with a photo ID and the tracking number.',
    eta: 'Minutes',
    percent: 0.012,
    flat: 2.4,
    icon: 'cash',
  },
  bank: {
    label: 'Bank deposit',
    blurb: 'Lands directly in the account on file for the recipient.',
    eta: '1–2 business days',
    percent: 0.006,
    flat: 1.2,
    icon: 'bank',
  },
  wallet: {
    label: 'Digital wallet',
    blurb: 'Credited to their wallet, spendable straight away.',
    eta: 'Minutes',
    percent: 0.009,
    flat: 1.6,
    icon: 'wallet',
  },
};

export const PAYOUT_METHODS = Object.keys(PAYOUT) as PayoutMethod[];

/** A send limit exists so the error state in the prototype is reachable, not decorative. */
export const DAILY_LIMIT_USD = 920;

/**
 * The balance the Amount screen reports. Held in USD like the limit and
 * converted at the corridor rate, so the two helper lines can never disagree.
 */
export const BALANCE_USD = 2480;

export function rate(from: CurrencyCode, to: CurrencyCode): number {
  return CURRENCIES[to].perUsd / CURRENCIES[from].perUsd;
}

export function toUsd(amount: number, from: CurrencyCode): number {
  return amount / CURRENCIES[from].perUsd;
}

export function format(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCIES[code].locale, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Plain number, no symbol — for a field whose currency sits beside it in a picker. */
export function formatPlain(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCIES[code].locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** The locale's own decimal mark, read from Intl rather than assumed per language. */
function decimalSeparator(code: CurrencyCode): string {
  const parts = new Intl.NumberFormat(CURRENCIES[code].locale).formatToParts(1.1);
  return parts.find((part) => part.type === 'decimal')?.value ?? '.';
}

/**
 * A half-typed amount ("1234.5") in the currency's locale ("1.234,5" in BRL,
 * "1,234.5" in MXN). Not `format`: the decimals are whatever has been typed so far.
 */
export function formatAmountInput(typed: string, code: CurrencyCode): string {
  if (typed === '') return '0';
  const [whole, decimals] = typed.split('.');
  const grouped = new Intl.NumberFormat(CURRENCIES[code].locale).format(Number(whole || '0'));
  return decimals === undefined ? grouped : `${grouped}${decimalSeparator(code)}${decimals}`;
}

export type Quote = {
  send: number;
  sendCurrency: CurrencyCode;
  receiveCurrency: CurrencyCode;
  method: PayoutMethod;
  fee: number;
  converted: number;
  fxRate: number;
  receive: number;
  eta: string;
  overLimit: boolean;
  limitInSendCurrency: number;
  balanceInSendCurrency: number;
};

const toCents = (amount: number) => Math.round(amount * 100) / 100;

export function quoteTransfer(
  send: number,
  sendCurrency: CurrencyCode,
  receiveCurrency: CurrencyCode,
  method: PayoutMethod
): Quote {
  const payout = PAYOUT[method];
  const flatInSend = payout.flat * CURRENCIES[sendCurrency].perUsd;
  const fee = send > 0 ? toCents(send * payout.percent + flatInSend) : 0;
  const converted = Math.max(send - fee, 0);
  const fxRate = rate(sendCurrency, receiveCurrency);

  return {
    send,
    sendCurrency,
    receiveCurrency,
    method,
    fee,
    converted: toCents(converted),
    fxRate,
    receive: toCents(converted * fxRate),
    eta: payout.eta,
    overLimit: toUsd(send, sendCurrency) > DAILY_LIMIT_USD,
    limitInSendCurrency: toCents(DAILY_LIMIT_USD * CURRENCIES[sendCurrency].perUsd),
    balanceInSendCurrency: toCents(BALANCE_USD * CURRENCIES[sendCurrency].perUsd),
  };
}

/** One sentence for a live region: the result, or the reason there is none. */
export function describeQuote(quote: Quote): string {
  if (quote.overLimit) {
    return `Over the ${format(quote.limitInSendCurrency, quote.sendCurrency)} daily limit.`;
  }
  return `They get ${format(quote.receive, quote.receiveCurrency)}.`;
}

/**
 * Ten digits from a millisecond timestamp, grouped 4-4-2. The same timestamp
 * names the transfer, so two sends of the same amount get different numbers.
 */
export function trackingNumber(createdAt: number): string {
  const digits = String(Math.trunc(Math.abs(createdAt)) % 1e10).padStart(10, '0');
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 10)}`;
}
