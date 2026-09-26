import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'lg' | 'md';

/**
 * Every appearance is a lookup into the semantic tokens; no colour is written here.
 *
 * A wrapper, not `button[wuButton]`: the loading announcement lives in a status region
 * beside the native button, because assistive tech ignores roles inside a button.
 */
@Component({
  selector: 'wu-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.wu-button--block]': 'block()' },
  template: `
    <button
      [class]="classes()"
      [attr.type]="nativeType()"
      [disabled]="disabled()"
      [attr.aria-disabled]="loading() || null"
      [attr.aria-busy]="loading() || null"
      (click)="ignoreWhileLoading($event)"
    >
      @if (loading()) {
        <span class="wu-btn__spinner" aria-hidden="true"></span>
      }
      <ng-content />
    </button>
    <span class="wu-visually-hidden" role="status">
      @if (loading()) {
        {{ loadingLabel() }}
      }
    </span>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('lg');
  readonly block = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /** Announced when loading starts. Override it for the page's language. */
  readonly loadingLabel = input('Loading');
  readonly nativeType = input<'button' | 'submit'>('button');

  protected readonly classes = computed(() =>
    [
      'wu-btn',
      `wu-btn--${this.variant()}`,
      `wu-btn--${this.size()}`,
      this.block() ? 'wu-btn--block' : '',
      this.loading() ? 'is-loading' : '',
    ]
      .filter(Boolean)
      .join(' ')
  );

  /** A loading button keeps focus (aria-disabled, not disabled) but must not act twice. */
  protected ignoreWhileLoading(event: Event): void {
    if (this.loading()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
