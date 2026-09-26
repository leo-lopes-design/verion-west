import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Components/Badge',
  component: BadgeComponent,
  args: { tone: 'info' },
  argTypes: { tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] } },
  render: (args) => ({ props: args, template: `<wu-badge [tone]="tone">Processing</wu-badge>` }),
  parameters: {
    docs: {
      description: {
        component:
          'bg and fg always come from one feedback family — that pairing is what holds contrast when the mode flips. The file types "Delivered", not "DELIVERED": there is no case transform here because the Figma text style carries none either.',
      },
    },
  },
};
export default meta;

export const Playground: StoryObj<BadgeComponent> = {};

export const EveryTone: StoryObj<BadgeComponent> = {
  name: 'Every tone',
  render: () => ({
    template: `
      <div class="sb-row">
        <wu-badge tone="info">Processing</wu-badge>
        <wu-badge tone="success">Delivered</wu-badge>
        <wu-badge tone="warning">Ready to collect</wu-badge>
        <wu-badge tone="error">Failed</wu-badge>
      </div>`,
  }),
};
