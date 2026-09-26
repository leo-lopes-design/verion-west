/**
 * Not part of the library. Storybook's builder reads its options from the `build`
 * target, and that target needs an entry point; this is it. Consumers import from
 * the package built out of public-api.ts (`npm run build:lib`).
 */
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'wu-root',
  template: `<p>This library is documented in Storybook. Run <code>npm run storybook</code>.</p>`,
})
export class RootComponent {}

void bootstrapApplication(RootComponent);
