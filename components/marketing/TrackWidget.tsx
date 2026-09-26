'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { DetailRow } from '@/components/ui/Rows';
import { TransferTimeline } from '@/components/ui/TransferTimeline';
import { SEED_TRANSFERS, STATUS_LABEL, STATUS_TONE, recipientOf } from '@/lib/flow';
import { PAYOUT, format } from '@/lib/money';

type Lookup = { kind: 'found'; id: string } | { kind: 'missing' } | null;

const digitsOnly = (reference: string) => reference.replace(/\s/g, '');

export function TrackWidget() {
  const [value, setValue] = useState('');
  const [lookup, setLookup] = useState<Lookup>(null);

  function lookUp(reference: string) {
    setValue(reference);
    const hit = SEED_TRANSFERS.find((t) => digitsOnly(t.reference) === digitsOnly(reference));
    setLookup(hit ? { kind: 'found', id: hit.id } : { kind: 'missing' });
  }

  const transfer =
    lookup?.kind === 'found' ? SEED_TRANSFERS.find((t) => t.id === lookup.id) : undefined;
  const recipient = transfer ? recipientOf(transfer.recipientId) : undefined;

  return (
    <div className="track">
      <form
        className="track__form"
        onSubmit={(e) => {
          e.preventDefault();
          lookUp(value);
        }}
      >
        <Field
          label="Tracking number"
          placeholder="0000 0000 00"
          value={value}
          inputMode="numeric"
          state={lookup?.kind === 'missing' ? 'error' : 'default'}
          onChange={(v) => {
            setValue(v);
            setLookup(null);
          }}
          help={
            lookup?.kind === 'missing'
              ? 'No transfer with that number. Try one of the samples below.'
              : undefined
          }
        />
        <Button type="submit" size="md">
          Track
        </Button>
      </form>

      <div className="track__chips">
        <span className="t-body-03 text-secondary" style={{ alignSelf: 'center' }}>
          Sample numbers:
        </span>
        {SEED_TRANSFERS.map((t) => (
          <button
            key={t.id}
            type="button"
            className="track__chip"
            onClick={() => lookUp(t.reference)}
          >
            {t.reference}
          </button>
        ))}
      </div>

      {transfer && recipient ? (
        <div className="track__result">
          <div className="track__head">
            <span className="t-display-h5">{format(transfer.send, transfer.sendCurrency)}</span>
            <Badge tone={STATUS_TONE[transfer.status]}>{STATUS_LABEL[transfer.status]}</Badge>
          </div>
          <p className="t-body-02 text-secondary">
            to {recipient.name} — {recipient.place}, {recipient.country}
          </p>
          <TransferTimeline status={transfer.status} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--wu-ref-space-md)' }}>
            <DetailRow label="Collection" value={PAYOUT[transfer.method].label} />
            <DetailRow
              label="They receive"
              value={format(transfer.receive, transfer.receiveCurrency)}
            />
            <DetailRow label="Placed" value={transfer.placedAt} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
