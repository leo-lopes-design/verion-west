import type { Meta, StoryObj } from '@storybook/angular';
import { IconComponent } from './icon.component';
import { ICON_NAMES } from './icon-paths';

const meta: Meta<IconComponent> = {
  title: 'Components/Icon',
  component: IconComponent,
  argTypes: { name: { control: 'select', options: ICON_NAMES } },
  args: { name: 'cash', label: '' },
  render: (args) => ({ props: args, template: `<wu-icon [name]="name" [label]="label" />` }),
  parameters: {
    docs: {
      description: {
        component:
          'The same path data as the React app and the Figma file. They carry no colour: `currentColor` means an icon always agrees with the text beside it, whatever token that text resolved to. Give one a `label` only when the icon is the whole message — beside a word it is decoration, and a screen reader should not read the word twice.',
      },
    },
  },
};
export default meta;
type S = StoryObj<IconComponent>;

export const Playground: S = {};

// One story per glyph, so each icon component in Figma can link to its own story from Dev Mode.
export const ArrowLeft: S = { name: 'arrow-left', args: { name: 'arrow-left' } };
export const Close: S = { name: 'close', args: { name: 'close' } };
export const ChevronDown: S = { name: 'chevron-down', args: { name: 'chevron-down' } };
export const Check: S = { name: 'check', args: { name: 'check' } };
export const MoreHorizontal: S = { name: 'more-horizontal', args: { name: 'more-horizontal' } };
export const Cash: S = { name: 'cash', args: { name: 'cash' } };
export const Bank: S = { name: 'bank', args: { name: 'bank' } };
export const Wallet: S = { name: 'wallet', args: { name: 'wallet' } };
export const Clock: S = { name: 'clock', args: { name: 'clock' } };
export const Backspace: S = { name: 'backspace', args: { name: 'backspace' } };
export const Alert: S = { name: 'alert', args: { name: 'alert' } };
export const Shield: S = { name: 'shield', args: { name: 'shield' } };
export const Sun: S = { name: 'sun', args: { name: 'sun' } };
export const Moon: S = { name: 'moon', args: { name: 'moon' } };
export const Card: S = { name: 'card', args: { name: 'card' } };
export const Download: S = { name: 'download', args: { name: 'download' } };

export const EveryGlyph: S = {
  name: 'Every glyph',
  render: () => ({
    props: { names: ICON_NAMES },
    template: `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:16px">
        @for (n of names; track n) {
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
            <wu-icon [name]="n" />
            <code style="font-family:ui-monospace,monospace;font-size:11px;color:var(--wu-text-secondary)">{{ n }}</code>
          </div>
        }
      </div>`,
  }),
};
