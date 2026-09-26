import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Mode } from '../../tokens/tokens';
import { ThemeDirective } from './theme.directive';

@Component({
  imports: [ThemeDirective],
  template: `<section [wuTheme]="mode()"></section>`,
})
class ThemedPanel {
  readonly mode = signal<Mode>('dark');
}

describe('ThemeDirective', () => {
  it('sets data-theme on its host and follows the mode when it changes', () => {
    const fixture = TestBed.createComponent(ThemedPanel);
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector('section') as HTMLElement;
    expect(section.getAttribute('data-theme')).toBe('dark');

    fixture.componentInstance.mode.set('light');
    fixture.detectChanges();
    expect(section.getAttribute('data-theme')).toBe('light');
  });
});
