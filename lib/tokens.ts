import raw from '@/tokens/figma-export.json';
import { CONTRAST_PAIRS, contrastRatio, resolveHex } from '@/scripts/tokens/contrast.mjs';
import { counts } from '@/scripts/tokens/dtcg.mjs';

type Modal = { light: string; dark: string };

const isModal = (node: unknown): node is Modal =>
  typeof node === 'object' && node !== null && 'light' in node && 'dark' in node;

const valueAt = (path: string): unknown =>
  path
    .split('.')
    .reduce<unknown>(
      (node, key) => (node == null ? node : (node as Record<string, unknown>)[key]),
      raw
    );

/** Follow a `ref.*` pointer to the literal it ends at. A pointer to nothing fails the build. */
export function resolveRef(pointer: string): string {
  const value = valueAt(pointer);
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  throw new Error(
    `Token pointer "${pointer}" does not resolve to a value in tokens/figma-export.json`
  );
}

/** The day the variables were exported from Figma — the date every derived file is true on. */
export const EXPORTED_AT: string = raw.$meta.exportedAt;

export type SemanticToken = {
  name: string;
  cssVar: string;
  light: string;
  dark: string;
  themed: boolean;
};

/** Flatten one semantic group (surface, text, action…) into display rows. */
export function semanticGroup(group: string): SemanticToken[] {
  const node = (raw.sys as Record<string, unknown>)[group];
  const out: SemanticToken[] = [];

  const walk = (obj: Record<string, unknown>, trail: string[]) => {
    for (const [key, value] of Object.entries(obj)) {
      const path = [group, ...trail, key];
      if (isModal(value)) {
        out.push({
          name: path.join('/'),
          cssVar: '--wu-' + path.join('-'),
          light: resolveRef(value.light),
          dark: resolveRef(value.dark),
          themed: value.light !== value.dark,
        });
      } else if (value && typeof value === 'object') {
        walk(value as Record<string, unknown>, [...trail, key]);
      }
    }
  };

  walk(node as Record<string, unknown>, []);
  return out;
}

export const SPACE = Object.entries(raw.ref.space) as [string, number][];
export const RADIUS = Object.entries(raw.ref.radius) as [string, number][];
export const DURATIONS = Object.entries(raw.ref.motion.duration) as [string, number][];
export const EASES = Object.entries(raw.ref.motion.ease) as [string, string][];
export const TYPOGRAPHY = Object.entries(raw.$typography) as [
  string,
  { role: string; family: string; weight: number },
][];
export const TYPE_ROLES = raw.sys.type as Record<string, { size: string; line: string }>;

/** Leaf counts by the same walker the build checks against `$meta.counts`. */
export const COUNTS: { ref: number; sys: number } = counts(raw);

/* ---------- contrast, computed rather than asserted ----------
   The pair list and the ratio are the build's own (scripts/tokens/contrast.mjs),
   so the table on / shows exactly what tests/tokens.test.mjs enforces. */

export { CONTRAST_PAIRS };
export type ContrastPair = (typeof CONTRAST_PAIRS)[number];

const toHundredths = (ratio: number) => Math.round(ratio * 100) / 100;

/** One pair's ratio in each mode, rounded for display. */
export function measureContrast({ fg, bg }: ContrastPair) {
  const ratioIn = (mode: 'light' | 'dark') =>
    toHundredths(contrastRatio(resolveHex(raw, fg, mode), resolveHex(raw, bg, mode)));
  return { light: ratioIn('light'), dark: ratioIn('dark') };
}
