import { useId, type ReactNode } from 'react';

type State = 'default' | 'error' | 'disabled';

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  help?: ReactNode;
  state?: State;
  trailing?: ReactNode;
  /** Editing. Its absence is what makes the field read-only, so a caller cannot
   *  accidentally ship an input nobody can type into but that looks live. */
  onChange?: (value: string) => void;
  /** Only to force read-only on a field that does have an onChange. */
  readOnly?: boolean;
  /** Which on-screen keyboard. Money wants `decimal`; a tracking number wants
   *  `numeric`, which has no decimal point to press by mistake. */
  inputMode?: 'decimal' | 'numeric' | 'text';
};

/**
 * The Input set from Figma, states included. Error paints the border and the
 * help text from one token, so the frame and the message can never disagree.
 * Focus thickens the ring rather than changing the fill, because the fill is
 * already carrying the disabled state.
 *
 * Always controlled; a field without `onChange` is read-only, so React never
 * sees a value it cannot update. No client directive: it renders on the server
 * wherever it has no handler.
 */
export function Field({
  label,
  value,
  placeholder,
  help,
  state = 'default',
  trailing,
  onChange,
  readOnly = onChange === undefined,
  inputMode = 'decimal',
}: Props) {
  const id = useId();
  const cls = ['field', state !== 'default' ? `field--${state}` : ''].filter(Boolean).join(' ');

  return (
    <div className={cls}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <input
          id={id}
          className="field__input"
          value={value ?? ''}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={state === 'disabled'}
          readOnly={readOnly}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={help ? `${id}-help` : undefined}
          inputMode={inputMode}
        />
        {trailing}
      </div>
      {help ? (
        <p className="field__help" id={`${id}-help`}>
          {help}
        </p>
      ) : null}
    </div>
  );
}
