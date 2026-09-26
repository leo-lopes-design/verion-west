import type { Meta, StoryObj } from '@storybook/angular';
import { FieldComponent } from './field.component';

const meta: Meta<FieldComponent> = {
  title: 'Components/Field',
  component: FieldComponent,
  args: {
    label: 'You send',
    value: '1,000.00',
    trailing: 'BRL',
    help: 'Available balance R$ 4,820.00',
    invalid: false,
    disabled: false,
    inputMode: 'decimal',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    inputMode: { control: 'inline-radio', options: ['text', 'decimal', 'numeric'] },
  },
  render: (args) => ({
    props: args,
    template: `<div class="sb-stack"><wu-field [label]="label" [value]="value" [trailing]="trailing"
                 [help]="help" [invalid]="invalid" [disabled]="disabled" [inputMode]="inputMode" /></div>`,
  }),
  parameters: {
    docs: {
      description: {
        component:
          'A field in error is TINTED, not merely outlined: a state that lives only on a 2px border is missed by a glance that never reaches the border. Five roles carry it — ground, inset, value, border, and the words around it. It is a ControlValueAccessor, so `formControl` and `ngModel` work, and `[(value)]` works without a form.',
      },
    },
  },
};
export default meta;
type S = StoryObj<FieldComponent>;

export const Playground: S = {};

export const WithError: S = {
  name: 'Error — five roles',
  args: {
    invalid: true,
    value: '6,500.00',
    help: 'Over the R$ 5,000.00 daily limit. Lower the amount or split it into two transfers.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'The helper sits on the PAGE and not on the tint. Inside the field its colour would read 3.36:1; where it actually sits, 6.58:1. The layout saves the colour.',
      },
    },
  },
};

export const Disabled: S = {
  args: {
    label: 'They get',
    disabled: true,
    value: '—',
    trailing: 'USD',
    help: 'Fee calculated in the next step',
  },
};
