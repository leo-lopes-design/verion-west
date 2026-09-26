/**
 * axe-core on every route, in both themes. Exits 1 on any serious or critical violation.
 *
 *   BASE=http://localhost:3210 node qa/a11y.mjs      (after `npm run start:qa`)
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.BASE ?? 'http://localhost:3210';
const ROUTES = ['/', '/app', '/site', '/personas', '/handoff'];
const BLOCKING = new Set(['serious', 'critical']);

let blocking = 0;
const browser = await chromium.launch();
try {
  for (const theme of ['light', 'dark']) {
    // reduced motion so axe never measures contrast halfway through a fade
    const ctx = await browser.newContext({ colorScheme: theme, reducedMotion: 'reduce' });
    await ctx.addInitScript((t) => localStorage.setItem('wu-theme', t), theme);
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      // ?intro=0 skips the opening overlay, which exists for people, not for probes
      await page.goto(`${BASE}${route}?intro=0`, { waitUntil: 'networkidle' });
      await page.waitForFunction((t) => document.documentElement.dataset.theme === t, theme, {
        timeout: 5000,
      });
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations.filter((v) => BLOCKING.has(v.impact));
      blocking += bad.length;
      const tag = bad.length ? 'FAIL' : 'ok  ';
      console.log(
        `${tag}  ${theme.padEnd(5)}  ${route.padEnd(9)}  ${bad.length} serious/critical, ${violations.length - bad.length} other`
      );
      for (const v of bad) {
        console.log(
          `        ${v.impact} ${v.id} x${v.nodes.length}: ${v.help} — e.g. ${v.nodes[0].target.join(' ')}`
        );
      }
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(
  `\na11y: ${blocking} serious/critical rule(s) failing, ${ROUTES.length} routes x 2 themes`
);
process.exit(blocking ? 1 : 0);
