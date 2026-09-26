# Verion West

A design-system study. It uses one token source, exported from Figma, to drive two codebases:

- a **Next.js** showcase with a marketing page, a mobile app prototype, personas and a handoff page;
- an **Angular** component library, documented in Storybook and packaged with ng-packagr.

Verion West is a fictional brand. Its visual language was measured from a public money-transfer website. See [Legal](#legal).

**Live demo:** [wu-ds-demo.vercel.app](https://wu-ds-demo.vercel.app) · **Storybook:** [/storybook](https://wu-ds-demo.vercel.app/storybook/index.html)

## Run it

Requires Node 22 or newer (`.nvmrc`).

```bash
npm ci
npm run dev          # Next.js showcase on http://localhost:3000
npm run storybook    # Angular Storybook on http://localhost:6006
```

`npm ci` installs both workspaces: the root app and `angular/`. `dev` and `storybook` regenerate the tokens first, so there is no separate setup step.

## How the tokens flow

```text
Figma variables
   │  exported once, committed as-is
   ▼
tokens/figma-export.json        the only place a value lives
   │  npm run tokens  (scripts/build-tokens.mjs, Style Dictionary)
   ├─► app/tokens.css                          Next.js: CSS custom properties, light + dark
   ├─► angular/src/tokens/tokens.css           Angular: the same properties
   ├─► angular/src/tokens/_tokens.scss         SCSS variables that point AT the properties
   ├─► angular/src/tokens/tokens.ts            typed token names
   └─► tokens/tokens.json, public/artifacts/   downloadable copies with references intact
```

There are two tiers. **114 primitives** (`ref`) hold raw values. **97 semantic tokens** (`sys`) are aliases of those primitives, and 51 of them change between light and dark. Components only consume semantic tokens.

The build **fails** when any of these happens:

- a semantic token holds a raw value instead of an alias;
- an alias points at a primitive that does not exist;
- the number of primitives or semantic tokens drifts from the count recorded at export.

Nothing reads Figma live. Figma's Variables REST API is Enterprise-only, so the claim here is "counted at export", not "continuously in sync".

## What is checked

| Command             | What it proves                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run lint`      | ESLint on the Next app (`eslint-config-next`), angular-eslint on the library                                      |
| `npm run typecheck` | Strict TypeScript across the Next app                                                                             |
| `npm test`          | Token pipeline invariants (`tests/`), persona data schema (`qa/verify-personas.mjs`), Angular unit tests (Vitest) |
| `npm run build`     | Tokens, then Storybook, then the Next.js production build                                                         |
| `npm run build:lib` | The Angular library as an installable package, verified after packing                                             |
| `npm run test:e2e`  | Theme switching and axe accessibility checks on every route, both themes (needs `npm run start:qa`)               |

CI runs all of these on every push: `.github/workflows/ci.yml`.

## Repository map

```text
app/            Next.js routes: /, /app, /site, /personas, /handoff
components/     React components for the showcase and the prototype
lib/            data and helpers: money formatting, flow state, tokens, personas
angular/        the Angular library: src/lib/* components, Storybook, ng-packagr config
scripts/        the token pipeline (build-tokens.mjs, scripts/tokens/*)
tokens/         figma-export.json, the source of every value
tests/          token pipeline tests (node:test)
qa/             end-to-end, accessibility and data checks
design/         research notes behind the personas
```

## Decisions worth knowing

- **The `wu-` prefix is kept.** Custom properties are `--wu-*` and Angular selectors are `wu-*`, so the tokens and components can drop into an existing codebase without renaming. The npm package itself is `@verion-west/angular`.
- **Angular 21.** The library targets the Angular 21 LTS line. Nothing in it depends on 21 specifically, and Storybook 10.6 supports up to 22.
- **Style Dictionary orchestrates, custom formats emit.** Style Dictionary has no concept of a mode. The CSS formats emit only the tokens that change inside the dark block, instead of repeating all 97.
- **Generated files are not committed.** Tokens, the Storybook build and the downloadable artifacts are all rebuilt by `npm run build`.

## Legal

Verion West is a fictional brand created for a design-system study. This project is not affiliated with, sponsored by, or endorsed by Western Union or its affiliates. "Western Union" is a trademark of Western Union Holdings, Inc. It is named here only to identify the public website whose stylesheet values (colours, type scale, radii) were measured for the study. The Verion West logo is an original drawing. No Western Union logo, artwork, photography or copy is included.

Nothing here is a real financial product. Exchange rates, fees, tracking numbers, card numbers and people are all invented. The app sends no data anywhere and cannot move money. Do not enter real personal or payment information.

The MIT License covers the original source code and design tokens in this repository. It grants no rights in any third-party trademark. The portraits in `public/media` are AI-generated and depict no real person. Archivo, Roboto and Nunito Sans are used under the SIL Open Font License 1.1.

## License

[MIT](LICENSE). Take anything that is useful.
