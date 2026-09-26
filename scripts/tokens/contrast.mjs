/**
 * WCAG 2.2 contrast, computed from the export rather than asserted in prose.
 *
 * CONTRAST_PAIRS mirrors the list in lib/tokens.ts that the catalogue page
 * renders; tests/tokens.test.mjs fails if the two lists disagree.
 */
import { at, modes } from './dtcg.mjs';

function channel(c) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
  if (!m) throw new Error(`${JSON.stringify(hex)} is not a hex colour`);
  // a translucent colour's contrast depends on what is under it, so it has no single ratio
  if (m[2] && m[2].toLowerCase() !== 'ff')
    throw new Error(`${hex} is translucent; composite it before measuring`);
  const [r, g, b] = [0, 2, 4].map((i) => channel(parseInt(m[1].slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The unrounded WCAG ratio, 1 to 21. */
export function contrastRatio(hexA, hexB) {
  const [a, b] = [luminance(hexA), luminance(hexB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** The literal a semantic token ends at in one mode: resolveHex(src, 'text.primary', 'dark'). */
export function resolveHex(src, sysPath, mode) {
  const node = at(src, `sys.${sysPath}`);
  if (node === undefined) throw new Error(`sys.${sysPath} does not exist`);
  const alias = modes(src, `sys.${sysPath}`, node)[mode];
  if (!alias) throw new Error(`unknown mode "${mode}"`);
  return at(src, alias);
}

/** 4.5 for body text (SC 1.4.3), 3 for UI boundaries (SC 1.4.11). Disabled controls are exempt under 1.4.3. */
export const CONTRAST_PAIRS = [
  { fg: 'text.primary', bg: 'surface.page', min: 4.5, label: 'Body copy' },
  { fg: 'text.secondary', bg: 'surface.page', min: 4.5, label: 'Secondary text' },
  { fg: 'text.link', bg: 'surface.page', min: 4.5, label: 'Link' },
  { fg: 'text.on-brand', bg: 'surface.brand', min: 4.5, label: 'Text on brand' },
  { fg: 'action.primary.fg', bg: 'action.primary.bg', min: 4.5, label: 'Primary button' },
  { fg: 'action.secondary.fg', bg: 'action.secondary.bg', min: 4.5, label: 'Secondary button' },
  { fg: 'feedback.info.fg', bg: 'feedback.info.bg', min: 4.5, label: 'Badge · info' },
  { fg: 'feedback.success.fg', bg: 'feedback.success.bg', min: 4.5, label: 'Badge · success' },
  { fg: 'feedback.error.fg', bg: 'feedback.error.bg', min: 4.5, label: 'Badge · error' },
  { fg: 'feedback.warning.fg', bg: 'feedback.warning.bg', min: 4.5, label: 'Badge · warning' },
  { fg: 'text.on-fixed-dark', bg: 'surface.fixed-dark', min: 4.5, label: 'Footer heading' },
  { fg: 'text.on-fixed-dark-secondary', bg: 'surface.fixed-dark', min: 4.5, label: 'Footer link' },
  { fg: 'border.default', bg: 'surface.page', min: 3, label: 'Control border' },
  { fg: 'border.focus', bg: 'surface.raised', min: 3, label: 'Focus ring' },
  {
    fg: 'text.disabled',
    bg: 'surface.page',
    min: 4.5,
    label: 'Disabled control text',
    exempt: true,
  },
];
