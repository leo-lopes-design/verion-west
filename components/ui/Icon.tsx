/**
 * The icon set from the Figma file, same path data. No glyph carries a colour
 * of its own: `currentColor` keeps an icon in agreement with the text beside it.
 */
export const ICON_PATHS = {
  'arrow-left':
    'M10 3.8 L11.9 5.7 L6.9 10.7 L21 10.7 L21 13.3 L6.9 13.3 L11.9 18.3 L10 20.2 L1.8 12 Z',
  close:
    'M12 10.1 L18.3 3.8 L20.2 5.7 L13.9 12 L20.2 18.3 L18.3 20.2 L12 13.9 L5.7 20.2 L3.8 18.3 L10.1 12 L3.8 5.7 L5.7 3.8 Z',
  'chevron-down': 'M12 15.4 L4.8 8.2 L6.7 6.3 L12 11.6 L17.3 6.3 L19.2 8.2 Z',
  check: 'M9.6 18.6 L3 12 L4.9 10.1 L9.6 14.8 L19.1 5.3 L21 7.2 Z',
  'more-horizontal':
    'M4 9.6 A2.4 2.4 0 1 0 4.01 9.6 Z M12 9.6 A2.4 2.4 0 1 0 12.01 9.6 Z M20 9.6 A2.4 2.4 0 1 0 20.01 9.6 Z',
  cash: 'M2 5 H22 V19 H2 Z M4 7 V17 H20 V7 Z M12 9.4 A2.6 2.6 0 1 0 12.01 9.4 Z',
  bank: 'M12 2 L22.5 8 V10.4 H1.5 V8 Z M4 12.4 H7 V18.4 H4 Z M10.5 12.4 H13.5 V18.4 H10.5 Z M17 12.4 H20 V18.4 H17 Z M1.5 20.2 H22.5 V22.4 H1.5 Z',
  wallet:
    'M2.5 5 H18.5 V9.4 H14.6 A2.6 2.6 0 0 0 14.6 14.6 H18.5 V19 H2.5 Z M20.6 10.9 H22.5 V13.1 H20.6 Z M16.2 10.9 H22.5 V13.1 H16.2 Z',
  clock:
    'M12 2 A10 10 0 1 0 12.01 2 Z M12 4.4 A7.6 7.6 0 1 1 11.99 4.4 Z M11 6.4 H13 V12.3 L16.9 14.6 L15.9 16.3 L11 13.4 Z',
  backspace:
    'M8.4 4 H22 V20 H8.4 L1 12 Z M13.1 8.2 L11.7 9.6 L14.1 12 L11.7 14.4 L13.1 15.8 L15.5 13.4 L17.9 15.8 L19.3 14.4 L16.9 12 L19.3 9.6 L17.9 8.2 L15.5 10.6 Z',
  alert: 'M12 2 A10 10 0 1 0 12.01 2 Z M11 6.4 H13 V13.6 H11 Z M11 15.4 H13 V17.6 H11 Z',
  shield:
    'M12 1.8 L21 5.8 V12 C21 17.1 17.2 21.2 12 22.2 C6.8 21.2 3 17.1 3 12 V5.8 Z M10.8 16.4 L17.4 9.8 L15.8 8.2 L10.8 13.2 L8.2 10.6 L6.6 12.2 Z',
  // disc plus eight bars; the subpaths never overlap, so even-odd unions them
  sun: 'M12 7.4 A4.6 4.6 0 1 0 12.01 7.4 Z M10.9 1.6 H13.1 V4.8 H10.9 Z M10.9 19.2 H13.1 V22.4 H10.9 Z M1.6 10.9 H4.8 V13.1 H1.6 Z M19.2 10.9 H22.4 V13.1 H19.2 Z M15.42 4.82 L17.62 2.62 L19.18 4.18 L16.98 6.38 Z M8.58 4.82 L6.38 2.62 L4.82 4.18 L7.02 6.38 Z M15.42 19.18 L17.62 21.38 L19.18 19.82 L16.98 17.62 Z M8.58 19.18 L6.38 21.38 L4.82 19.82 L7.02 17.62 Z',
  // two equal circles, outer at (12,12) and cutter at (17.2,7.2), joined at their
  // intersections — punching one disc out of another with even-odd leaves the
  // cutter's overhang filled, which is not a crescent
  moon: 'M8.694 3.202 A9.4 9.4 0 1 0 20.506 15.998 A9.4 9.4 0 0 1 8.694 3.202 Z',
  // cash already owns "ring with a centred circle", so the card leans on its chip
  // to stay legible against it at tab size
  card: 'M2 5 H22 V19 H2 Z M4 7 V17 H20 V7 Z M6 9.4 H10.4 V13 H6 Z M13 9.8 H19 V11 H13 Z M13 12.4 H19 V13.6 H13 Z',
  // shaft, arrowhead, tray. The tray is open at the top so the arrow reads as
  // going INTO something — a closed box would read as a hard drive.
  download:
    'M10.9 2.4 H13.1 V11.6 L16.7 8 L18.3 9.6 L12 15.9 L5.7 9.6 L7.3 8 L10.9 11.6 Z M3 14.8 H5.2 V19 H18.8 V14.8 H21 V21.2 H3 Z',
} as const;

export type IconName = keyof typeof ICON_PATHS;
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];

type Props = {
  name: IconName;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  title?: string;
};

const SIZE_VAR = {
  sm: 'var(--wu-ref-icon-size-sm)',
  md: 'var(--wu-ref-icon-size-md)',
  lg: 'var(--wu-ref-icon-size-lg)',
} as const;

export function Icon({ name, className, size, title }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={size ? { width: SIZE_VAR[size], height: SIZE_VAR[size] } : undefined}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <path d={ICON_PATHS[name]} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}
