import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ThemeDirective } from './theme.directive';
import { ButtonComponent } from '../button/button.component';
import { TileComponent } from '../tile/tile.component';
import { FieldComponent } from '../field/field.component';

/**
 * The claim the whole system rests on, in one story: two identical subtrees,
 * one attribute different, no component aware of either.
 */
const meta: Meta = {
  title: 'Foundations/Theme',
  decorators: [
    moduleMetadata({ imports: [ThemeDirective, ButtonComponent, TileComponent, FieldComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Theming is one attribute on one host. The two panels below render the same components with the same inputs; the only difference is `wuTheme`. Nothing inside them knows which side it is on, because none of them holds a colour — they hold token names, and the token resolves differently under the attribute.',
      },
    },
  },
};
export default meta;

const PANEL = (label: string) => `
  <div style="flex:1;min-width:260px;background:var(--wu-surface-page);color:var(--wu-text-primary);
              padding:20px;border-radius:var(--wu-radius-container);
              border:1px solid var(--wu-border-subtle);display:flex;flex-direction:column;gap:14px">
    <strong style="font:var(--wu-font-label-02);letter-spacing:.04em;color:var(--wu-text-secondary)">${label}</strong>
    <wu-button variant="primary">Send money</wu-button>
    <wu-button variant="secondary">Share receipt</wu-button>
    <wu-tile title="Maria Silva" subtitle="Sao Paulo, BR · Cash pickup" initials="MS"
             amount="R$ 1,000.00" badge="Processing" badgeTone="info" />
    <wu-field label="You send" value="1,000.00" trailing="BRL" help="Available balance R$ 4,820.00" />
  </div>`;

export const SideBySide: StoryObj = {
  name: 'One attribute, both modes',
  render: () => ({
    template: `
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <div wuTheme="light" style="display:flex;flex:1;min-width:260px">
          ${PANEL('wuTheme="light"')}
        </div>
        <div wuTheme="dark" style="display:flex;flex:1;min-width:260px">
          ${PANEL('wuTheme="dark"')}
        </div>
      </div>`,
  }),
};
