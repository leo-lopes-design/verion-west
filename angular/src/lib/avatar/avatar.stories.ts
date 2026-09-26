import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Avatar',
  component: AvatarComponent,
  args: { initials: 'MS', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['md', 'sm'] } },
  render: (args) => ({
    props: args,
    template: `<wu-avatar [initials]="initials" [size]="size" />`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'A person, reduced to the two letters a 40px row can show. It is the only place the brand colour appears inside the app — a recipient is the warmest thing on these screens. It carries `aria-hidden`, because the row beside it already says the name.',
      },
    },
  },
};
export default meta;
type S = StoryObj<AvatarComponent>;

export const Playground: S = {};

export const BothSizes: S = {
  name: 'Both sizes',
  render: () => ({
    template: `<div class="sb-row"><wu-avatar initials="MS" /><wu-avatar initials="JP" size="sm" /></div>`,
  }),
};
