import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../avatar/avatar.component';
import { BadgeComponent, type BadgeTone } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import type { IconName } from '../icon/icon-paths';

/** One row of a list about a person or a choice. A real <button>, so every row is reachable by keyboard. */
@Component({
  selector: 'wu-tile',
  imports: [AvatarComponent, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="wu-tile"
      [class.is-selected]="selected()"
      [class.wu-tile--align-start]="!!detail()"
      [attr.aria-pressed]="selectable() ? selected() : null"
      (click)="picked.emit()"
    >
      @if (initials(); as initials) {
        <wu-avatar [initials]="initials" />
      } @else if (icon(); as icon) {
        <span class="wu-tile__icon"><wu-icon [name]="icon" /></span>
      }

      <span class="wu-tile__text">
        <span class="wu-tile__title">{{ title() }}</span>
        @if (subtitle()) {
          <span class="wu-tile__secondary">{{ subtitle() }}</span>
        }
        @if (detail()) {
          <span class="wu-tile__secondary">{{ detail() }}</span>
        }
      </span>

      @if (amount() || badge()) {
        <span class="wu-tile__meta">
          @if (amount()) {
            <span class="wu-tile__amount">{{ amount() }}</span>
          }
          @if (badge()) {
            <wu-badge [tone]="badgeTone()">{{ badge() }}</wu-badge>
          }
        </span>
      }
    </button>
  `,
  styleUrl: './tile.component.scss',
})
export class TileComponent {
  readonly title = input.required<string>();
  /** The line under the title: where, or what the option is. */
  readonly subtitle = input('');
  /** A second supporting line, such as the fee and speed of an option. */
  readonly detail = input('');
  readonly initials = input<string | null>(null);
  readonly icon = input<IconName | null>(null);
  readonly amount = input('');
  readonly badge = input('');
  readonly badgeTone = input<BadgeTone>('info');
  readonly selected = input(false, { transform: booleanAttribute });
  /** A row in a list of options announces its pressed state; a row that navigates
      does not, because there is nothing for it to be pressed into. */
  readonly selectable = input(false, { transform: booleanAttribute });
  readonly picked = output<void>();
}
