import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { TileComponent } from './tile.component';

@Component({
  imports: [TileComponent],
  template: `
    <wu-tile
      title="Bank deposit"
      icon="bank"
      [selectable]="selectable()"
      [selected]="selected()"
      (picked)="picks = picks + 1"
    />
  `,
})
class DeliveryOption {
  readonly selectable = signal(true);
  readonly selected = signal(false);
  picks = 0;
}

function render(state: { selectable: boolean; selected: boolean }) {
  const fixture = TestBed.createComponent(DeliveryOption);
  fixture.componentInstance.selectable.set(state.selectable);
  fixture.componentInstance.selected.set(state.selected);
  fixture.detectChanges();
  return { fixture, button: fixture.nativeElement.querySelector('button') as HTMLButtonElement };
}

describe('TileComponent', () => {
  it('is a button that reports a pick when activated', () => {
    const { fixture, button } = render({ selectable: true, selected: false });

    button.click();

    expect(button.type).toBe('button');
    expect(fixture.componentInstance.picks).toBe(1);
  });

  it('announces its pressed state when it is one of a set of options', () => {
    const { fixture, button } = render({ selectable: true, selected: false });
    expect(button.getAttribute('aria-pressed')).toBe('false');

    fixture.componentInstance.selected.set(true);
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('carries no pressed state when it navigates instead of choosing', () => {
    const { button } = render({ selectable: false, selected: true });

    expect(button.hasAttribute('aria-pressed')).toBe(false);
  });
});
