import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TileComponent } from './tile.component';
import { AvatarComponent } from '../avatar/avatar.component';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { ICON_NAMES } from '../icon/icon-paths';

const meta: Meta<TileComponent> = {
  title: 'Components/Tile',
  component: TileComponent,
  decorators: [moduleMetadata({ imports: [AvatarComponent, BadgeComponent, IconComponent] })],
  args: {
    title: 'Maria Silva',
    subtitle: 'Sao Paulo, BR · Cash pickup',
    detail: '',
    initials: 'MS',
    icon: null,
    amount: 'R$ 1,000.00',
    badge: 'Processing',
    badgeTone: 'info',
    selected: false,
    selectable: false,
  },
  argTypes: {
    badgeTone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'error'] },
    icon: { control: 'select', options: [null, ...ICON_NAMES] },
    selected: { control: 'boolean' },
    selectable: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `<div class="sb-stack"><wu-tile [title]="title" [subtitle]="subtitle" [detail]="detail"
                 [initials]="initials" [icon]="icon" [amount]="amount" [badge]="badge"
                 [badgeTone]="badgeTone" [selected]="selected" [selectable]="selectable" /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'The most repeated shape in the app. It is a `<button>`, so every row is reachable and operable by keyboard — a `<div>` with a click handler is not, and axe does not flag it because a div with no role is not an error. Selected is a border, not a fill, so choosing a row never changes the contrast of what is written on it.',
      },
    },
  },
};
export default meta;
type S = StoryObj<TileComponent>;

export const Playground: S = {};

export const Recent: S = {
  render: () => ({
    template: `
      <div class="sb-stack">
        <wu-tile title="Maria Silva" subtitle="Sao Paulo, BR · Cash pickup" initials="MS"
                 amount="R$ 1,000.00" badge="Processing" badgeTone="info" />
        <wu-tile title="John Pereira" subtitle="Lisbon, PT · Bank deposit" initials="JP"
                 amount="R$ 2,400.00" badge="Delivered" badgeTone="success" />
        <wu-tile title="Diego Ramos" subtitle="Guadalajara, MX · Cash pickup" initials="DR"
                 amount="R$ 620.00" badge="Ready to collect" badgeTone="warning" />
      </div>`,
  }),
};

export const WithIcon: S = {
  name: 'Icon leading — how they collect',
  render: () => ({
    template: `
      <div class="sb-stack">
        <wu-tile icon="cash" selectable selected
                 title="Cash at an agent"
                 subtitle="They collect at a partner agent with a photo ID and the tracking number."
                 detail="Fee R$ 12.90 · Minutes" />
        <wu-tile icon="bank" selectable
                 title="Bank deposit"
                 subtitle="Lands directly in the account on file for the recipient."
                 detail="Fee R$ 6.45 · 1–2 business days" />
        <wu-tile icon="wallet" selectable
                 title="Digital wallet"
                 subtitle="Credited to their wallet, spendable straight away."
                 detail="Fee R$ 9.68 · Minutes" />
      </div>`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The icon-leading layout, with a `detail` line. These rows carry `selectable`, which makes each one an `aria-pressed` option rather than a link to somewhere.',
      },
    },
  },
};

export const Selected: S = {
  render: () => ({
    template: `
      <div class="sb-stack">
        <wu-tile title="Maria Silva" subtitle="Sao Paulo, Brazil" initials="MS" amount="USD"
                 selectable selected />
        <wu-tile title="Ana Costa" subtitle="Miami, United States" initials="AC" amount="USD"
                 selectable />
      </div>`,
  }),
};
