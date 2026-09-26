import { Directive, input } from '@angular/core';
import type { Mode } from '../../tokens/tokens';

/** Sets `data-theme` on the host; every token below it re-resolves, so no component knows the mode. */
@Directive({
  selector: '[wuTheme]',
  host: { '[attr.data-theme]': 'wuTheme()' },
})
export class ThemeDirective {
  readonly wuTheme = input.required<Mode>();
}
