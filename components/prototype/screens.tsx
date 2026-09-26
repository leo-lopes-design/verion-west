'use client';

import { NavBar, TabHeader, useFlow } from './context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { DetailRow } from '@/components/ui/Rows';
import { PaymentCard, type CardState } from '@/components/ui/PaymentCard';
import { TransferTimeline } from '@/components/ui/TransferTimeline';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  ACCOUNT_HOLDER,
  RECIPIENTS,
  ROUTE_NAMES,
  SEED_TRANSFERS,
  STATUS_LABEL,
  STATUS_TONE,
  recipientOf,
  type Transfer,
} from '@/lib/flow';
import {
  PAYOUT,
  PAYOUT_METHODS,
  describeQuote,
  format,
  formatAmountInput,
  formatPlain,
  quoteTransfer,
} from '@/lib/money';

/* ------------------------------------------------------------------ home */

export function HomeScreen() {
  const { go, transfers, draft, quote } = useFlow();
  const recent = transfers.slice(0, 3);

  return (
    <>
      <TabHeader
        title="Good afternoon"
        trailing={<span className="avatar avatar--sm">{ACCOUNT_HOLDER.initials}</span>}
      />

      <div className="scr__body">
        <div className="card" style={{ padding: 'var(--wu-ref-space-lg)' }}>
          <p className="sectionlabel">Send money</p>
          <p className="t-display-h4" style={{ marginTop: 'var(--wu-ref-space-sm)' }}>
            {format(quote.receive, draft.receiveCurrency)}
          </p>
          <p className="t-body-03 text-secondary" style={{ marginTop: 2 }}>
            arrives when you send {format(quote.send, draft.sendCurrency)} ·{' '}
            {quote.eta.toLowerCase()}
          </p>
          <div style={{ marginTop: 'var(--wu-ref-space-lg)' }}>
            <Button block icon="cash" onClick={() => go({ name: 'amount' })}>
              Start a transfer
            </Button>
          </div>
        </div>

        <div className="ratestrip">
          <span className="t-body-03 text-secondary">Today&apos;s rate</span>
          <span className="t-body-02">
            1 {draft.sendCurrency} = {quote.fxRate.toFixed(4)} {draft.receiveCurrency}
          </span>
        </div>

        <div>
          <p className="sectionlabel" style={{ marginBottom: 'var(--wu-ref-space-sm)' }}>
            Recent
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--wu-ref-space-sm)' }}>
            {recent.map((t) => (
              <TransferTile
                key={t.id}
                transfer={t}
                onClick={() => go({ name: 'tracking', id: t.id })}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function TransferTile({ transfer, onClick }: { transfer: Transfer; onClick: () => void }) {
  const recipient = recipientOf(transfer.recipientId);
  return (
    <button type="button" className="tile" onClick={onClick}>
      <span className="avatar">{recipient.initials}</span>
      <span className="tile__text">
        <span className="tile__title">{recipient.name}</span>
        <span className="tile__sub">
          {recipient.place} · {PAYOUT[transfer.method].label}
        </span>
      </span>
      <span className="tile__meta">
        <span className="tile__amount">{format(transfer.send, transfer.sendCurrency)}</span>
        <Badge tone={STATUS_TONE[transfer.status]}>{STATUS_LABEL[transfer.status]}</Badge>
      </span>
    </button>
  );
}

/* ---------------------------------------------------------------- amount */

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'] as const;
type Key = (typeof KEYS)[number];

/** Nine digits and two decimals at most; a leading zero gives way to the first digit. */
function applyKey(typed: string, key: Key): string {
  if (key === 'del') return typed.slice(0, -1);
  if (key === '.') return typed.includes('.') ? typed : (typed === '' ? '0' : typed) + '.';
  const [, decimals] = typed.split('.');
  if (decimals !== undefined && decimals.length >= 2) return typed;
  if (typed === '0') return key;
  if (typed.replace('.', '').length >= 9) return typed;
  return typed + key;
}

export function AmountScreen() {
  const { draft, setDraft, back, go, quote, amount } = useFlow();
  const blocked = quote.overLimit || amount <= 0;

  return (
    <>
      <NavBar title="Transfer amount" onBack={back} onClose={() => go({ name: 'home' })} />

      <div className="scr__body">
        <Field
          label="You send"
          value={formatAmountInput(draft.amountStr, draft.sendCurrency)}
          state={quote.overLimit ? 'error' : 'default'}
          trailing={
            <CurrencySelect
              value={draft.sendCurrency}
              onChange={(code) => setDraft({ sendCurrency: code })}
              label="Send currency"
            />
          }
          help={
            quote.overLimit
              ? `Over the ${format(quote.limitInSendCurrency, draft.sendCurrency)} daily limit. Lower the amount or split it into two transfers.`
              : `Available balance ${format(quote.balanceInSendCurrency, draft.sendCurrency)}`
          }
        />

        {/* Over the limit there is no quote to show: leaving the numbers up would
            state a result the system already refused. */}
        <div className="summary">
          <DetailRow
            label="Transfer fee"
            value={quote.overLimit ? '—' : format(quote.fee, draft.sendCurrency)}
            muted={quote.overLimit}
          />
          <DetailRow
            label="Exchange rate"
            value={
              quote.overLimit
                ? '—'
                : `1 ${draft.sendCurrency} = ${quote.fxRate.toFixed(4)} ${draft.receiveCurrency}`
            }
            muted={quote.overLimit}
          />
          <DetailRow
            label="Total debited"
            value={quote.overLimit ? '—' : format(quote.send, draft.sendCurrency)}
            muted={quote.overLimit}
          />
        </div>

        <Field
          label="They get"
          value={quote.overLimit ? '—' : formatPlain(quote.receive, draft.receiveCurrency)}
          trailing={
            <CurrencySelect
              value={draft.receiveCurrency}
              onChange={(code) => setDraft({ receiveCurrency: code })}
              label="Payout currency"
            />
          }
          help="Fee calculated in the next step"
        />
        <p className="visually-hidden" aria-live="polite">
          {describeQuote(quote)}
        </p>

        <p className="t-body-03 text-secondary">
          Available for pickup in {PAYOUT[draft.method].eta.toLowerCase()}
        </p>
      </div>

      <div className="scr__footer scr__footer--bare">
        <Button block disabled={blocked} onClick={() => go({ name: 'recipient' })}>
          Continue
        </Button>
      </div>

      <div className="keypad">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={key === 'del' ? 'is-bare' : ''}
            onClick={() => setDraft({ amountStr: applyKey(draft.amountStr, key) })}
            aria-label={key === 'del' ? 'Delete' : key}
          >
            {key === 'del' ? <Icon name="backspace" /> : key}
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------- recipient */

export function RecipientScreen() {
  const { draft, setDraft, back, go } = useFlow();

  return (
    <>
      <NavBar title="Recipient" onBack={back} onClose={() => go({ name: 'home' })} />
      <div className="scr__body">
        <p className="t-body-03 text-secondary">
          Picking someone switches the payout currency to theirs and re-quotes the transfer.
        </p>
        {RECIPIENTS.map((recipient) => (
          <button
            key={recipient.id}
            type="button"
            className="tile"
            data-selected={draft.recipientId === recipient.id}
            onClick={() =>
              setDraft({
                recipientId: recipient.id,
                receiveCurrency: recipient.currency,
                method: recipient.defaultMethod,
              })
            }
          >
            <span className="avatar">{recipient.initials}</span>
            <span className="tile__text">
              <span className="tile__title">{recipient.name}</span>
              <span className="tile__sub">
                {recipient.place}, {recipient.country}
              </span>
            </span>
            <span className="tile__meta">
              <span className="tile__amount">{recipient.currency}</span>
            </span>
          </button>
        ))}
      </div>
      <div className="scr__footer">
        <Button block onClick={() => go({ name: 'method' })}>
          Continue
        </Button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- method */

export function MethodScreen() {
  const { draft, setDraft, back, go, amount } = useFlow();
  const recipient = recipientOf(draft.recipientId);

  return (
    <>
      <NavBar title="How they collect" onBack={back} onClose={() => go({ name: 'home' })} />
      <div className="scr__body">
        <p className="t-body-03 text-secondary">
          The fee and the arrival time change with the method — both update as you choose.
        </p>
        {PAYOUT_METHODS.map((method) => {
          const payout = PAYOUT[method];
          const methodQuote = quoteTransfer(
            amount,
            draft.sendCurrency,
            draft.receiveCurrency,
            method
          );
          return (
            <button
              key={method}
              type="button"
              className="tile"
              data-selected={draft.method === method}
              onClick={() => setDraft({ method })}
              style={{ alignItems: 'flex-start' }}
            >
              <span className="tile__icon">
                <Icon name={payout.icon} />
              </span>
              <span className="tile__text">
                <span className="tile__title">{payout.label}</span>
                <span className="tile__sub">{payout.blurb}</span>
                <span className="tile__sub" style={{ marginTop: 4 }}>
                  Fee {format(methodQuote.fee, draft.sendCurrency)} · {payout.eta}
                </span>
              </span>
            </button>
          );
        })}
        <p className="t-body-03 text-secondary">
          {recipient.name} usually collects by {PAYOUT[recipient.defaultMethod].label.toLowerCase()}
          .
        </p>
      </div>
      <div className="scr__footer">
        <Button block onClick={() => go({ name: 'review' })}>
          Review transfer
        </Button>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- review */

export function ReviewScreen() {
  const { draft, quote, back, go, commit } = useFlow();
  const recipient = recipientOf(draft.recipientId);

  return (
    <>
      <NavBar title="Review" onBack={back} onClose={() => go({ name: 'home' })} />
      <div className="scr__body">
        <div className="card" style={{ padding: 'var(--wu-ref-space-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--wu-ref-space-md)', alignItems: 'center' }}>
            <span className="avatar">{recipient.initials}</span>
            <span className="tile__text">
              <span className="tile__title">{recipient.name}</span>
              <span className="tile__sub">
                {recipient.place}, {recipient.country}
              </span>
            </span>
          </div>
          <p className="t-display-h4" style={{ marginTop: 'var(--wu-ref-space-lg)' }}>
            {format(quote.receive, draft.receiveCurrency)}
          </p>
          <p className="t-body-03 text-secondary">
            {PAYOUT[draft.method].label} · {quote.eta.toLowerCase()}
          </p>
        </div>

        <div className="summary">
          <DetailRow label="You send" value={format(quote.send, draft.sendCurrency)} />
          <DetailRow label="Fee" value={format(quote.fee, draft.sendCurrency)} />
          <DetailRow label="Amount converted" value={format(quote.converted, draft.sendCurrency)} />
          <DetailRow
            label="Exchange rate"
            value={`1 ${draft.sendCurrency} = ${quote.fxRate.toFixed(4)} ${draft.receiveCurrency}`}
          />
          <div className="summary__total">
            <span className="t-body-02 text-secondary">Total charged</span>
            <span className="t-display-h6">{format(quote.send, draft.sendCurrency)}</span>
          </div>
        </div>

        <p className="t-body-03 text-secondary">
          The rate locks when you confirm. Nothing here is a real payment — this prototype takes no
          card, no account and no personal data.
        </p>
      </div>
      <div className="scr__footer">
        <Button block onClick={() => go({ name: 'success', id: commit() })}>
          Confirm and send
        </Button>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- success */

export function SuccessScreen({ id }: { id: string }) {
  const { transfers, go, resetDraft } = useFlow();
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) return null;
  const recipient = recipientOf(transfer.recipientId);

  return (
    <>
      <div className="success">
        <span className="success__badge">
          <Icon name="check" />
        </span>
        <h2 className="t-display-h5" tabIndex={-1} data-screen-title>
          On its way
        </h2>
        <p className="t-body-02 text-secondary">
          {format(transfer.receive, transfer.receiveCurrency)} to {recipient.name} ·{' '}
          {PAYOUT[transfer.method].eta.toLowerCase()}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="sectionlabel">Tracking number</span>
          <span className="success__ref">{transfer.reference}</span>
        </div>
      </div>
      <div className="scr__footer scr__footer--bare">
        <Button block onClick={() => go({ name: 'tracking', id })}>
          Track this transfer
        </Button>
        <Button
          block
          variant="tertiary"
          onClick={() => {
            resetDraft();
            go({ name: 'home' });
          }}
        >
          Back to home
        </Button>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- tracking */

export function TrackingScreen({ id }: { id: string }) {
  const { transfers, back } = useFlow();
  const transfer = transfers.find((t) => t.id === id);
  if (!transfer) return null;
  const recipient = recipientOf(transfer.recipientId);

  return (
    <>
      <NavBar title="Transfer" onBack={back} />
      <div className="scr__body">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--wu-ref-space-sm)',
            alignItems: 'flex-start',
          }}
        >
          <p className="t-display-h4">{format(transfer.send, transfer.sendCurrency)}</p>
          <p className="t-body-02 text-secondary">
            to {recipient.name} — {recipient.place}, {recipient.country}
          </p>
          <Badge tone={STATUS_TONE[transfer.status]}>{STATUS_LABEL[transfer.status]}</Badge>
        </div>

        <TransferTimeline status={transfer.status} />

        <div className="summary">
          <DetailRow label="Tracking number" value={transfer.reference} />
          <DetailRow label="Collection" value={PAYOUT[transfer.method].label} />
          <DetailRow label="Fee" value={format(transfer.fee, transfer.sendCurrency)} />
          <DetailRow
            label="They receive"
            value={format(transfer.receive, transfer.receiveCurrency)}
          />
          <DetailRow label="Placed" value={transfer.placedAt} />
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- activity */

export function ActivityScreen() {
  const { transfers, go } = useFlow();
  return (
    <>
      <TabHeader title="Activity" />
      <div className="scr__body">
        {transfers.length === 0 ? (
          <div className="empty">
            <Icon name="clock" />
            <p className="t-body-02">No transfers yet</p>
          </div>
        ) : (
          transfers.map((t) => (
            <TransferTile
              key={t.id}
              transfer={t}
              onClick={() => go({ name: 'tracking', id: t.id })}
            />
          ))
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ card */

export function CardScreen() {
  const { cardFrozen, cardRevealed, setCardFrozen, setCardRevealed } = useFlow();
  const state: CardState = cardFrozen ? 'frozen' : cardRevealed ? 'active' : 'masked';

  return (
    <>
      <TabHeader title="Card" />
      <div className="scr__body">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBlock: 'var(--wu-ref-space-sm)',
          }}
        >
          <PaymentCard state={state} holder={ACCOUNT_HOLDER.name.toUpperCase()} />
        </div>

        <button
          type="button"
          className="tile"
          aria-pressed={cardRevealed}
          disabled={cardFrozen}
          onClick={() => setCardRevealed(!cardRevealed)}
          style={cardFrozen ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
        >
          <span className="tile__icon">
            <Icon name={cardRevealed ? 'shield' : 'card'} />
          </span>
          <span className="tile__text">
            <span className="tile__title">
              {cardRevealed ? 'Hide card number' : 'Show card number'}
            </span>
            <span className="tile__sub">
              {cardFrozen
                ? 'Unavailable while the card is frozen'
                : 'Only the last four digits are shown by default'}
            </span>
          </span>
        </button>

        <button
          type="button"
          className="tile"
          aria-pressed={cardFrozen}
          onClick={() => {
            const next = !cardFrozen;
            setCardFrozen(next);
            if (next) setCardRevealed(false);
          }}
        >
          <span className="tile__icon">
            <Icon name={cardFrozen ? 'check' : 'alert'} />
          </span>
          <span className="tile__text">
            <span className="tile__title">{cardFrozen ? 'Unfreeze card' : 'Freeze card'}</span>
            <span className="tile__sub">
              {cardFrozen
                ? 'Payments are blocked right now'
                : 'Blocks payments without cancelling the card'}
            </span>
          </span>
        </button>

        <div className="summary">
          <DetailRow label="Card type" value="Virtual · Multi-currency" />
          <DetailRow label="Linked balance" value="USD" />
          <DetailRow label="Spent this month" value={format(412.6, 'USD')} />
          <DetailRow label="Status" value={cardFrozen ? 'Frozen' : 'Active'} muted={cardFrozen} />
        </div>

        <p className="t-body-03 text-secondary">
          A fictional card on a fictional product. No number here belongs to anyone, and nothing on
          this screen touches a payment network.
        </p>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- settings */

export function SettingsScreen({ tokenCount }: { tokenCount: number }) {
  const { resetAll, transfers } = useFlow();
  const seeded = SEED_TRANSFERS.length;
  const added = transfers.length - seeded;
  return (
    <>
      <TabHeader title="Settings" />
      <div className="scr__body">
        <div className="card" style={{ padding: 'var(--wu-ref-space-lg)' }}>
          <p className="sectionlabel">Appearance</p>
          <p
            className="t-body-03 text-secondary"
            style={{ margin: '6px 0 var(--wu-ref-space-lg)' }}
          >
            The toggle flips one attribute on the page root. Every screen in here — and both pages
            outside the device — follow from the same token set.
          </p>
          <ThemeToggle />
        </div>

        <div className="card" style={{ padding: 'var(--wu-ref-space-lg)' }}>
          <p className="sectionlabel">About this prototype</p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--wu-ref-space-md)',
              marginTop: 'var(--wu-ref-space-md)',
            }}
          >
            {/* Counted, not remembered: both figures are measured from their source. */}
            <DetailRow label="Design tokens" value={`${tokenCount} variables`} />
            <DetailRow label="Modes" value="Light / Dark" />
            <DetailRow label="Screens" value={String(ROUTE_NAMES.length)} />
            <DetailRow label="Real money moved" value="None" />
          </div>
        </div>

        <div className="card" style={{ padding: 'var(--wu-ref-space-lg)' }}>
          <p className="sectionlabel">This session</p>
          <p
            className="t-body-03 text-secondary"
            style={{ margin: '6px 0 var(--wu-ref-space-lg)' }}
          >
            Where you are, what you typed and anything you sent survive a reload — they are held for
            this browser tab and nowhere else.{' '}
            {added > 0
              ? `You have added ${added} transfer${added === 1 ? '' : 's'} to the ${seeded} seeded ones.`
              : `Nothing has been added to the ${seeded} seeded transfers yet.`}
          </p>
          <Button variant="secondary" size="md" block onClick={resetAll}>
            Start over
          </Button>
        </div>

        <p className="t-body-03 text-secondary">
          Rates, fees and tracking numbers are invented. Nothing here connects to a payment network.
        </p>
      </div>
    </>
  );
}
