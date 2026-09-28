import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { EXPORTED_AT } from '@/lib/tokens';
import { spellCount } from '@/lib/words';

export const metadata: Metadata = {
  title: 'Handoff',
  description:
    'What a developer takes away: the tokens exported from Figma, their generated outputs, and the same components in Angular.',
};

/* Every figure below is read from a generated file when the page is built. */
export const dynamic = 'force-static';

type Counts = { ref: number; sys: number; themed: number; static: number };
type Artifact = { file: string; what: string; platform: string; href: string };
type Manifest = { counts: Counts; outputs: Artifact[] };
type StorybookIndex = { entries: Record<string, { type: string }> };

/* Each path is spelled out in full so the build traces one file, not the project. */
const MANIFEST_FILE = path.join(process.cwd(), 'public', 'artifacts', 'manifest.json');
const STORYBOOK_INDEX_FILE = path.join(process.cwd(), 'public', 'storybook', 'index.json');

/* The .fig is a GitHub release asset, not a tracked file: it is binary and outside git history. */
const FIG_URL =
  'https://github.com/leo-lopes-design/verion-west/releases/latest/download/verion-west.fig';

/** A generated file, or null when this build did not generate it. */
function readGenerated<T>(file: string): T | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return null;
  }
}

function countEntries(index: StorybookIndex, type: 'story' | 'docs') {
  return Object.values(index.entries).filter((entry) => entry.type === type).length;
}

const EXPORTED_ON = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
}).format(new Date(EXPORTED_AT));

const COMPONENTS: [name: string, why: string][] = [
  ['Button', '3 types × 4 states × 2 sizes, and not one colour in the component'],
  ['Field', 'The error state, tinted rather than outlined — five roles, five tokens'],
  ['Tile', 'A button, not a div — avatar or icon, two or three lines, optional right column'],
  ['Icon', 'Sixteen glyphs, one fill rule, no colour of their own'],
  ['Badge', 'Four feedback tones'],
  ['Avatar', 'The only place the brand colour appears inside the app'],
  ['Detail row', 'Label, value, baseline-aligned'],
  ['Theme directive', 'The whole theming mechanism: one attribute on one host'],
];

type Step = { what: string; how: string; cmd?: string };

function pipelineSteps(counts: Counts | null): Step[] {
  const tiers = counts
    ? `${counts.ref} primitives and ${counts.sys} semantic tokens.`
    : 'Primitives and semantic tokens.';
  return [
    {
      what: 'Figma variables',
      how: `${tiers} Every semantic token is an alias of a primitive; only the primitives hold raw values.`,
    },
    {
      what: 'Exported to the repo',
      how: `tokens/figma-export.json, exported from Figma on ${EXPORTED_ON}. Nothing reads Figma live: everything downstream derives from this file, and nothing flows back into Figma.`,
    },
    {
      what: 'Style Dictionary',
      how: 'The build fails if a semantic token is not an alias of a primitive, if any reference is missing, or if the primitive or semantic count drifts from the one recorded at export.',
      cmd: 'npm run tokens',
    },
    {
      what: 'Platforms',
      how: 'CSS custom properties for the web, the same properties plus SCSS and typed TS for Angular, and DTCG for anything else.',
    },
    {
      what: 'Angular library',
      how: `${spellCount(COMPONENTS.length, { capital: true })} components authored against the generated SCSS. None of them knows a colour.`,
      cmd: 'npm run storybook',
    },
  ];
}

export default function HandoffPage() {
  const manifest = readGenerated<Manifest>(MANIFEST_FILE);
  const storybook = readGenerated<StorybookIndex>(STORYBOOK_INDEX_FILE);
  const steps = pipelineSteps(manifest?.counts ?? null);
  const commands = steps.filter((step) => step.cmd).length;

  return (
    <main className="wrap" id="main">
      <section className="section">
        <div className="section__head">
          <h1 className="t-display-h3">Handoff</h1>
          <p className="t-body-01 text-secondary">
            What a developer takes away. The design tokens were exported from Figma on{' '}
            <time dateTime={EXPORTED_AT}>{EXPORTED_ON}</time>. Everything on this page is
            regenerated from that export by one command, so no output can drift from it.
          </p>
          {manifest && (
            <p className="t-body-03 text-secondary">
              {manifest.counts.ref} primitives · {manifest.counts.sys} semantic tokens ·{' '}
              {manifest.counts.themed} of them change between modes
            </p>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------ design file */}
      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The design file</h2>
          <p className="t-body-01 text-secondary">
            The Figma source: variables in both modes, the components, and the screens of the site
            and the app. In Dev Mode every component links to its Storybook story and its Angular
            source.
          </p>
        </div>
        <div className="handoff">
          <article className="handoff__card">
            <p className="sectionlabel">Figma source</p>
            <p className="t-display-h6">verion-west.fig</p>
            <p className="t-body-03 text-secondary">
              Opens with File → Import in any Figma account. Published as a release of the public
              repository, so the link always serves the latest export.
            </p>
            <ButtonLink href={FIG_URL} size="md" icon="download" prefetch={false}>
              Download the .fig
            </ButtonLink>
          </article>
        </div>
      </section>

      {/* ---------------------------------------------------------- tokens */}
      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">Tokens</h2>
          <p className="t-body-01 text-secondary">
            One source
            {manifest ? `, ${spellCount(manifest.outputs.length)} outputs` : ''}. Style Dictionary
            reads the DTCG and resolves every reference before writing anything, so a token pointing
            at something that does not exist fails the build rather than reaching a browser.
          </p>
        </div>
        {manifest ? (
          <div className="artifacts">
            {manifest.outputs.map((a) => (
              <a key={a.file} className="artifact" href={a.href} download>
                <span className="artifact__top">
                  <span className="artifact__name">{a.file}</span>
                  <Icon name="download" />
                </span>
                <span className="artifact__what">{a.what}</span>
                <span className="artifact__platform">{a.platform}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="t-body-02 text-secondary">
            Run <code>npm run tokens</code> to generate them.
          </p>
        )}
      </section>

      {/* ---------------------------------------------------------- angular */}
      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The design system in Angular</h2>
          <p className="t-body-01 text-secondary">
            The same tokens and the same two modes, with {spellCount(COMPONENTS.length)} components
            built in Angular 21 and packaged as <code>@verion-west/angular</code> (
            <code>npm run build:lib</code>). Every colour in them comes from a token, so flipping
            the theme attribute re-themes them without touching component code.
          </p>
        </div>
        <div className="handoff">
          <article className="handoff__card">
            <p className="sectionlabel">Storybook</p>
            {storybook ? (
              <>
                <p className="t-display-h6">Browse the components</p>
                <p className="t-body-03 text-secondary">
                  {countEntries(storybook, 'story')} stories and {countEntries(storybook, 'docs')}{' '}
                  documentation pages · the Mode control in the toolbar flips the same attribute
                  this page does.
                </p>
                {/* A static build, not a Next route: skip the prefetch and let the router hand over. */}
                <ButtonLink href="/storybook/index.html" size="md" prefetch={false}>
                  Open Storybook
                </ButtonLink>
              </>
            ) : (
              <>
                <p className="t-display-h6">Not in this build</p>
                <p className="t-body-03 text-secondary">
                  <code>npm run build:storybook</code> generates it into{' '}
                  <code>public/storybook</code>.
                </p>
              </>
            )}
          </article>
          <article className="handoff__card">
            <p className="sectionlabel">What is in it</p>
            <ul className="handoff__list">
              {COMPONENTS.map(([name, why]) => (
                <li key={name}>
                  <strong>{name}</strong>
                  <span className="text-secondary"> — {why}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      {/* --------------------------------------------------------- pipeline */}
      <section className="section">
        <div className="section__head">
          <h2 className="t-display-h4">The pipeline</h2>
          <p className="t-body-01 text-secondary">
            {spellCount(steps.length, { capital: true })} steps, {spellCount(commands)} commands.
            Everything between them is generated, and the CSS, SCSS and TS outputs say so in their
            first line.
          </p>
        </div>
        <ol className="pipeline">
          {steps.map((step, i) => (
            <li key={step.what} className="pipeline__step">
              <span className="pipeline__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="pipeline__body">
                <span className="pipeline__what">{step.what}</span>
                <span className="t-body-03 text-secondary">{step.how}</span>
                {step.cmd && <code className="pipeline__cmd">{step.cmd}</code>}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
