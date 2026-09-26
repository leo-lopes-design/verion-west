import type { Metadata } from 'next';
import { JsonPreview } from '@/components/personas/JsonPreview';
import { PersonaDownload } from '@/components/personas/PersonaDownload';
import { Badge, type Tone } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { DetailRow } from '@/components/ui/Rows';
import { PERSONAS, toPersonaJson, type Mark } from '@/lib/personas';
import { spellCount } from '@/lib/words';

export const metadata: Metadata = {
  title: 'Personas',
  description:
    'Three synthetic personas for a fictional remittance product, with every trait marked by how it is known.',
};

/**
 * The personas route.
 *
 * A design system demo that invents three users and presents them as findings
 * would be doing the exact thing this demo argues against everywhere else. So
 * every trait on this page carries how it is known, and the page keeps the
 * three marks visible rather than hiding them in a footnote.
 */

const MARK_TONE: Record<Mark, Tone> = {
  product: 'success',
  sourced: 'info',
  hypothesis: 'warning',
};

/** The panel repeats the marks in a smaller form, so it repeats the meaning too. */
const MARK_TITLE: Record<Mark, string> = {
  product: 'Derived from something built — a token, a fee, a seeded value, a screen.',
  sourced: 'Has a public source about remittance behaviour generally, not about this product.',
  hypothesis: 'An assumption, still unverified, marked so it cannot quietly become a fact.',
};

function Trait({ mark, children }: { mark: Mark; children: React.ReactNode }) {
  return (
    <div className="trait">
      <span className="trait__mark">
        <Badge tone={MARK_TONE[mark]}>{mark}</Badge>
      </span>
      <span className="trait__text">{children}</span>
    </div>
  );
}

const CAST: {
  file: string;
  name: string;
  age: string;
  tone: Tone;
  verdict: string;
  why: string;
}[] = [
  {
    file: 'C8-market.jpg',
    name: 'C8-market',
    age: 'Forties',
    tone: 'success',
    verdict: 'Strongest',
    why: 'Sits on the peak of the propensity curve.',
  },
  {
    file: 'C7b-window.jpg',
    name: 'C7b-window',
    age: 'Mid-forties',
    tone: 'success',
    verdict: 'Recast',
    why: 'Was cast in her twenties — the lowest adult band and the stereotype the evidence refuses. Age is the only thing that changed.',
  },
  {
    file: 'C5-kitchen.jpg',
    name: 'C5-kitchen',
    age: 'Late thirties',
    tone: 'success',
    verdict: 'Strong',
    why: 'Inside the band, just under the peak.',
  },
  {
    file: 'C6-doorway.jpg',
    name: 'C6-doorway',
    age: 'Sixties',
    tone: 'info',
    verdict: 'Defensible',
    why: 'Above the peak, but 21% still send at 70+, and 45-and-over is the largest band among Filipino workers abroad.',
  },
];

export default function PersonasPage() {
  return (
    <main className="wrap" id="main">
      <section className="section">
        <div className="section__head">
          <h1 className="t-display-h3">Who this is for</h1>
          <p className="t-body-01 text-secondary">
            {spellCount(PERSONAS.length, { capital: true })} people, and only one of them ever opens
            the app. That is not a segmentation exercise — it is what the product already assumes.
            Three payout methods with different fees, speeds and consequences are three different
            lives on the receiving end.
          </p>
          <p className="t-body-02 text-secondary">
            These personas are <strong>synthetic</strong>. Nobody was interviewed, because the
            product is fictional. What grounds them instead is the product itself — the currencies,
            the fees, the daily limit, what the Activity screen chooses to show — plus public
            research on remittance behaviour generally. Where neither of those says anything, the
            page says so rather than filling the gap.
          </p>
        </div>

        <div className="card legend" style={{ maxWidth: '68ch' }}>
          <h2 className="t-label-01 text-secondary">How to read every claim below</h2>
          <div className="legend__row">
            <Badge tone="success">product</Badge>
            <span className="t-body-03 text-secondary">
              Derived from something built — a token, a fee, a seeded value, a screen.
            </span>
          </div>
          <div className="legend__row">
            <Badge tone="info">sourced</Badge>
            <span className="t-body-03 text-secondary">
              Has a public source about remittance behaviour. Not about this product, and not about
              Western Union&rsquo;s own customers — the company publishes no customer demographics
              at all.
            </span>
          </div>
          <div className="legend__row">
            <Badge tone="warning">hypothesis</Badge>
            <span className="t-body-03 text-secondary">
              My assumption. Still unverified, and marked so it cannot quietly become a fact.
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The {spellCount(PERSONAS.length)}</h2>
        </div>

        <div className="persona-grid">
          {PERSONAS.map((p) => (
            <article key={p.id} className={`card persona${p.primary ? ' persona--primary' : ''}`}>
              <div className="persona__head">
                <img
                  className="persona__avatar"
                  src={p.avatar}
                  alt={p.avatarAlt}
                  width={512}
                  height={512}
                />
                <div className="persona__ident">
                  <span className="persona__role">{p.role}</span>
                  <h3 className="t-display-h5">{p.name}</h3>
                </div>
              </div>

              <p className="t-body-02 persona__job">{p.job}</p>

              <dl className="persona__panel">
                {p.panel.map((row) => (
                  <div className="persona__row" key={row.label}>
                    <dt className="persona__key">{row.label}</dt>
                    <dd className="persona__val">
                      {row.value}
                      <span
                        className={`persona__mark persona__mark--${row.mark}`}
                        title={MARK_TITLE[row.mark]}
                      >
                        {row.mark}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="trait-list">
                {p.traits.map((t, i) => (
                  <Trait key={i} mark={t.mark}>
                    {t.text}
                  </Trait>
                ))}
              </div>

              {/* A fixed date, not `new Date()`. The JSON rendered on the server
                  has to match the JSON rendered on the client or React reports a
                  hydration mismatch — and a persona whose only changing field is
                  a timestamp is not a persona that changed. The download stamps
                  the real time, because that file does leave the building. */}
              <JsonPreview
                value={toPersonaJson(p, '2026-09-14T00:00:00.000Z')}
                filename={`${p.id}.persona.json`}
                label={`The persona JSON for ${p.name}`}
              />

              <PersonaDownload persona={p} />
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The correction</h2>
          <p className="t-body-01 text-secondary">
            The first version of this page put the sender at 25–45. That number had no source — it
            was instinct wearing the costume of data. One research pass later, the correction went{' '}
            <strong style={{ color: 'var(--wu-text-primary)' }}>up, not down</strong>. The casting
            the evidence refuses is not the older man; it is the recent arrival in his twenties,
            which happens to be the image the category reaches for most.
          </p>
        </div>

        <div className="demo-grid" style={{ alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: 1, minWidth: 280 }}>
            <h3 className="t-label-01 text-secondary">Propensity to send money abroad, by age</h3>
            <div
              className="stack"
              style={{ gap: 'var(--wu-ref-space-md)', marginTop: 'var(--wu-ref-space-lg)' }}
            >
              <DetailRow label="18–29" value="28%" />
              <DetailRow label="40–49" value="45% — peak" />
              <DetailRow label="70 and over" value="21%" />
            </div>
            <p className="t-body-03 text-secondary" style={{ marginTop: 'var(--wu-ref-space-lg)' }}>
              Statistics Canada, Study on International Money Transfers. Data year 2017, n≈23,000.
            </p>
          </div>

          <div className="card" style={{ flex: 1, minWidth: 280 }}>
            <h3 className="t-label-01 text-secondary">Digital adoption, by the same ages</h3>
            <div
              className="stack"
              style={{ gap: 'var(--wu-ref-space-md)', marginTop: 'var(--wu-ref-space-lg)' }}
            >
              <DetailRow label="18–29 using electronic transfer" value="25%" />
              <DetailRow label="60–69 using electronic transfer" value="7%" />
              <DetailRow label="Senders still using a counter" value="45%" />
              <DetailRow label="Senders holding a bank account" value="80%" />
            </div>
            <p className="t-body-03 text-secondary" style={{ marginTop: 'var(--wu-ref-space-lg)' }}>
              The two curves point in opposite directions. That is the tension this product carries.
            </p>
          </div>
        </div>

        <div className="card" style={{ marginTop: 'var(--wu-ref-space-2xl)', maxWidth: '68ch' }}>
          <h3 className="t-display-h6">What this changed in the interface</h3>
          <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
            An app-first product selects the young end of an audience whose money sits at the old
            end. That reclassifies a finding the visual review had filed as taste: section headings
            rendering at 12px, smaller than the 16px body they introduce. Against a primary user of
            25 that is a typographic quibble. Against a primary user of 45 it is an access debt.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The second correction: who decides</h2>
          <p className="t-body-01 text-secondary">
            An earlier version of this page carried an open question with a warning attached: that
            Western Union&rsquo;s own research showed the receiver drives the choice of channel and
            brand, and that if it held, the hierarchy here was upside down. It was chased down. The
            answer is more interesting than either the question or the fear.
          </p>
        </div>

        <div className="stack" style={{ gap: 'var(--wu-ref-space-xl)', maxWidth: '68ch' }}>
          <div className="card">
            <h3 className="t-display-h6">She does not choose the company. She influences it.</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              The figure behind the claim is a Western Union&mdash;commissioned survey, reported in
              December 2022 on a single national cut (Saudi Arabia, n&gt;1,500):{' '}
              <em>
                &ldquo;Sixty-eight percent also say their receiver influences the company they
                choose to send money through.&rdquo;
              </em>{' '}
              The verb is <strong style={{ color: 'var(--wu-text-primary)' }}>influences</strong>,
              and the sender is still the one who <em>chooses</em>. In the same period a Western
              Union executive scoped receiver influence to the frequency and amounts of transfers —
              not to brand. The global version of the statistic could not be checked: the corporate
              site was unavailable when this research was done (2026-09-15).
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">
              She does decide how it lands — that part is contractual
            </h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              Stronger than any survey, and easy to miss because it sits in the terms rather than in
              a press release: Western Union&rsquo;s Online Money Transfer conditions state that{' '}
              <em>
                &ldquo;the Sender authorizes Us to honor the Receiver&rsquo;s choice of method to
                receive funds or the pay-out currency even if it differs from the Sender&rsquo;s
                instructions.&rdquo;
              </em>{' '}
              Not the brand — the{' '}
              <strong style={{ color: 'var(--wu-text-primary)' }}>method</strong> and the{' '}
              <strong style={{ color: 'var(--wu-text-primary)' }}>currency</strong>. The
              receiver&rsquo;s authority is real, and it is narrower and sharper than &ldquo;she
              decides&rdquo;.
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">The product had already conceded it</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              Nothing on this page was reordered, because nothing needed to be. Marcos stays primary
              for a reason that is not a judgement about power: he is the only one who opens the
              app. But the screen where the payout method gets picked is titled{' '}
              <strong style={{ color: 'var(--wu-text-primary)' }}>How they collect</strong>, every
              recipient in the seed carries a default method, and the copy under each one reads
              &ldquo;usually collects by&hellip;&rdquo;. That is not a sender choosing. That is a
              sender reporting a fact about somebody else&rsquo;s life. The interface was already
              modelling a constrained decision — the research named it.
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">What we are still buying on trust</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              One survey, commissioned by Western Union, four years old, one country, no independent
              corroboration found. We agreed to treat Western Union as a credible source — and on
              that agreement the finding still does not reach &ldquo;the receiver decides&rdquo;. It
              reaches <em>the receiver materially constrains the sender&rsquo;s choice</em>, which
              is a smaller claim that happens to be the one the evidence supports and the one the
              product already implements.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Casting</h2>
          <p className="t-body-01 text-secondary">
            {spellCount(CAST.length, { capital: true })} generated portraits, all of them in the
            sender&rsquo;s register. Each is scored against the curve above, and one was recast on
            the strength of it.
          </p>
          <p className="t-body-02 text-secondary">
            The direction — looking into the camera, a small closed-lipped smile, calm — is a
            deliberate choice, and worth naming precisely: it is the register the category{' '}
            <strong style={{ color: 'var(--wu-text-primary)' }}>advertises</strong>, not the one
            research measures. Peer-reviewed analysis of a decade of this industry&rsquo;s
            advertising finds reciprocal care; qualitative work with actual senders finds obligation
            and strain. Both are true. Only one of them is a photograph.
          </p>
        </div>

        <div className="cast-grid">
          {CAST.map((c) => (
            <figure className="cast" key={c.name} style={{ margin: 0 }}>
              <img
                className="cast__shot"
                src={`/media/${c.file}`}
                alt={`Portrait in the sender's register — ${c.age.toLowerCase()}, holding a phone with the screen off`}
                width={1200}
                height={805}
                loading="lazy"
              />
              <figcaption className="cast__caption">
                <div className="cast__head">
                  <Badge tone={c.tone}>{c.verdict}</Badge>
                  <span className="cast__name">{c.name}</span>
                  <span className="t-body-03 text-secondary">{c.age}</span>
                </div>
                <p className="t-body-03 text-secondary">{c.why}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="section__head" style={{ marginTop: 'var(--wu-ref-space-4xl)' }}>
          <h3 className="t-display-h6">
            The {spellCount(PERSONAS.length)} avatars, shot after the fact
          </h3>
          <p className="t-body-02 text-secondary">
            The {spellCount(CAST.length)} above are all the sender&rsquo;s register — which is why
            the receivers had no face until now. These are tighter framings, one per register:
            Marcos indoors and contained, Alzira outside in hard light, Joana interior and
            unhurried.
          </p>
          <p className="t-body-02 text-secondary">
            Two things about them are worth saying rather than hiding. Alzira was reshot once
            because the first frame put her on a European street, which contradicts her corridors in
            the seed — São Paulo and Guadalajara. And{' '}
            <strong style={{ color: 'var(--wu-text-primary)' }}>
              the receivers&rsquo; ages are invented
            </strong>
            : the research pass found no anchored source for how old a person receiving a remittance
            is, and the one table it did surface summed to 109% and was discarded.
          </p>
        </div>

        <div className="cast-grid">
          {PERSONAS.map((p) => (
            <figure className="cast" key={p.id} style={{ margin: 0 }}>
              <img
                className="cast__shot"
                src={p.avatar}
                alt={p.avatarAlt}
                width={512}
                height={512}
                loading="lazy"
              />
              <figcaption className="cast__caption">
                <div className="cast__head">
                  <Badge tone={p.primary ? 'success' : 'info'}>{p.name}</Badge>
                  <span className="cast__name">{p.avatar.split('/').pop()}</span>
                </div>
                <p className="t-body-03 text-secondary">{p.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">What the research could not answer</h2>
          <p className="t-body-01 text-secondary">
            A research pass is only worth having if it is allowed to come back empty. This one came
            back empty on more than it filled.
          </p>
        </div>

        <div className="stack" style={{ gap: 'var(--wu-ref-space-xl)', maxWidth: '68ch' }}>
          <div className="card">
            <h3 className="t-display-h6">There is no median age of remittance senders</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              Not globally, not for the US. The flagship financial-inclusion survey has no
              sender-side module. Pew&rsquo;s 2024 report on remittances carries no age breakdown at
              all. The US Census paper cuts by nativity only. What exists is a propensity curve,
              which is a different object — &ldquo;45% of 40-somethings send money&rdquo; is not
              &ldquo;45% of senders are 40-something&rdquo;, and the two get confused constantly.
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">Who the money actually goes to is unknown</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              Parent, sibling, child, partner, employee — the split decides the emotional register
              of every image with two people in it. The only anchored breakdown we found is
              seventeen years old and covers one occupation in one country. It was not promoted to a
              fact here.
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">The primary source could not be checked</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              The corporate site was unavailable when this research was done (2026-09-15). That is
              where the global receiver-influence figure is published, so everything this page says
              about receiver agency rests on secondary reporting of that research, not on the
              research itself.
            </p>
          </div>

          <div className="card">
            <h3 className="t-display-h6">Most of this evidence is old</h3>
            <p className="t-body-02 text-secondary" style={{ marginTop: 'var(--wu-ref-space-md)' }}>
              Of the claims that anchored, most breach an eighteen-month freshness bar, and four of
              the six built on primary survey data come from the <em>same</em> 2017 Canadian study.
              This subject is thinner in the public record than the ubiquity of its statistics
              suggests.
            </p>
          </div>
        </div>

        <div className="demo-grid" style={{ marginTop: 'var(--wu-ref-space-2xl)' }}>
          <ButtonLink href="/app" size="md">
            Drive the app he uses
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="md">
            Back to the design system
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
