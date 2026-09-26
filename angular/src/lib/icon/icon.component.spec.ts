import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { IconComponent } from './icon.component';
import { ICON_PATHS } from './icon-paths';

function render(name: string, label = '') {
  const fixture = TestBed.createComponent(IconComponent);
  fixture.componentRef.setInput('name', name);
  fixture.componentRef.setInput('label', label);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('svg') as SVGSVGElement;
}

describe('IconComponent', () => {
  it('draws the path of the named glyph, hidden from assistive tech', () => {
    const svg = render('cash');

    expect(svg.querySelector('path')?.getAttribute('d')).toBe(ICON_PATHS.cash);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.hasAttribute('aria-label')).toBe(false);
  });

  it('becomes an image with a name when it is given a label', () => {
    const svg = render('alert', 'Warning');

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Warning');
    expect(svg.hasAttribute('aria-hidden')).toBe(false);
  });

  it('keeps its box and draws nothing for a name it does not know', () => {
    const svg = render('not-a-glyph');

    expect(svg).not.toBeNull();
    expect(svg.querySelector('path')).toBeNull();
  });
});
