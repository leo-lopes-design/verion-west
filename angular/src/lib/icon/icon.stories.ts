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
