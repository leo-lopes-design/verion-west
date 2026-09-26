import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICON_PATHS, type IconName } from './icon-paths';

/**
 * One path per glyph, drawn in currentColor.
 *
 * `evenodd` is load-bearing: glyphs such as alert, cash and clock are one path whose
 * inner subpaths must read as holes, whichever direction they were drawn in.
 */
@Component({
  selector: 'wu-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="wu-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
      focusable="false"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-label]="label() || null"
      [attr.aria-hidden]="label() ? null : 'true'"
    >
      @if (path(); as d) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .wu-icon {
      width: var(--wu-ref-icon-size-md);
      height: var(--wu-ref-icon-size-md);
      display: block;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  /** Give it a label only when the icon is the whole message. Beside a word it
      is decoration, and a screen reader should not read the word twice. */
  readonly label = input('');

  /** A name that arrives untyped at runtime (from a CMS, say) keeps its box and draws nothing. */
  protected readonly path = computed(() => {
    const name = this.name();
    return Object.hasOwn(ICON_PATHS, name) ? ICON_PATHS[name] : null;
  });
}

export { ICON_PATHS, ICON_NAMES } from './icon-paths';
export type { IconName } from './icon-paths';
