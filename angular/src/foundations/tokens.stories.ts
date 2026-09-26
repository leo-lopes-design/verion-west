import type { Meta, StoryObj } from '@storybook/angular';
import { tokens, counts } from '../tokens/tokens';

/**
 * Not a hand-written table. Every swatch below is read out of `tokens.ts`, which
 * Style Dictionary generated from `tokens/figma-export.json`, which mirrors the
 * Figma variables one for one. If somebody adds a token in Figma and runs the
 * build, it appears here without anyone editing this file — and if somebody
 * deletes one, this page loses a row instead of printing a stale value.
 */
const meta: Meta = {
  title: 'Foundations/Tokens',
  parameters: {
    docs: {
      description: {
        component: `${counts.semantic} semantic tokens over ${counts.ref} primitives, ${counts.themed} of which change between modes. Flip the Mode control in the toolbar: nothing on this page re-renders, the custom properties simply resolve differently.`,
      },
    },
  },
};
export default meta;

const groupsOf = (prefix: string) => Object.keys(tokens).filter((k) => k.startsWith(prefix + '-'));

function swatches(names: string[]) {
  return names
    .map(
      (n) => `
      <div style="display:flex;align-items:center;gap:12px">
        <span style="width:40px;height:40px;flex:none;border-radius:var(--wu-radius-control);
                     background:var(--wu-${n});
                     box-shadow:inset 0 0 0 1px var(--wu-border-subtle)"></span>
        <code style="font-family:ui-monospace,monospace;font-size:12px;color:var(--wu-text-secondary)">${n}</code>
      </div>`
    )
    .join('');
}

const section = (title: string, prefix: string) => `
  <section style="margin-bottom:32px">
    <h3 style="font:var(--wu-font-display-h6);color:var(--wu-text-primary);margin:0 0 12px">${title}</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px">
      ${swatches(groupsOf(prefix))}
    </div>
  </section>`;

export const Surfaces: StoryObj = { render: () => ({ template: section('surface/*', 'surface') }) };
export const Text: StoryObj = { render: () => ({ template: section('text/*', 'text') }) };
export const Borders: StoryObj = { render: () => ({ template: section('border/*', 'border') }) };
export const Feedback: StoryObj = {
  render: () => ({ template: section('feedback/*', 'feedback') }),
};
export const Action: StoryObj = { render: () => ({ template: section('action/*', 'action') }) };

export const Everything: StoryObj = {
  name: 'Every semantic token',
  render: () => ({
    template: `
      <div>
        <p style="font:var(--wu-font-body-02);color:var(--wu-text-secondary);margin:0 0 24px">
          ${counts.semantic} semantic tokens · ${counts.ref} primitives · ${counts.themed} theme between modes.
          Generated, never typed.
        </p>
        ${section('surface/*', 'surface')}
        ${section('text/*', 'text')}
        ${section('border/*', 'border')}
        ${section('feedback/*', 'feedback')}
        ${section('action/*', 'action')}
        ${section('indicator/*', 'indicator')}
        ${section('syntax/*', 'syntax')}
      </div>`,
  }),
};
