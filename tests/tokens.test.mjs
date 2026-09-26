/**
 * Token pipeline invariants, run in memory against tokens/figma-export.json.
 *
 *   node --test tests/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ROOT,
  buildDtcg,
  counts,
  dtcgType,
  isAlias,
  leaves,
  loadSource,
  validateSource,
  withUnit,
} from '../scripts/tokens/dtcg.mjs';
import { css, partition } from '../scripts/tokens/formats.mjs';
import { CONTRAST_PAIRS, contrastRatio, resolveHex } from '../scripts/tokens/contrast.mjs';

const src = loadSource();
const CSS = css(src);
const mutate = (fn) => {
  const copy = structuredClone(src);
  fn(copy);
  return copy;
};

/** Flat list of rule blocks: { selector, decls: Map }, with @media prefixed onto the selector. */
function rules(text) {
  const out = [];
  const stack = [];
  let buf = '';
  for (const ch of text.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') {
      stack.push(buf.trim().replace(/\s+/g, ' '));
      buf = '';
    } else if (ch === '}') {
      if (buf.trim()) {
        const decls = new Map();
        for (const d of buf
          .split(';')
          .map((s) => s.trim())
          .filter(Boolean)) {
          const i = d.indexOf(':');
          decls.set(d.slice(0, i).trim(), d.slice(i + 1).trim());
        }
        out.push({ selector: stack.join(' '), decls });
      }
      stack.pop();
      buf = '';
    } else buf += ch;
  }
  return out;
}
const RULES = rules(CSS);
const rule = (selector) => {
  const found = RULES.find((r) => r.selector === selector);
  assert.ok(found, `no rule for ${selector}`);
  return found;
};
const LIGHT = rule(":root, [data-theme='light']");
const DARK = rule("[data-theme='dark']");
const DARK_OS = rule("@media (prefers-color-scheme: dark) :root:not([data-theme='light'])");
const p = partition(src);

/* ------------------------------------------------------------ a. counts */
test('counts: 114 ref, 97 sys, 51 themed, and they match $meta.counts', () => {
  const c = counts(src);
  assert.deepEqual(c, { ref: 114, sys: 97 });
  assert.deepEqual(c, src.$meta.counts);
  assert.equal(p.light.length, 51);
  assert.equal(p.dark.length, 51);
  assert.equal(p.statics.length, 97 - 51);
  assert.deepEqual(validateSource(src), c);
});

/* ------------------------------------------------------------ b. aliases */
test('every sys leaf, in both modes, is a ref.* alias to an existing primitive', () => {
  for (const [path, value] of leaves(src.sys)) {
    const aliases = typeof value === 'object' ? [value.light, value.dark] : [value];
    for (const alias of aliases) {
      assert.ok(isAlias(alias), `sys.${path.join('.')} = ${alias}`);
      const target = alias.split('.').reduce((o, k) => o?.[k], src);
      assert.ok(
        target !== undefined && typeof target !== 'object',
        `sys.${path.join('.')} -> ${alias}`
      );
    }
  }
});

test('no ref leaf is an alias', () => {
  for (const [path, value] of leaves(src.ref)) {
    assert.ok(!isAlias(value), `ref.${path.join('.')} = ${value}`);
  }
});

/* ------------------------------------------------------------ c. units */
test('every duration ends in ms and every dimension in px, in tokens.json and in the CSS', () => {
  const dtcg = buildDtcg(src);
  const root = rule(':root').decls;
  const UNIT = { duration: /^\d+ms$/, dimension: /^-?\d+(\.\d+)?px$/ };
  const seen = { duration: 0, dimension: 0 };
  for (const [path] of leaves(src.ref)) {
    const node = path.reduce((o, k) => o[k], dtcg.ref);
    if (!UNIT[node.$type]) continue;
    seen[node.$type]++;
    assert.match(node.$value, UNIT[node.$type], `tokens.json ref.${path.join('.')}`);
    assert.match(
      root.get(`--wu-ref-${path.join('-')}`),
      UNIT[node.$type],
      `tokens.css ref.${path.join('.')}`
    );
  }
  assert.deepEqual(seen, { duration: 10, dimension: 52 });
});

test('an unknown group throws instead of guessing a type', () => {
  assert.throws(() => dtcgType('ref', ['sparkle', 'x']), /unknown token group "ref.sparkle"/);
  assert.throws(
    () => dtcgType('ref', ['motion', 'wobble', 'x']),
    /unknown token group "ref.motion.wobble"/
  );
  assert.throws(() => dtcgType('sys', ['color', 'x']), /unknown token group "sys.color"/);
  assert.throws(() => withUnit('color', 12), /not a valid color/);
  assert.throws(() => withUnit('dimension', '8'), /not a valid dimension/);
  assert.throws(
    () => validateSource(mutate((s) => (s.ref.opacity = { half: 0.5 }))),
    /unknown token group "ref.opacity"/
  );
});

/* ------------------------------------------------------------ d-f. css */
test('every var(--wu-*) the CSS references is declared in it', () => {
  const declared = new Set(RULES.flatMap((r) => [...r.decls.keys()]));
  const used = new Set([...CSS.matchAll(/var\((--wu-[a-z0-9-]+)\)/g)].map((m) => m[1]));
  // the three kinds of reference: primitives, type roles in the font shorthands, shadows in the composites
  for (const n of ['--wu-ref-color-neutral-900', '--wu-type-body-size', '--wu-shadow-md'])
    assert.ok(used.has(n), n);
  const missing = [...used].filter((n) => !declared.has(n));
  assert.deepEqual(missing, []);
});

test('every name in the dark block exists in the light block with a different value', () => {
  for (const block of [DARK, DARK_OS]) {
    const themed = [...block.decls].filter(
      ([k]) => k.startsWith('--wu-') && !k.startsWith('--wu-elevation-')
    );
    assert.equal(themed.length, 51, block.selector);
    for (const [name, value] of themed) {
      assert.ok(LIGHT.decls.has(name), `${name} missing from the light block`);
      assert.notEqual(LIGHT.decls.get(name), value, `${name} is the same in both modes`);
    }
  }
});

test('a nested [data-theme=light] scope redeclares every themed token and composite', () => {
  const composites = p.elevation.map(([k]) => k);
  assert.equal(composites.length, 3);
  for (const block of [LIGHT, DARK, DARK_OS]) {
    for (const [name] of p.light)
      assert.ok(block.decls.has(name), `${block.selector} lacks ${name}`);
    for (const name of composites)
      assert.ok(block.decls.has(name), `${block.selector} lacks ${name}`);
  }
  assert.equal(LIGHT.decls.get('color-scheme'), 'light');
  assert.equal(DARK.decls.get('color-scheme'), 'dark');
  assert.equal(DARK_OS.decls.get('color-scheme'), 'dark');
  // the composites live only in the theme blocks, never on the bare :root
  for (const name of composites) assert.ok(!rule(':root').decls.has(name));
});

/* ------------------------------------------------------------ g. contrast */
test('every non-exempt contrast pair meets its threshold in both modes', () => {
  const failures = [];
  for (const { fg, bg, min, label, exempt } of CONTRAST_PAIRS) {
    if (exempt) continue;
    for (const mode of ['light', 'dark']) {
      const ratio = contrastRatio(resolveHex(src, fg, mode), resolveHex(src, bg, mode));
      if (ratio < min)
        failures.push(`${label} (${fg} on ${bg}, ${mode}): ${ratio.toFixed(2)} < ${min}`);
    }
  }
  assert.deepEqual(failures, []);
});

test('contrastRatio matches the WCAG reference values', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#ffffff', '#ffffff'), 1);
  assert.equal(contrastRatio('#767676', '#ffffff').toFixed(2), '4.54');
  assert.throws(() => contrastRatio('#00000080', '#ffffff'), /translucent/);
});

test('CONTRAST_PAIRS mirrors the list lib/tokens.ts renders', () => {
  const lib = readFileSync(join(ROOT, 'lib/tokens.ts'), 'utf8');
  const literal = /CONTRAST_PAIRS[^=]*=\s*\[([\s\S]*?)\n\];/.exec(lib);
  if (!literal) return; // lib imports the list instead of declaring its own: nothing to mirror
  const field = (obj, key) => new RegExp(`\\b${key}:\\s*'?([^',\\n]+)'?`).exec(obj)?.[1];
  const theirs = literal[1]
    .split('}')
    .filter((obj) => field(obj, 'fg'))
    .map(
      (obj) =>
        `${field(obj, 'fg')} on ${field(obj, 'bg')} >= ${Number(field(obj, 'min'))}${/\bexempt/.test(obj) ? ' (exempt)' : ''}`
    );
  const ours = CONTRAST_PAIRS.map(
    (c) => `${c.fg} on ${c.bg} >= ${c.min}${c.exempt ? ' (exempt)' : ''}`
  );
  assert.ok(
    theirs.length > 0,
    'found a CONTRAST_PAIRS literal in lib/tokens.ts but parsed no pairs'
  );
  assert.deepEqual([...ours].sort(), [...theirs].sort());
});

/* ------------------------------------------------------------ fail loudly */
test('the build refuses a broken source', async (t) => {
  const cases = [
    [
      'count drift',
      (s) => (s.$meta.counts.ref = 115),
      /count drift: ref has 114 leaves, \$meta\.counts\.ref says 115/,
    ],
    ['missing counts', (s) => delete s.$meta.counts, /\$meta\.counts is missing/],
    [
      'raw sys value',
      (s) => (s.sys.text.primary.light = '#000000'),
      /sys\.text\.primary\.light is "#000000", not a ref\.\* alias/,
    ],
    [
      'raw single-mode sys value',
      (s) => (s.sys.type.body.size = 16),
      /sys\.type\.body\.size is 16, not a ref\.\* alias/,
    ],
    [
      'bad alias',
      (s) => (s.sys.text.primary.dark = 'ref.color.neutral.999'),
      /points at ref\.color\.neutral\.999, a missing primitive/,
    ],
    [
      'alias to a group',
      (s) => (s.sys.text.primary.dark = 'ref.color.neutral'),
      /a missing primitive/,
    ],
    [
      'half a mode pair',
      (s) => delete s.sys.text.primary.dark,
      /sys\.text\.primary has modes \{light\}/,
    ],
    ['ref alias', (s) => (s.ref.space.xs = 'ref.space.sm'), /ref\.space\.xs is an alias/],
    [
      'unknown sys group',
      (s) =>
        (s.sys.glow = { soft: { light: 'ref.color.transparent', dark: 'ref.color.transparent' } }),
      /unknown token group "sys\.glow"/,
    ],
    ['unknown top-level key', (s) => (s.elevation = {}), /unknown top-level key "elevation"/],
    [
      'unknown type role',
      (s) => (s.$typography['Body/01'].role = 'fine-print'),
      /role "fine-print"/,
    ],
    ['unknown font family', (s) => (s.$typography['Body/01'].family = 'mono'), /family "mono"/],
    [
      'elevation without a shadow',
      (s) => delete s.sys.shadow.md,
      /ref\.elevation\.md has no sys\.shadow\.md/,
    ],
  ];
  for (const [name, fn, message] of cases) {
    await t.test(name, () => assert.throws(() => validateSource(mutate(fn)), message));
  }
  // the emitters refuse too, so skipping validation cannot sneak a raw value into the CSS
  const raw = mutate((s) => (s.sys.text.primary.light = '#000000'));
  assert.throws(() => css(raw), /not a ref\.\* alias/);
  assert.throws(() => buildDtcg(raw), /not a ref\.\* alias/);
});
