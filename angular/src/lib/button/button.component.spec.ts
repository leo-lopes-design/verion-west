import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { ButtonComponent } from './button.component';

@Component({
  imports: [ButtonComponent],
  template: `
    <form (submit)="submitted($event)">
      <wu-button
        nativeType="submit"
        [disabled]="disabled()"
        [loading]="loading()"
        (click)="clicked()"
      >
        Send money
      </wu-button>
    </form>
  `,
})
class SendMoneyForm {
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly clicked = vi.fn();
  readonly submitted = vi.fn((event: Event) => event.preventDefault());
}

function render(state: { disabled?: boolean; loading?: boolean } = {}) {
  const fixture = TestBed.createComponent(SendMoneyForm);
  fixture.componentInstance.disabled.set(state.disabled ?? false);
  fixture.componentInstance.loading.set(state.loading ?? false);
  fixture.detectChanges();
  const element: HTMLElement = fixture.nativeElement;
  return {
    form: fixture.componentInstance,
    button: element.querySelector('button') as HTMLButtonElement,
    status: element.querySelector('[role="status"]') as HTMLElement,
  };
}

describe('ButtonComponent', () => {
  it('passes a click through to the consumer and submits its form', () => {
    const { form, button } = render();

    button.click();

    expect(form.clicked).toHaveBeenCalledTimes(1);
    expect(form.submitted).toHaveBeenCalledTimes(1);
  });

  it('does nothing while disabled', () => {
    const { form, button } = render({ disabled: true });

    button.click();

    expect(button.disabled).toBe(true);
    expect(form.clicked).not.toHaveBeenCalled();
    expect(form.submitted).not.toHaveBeenCalled();
  });

  it('ignores clicks and does not submit while loading, so a payment cannot be sent twice', () => {
    const { form, button } = render({ loading: true });

    button.click();
    button.click();

    expect(form.clicked).not.toHaveBeenCalled();
    expect(form.submitted).not.toHaveBeenCalled();
  });

  it('stays focusable while loading, marked aria-disabled rather than disabled', () => {
    const { button } = render({ loading: true });

    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('marks itself busy and announces the loading label in a status region', () => {
    const idle = render();
    expect(idle.button.hasAttribute('aria-busy')).toBe(false);
    expect(idle.status.textContent?.trim()).toBe('');

    const loading = render({ loading: true });
    expect(loading.button.getAttribute('aria-busy')).toBe('true');
    expect(loading.status.textContent?.trim()).toBe('Loading');
  });
});
