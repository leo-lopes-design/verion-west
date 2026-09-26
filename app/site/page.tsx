import type { Metadata } from 'next';
import Link from 'next/link';
import { Mark } from '@/components/Mark';
import { Motion } from '@/components/Motion';
import { BandScrim } from '@/components/marketing/BandScrim';
import { Calculator } from '@/components/marketing/Calculator';
import { TrackWidget } from '@/components/marketing/TrackWidget';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ListRow } from '@/components/ui/Rows';
import { SEED_TRANSFERS, STATUS_LABEL, STATUS_TONE, recipientOf } from '@/lib/flow';
import { CURRENCY_LIST, PAYOUT, PAYOUT_METHODS, format } from '@/lib/money';
import { spellCount } from '@/lib/words';

export const metadata: Metadata = {
  title: 'Marketing',
  description:
    'A marketing surface driven entirely by the token layer, with a calculator that actually recomputes.',
};

const NAV = [
  { href: '#send', label: 'Send money' },
  { href: '#track', label: 'Track a transfer' },
  { href: '#collect', label: 'Find an agent' },
];

/** Every figure is the demo's own: this is a fictional service, not a real network. */
const HERO_FACTS: [figure: string, caption: string][] = [
  [String(CURRENCY_LIST.length), 'currencies, each quoted before you confirm'],
  [PAYOUT.cash.eta, 'to cash pickup'],
  ['Both ends', 'see the same status'],
];

const FOOTER: [string, string[]][] = [
  ['Send', ['Send online', 'Send in person', 'Payment methods', 'Fees and rates']],
  ['Collect', ['Cash pickup', 'Bank deposit', 'Digital wallet', 'Find an agent']],
  ['Support', ['Track a transfer', 'Help centre', 'Contact us', 'Report fraud']],
  ['Company', ['About the company', 'Careers', 'Privacy', 'Terms of use']],
];

/**
 * Card copy overrides the generic blurb in lib/money.ts: a marketing card and
 * an in-app method picker are not saying the same thing to the same person at
 * the same moment.
 */
const METHOD_COPY: Record<string, string> = {
  cash: 'They collect at a partner agent with the tracking number and a photo ID. Neither of you needs an account.',
  bank: 'Straight into the account already on file. The cheapest route, and the one nobody has to leave home for.',
  wallet: 'Credited to their wallet, spendable the moment it arrives.',
};

/* Recomputed for the oversized parallax element. With the photograph one
 * travel taller than the band, the vertical overflow shrinks and these
 * percentages move with it: band 1 lands the crown at source y=92 and the
 * phone at y=981; band 2 keeps the framing the comp had, source y 40 to 823. */
const CROP = { c6: '50% 50%', c7: '50% 0%' };

export default function MarketingPage() {
  return (
    <main id="main">
      <Motion />

      <header className="mkt-header">
        <div className="wrap wrap--wide mkt-header__inner">
          <Mark tone="inverse" />
          <nav className="mkt-nav" aria-label="Main">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          {/* Both go to the app prototype, which opens signed in: there are no accounts. */}
          <span className="demo-grid" style={{ gap: 'var(--wu-ref-space-md)' }}>
            <ButtonLink href="/app" variant="tertiary" size="md">
              Log in
            </ButtonLink>
            <ButtonLink href="/app" variant="secondary" size="md">
              Sign up
            </ButtonLink>
          </span>
        </div>
      </header>

      {/* No photograph here. The frame fill in Figma is a flat #FFDD00 and the
          layer on top of it — named after a portrait — carries only a gradient. */}
      <section className="hero" id="send">
        <span className="hero__wash" aria-hidden="true" />
        <div className="wrap wrap--wide hero__inner">
          <div className="stack" style={{ gap: 'var(--wu-ref-space-xl)' }}>
            {/* 64/64 and a hard break after "is the" — both read off the Figma
                node, which carries a literal \n. The break is explicit rather
                than left to the box width so it survives a font swap. */}
            <h1 className="t-display-h2 hero__title" style={{ maxWidth: 777 }} data-reveal>
              The amount you see is the
              <br />
              amount they collect
            </h1>
            {/* 634px, the comp's box. It fits inside the contrast zone because
                the veil now holds to 20% — at the box's right edge the wash is
                still at alpha 0.474, just over the 0.464 that white needs. */}
            <p className="t-body-01 hero__lede" style={{ maxWidth: 634 }} data-reveal>
              Fee and exchange rate are settled before you confirm, not after. Pick cash pickup, a
              bank deposit or a digital wallet — the figure in the calculator is the one that lands.
            </p>
            <div className="hero__facts">
              {HERO_FACTS.map(([figure, caption], i) => (
                <span
                  className="hero__fact"
                  key={caption}
                  data-reveal
                  style={{ '--i': i + 2 } as React.CSSProperties}
                >
                  <span className="t-display-h6">{figure}</span>
                  <span className="t-body-03">{caption}</span>
                </span>
              ))}
            </div>
          </div>

          <div data-reveal="zoom" style={{ '--i': 3 } as React.CSSProperties}>
            <Calculator />
          </div>
        </div>
      </section>

      <section className="section" id="collect">
        <div className="wrap wrap--wide">
          <div className="section__head section__head--wide" data-reveal>
            <h2 className="t-display-h4">
              {spellCount(PAYOUT_METHODS.length, { capital: true })} ways the money lands
            </h2>
            <p className="t-body-01 text-secondary">
              The person receiving picks the format. Fee and arrival time move with that choice,
              which is why the calculator prices all {spellCount(PAYOUT_METHODS.length)} instead of
              quoting an average.
            </p>
          </div>
          <div className="methods">
            {PAYOUT_METHODS.map((m, i) => (
              <article
                className="card card--elevated"
                key={m}
                data-reveal="zoom"
                style={{ '--i': i } as React.CSSProperties}
              >
                <span className="method__icon">
                  <Icon name={PAYOUT[m].icon} />
                </span>
                <h3 className="t-display-h6">{PAYOUT[m].label}</h3>
                <p
                  className="t-body-02 text-secondary"
                  style={{ margin: 'var(--wu-ref-space-md) 0' }}
                >
                  {METHOD_COPY[m]}
                </p>
                <p className="t-label-02">{PAYOUT[m].eta}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* First media band. Photograph at the Figma crop, the Figma gradient
          stack, on-media text. Parallax drives --p on the image only. */}
      <section className="media quoteband">
        <img
          className="media__shot"
          src="/media/C6-doorway.jpg"
          alt=""
          aria-hidden="true"
          width={1600}
          height={1073}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: CROP.c6 }}
        />
        <BandScrim variant="quote" />
        <div className="wrap wrap--wide media__inner quoteband__inner">
          <div className="quoteband__col" data-reveal>
            <figure style={{ margin: 0 }}>
              <span className="quoteband__mark" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="quoteband__quote">
                Twenty-six years, the same amount, the same day of the month. It stopped being a
                transfer a long time ago. It&rsquo;s how she knows I&rsquo;m still here.
              </blockquote>
              <span className="quoteband__mark quoteband__mark--close" aria-hidden="true">
                &rdquo;
              </span>
              {/* Attribution matters more than the line does. A quote with no name
                  is advertising; a name with no disclosure is a fabricated
                  testimonial. This is neither: it is the research persona
                  speaking, it says so, and the page it links to shows every trait
                  behind it and how that trait is known. The 26 years is not
                  decoration — it is the measured average tenure of a sender in
                  the largest US corridor. */}
              <figcaption className="quoteband__by">
                Marcos, 45 · sends monthly, United States to Brazil
                <span className="quoteband__note">
                  A research persona, not a customer —{' '}
                  <Link href="/personas">see how each trait is known</Link>
                </span>
              </figcaption>
            </figure>
            <div className="demo-grid">
              <ButtonLink href="/app" size="md">
                Open an account today
              </ButtonLink>
              <ButtonLink href="#collect" variant="secondary" size="md">
                Check our services
              </ButtonLink>
            </div>
          </div>
        </div>
        {/* The comp's carousel dots, kept as decoration: there is one slide, so
            announcing a position in a set would describe a control that does not exist. */}
        <div className="media__inner quoteband__dots" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`quoteband__dot${i === 0 ? ' quoteband__dot--current' : ''}`}
            />
          ))}
        </div>
      </section>

      <section className="section" id="track" style={{ background: 'var(--wu-surface-sunken)' }}>
        <div className="wrap wrap--wide">
          <div className="section__head section__head--wide" data-reveal>
            <h2 className="t-display-h4">Know where it is without asking</h2>
            <p className="t-body-01 text-secondary">
              Every transfer carries one status — the same one on the site, in the app and at the
              counter. {spellCount(SEED_TRANSFERS.length, { capital: true })} sample tracking
              numbers are seeded below.
            </p>
          </div>
          <TrackWidget />
          <div className="list" style={{ marginTop: 'var(--wu-ref-space-4xl)' }}>
            {SEED_TRANSFERS.map((t) => {
              const recipient = recipientOf(t.recipientId);
              return (
                <ListRow
                  key={t.id}
                  primary={`${recipient.name} — ${PAYOUT[t.method].label}`}
                  secondary={`${recipient.place}, ${recipient.country} · ${t.reference}`}
                  amount={format(t.send, t.sendCurrency)}
                  tone={STATUS_TONE[t.status]}
                  status={STATUS_LABEL[t.status]}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Second media band. Same three layers, copy on the other side, and the
          gradient runs the other way because the subject does. */}
      <section className="media closeband media--flip">
        <img
          className="media__shot"
          src="/media/C7-window.jpg"
          alt=""
          aria-hidden="true"
          width={1600}
          height={1073}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: CROP.c7 }}
        />
        <BandScrim variant="close" />
        <div className="wrap wrap--wide media__inner closeband__inner">
          <div className="closeband__col" data-reveal>
            {/* 487 and 640 — the comp's two boxes, which is what puts the
                headline on two lines and the body on two. */}
            <h2 className="t-display-h3 media__title" style={{ maxWidth: 487 }}>
              Send the first one in a few minutes
            </h2>
            {/* 320, not the comp's 640. Probed across the band in Light: on the
                comp's own gradient, text/secondary clears 4.5:1 only out to
                about x=370, and the 640 box runs to x=688 where it lands at
                1.99:1. The gradient is the comp's and stays; the paragraph is
                what moves. It costs two extra lines. */}
            <p className="t-body-01 media__body" style={{ maxWidth: 320 }}>
              Opening an account costs nothing. You will see the full cost of a transfer before you
              commit to it.
            </p>
            <div className="demo-grid">
              <ButtonLink href="/app" size="md">
                Open an account today
              </ButtonLink>
              <ButtonLink href="#collect" variant="secondary" size="md">
                Check our services
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <footer className="mkt-footer">
        <div className="wrap wrap--wide mkt-footer__inner">
          <div className="mkt-footer__cols">
            <div className="stack" style={{ gap: 'var(--wu-ref-space-lg)' }} data-reveal="zoom">
              <Mark tone="fixed" />
              <p className="t-body-03" style={{ color: 'var(--wu-text-on-fixed-dark-secondary)' }}>
                International money transfer service.
              </p>
            </div>
            {/* Left to right: --i is the column index, so the cascade runs the
                way the eye does. */}
            {FOOTER.map(([title, items], i) => (
              <div key={title} data-reveal style={{ '--i': i + 1 } as React.CSSProperties}>
                <h3>{title}</h3>
                <ul>
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <hr />
          <p className="mkt-footer__legal">
            DEMO — a study reconstruction. No affiliation with, endorsement by, or approval from
            Western Union. The Verion West logo is an original drawing; the Western Union name and
            marks belong to Western Union Holdings, Inc. Amounts, fees and rates shown here are
            fictional.
          </p>
          <p className="mkt-footer__legal">
            This footer is also the argument of the page, and the argument changed once the file was
            measured. The footer uses <code>surface/fixed-dark</code>, which holds one value in both
            modes because it carries identity. The hero and the two photographic bands use{' '}
            <code>surface/brand-veil</code> and <code>surface/media-veil</code>, which do the
            opposite: the ground under them never moves, and the veil over them does — so the copy
            can stay legible in whichever mode you are reading in. Fixed and themed are not a
            hierarchy here. They are two jobs.
          </p>
        </div>
      </footer>
    </main>
  );
}
