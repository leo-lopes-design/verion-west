import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // public/media ships pre-sized JPEGs with explicit width and height; an
    // image optimizer would add a runtime dependency for no measurable gain.
    rules: { '@next/next/no-img-element': 'off' },
  },
  globalIgnores([
    // eslint-config-next's own defaults, restated because this list replaces them.
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // The Angular workspace lints itself with its own config (`npm run lint -w`).
    'angular/**',
    // Generated: `npm run tokens`, `npm run build:storybook`, and the QA scripts.
    'public/artifacts/**',
    'public/storybook/**',
    'app/tokens.css',
    'lib/.personas-build/**',
    'lib/personas.compiled.mjs',
    'qa/screenshots/**',
    'qa/measurements-*.json',
  ]),
]);
