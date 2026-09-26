import type { Metadata } from 'next';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CurrencySelect } from '@/components/ui/CurrencySelect';
import { Field } from '@/components/ui/Field';
import { Icon, ICON_NAMES } from '@/components/ui/Icon';
import { DetailRow, ListRow, TimelineStep } from '@/components/ui/Rows';
import { DAILY_LIMIT_USD, format } from '@/lib/money';
import {
  COUNTS,
  CONTRAST_PAIRS,
  DURATIONS,
  EASES,
  RADIUS,
  SPACE,
  TYPE_ROLES,
  TYPOGRAPHY,
  measureContrast,
  semanticGroup,
  type ContrastPair,
} from '@/lib/tokens';
import { spellCount } from '@/lib/words';

/* The root layout's title template does not reach a page in its own segment. */
export const metadata: Metadata = {
  title: 'Design system — Verion West',
  description:
    'The token tiers, type ramp, components and contrast table of the Verion West design system, all read from one Figma export.',
};

const GROUPS: [string, string][] = [
  [
    'surface',
    'Backgrounds. `fixed-dark` is the only one that never themes — it is identity, not mode.',
  ],
  ['text', 'Text colours, including the ones that live on surfaces which never invert.'],
  ['border', '`default` clears 3:1 in both modes; `subtle` is decorative and does not have to.'],
  ['action', 'Each button type carries four background states and two foregrounds.'],
  [
    'feedback',
    'bg and fg always come from one family — that is what holds contrast when the mode flips.',
  ],
];

const MEASURED = CONTRAST_PAIRS.map((pair) => ({ pair, ...measureContrast(pair) }));
const HELD_TO_MINIMUM = MEASURED.filter(({ pair }) => !('exempt' in pair));
const PASSING = HELD_TO_MINIMUM.filter(
  ({ pair, light, dark }) => light >= pair.min && dark >= pair.min
);

/** WCAG 1.4.3 exempts text on inactive controls, so an exempt pair is shown but never failed. */
function verdict(ratio: number, pair: ContrastPair) {
  if ('exempt' in pair) return 'exempt';
  return ratio >= pair.min ? '✓' : '✗';
}

function Swatches({ group, note }: { group: string; note: string }) {
  const tokens = semanticGroup(group);
  return (
    <div className="stack" style={{ gap: 'var(--wu-ref-space-md)' }}>
      <h3 className="t-label-02 text-secondary">
        {group} — {tokens.length} tokens, {tokens.filter((t) => t.themed).length} themed
      </h3>
      <p className="t-body-03 text-secondary" style={{ maxWidth: '68ch' }}>
        {note}
      </p>
      <div className="swatch-grid">
        {tokens.map((t) => (
          <div className="swatch" key={t.name}>
            <div className="swatch__chip" style={{ background: `var(${t.cssVar})` }} />
            <span className="swatch__name">{t.cssVar}</span>
            <span className="swatch__value">
              {t.themed ? `${t.light} → ${t.dark}` : `${t.light} (fixed)`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="wrap" id="main">
      <section className="section">
        <div className="section__head">
          <h1 className="t-display-h3">A design system in three tiers</h1>
          <p className="t-body-01 text-secondary">
            {COUNTS.ref} primitives feed {COUNTS.sys} semantic tokens, and the semantic tier feeds
            everything you can see. Nothing on this page owns a colour: switching theme flips one
            attribute on <code>&lt;html&gt;</code> and the rest follows.
          </p>
          <p className="t-body-02 text-secondary">
            The values were measured from the public stylesheet of westernunion.com as a study. The
            type ramp, the radii and 24 of the colours came from there. The dark mode, four derived
            colours and the display typeface substitution are my interpretation, and the product on
            the other two routes is fictional.
          </p>
          <div className="demo-grid" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
            <Badge tone="success">{COUNTS.ref + COUNTS.sys} variables</Badge>
            <Badge tone="info">2 modes</Badge>
            <Badge tone="warning">{CONTRAST_PAIRS.length} contrast pairs measured</Badge>
          </div>
          <div className="demo-grid" style={{ marginTop: 'var(--wu-ref-space-lg)' }}>
            <ButtonLink href="/site" size="md">
              See it as a marketing page
            </ButtonLink>
            <ButtonLink href="/app" variant="secondary" size="md">
              Drive the app prototype
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Colour</h2>
          <p className="t-body-01 text-secondary">
            Every semantic token is an alias onto a primitive, never a raw value. Where light and
            dark point at the same primitive, the token never enters the dark block of the CSS —
            which is how a brand surface stays put while the page around it turns.
          </p>
        </div>
        <div className="stack" style={{ gap: 'var(--wu-ref-space-4xl)' }}>
          {GROUPS.map(([g, note]) => (
            <Swatches key={g} group={g} note={note} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Typography</h2>
          <p className="t-body-01 text-secondary">
            {spellCount(TYPOGRAPHY.length, { capital: true })} styles, each bound to a role (
            <code>type/body</code>, <code>type/page-title</code>) which in turn points at the raw
            ramp. Move the role and everything using it moves; move the ramp and every role moves.
          </p>
        </div>
        <div>
          {TYPOGRAPHY.map(([name, meta]) => {
            const role = TYPE_ROLES[meta.role];
            if (!role) throw new Error(`Text style "${name}" names an unknown role "${meta.role}"`);
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return (
              <div className="specimen-row" key={name}>
                <div className="specimen-row__meta">
                  <span className="t-body-02">{name}</span>
                  <span className="t-body-03 text-secondary">
                    {meta.family === 'display' ? 'Archivo' : 'Roboto'} · weight {meta.weight}
                  </span>
                  <span className="specimen-row__token">type/{meta.role}</span>
                  <span className="t-body-03 text-secondary">
                    {role.size.split('.').pop()} / {role.line.split('.').pop()}
                  </span>
                </div>
                <div className="specimen-row__sample" style={{ font: `var(--wu-font-${slug})` }}>
                  Send money across the world
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Space, radius and elevation</h2>
        </div>
        <div className="stack" style={{ gap: 'var(--wu-ref-space-4xl)' }}>
          <div className="ruler">
            {SPACE.map(([k, v]) => (
              <div className="ruler__cell" key={k}>
                <div className="ruler__bar" style={{ width: Math.max(v, 2) }} />
                <span className="t-body-03 text-secondary">
                  space/{k} · {v}
                </span>
              </div>
            ))}
          </div>
          <div className="ruler">
            {RADIUS.map(([k, v]) => (
              <div className="ruler__cell" key={k} style={{ width: 150 }}>
                <div className="ruler__box" style={{ borderRadius: v }} />
                <span className="t-body-03 text-secondary">
                  radius/{k} · {v}
                </span>
              </div>
            ))}
          </div>
          <div className="demo-grid">
            {(['sm', 'md', 'lg'] as const).map((lvl) => (
              <div
                key={lvl}
                className="card"
                style={{ boxShadow: `var(--wu-elevation-${lvl})`, width: 220 }}
              >
                <p className="t-display-h6">Elevation/{lvl}</p>
                <p className="t-body-03 text-secondary" style={{ marginTop: 8 }}>
                  Shadows carry more weight in dark, where the ground is already black.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Icons</h2>
          <p className="t-body-01 text-secondary">
            {spellCount(ICON_NAMES.length, { capital: true })} drawings at 24×24, all painted with{' '}
            <code>currentColor</code> — an icon never disagrees with the text beside it.
          </p>
        </div>
        <div className="icon-grid">
          {ICON_NAMES.map((n) => (
            <div className="icon-cell" key={n}>
              <Icon name={n} title={n} />
              <span>{n}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Components</h2>
          <p className="t-body-01 text-secondary">
            These are the same instances the marketing page and the app prototype render. There is
            no separate mobile set.
          </p>
        </div>

        <div className="stack" style={{ gap: 'var(--wu-ref-space-4xl)' }}>
          <div className="stack" style={{ gap: 'var(--wu-ref-space-lg)' }}>
            <h3 className="t-label-02 text-secondary">Button — 3 types × 2 sizes × icon slot</h3>
            <div className="demo-grid">
              <Button variant="primary">Send money</Button>
              <Button variant="secondary">Create account</Button>
              <Button variant="tertiary">Log in</Button>
              <Button variant="primary" disabled>
                Continue
              </Button>
            </div>
            <div className="demo-grid">
              <Button variant="primary" size="md" icon="cash">
                Cash pickup
              </Button>
              <Button variant="secondary" size="md" icon="bank">
                Bank deposit
              </Button>
              <Button variant="tertiary" size="md" icon="clock">
                View history
              </Button>
            </div>
          </div>

          <div className="stack" style={{ gap: 'var(--wu-ref-space-lg)' }}>
            <h3 className="t-label-02 text-secondary">Input — states</h3>
            <div className="demo-grid" style={{ alignItems: 'flex-start' }}>
              <div style={{ width: 300 }}>
                <Field
                  label="You send"
                  value="250.00"
                  help="Fee shown before you confirm"
                  trailing={<CurrencySelect label="Send currency" defaultValue="USD" />}
                />
              </div>
              <div style={{ width: 300 }}>
                <Field
                  label="You send"
                  value="6,500.00"
                  state="error"
                  help={`Over the ${format(DAILY_LIMIT_USD, 'USD')} daily limit.`}
                  trailing={<CurrencySelect label="Send currency" defaultValue="USD" />}
                />
              </div>
              <div style={{ width: 300 }}>
                <Field
                  label="You send"
                  value="Unavailable"
                  state="disabled"
                  help="Corridor closed"
                />
              </div>
            </div>
          </div>

          <div className="stack" style={{ gap: 'var(--wu-ref-space-lg)' }}>
            <h3 className="t-label-02 text-secondary">Badge, list and timeline</h3>
            <div className="demo-grid">
              <Badge tone="info">Processing</Badge>
              <Badge tone="success">Delivered</Badge>
              <Badge tone="error">Rejected</Badge>
              <Badge tone="warning">Ready to collect</Badge>
            </div>
            <div className="list">
              <ListRow
                primary="Maria Silva — Cash pickup"
                secondary="São Paulo, Brazil · 8472 1193 04"
                amount="$250.00"
                tone="success"
                status="Delivered"
              />
              <ListRow
                primary="John Pereira — Bank deposit"
                secondary="Lisbon, Portugal · 5590 2284 71"
                amount="$480.00"
                tone="info"
                status="Processing"
              />
            </div>
            <div className="card" style={{ maxWidth: 420 }}>
              <div className="timeline">
                <TimelineStep state="done" title="Transfer submitted" when="Payment authorised" />
                <TimelineStep
                  state="active"
                  title="Funds converted"
                  when="Rate locked at submission"
                />
                <TimelineStep state="pending" title="Ready to collect" when="Pending" last />
              </div>
              <div
                className="stack"
                style={{ gap: 'var(--wu-ref-space-md)', marginTop: 'var(--wu-ref-space-lg)' }}
              >
                <DetailRow label="Tracking number" value="5590 2284 71" />
                <DetailRow label="Fee" value="$4.08" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Contrast</h2>
          <p className="t-body-01 text-secondary">
            Computed at build time from these same tokens, not copied out of a spreadsheet. Text
            needs 4.5:1, non-text needs 3:1. {PASSING.length} of {HELD_TO_MINIMUM.length} pairs
            clear their minimum in both modes. Disabled text is listed too: it is exempt, and the
            table says so rather than leaving it out.
          </p>
        </div>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Pair</th>
                <th>Minimum</th>
                <th>Light</th>
                <th>Dark</th>
              </tr>
            </thead>
            <tbody>
              {MEASURED.map(({ pair, light, dark }) => (
                <tr key={pair.label}>
                  <td>
                    {pair.label}
                    <br />
                    <span className="t-body-03 text-secondary">
                      {pair.fg} on {pair.bg}
                      {'exempt' in pair ? ' · exempt under WCAG 1.4.3, disabled fields only' : ''}
                    </span>
                  </td>
                  <td className="num">{pair.min}</td>
                  <td className="num">
                    {light} {verdict(light, pair)}
                  </td>
                  <td className="num">
                    {dark} {verdict(dark, pair)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Motion</h2>
          <p className="t-body-01 text-secondary">
            Durations and curves are variables too — TIMING and EASING types, which almost nobody
            uses. The app prototype drives its screen transitions from these.
          </p>
        </div>
        <div className="demo-grid">
          {DURATIONS.map(([k, v]) => (
            <div key={k} className="card" style={{ width: 200 }}>
              <p className="t-display-h6">{k}</p>
              <p className="t-body-03 text-secondary">{Math.round(v * 1000)}ms</p>
            </div>
          ))}
        </div>
        <div
          className="stack"
          style={{ gap: 'var(--wu-ref-space-sm)', marginTop: 'var(--wu-ref-space-xl)' }}
        >
          {EASES.map(([k, v]) => (
            <p className="t-body-03 text-secondary" key={k}>
              <strong style={{ color: 'var(--wu-text-primary)' }}>motion/ease/{k}</strong> —{' '}
              <span style={{ fontFamily: 'ui-monospace, monospace' }}>{v}</span>
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}
