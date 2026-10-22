// Run the preview server first, then this file with Playwright installed.
// PLAYWRIGHT_MODULE / CHROMIUM_EXECUTABLE optionally select local installations.
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const modulePath = process.env.PLAYWRIGHT_MODULE;
const { chromium } = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined });
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4173";
await mkdir("build", { recursive: true });

try {
  for (const width of [1920, 1280, 960]) {
    const context = await browser.newContext({ viewport: { width, height: 1080 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${base}/test/harness/desktop.html`);
    await page.waitForFunction(() => window.SpotifyRedesign && document.querySelector(".srd-window-controls"));
    await page.waitForTimeout(150);
    const geometry = await page.evaluate(() => {
      const rect = selector => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, cx: r.x + r.width / 2, cy: r.y + r.height / 2 };
      };
      const shelf = document.querySelector('[data-testid="component-shelf"]');
      const cards = [...shelf.querySelectorAll('.e-10451-card')].slice(0, 2).map(node => {
        const r = node.getBoundingClientRect(); return { x: r.x, w: r.width };
      });
      return {
        nav: rect('.srd-global-nav'), caption: rect('.srd-window-controls'), menu: rect('[aria-label="Main menu"]'),
        player: rect('.srd-player-zone'), play: rect('[data-testid="control-button-playpause"]'),
        icon: rect('[data-testid="control-button-playpause"] svg'), shelf: rect('[data-testid="component-shelf"]'), cards,
        buttons: document.querySelectorAll('.srd-window-control').length,
        pageWidth: document.documentElement.scrollWidth, viewport: innerWidth,
      };
    });
    console.log(width, JSON.stringify(geometry));
    assert.equal(geometry.buttons, 3, "all native DOM caption actions must be recognized");
    assert(Math.abs(geometry.nav.cy - geometry.caption.cy) < 1, "caption panel must align vertically with navigation");
    assert(geometry.caption.x - geometry.nav.x - geometry.nav.w >= 15, "caption needs a separate gutter");
    assert(Math.abs(geometry.menu.cy - geometry.nav.cy) < 1, "three-dot menu must be centered");
    assert(Math.abs(geometry.play.cx - geometry.player.cx) < 1, "play/pause must be centered in the player");
    assert(Math.abs(geometry.icon.cx - geometry.play.cx) < 1 && Math.abs(geometry.icon.cy - geometry.play.cy) < 1, "play/pause glyph must be centered in its hit target");
    assert(geometry.cards[0].x - geometry.shelf.x >= 23, "first card needs the same inset as its shelf header");
    assert(geometry.cards[1].x - geometry.cards[0].x - geometry.cards[0].w >= 15, "cards need a consistent gutter");
    assert(geometry.pageWidth <= geometry.viewport, "window must not overflow horizontally");
    const searchWidth = await page.locator('[data-testid="search-input"]').evaluate(n => n.getBoundingClientRect().width);
    assert(searchWidth > 200, 'native collapsed search styles must not reduce the input to an icon');
    assert.notEqual(await page.locator('[data-testid="control-button-playpause"] path').evaluate(n => getComputedStyle(n).fill), 'rgb(0, 0, 0)', 'native inverted spans must not turn the play icon black');
    const card = page.locator('.e-10451-card').first();
    await card.hover();
    await page.waitForTimeout(220);
    const hover = await card.evaluate(n => ({ bg: getComputedStyle(n).backgroundColor, transform: getComputedStyle(n).transform }));
    assert.notEqual(hover.bg, 'rgb(31, 31, 31)', 'hover must keep the glass surface');
    assert(hover.transform.includes('-2'), 'hover should lift the card gently');
    await page.locator('.transport-side').first().evaluate(node => {
      const extra = document.createElement('button'); extra.ariaLabel = 'Seek backward'; extra.textContent = '15'; node.appendChild(extra);
    });
    const asymmetricCenter = await page.locator('[data-testid="control-button-playpause"]').evaluate(node => {
      const play = node.getBoundingClientRect(); const player = node.closest('.srd-player-zone').getBoundingClientRect();
      return Math.abs(play.x + play.width / 2 - player.x - player.width / 2);
    });
    assert(asymmetricCenter < 1, 'play/pause must stay centered when transport groups contain different numbers of controls');
    await page.getByRole('button', { name: 'Seek backward', exact: true }).evaluate(node => node.remove());

    await page.getByRole('button', { name: 'Minimize', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.fixtureCaptionClicks), ['Minimize'], "caption handlers must be preserved");
    await page.getByRole('combobox', { name: 'Search', exact: true }).focus();
    await page.waitForFunction(() => !document.querySelector('#search-results').hidden);
    const onTop = await page.locator('#search-results [role="option"]').first().evaluate(node => {
      const r = node.getBoundingClientRect();
      return node.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    });
    assert(onTop, "search results must be hit-testable above the main content");
    if (width === 1920) await page.screenshot({ path: 'build/layout-search.png' });
    await page.getByRole('combobox', { name: 'Search', exact: true }).press('Escape');

    await page.getByRole('button', { name: 'Open Remixify settings', exact: true }).click();
    const range = async (label, value) => page.getByLabel(label, { exact: true }).evaluate((node, next) => {
      node.value = String(next); node.dispatchEvent(new Event('input', { bubbles: true }));
    }, value);
    const material = () => page.locator('.srd-global-nav').evaluate(node => {
      const s = getComputedStyle(node); return [s.backgroundImage, s.backgroundColor, s.backdropFilter];
    });
    const before = await material();
    await range('Glass brightness', 100);
    const brighter = await material();
    assert.notEqual(brighter[0], before[0], "brightness must change visible panel material");
    await range('Glass clarity', 5);
    assert.notEqual((await material())[1], before[1], "clarity must change visible panel opacity");
    await range('Glass blur', 8);
    assert((await material())[2].includes('8px'), "blur must affect the real navigation panel");
    await range('Glass brightness', 65);
    await range('Glass clarity', 78);
    await range('Glass blur', 24);
    const padding = () => page.locator('.e-10451-card').first().evaluate(node => getComputedStyle(node).padding);
    const comfortPadding = await padding();
    await page.getByRole('button', { name: 'Compact', exact: true }).click();
    assert.notEqual(await padding(), comfortPadding, 'density setting must change media-card spacing');
    await page.getByRole('button', { name: 'Comfort', exact: true }).click();
    await page.locator('.srd-close').click();
    if (width === 1920) await page.screenshot({ path: 'build/layout-desktop.png' });
    assert.deepEqual(errors, [], "runtime should have no page errors");
    await context.close();
  }

  const updates = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const updatePage = await updates.newPage();
  await updatePage.goto(base + '/test/harness/desktop.html');
  await updatePage.waitForFunction(() => window.SpotifyRedesign);
  await updatePage.evaluate(() => {
    window.fixtureUpdate = { ...window.__SpotifyRedesignBootstrap.channel, version: 'next' };
    window.fixtureProgress = (ready, progress) => window.dispatchEvent(new CustomEvent('spotify-redesign:update-available', { detail: { update: window.fixtureUpdate, ready, progress: { ...progress, updatedAt: Date.now() } } }));
    document.addEventListener('click', e => { if (e.target instanceof HTMLAnchorElement && e.target.protocol === 'remixify:') e.preventDefault(); }, true);
    window.fixtureProgress(false, { stage: 'downloading', bytes: 512, totalBytes: 1024 });
  });
  await updatePage.locator('.srd-update-button').click();
  assert.equal(await updatePage.locator('.srd-update-progress').evaluate(n => n.value), 50);
  assert(await updatePage.getByRole('button', { name: /^Downloading/ }).isDisabled());
  await updatePage.evaluate(() => window.fixtureProgress(true, { stage: 'ready' }));
  await updatePage.getByRole('button', { name: 'Update now', exact: true }).click();
  await updatePage.waitForFunction(() => document.querySelector('.srd-update-status--error'), { timeout: 12000 });
  assert((await updatePage.locator('.srd-update-status-label').textContent()).includes('Windows did not respond'));
  assert(await updatePage.getByRole('button', { name: 'Update now', exact: true }).isEnabled());
  await updatePage.getByRole('button', { name: 'Update now', exact: true }).click();
  await updatePage.evaluate(() => window.fixtureProgress(true, { stage: 'installing', step: 3, steps: 4, message: 'Repairing launchers' }));
  assert.equal(await updatePage.locator('.srd-update-progress').evaluate(n => n.value), 50);
  assert((await updatePage.locator('.srd-update-status-label').textContent()).includes('Repairing launchers'));
  await updates.close();

  const native = await browser.newContext({ viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/142.0.0.0 Safari/537.36' });
  const page = await native.newPage();
  await page.goto(`${base}/test/harness/desktop.html?native`);
  await page.waitForSelector('.srd-native-caption-frame', { state: 'visible' });
  const nativeGeometry = await page.evaluate(() => {
    const nav = document.querySelector('.srd-global-nav').getBoundingClientRect();
    const caption = document.querySelector('.srd-native-caption-frame').getBoundingClientRect();
    const menu = document.querySelector('.srd-native-menu-frame').getBoundingClientRect();
    return { captionGap: caption.x - nav.right, navCenter: nav.y + nav.height / 2, captionCenter: caption.y + caption.height / 2, menuCenter: menu.y + menu.height / 2, pointerEvents: getComputedStyle(document.querySelector('.srd-native-caption-frame')).pointerEvents };
  });
  assert(nativeGeometry.captionGap >= 16);
  assert.equal(nativeGeometry.navCenter, nativeGeometry.captionCenter);
  assert.equal(nativeGeometry.navCenter, nativeGeometry.menuCenter);
  assert.equal(nativeGeometry.pointerEvents, 'none', 'decorative frames must not intercept native actions');
  await page.getByRole('button', { name: 'Open Remixify settings', exact: true }).click();
  await page.getByRole('button', { name: 'Classic', exact: true }).click();
  assert.equal(await page.locator('.srd-native-caption-frame').evaluate(node => getComputedStyle(node).display), 'none', 'classic mode must restore the original caption layout');
  await native.close();
  console.log('PASS: search stacking, caption actions/alignment, play/pause centering, card gutters, responsive layout, appearance controls, native fallback and classic mode.');
} finally { await browser.close(); }
