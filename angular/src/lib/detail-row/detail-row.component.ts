import { booleanAttribute, ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Label on the left, value on the right, baseline-aligned. */
@Component({
  selector: 'wu-detail-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wu-row" [class.is-muted]="muted()">
      <span class="wu-row__label">{{ label() }}</span>
      <span class="wu-row__value">{{ value() }}</span>
    </div>
  `,
  styleUrl: './detail-row.component.scss',
})
export class DetailRowComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  /** For a value the system declined to compute. Still readable text, so it is secondary, not disabled. */
  readonly muted = input(false, { transform: booleanAttribute });
}
