import type { Metadata } from 'next';
import { AppFlow } from '@/components/prototype/AppFlow';
import { DeviceFrame } from '@/components/prototype/DeviceFrame';
import { ROUTE_NAMES, TIMELINE_STEPS } from '@/lib/flow';
import { PAYOUT_METHODS } from '@/lib/money';
import { COUNTS } from '@/lib/tokens';
import { spellCount } from '@/lib/words';

const SCREEN_COUNT = ROUTE_NAMES.length;

export const metadata: Metadata = {
  title: 'App prototype',
  description: `A navigable ${SCREEN_COUNT}-screen remittance flow built from the same tokens and components as the marketing page.`,
};

const STEPS: [title: string, note: string][] = [
  ['Home', 'Quote on the card recomputes from the amount last typed on the keypad.'],
  ['Amount', 'Keypad drives a live quote. Push past the daily limit to reach the error state.'],
  ['Recipient', 'Choosing someone switches the payout currency and re-quotes.'],
  [
    'Collection',
    `Fee and arrival time differ per method — all ${spellCount(PAYOUT_METHODS.length)} are priced as you look.`,
  ],
  ['Review → Send', 'Confirming writes a real record into Activity with its own tracking number.'],
  [
    'Tracking',
    `${spellCount(TIMELINE_STEPS.length, { capital: true })}-step timeline; the connector carries the colour of the step above it.`,
  ],
];

export default function AppPrototypePage() {
  return (
    <main className="wrap" id="main">
      <section className="section">
        <div className="section__head">
          <h1 className="t-display-h3">A prototype you can actually drive</h1>
          <p className="t-body-01 text-secondary">
            {spellCount(SCREEN_COUNT, { capital: true })} screens, real state. Type an amount, pick
            who gets it, choose how they collect, send it — the transfer you create shows up in
            Activity with a tracking number and a timeline. Nothing is a screenshot.
          </p>
          <p className="t-body-02 text-secondary">
            Not one component here is mobile-only. The Button, Input, Badge, timeline and rows are
            the same ones the marketing page uses. Settings, inside the app, carries its own theme
            toggle — the device themes along with the page around it.
          </p>
        </div>

        <div className="proto">
          <DeviceFrame>
            <AppFlow facts={{ tokenCount: COUNTS.ref + COUNTS.sys }} />
          </DeviceFrame>

          <div className="proto__guide">
            <h2 className="t-display-h5">What to try</h2>
            <ol className="proto__steps">
              {STEPS.map(([title, note], i) => (
                <li key={title}>
                  <span className="proto__num">{i + 1}</span>
                  <span>
                    <strong className="t-body-02">{title}</strong>
                    <span className="t-body-03 text-secondary" style={{ display: 'block' }}>
                      {note}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="t-body-03 text-secondary">
              State is held for this browser tab, so it survives a reload; Start over, in Settings,
              clears it. Rates and fees are invented and frozen; the prototype takes no card, no
              account and no personal data.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
