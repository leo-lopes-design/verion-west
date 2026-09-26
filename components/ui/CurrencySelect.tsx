import { CURRENCY_LIST, type CurrencyCode } from '@/lib/money';
import { Icon } from './Icon';

type Props = {
  label: string;
  /** Controlled. Without `onChange`, pass `defaultValue` instead. */
  value?: CurrencyCode;
  defaultValue?: CurrencyCode;
  onChange?: (code: CurrencyCode) => void;
};

/** The currency picker in a Field's trailing slot. */
export function CurrencySelect({ label, value, defaultValue, onChange }: Props) {
  return (
    <span className="selectwrap">
      <select
        value={value}
        defaultValue={defaultValue}
        onChange={onChange && ((e) => onChange(e.target.value as CurrencyCode))}
        aria-label={label}
      >
        {CURRENCY_LIST.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
      <Icon name="chevron-down" />
    </span>
  );
}
