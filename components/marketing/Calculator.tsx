'use client';

import { useState } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import {
  PAYOUT,
  PAYOUT_METHODS,
  describeQuote,
  format,
  formatPlain,
  quoteTransfer,
  type CurrencyCode,
  type PayoutMethod,
} from '@/lib/money';

/** Up to nine whole digits and two decimals — the shape a money field accepts while typing. */
const TYPED_AMOUNT = /^\d{0,9}(\.\d{0,2})?$/;

export function Calculator() {
  const [amountInput, setAmountInput] = useState('250');
  const [sendCurrency, setSendCurrency] = useState<CurrencyCode>('USD');
  const [receiveCurrency, setReceiveCurrency] = useState<CurrencyCode>('BRL');
  const [method, setMethod] = useState<PayoutMethod>('cash');

  const amount = Number(amountInput) || 0;
  const quote = quoteTransfer(amount, sendCurrency, receiveCurrency, method);

  function onAmountChange(typed: string) {
    if (typed === '' || TYPED_AMOUNT.test(typed)) setAmountInput(typed);
  }

  return (
    <div className="card card--floating calc">
      <Field
        label="You send"
        value={amountInput}
        onChange={onAmountChange}
        state={quote.overLimit ? 'error' : 'default'}
        trailing={
          <CurrencySelect value={sendCurrency} onChange={setSendCurrency} label="Send currency" />
        }
        help={
          quote.overLimit
            ? `Over the ${format(quote.limitInSendCurrency, sendCurrency)} daily limit — split it into two transfers.`
            : `Arrives in ${quote.eta.toLowerCase()} · rate locks when you confirm`
        }
      />

      <div className="calc__methods" role="group" aria-label="How they collect">
        {PAYOUT_METHODS.map((m) => (
          <button
            key={m}
            type="button"
            className="calc__method"
            aria-pressed={method === m}
            onClick={() => setMethod(m)}
          >
            <Icon name={PAYOUT[m].icon} />
            {PAYOUT[m].label}
          </button>
        ))}
      </div>

      <div className="calc__breakdown">
        <Line
          op="−"
          amount={format(quote.fee, sendCurrency)}
          label={`${PAYOUT[method].label} fee`}
        />
        <Line op="=" amount={format(quote.converted, sendCurrency)} label="Amount we convert" />
        <Line op="×" amount={quote.fxRate.toFixed(4)} label="Exchange rate" />
      </div>

      {/* A derived output, so no onChange, which makes it read-only. It stays in
          the tab order: this is the number people most want to copy out. */}
      <Field
        label="They get"
        value={formatPlain(quote.receive, receiveCurrency)}
        trailing={
          <CurrencySelect
            value={receiveCurrency}
            onChange={setReceiveCurrency}
            label="Payout currency"
          />
        }
      />
      <p className="visually-hidden" aria-live="polite">
        {describeQuote(quote)}
      </p>

      {quote.overLimit || amount <= 0 ? (
        <Button block disabled>
          Continue in the app
        </Button>
      ) : (
        <ButtonLink href="/app" block>
          Continue in the app
        </ButtonLink>
      )}
    </div>
  );
}

function Line({ op, amount, label }: { op: string; amount: string; label: string }) {
  return (
    <div className="calc__line">
      <span className="calc__op" aria-hidden="true">
        {op}
      </span>
      <span className="calc__amount">{amount}</span>
      <span className="calc__label">{label}</span>
    </div>
  );
}
