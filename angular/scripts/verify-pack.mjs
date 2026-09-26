/**
 * Asserts that dist/lib is a package a consumer can install: its manifest, every
 * file its exports name, the token assets, and the public classes in its types.
 * Builds nothing, so it is cheap enough for CI; run it after `ng run verion-west:build-lib`.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'lib');
const PEERS = ['@angular/common', '@angular/core', '@angular/forms'];
const PUBLIC_CLASSES = [
  'AvatarComponent',
  'BadgeComponent',
  'ButtonComponent',
  'DetailRowComponent',
  'FieldComponent',
  'IconComponent',
  'ThemeDirective',
  'TileComponent',
];

const read = (file) => readFileSync(join(DIST, file), 'utf8');
const pkg = JSON.parse(read('package.json'));

assert.equal(pkg.name, '@verion-west/angular');
for (const peer of PEERS) {
  assert.match(
    pkg.peerDependencies?.[peer] ?? '',
    /^\^21\./,
    `${peer} must be a ^21 peer dependency`
  );
}
assert.deepEqual(
  Object.keys(pkg.dependencies ?? {}),
  ['tslib'],
  'only tslib may ship as a dependency'
);
assert.equal(
  pkg.scripts?.prepublishOnly,
  undefined,
  'the library must be compiled in partial mode'
);

const exported = {
  '.': [pkg.exports?.['.']?.types, pkg.exports?.['.']?.default],
  './tokens': [pkg.exports?.['./tokens']?.sass],
  './tokens/tokens.css': [pkg.exports?.['./tokens/tokens.css']],
};
for (const [subpath, files] of Object.entries(exported)) {
  for (const file of files) {
    assert.ok(
      file && existsSync(join(DIST, file)),
      `exports["${subpath}"] names a missing file: ${file}`
    );
  }
}
assert.match(
  read(pkg.exports['./tokens/tokens.css']),
  /--wu-surface-page:/,
  'tokens.css carries no tokens'
);
assert.match(
  read(pkg.exports['./tokens'].sass),
  /\$wu-surface-page:/,
  '_tokens.scss carries no tokens'
);

const types = read(pkg.exports['.'].types);
for (const name of PUBLIC_CLASSES) {
  assert.match(
    types,
    new RegExp(`\\bclass ${name}\\b`),
    `${name} is missing from the public types`
  );
}

console.log(
  `verify-pack: ${pkg.name}@${pkg.version} OK — ${PEERS.length} peers, ` +
    `${Object.keys(exported).length} export subpaths, ${PUBLIC_CLASSES.length} public classes`
);
