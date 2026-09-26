import type { Meta, StoryObj } from '@storybook/angular';
import { DetailRowComponent } from './detail-row.component';

const meta: Meta<DetailRowComponent> = {
  title: 'Components/Detail row',
  component: DetailRowComponent,
  args: { label: 'Transfer fee', value: 'R$ 12.90', muted: false },
  argTypes: { muted: { control: 'boolean' } },
  render: (args) => ({
    props: args,
    template: `<div class="sb-stack"><wu-detail-row [label]="label" [value]="value" [muted]="muted" /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'The humblest thing in the system and the one that appears on every screen. `muted` is for a value the system has refused to compute — over the limit there is no quote, and leaving the old numbers up would state a result that was already rejected.',
      },
    },
  },
};
export default meta;

export const Playground: StoryObj<DetailRowComponent> = {};

export const Summary: StoryObj<DetailRowComponent> = {
  render: () => ({
    template: `
      <div class="sb-stack" style="background:var(--wu-surface-sunken);border-radius:var(--wu-radius-control);padding:16px;gap:8px">
        <wu-detail-row label="You send" value="R$ 1,000.00" />
        <wu-detail-row label="Transfer fee" value="R$ 12.90" />
        <wu-detail-row label="Amount converted" value="R$ 987.10" />
        <wu-detail-row label="Exchange rate" value="1 BRL = 0.1840 USD" />
        <wu-detail-row label="Over the limit" value="—" muted />
      </div>`,
  }),
};
