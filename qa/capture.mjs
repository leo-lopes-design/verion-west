/**
 * Capture + measure every view of the prototype.
 *
 * Screenshots alone cannot see overflow that is clipped, a touch target two
 * pixels under the minimum, or a heading level skipped. So each capture also
 * emits measurements, and the written review separates what was measured from
 * what was judged by eye.
 *
 *   BASE=http://localhost:3210 node qa/capture.mjs
 *
 * Exits 1 when a flow step fails or a page scrolls sideways.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:3210';
const DATE = process.env.DATE ?? new Date().toISOString().slice(0, 10);
const OUT = `qa/screenshots/${DATE}`;
mkdirSync(OUT, { recursive: true });

const WIDTHS = [390, 768, 1080, 1440];
const THEMES = ['light', 'dark'];
// 44 is WCAG 2.5.5 (AAA) and the platform guideline; the AA floor in 2.5.8 is 24
const MIN_TAP = 44;

/** Everything a static image cannot tell us. Runs in the page, so the tap size comes in as an argument. */
const MEASURE = (minTap) => {
  const de = document.documentElement;
  const vw = de.clientWidth;

  const overflowing = [...document.querySelectorAll('*')]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && (r.right > vw + 1 || r.left < -1);
    })
    .slice(0, 12)
    .map((el) => ({
      sel:
        el.tagName.toLowerCase() +
        (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
          : ''),
      right: Math.round(el.getBoundingClientRect().right),
      width: Math.round(el.getBoundingClientRect().width),
    }));

  const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
    level: Number(h.tagName[1]),
    text: (h.textContent || '').trim().slice(0, 48),
    size: Math.round(parseFloat(getComputedStyle(h).fontSize)),
  }));

  const smallTargets = [...document.querySelectorAll('button,a,[role="switch"],select,input')]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, w: Math.round(r.width), h: Math.round(r.height) };
    })
    .filter(
      ({ w, h, el }) => w > 0 && h > 0 && (w < minTap || h < minTap) && el.offsetParent !== null
    )
    .slice(0, 14)
    .map(({ el, w, h }) => ({
      tag: el.tagName.toLowerCase(),
      label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 32),
      w,
      h,
    }));

  const tiny = [...document.querySelectorAll('p,span,li,td,th,label')]
    .map((el) => ({ el, px: parseFloat(getComputedStyle(el).fontSize) }))
    .filter(({ px, el }) => px > 0 && px < 12 && (el.textContent || '').trim().length > 0)
    .slice(0, 8)
    .map(({ el, px }) => ({ px, text: (el.textContent || '').trim().slice(0, 40) }));

  // vertical rhythm: gaps between the top-level section blocks
  const sections = [...document.querySelectorAll('main > section, .section')];
  const gaps = [];
  for (let i = 1; i < sections.length; i++) {
    const prev = sections[i - 1].getBoundingClientRect();
    const cur = sections[i].getBoundingClientRect();
    gaps.push(Math.round(cur.top - prev.bottom));
  }

  return {
    docScrollWidth: de.scrollWidth,
    viewportWidth: vw,
    horizontalOverflow: de.scrollWidth > vw + 1,
    pageHeight: de.scrollHeight,
    overflowing,
    headings,
    smallTargets,
    tinyText: tiny,
    sectionGaps: gaps,
  };
};

/** Walk the phone prototype; each entry leaves the app on the named screen. */
const FLOW = [
  ['01-home', async () => {}],
  ['02-amount', async (p) => p.getByRole('button', { name: 'Start a transfer' }).click()],
  [
    '03-amount-overlimit',
    async (p) => {
      for (const k of ['9', '9', '9', '9'])
        await p.getByRole('button', { name: k, exact: true }).click();
    },
  ],
  [
    '04-recipient',
    async (p) => {
      for (let i = 0; i < 4; i++) await p.getByRole('button', { name: 'Delete' }).click();
      await p.getByRole('button', { name: 'Continue' }).click();
    },
  ],
  ['05-method', async (p) => p.getByRole('button', { name: 'Continue' }).click()],
  ['06-review', async (p) => p.getByRole('button', { name: 'Review transfer' }).click()],
  ['07-success', async (p) => p.getByRole('button', { name: 'Confirm and send' }).click()],
  ['08-tracking', async (p) => p.getByRole('button', { name: 'Track this transfer' }).click()],
  // tracking is not a flow route, so the tab bar is already back — going Back
  // first pops to success, where the tabs are hidden and Activity is not there
  ['09-activity', async (p) => p.getByRole('button', { name: 'Activity' }).click()],
  ['10-settings', async (p) => p.getByRole('button', { name: 'Settings' }).click()],
];

const report = {};
const browser = await chromium.launch();

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 1000 },
      deviceScaleFactor: 2,
      colorScheme: theme,
    });
    await ctx.addInitScript((t) => {
      try {
        localStorage.setItem('wu-theme', t);
      } catch {}
    }, theme);
    const page = await ctx.newPage();

    for (const route of ['/', '/site', '/app']) {
      const slug = route === '/' ? 'catalogue' : route.slice(1);
      // ?intro=0 keeps the opening overlay out of the screenshots
      await page.goto(`${BASE}${route}?intro=0`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      const key = `${slug}-${width}-${theme}`;
      await page.screenshot({ path: `${OUT}/${key}.png`, fullPage: true });
      report[key] = await page.evaluate(MEASURE, MIN_TAP);
    }

    // the nine phone screens, at the two widths where the device shell differs
    if (width === 1440 || width === 390) {
      await page.goto(`${BASE}/app?intro=0`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(350);
      const device = page.locator('.device').first();
      for (const [name, step] of FLOW) {
        try {
          await step(page);
          await page.waitForTimeout(320);
          const key = `app-${name}-${width}-${theme}`;
          await device.screenshot({ path: `${OUT}/${key}.png` });
          report[key] = await page.evaluate(() => {
            const scr = document.querySelector('.scr__body');
            const dev = document.querySelector('.device__screen');
            return {
              screenScrolls: scr ? scr.scrollHeight > scr.clientHeight + 1 : null,
              contentHeight: scr ? scr.scrollHeight : null,
              visibleHeight: scr ? scr.clientHeight : null,
              deviceHeight: dev ? Math.round(dev.getBoundingClientRect().height) : null,
            };
          });
        } catch (e) {
          report[`app-${name}-${width}-${theme}`] = {
            error: String(e).split('\n')[0].slice(0, 160),
          };
        }
      }
    }

    await ctx.close();
  }
}

await browser.close();
writeFileSync(`qa/measurements-${DATE}.json`, JSON.stringify(report, null, 2));

const keys = Object.keys(report);
const failed = keys.filter((k) => report[k].error);
const overflow = keys.filter((k) => report[k].horizontalOverflow);
console.log(`captures: ${keys.length}`);
console.log(
  `failed flow steps: ${failed.length}${failed.length ? ' -> ' + failed.join(', ') : ''}`
);
console.log(
  `horizontal overflow: ${overflow.length}${overflow.length ? ' -> ' + overflow.join(', ') : ''}`
);
process.exit(failed.length || overflow.length ? 1 : 0);
