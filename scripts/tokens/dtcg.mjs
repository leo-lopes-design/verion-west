/**
 * The Figma export, validated and turned into a DTCG-style tree.
 *
 * Every function here is pure: it takes the parsed export and returns data or
 * throws. Reading the file is the only I/O, and it lives in `loadSource`, so
 * the tests can run every rule against an in-memory copy.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SOURCE = 'tokens/figma-export.json';

export const loadSource = () => JSON.parse(readFileSync(join(ROOT, SOURCE), 'utf8'));

export const isAlias = (v) => typeof v === 'string' && v.startsWith('ref.');
export const at = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);

/** ref.color.neutral.900 -> --wu-ref-color-neutral-900 */
export const refVar = (path) => '--wu-ref-' + path.replace(/^ref\./, '').replace(/\./g, '-');
export const sysVar = (path) => '--wu-' + path.replace(/\./g, '-');

/**
 * Every group the export may contain, and the DTCG type of its leaves. A group
 * missing from this table is an error, not a guess: the old fallback typed any
 * unknown number as px and any unknown motion value as a cubic-bezier.
 */
export const TYPES = {
  ref: {
    color: 'color',
    space: 'dimension',
    radius: 'dimension',
    'font-size': 'dimension',
    'line-height': 'dimension',
    'font-family': 'fontFamily',
    elevation: 'dimension',
    'icon-size': 'dimension',
    blur: 'dimension',
    'border-width': 'dimension',
    motion: { duration: 'duration', stagger: 'duration', travel: 'dimension', ease: 'cubicBezier' },
  },
  sys: {
    surface: 'color',
    text: 'color',
    border: 'color',
    action: 'color',
    feedback: 'color',
    shadow: 'color',
    syntax: 'color',
    indicator: 'color',
    radius: 'dimension',
    type: 'dimension',
    space: 'dimension',
  },
};

export function dtcgType(tier, path) {
  const groups = TYPES[tier];
  if (!groups) throw new Error(`unknown tier "${tier}"`);
  const entry = Object.hasOwn(groups, path[0]) ? groups[path[0]] : undefined;
  if (entry === undefined) throw new Error(`unknown token group "${tier}.${path[0]}"`);
  if (typeof entry === 'string') return entry;
  const sub = Object.hasOwn(entry, path[1]) ? entry[path[1]] : undefined;
  if (sub === undefined) throw new Error(`unknown token group "${tier}.${path[0]}.${path[1]}"`);
  return sub;
}

const SHAPES = {
  color: (v) => typeof v === 'string' && /^#(?:[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v),
  fontFamily: (v) => typeof v === 'string' && v.trim() !== '',
  cubicBezier: (v) => typeof v === 'string' && /^cubic-bezier\(.+\)$/.test(v),
  dimension: (v) => typeof v === 'number' && Number.isFinite(v),
  duration: (v) => typeof v === 'number' && Number.isFinite(v),
};

/**
 * The CSS value of a primitive. Durations are exported in seconds and leave in
 * ms, dimensions leave in px: unitless numbers are invalid for time and length,
 * and CSS drops the whole declaration silently.
 */
export function withUnit(type, value) {
  if (!SHAPES[type]?.(value)) throw new Error(`${JSON.stringify(value)} is not a valid ${type}`);
  if (type === 'dimension') return `${value}px`;
  if (type === 'duration') return `${Math.round(value * 1000)}ms`;
  return value;
}

const isModal = (v) => v && typeof v === 'object' && ('light' in v || 'dark' in v);

/** Walks to the leaves, treating a {light,dark} pair as a leaf rather than a branch. */
export function* leaves(obj, trail = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && !isModal(v))
      yield* leaves(v, trail.concat(k));
    else yield [trail.concat(k), v];
  }
}

/** The primitive an alias points at; throws unless it is a `ref.*` alias to an existing leaf. */
export function primitive(src, where, alias) {
  if (!isAlias(alias)) throw new Error(`${where} is ${JSON.stringify(alias)}, not a ref.* alias`);
  const target = at(src, alias);
  if (target === undefined || (target && typeof target === 'object')) {
    throw new Error(`${where} points at ${alias}, a missing primitive`);
  }
  return target;
}

/** The two alias strings of a sys leaf, in mode order. A single-mode leaf uses one alias for both. */
export function modes(src, where, value) {
  if (isModal(value)) {
    const keys = Object.keys(value).sort().join(',');
    if (keys !== 'dark,light')
      throw new Error(`${where} has modes {${keys}}, expected {dark,light}`);
    primitive(src, `${where}.light`, value.light);
    primitive(src, `${where}.dark`, value.dark);
    return { light: value.light, dark: value.dark };
  }
  primitive(src, where, value);
  return { light: value, dark: value };
}

export const counts = (src) => ({
  ref: [...leaves(src.ref)].length,
  sys: [...leaves(src.sys)].length,
});

const TOP_LEVEL = new Set(['$meta', 'ref', 'sys', '$typography']);

/**
 * Every rule the build depends on, checked before anything is emitted. All
 * problems are collected so one run reports all of them.
 */
export function validateSource(src) {
  const errors = [];
  const check = (fn) => {
    try {
      fn();
    } catch (e) {
      errors.push(e.message);
    }
  };

  for (const key of Object.keys(src)) {
    if (!TOP_LEVEL.has(key)) errors.push(`unknown top-level key "${key}"`);
  }
  if (!src.ref || !src.sys) throw new Error('token source is missing "ref" or "sys"');

  const expected = src.$meta?.counts;
  const actual = counts(src);
  if (!expected) errors.push('$meta.counts is missing: the export must record its own leaf counts');
  else {
    for (const tier of ['ref', 'sys']) {
      if (expected[tier] !== actual[tier]) {
        errors.push(
          `count drift: ${tier} has ${actual[tier]} leaves, $meta.counts.${tier} says ${expected[tier]}`
        );
      }
    }
  }

  for (const [path, value] of leaves(src.ref)) {
    const where = `ref.${path.join('.')}`;
    check(() => {
      if (typeof value === 'string' && (isAlias(value) || value.includes('{'))) {
        throw new Error(`${where} is an alias (${value}); primitives must hold raw values`);
      }
      withUnit(dtcgType('ref', path), value);
    });
  }

  for (const [path, value] of leaves(src.sys)) {
    const where = `sys.${path.join('.')}`;
    check(() => {
      dtcgType('sys', path);
      modes(src, where, value);
    });
  }

  for (const [name, t] of Object.entries(src.$typography ?? {})) {
    if (!src.sys.type?.[t.role])
      errors.push(`$typography "${name}" uses role "${t.role}", which sys.type does not define`);
    if (!src.ref['font-family']?.[t.family]) {
      errors.push(
        `$typography "${name}" uses family "${t.family}", which ref.font-family does not define`
      );
    }
    if (!Number.isInteger(t.weight))
      errors.push(`$typography "${name}" has weight ${JSON.stringify(t.weight)}`);
  }

  for (const lvl of Object.keys(src.ref.elevation ?? {})) {
    if (!src.sys.shadow?.[lvl])
      errors.push(`ref.elevation.${lvl} has no sys.shadow.${lvl} to colour it`);
  }

  if (errors.length) {
    throw new Error(
      `figma-export.json failed ${errors.length} check(s):\n  - ${errors.join('\n  - ')}`
    );
  }
  return actual;
}

function put(target, path, node) {
  let cur = target;
  path.slice(0, -1).forEach((k) => (cur = cur[k] ??= {}));
  cur[path[path.length - 1]] = node;
}

/**
 * The tree Style Dictionary parses and the tokens.json developers download.
 * DTCG-style ($type, $value, {ref.*} references) with values as CSS strings
 * ("8px", "150ms", "#ffdd00"), not the object forms of the 2025.10 spec.
 */
export function buildDtcg(src) {
  const dtcg = { $description: src.$meta.source, ref: {}, sys: {} };
  for (const [path, value] of leaves(src.ref)) {
    const type = dtcgType('ref', path);
    put(dtcg.ref, path, { $type: type, $value: withUnit(type, value) });
  }
  for (const [path, value] of leaves(src.sys)) {
    const type = dtcgType('sys', path);
    const m = modes(src, `sys.${path.join('.')}`, value);
    if (value && typeof value === 'object') {
      put(dtcg.sys, path, {
        $type: type,
        $value: `{${m.light}}`,
        $extensions: { 'com.figma.modes': { light: `{${m.light}}`, dark: `{${m.dark}}` } },
      });
    } else {
      put(dtcg.sys, path, { $type: type, $value: `{${m.light}}` });
    }
  }
  return dtcg;
}
