/**
 * Regression test: every copy of the theme switch stays in step.
 *
 * On /app two copies are on screen at once, the site nav and the phone's
 * Settings screen. When each kept its own state, flipping one left the other
 * stale, and the next click on the stale one changed nothing.
 *
 *   BASE=http://localhost:3210 node qa/verify-theme-sync.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3210';
const TIMEOUT = 5000;
const SWITCH = '[role="switch"][aria-label="Dark mode"]';
const results = [];
let failures = 0;

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  results.push(
    `${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`
  );
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // ?intro=0 skips the opening overlay, which would otherwise sit over the first click
  await page.goto(`${BASE}/app?intro=0`, { waitUntil: 'networkidle' });
  // initTheme stamps the attribute on mount, so its presence means the switches are hydrated
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-theme'), null, {
    timeout: TIMEOUT,
  });

  const switches = page.locator(SWITCH);
  const state = () =>
    page.$$eval(SWITCH, (els) => els.map((el) => el.getAttribute('aria-checked')));
  const attr = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'));

  /** Waits until every copy reads `want`, or gives up and lets the checks report it. */
  const settle = (want) =>
    page
      .waitForFunction(
        ([sel, w]) =>
          [...document.querySelectorAll(sel)].every((el) => el.getAttribute('aria-checked') === w),
        [SWITCH, want],
        { timeout: TIMEOUT }
      )
      .catch(() => {});
  /** Waits for the thumb and glyph transitions to finish; a transition replaced mid-flight rejects, and that counts as done. */
  const idle = (loc) =>
    loc.evaluate((el) =>
      Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished.catch(() => {})))
    );
  const flip = (want) => (want === 'true' ? 'false' : 'true');

  // the phone opens on Home; Settings is where the second copy lives
  await page.getByRole('button', { name: 'Settings' }).click();
  await switches
    .nth(1)
    .waitFor({ timeout: TIMEOUT })
    .catch(() => {});
  const count = await switches.count();
  check('two copies of the switch on one screen', count, 2);

  const before = await state();
  check('both copies agree at the start', before[0] === before[1], true);

  // flip via the nav copy
  await switches.nth(0).click();
  await settle(flip(before[0]));
  const afterNav = await state();
  check(
    'clicking the nav copy flips both',
    afterNav[0] === afterNav[1] && afterNav[0] !== before[0],
    true
  );
  check('the <html> attribute follows', await attr(), afterNav[0] === 'true' ? 'dark' : 'light');

  // the dead click: flip via the OTHER copy, which used to be stale
  await switches.nth(1).click();
  await settle(before[0]);
  const afterSettings = await state();
  check('clicking the Settings copy flips back (the dead click)', afterSettings[0], before[0]);
  check('both copies still agree', afterSettings[0] === afterSettings[1], true);

  // the thumb has to move, not just the aria state
  const sw = page.locator('.themeswitch').first();
  const thumbAt = () =>
    sw.locator('.themeswitch__thumb').evaluate((el) => getComputedStyle(el).transform);
  await idle(sw);
  const t0 = await thumbAt();
  const s0 = await sw.getAttribute('aria-checked');
  await sw.click();
  await settle(flip(s0));
  await idle(sw);
  check('the thumb moves between states', t0 !== (await thumbAt()), true);

  /* The thumb moving is not enough: an earlier build moved it while the active
     glyph stayed dim, because the rule keyed off :first-of-type and the thumb is
     also a span. Assert the colours directly. */
  const glyph = (side) =>
    sw
      .locator(`.themeswitch__slot[data-side="${side}"] svg`)
      .evaluate((el) => getComputedStyle(el).color);
  const setTo = async (want) => {
    if ((await sw.getAttribute('data-state')) !== want) {
      await sw.click();
      await settle(want === 'dark' ? 'true' : 'false');
    }
    await idle(sw);
  };

  await setTo('light');
  check(
    'light: the sun is lit and the moon dim',
    (await glyph('light')) !== (await glyph('dark')),
    true
  );
  await setTo('dark');
  check(
    'dark: the moon is lit and the sun dim',
    (await glyph('dark')) !== (await glyph('light')),
    true
  );
} catch (e) {
  failures++;
  results.push(`FAIL  ${e.message.split('\n')[0]}`);
} finally {
  await browser.close();
}

console.log(results.join('\n'));
console.log(`\ntheme sync: ${results.length - failures}/${results.length} passed`);
process.exit(failures ? 1 : 0);
