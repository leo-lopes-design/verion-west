import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Size = 'lg' | 'md';

type ButtonStyle = {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  block?: boolean;
  children: ReactNode;
};

function buttonClassName({
  variant = 'primary',
  size = 'lg',
  block,
  className,
}: Omit<ButtonStyle, 'children' | 'icon'> & { className?: string }) {
  return ['btn', `btn--${variant}`, `btn--${size}`, block ? 'btn--block' : '', className ?? '']
    .filter(Boolean)
    .join(' ');
}

/**
 * Three types, two sizes, a leading icon slot. Hover, active and disabled are
 * CSS states rather than variants because the browser owns them.
 */
export function Button({
  variant,
  size,
  icon,
  block,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle) {
  return (
    <button type={type} className={buttonClassName({ variant, size, block, className })} {...rest}>
      {icon ? <Icon name={icon} className="btn__icon" /> : null}
      {children}
    </button>
  );
}

/** The same look on a link, for anything that navigates rather than acts. */
export function ButtonLink({
  variant,
  size,
  icon,
  block,
  children,
  className,
  ...rest
}: Omit<ComponentProps<typeof Link>, 'children'> & ButtonStyle) {
  return (
    <Link className={buttonClassName({ variant, size, block, className })} {...rest}>
      {icon ? <Icon name={icon} className="btn__icon" /> : null}
      {children}
    </Link>
  );
}
