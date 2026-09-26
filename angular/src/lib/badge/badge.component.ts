import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type BadgeTone = 'info' | 'success' | 'warning' | 'error';

/** A status in a pill. No case transform: the Figma text style carries none. */
@Component({
  selector: 'wu-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="wu-badge" [class]="'wu-badge--' + tone()"><ng-content /></span>`,
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('info');
}
