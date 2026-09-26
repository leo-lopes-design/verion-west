import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { FieldComponent } from './field.component';

function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

@Component({
  imports: [FieldComponent],
  template: `<wu-field label="You send" [(value)]="amount" />`,
})
class TwoWayHost {
  readonly amount = signal('1,000.00');
}

@Component({
  imports: [FieldComponent, ReactiveFormsModule],
  template: `<wu-field label="You send" [formControl]="amount" />`,
})
class ReactiveFormHost {
  readonly amount = new FormControl('', { nonNullable: true });
}

@Component({
  imports: [FieldComponent],
  template: `<wu-field label="You send" trailing="BRL" [help]="help()" [invalid]="invalid()" />`,
})
class ErrorHost {
  readonly help = signal('Over the R$ 5,000.00 daily limit.');
  readonly invalid = signal(true);
}

describe('FieldComponent', () => {
  it('shows the bound value and writes what the user types back to it', () => {
    const fixture = TestBed.createComponent(TwoWayHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.value).toBe('1,000.00');
    type(input, '250.00');
    expect(fixture.componentInstance.amount()).toBe('250.00');
  });

  it('works as a reactive form control in both directions', () => {
    const fixture = TestBed.createComponent(ReactiveFormHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.amount;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    control.setValue('100.00');
    fixture.detectChanges();
    expect(input.value).toBe('100.00');

    type(input, '42.00');
    expect(control.value).toBe('42.00');

    input.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  });

  it('takes its disabled state from the form control', () => {
    const fixture = TestBed.createComponent(ReactiveFormHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    fixture.componentInstance.amount.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);

    fixture.componentInstance.amount.enable();
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
  });

  it('in error, is aria-invalid and described by the currency chip, then the help text', () => {
    const fixture = TestBed.createComponent(ErrorHost);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector('input') as HTMLInputElement;
    const chip = element.querySelector('.wu-field__chip') as HTMLElement;
    const help = element.querySelector('.wu-field__help') as HTMLElement;

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(`${chip.id} ${help.id}`);
    expect(chip.textContent?.trim()).toBe('BRL');
    expect(element.querySelector(`label[for="${input.id}"]`)?.textContent).toBe('You send');
  });

  it('drops aria-invalid when valid, and still announces the currency without help text', () => {
    const fixture = TestBed.createComponent(ErrorHost);
    fixture.componentInstance.invalid.set(false);
    fixture.componentInstance.help.set('');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const chip = fixture.nativeElement.querySelector('.wu-field__chip') as HTMLElement;

    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.getAttribute('aria-describedby')).toBe(chip.id);
  });
});
