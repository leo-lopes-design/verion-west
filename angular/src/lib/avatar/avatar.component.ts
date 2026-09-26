import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Initials on the brand colour. aria-hidden, because the row beside it already names the person. */
@Component({
  selector: 'wu-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="wu-avatar" [class.wu-avatar--sm]="size() === 'sm'" aria-hidden="true">{{
    initials()
  }}</span>`,
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  readonly initials = input.required<string>();
  readonly size = input<'md' | 'sm'>('md');
}
