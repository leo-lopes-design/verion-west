import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * A text field that works on its own (`[(value)]`) or inside a form (`formControl`, `ngModel`).
 *
 * In error the whole control is tinted, not only outlined: a state carried by a
 * 2px border is missed by a glance that never reaches the border.
 */
@Component({
  selector: 'wu-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FieldComponent), multi: true },
  ],
  template: `
    <div
      class="wu-field"
      [class.wu-field--error]="invalid()"
      [class.wu-field--disabled]="isDisabled()"
    >
      <label class="wu-field__label" [for]="id">{{ label() }}</label>
      <div class="wu-field__control">
        <input
          class="wu-field__input"
          [id]="id"
          [value]="value()"
          [disabled]="isDisabled()"
          [attr.inputmode]="inputMode()"
          [attr.aria-invalid]="invalid() || null"
          [attr.aria-describedby]="describedBy()"
          (input)="updateValue($event)"
          (blur)="onTouched()"
        />
        @if (trailing()) {
          <span class="wu-field__chip" [id]="chipId">{{ trailing() }}</span>
        }
      </div>
      @if (help()) {
        <p class="wu-field__help" [id]="helpId">{{ help() }}</p>
      }
    </div>
  `,
  styleUrl: './field.component.scss',
})
export class FieldComponent implements ControlValueAccessor {
  private static nextId = 0;
  protected readonly id = `wu-field-${FieldComponent.nextId++}`;
  protected readonly chipId = `${this.id}-chip`;
  protected readonly helpId = `${this.id}-help`;

  readonly label = input.required<string>();
  readonly value = model('');
  readonly help = input('');
  /** A unit shown inside the control, such as a currency code. */
  readonly trailing = input('');
  readonly inputMode = input<'text' | 'decimal' | 'numeric'>('text');
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly disabledByForm = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  /** The unit is read with the value, then the help text, so "6,500.00" is never heard without "BRL". */
  protected readonly describedBy = computed(
    () =>
      [this.trailing() ? this.chipId : '', this.help() ? this.helpId : '']
        .filter(Boolean)
        .join(' ') || null
  );

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  protected updateValue(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }
}
