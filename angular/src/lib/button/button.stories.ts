import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  args: { variant: 'primary', size: 'lg', block: false, disabled: false, loading: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'tertiary'] },
    size: { control: 'inline-radio', options: ['lg', 'md'] },
    block: { control: 'boolean' },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `<wu-button [variant]="variant" [size]="size" [block]="block"
                          [disabled]="disabled" [loading]="loading">Send money</wu-button>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'Three variants, three states, two sizes — and no colours: every appearance is a lookup into the semantic tier, the same lookup the React app and the Figma variant make. Disabled text is the one place the system leans on the WCAG 1.4.3 exemption deliberately. A loading button keeps focus, ignores further clicks and announces itself through a status region.',
      },
    },
  },
};
export default meta;
type S = StoryObj<ButtonComponent>;

/** Every control in the panel drives this one. */
export const Playground: S = {};

export const EveryType: S = {
  name: 'Every type',
  render: () => ({
    template: `
      <div class="sb-row">
        <wu-button variant="primary">Send money</wu-button>
        <wu-button variant="secondary">Share receipt</wu-button>
        <wu-button variant="tertiary">Log in</wu-button>
      </div>`,
  }),
};

export const EveryState: S = {
  name: 'Every state',
  render: () => ({
    template: `
      <div class="sb-stack">
        <div class="sb-row">
          <wu-button variant="primary">Default</wu-button>
          <wu-button variant="primary" disabled>Disabled</wu-button>
          <wu-button variant="primary" loading>Sending</wu-button>
        </div>
        <div class="sb-row">
          <wu-button variant="secondary">Default</wu-button>
          <wu-button variant="secondary" disabled>Disabled</wu-button>
        </div>
        <div class="sb-row">
          <wu-button variant="tertiary">Default</wu-button>
          <wu-button variant="tertiary" disabled>Disabled</wu-button>
        </div>
      </div>`,
  }),
};
