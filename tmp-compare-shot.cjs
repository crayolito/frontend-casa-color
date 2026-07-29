const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const out = path.join(__dirname, 'tmp-compare');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(out, 'angular-full.png'), fullPage: true });

  const cat = page.locator('app-category-accordion').first();
  if (await cat.count()) {
    await cat.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, 'angular-categories.png') });
  }
  const foot = page.locator('app-footer').first();
  if (await foot.count()) {
    await foot.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, 'angular-footer.png') });
  }

  const metrics = await page.evaluate(() => {
    const title = document.querySelector('.categories__title');
    const desc = document.querySelector('.categories__desc');
    const groups = document.querySelector('.categories__groups');
    const catEl = document.querySelector('.categories');
    const col = document.querySelector('.categories__column');
    const footerCol = document.querySelector('.footer__col');
    const footerW = document.querySelector('.footer__widgets');
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const pick = (s) =>
      s
        ? {
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: s.color,
            maxWidth: s.maxWidth,
            width: s.width,
            paddingBottom: s.paddingBottom,
            paddingLeft: s.paddingLeft,
            paddingRight: s.paddingRight,
          }
        : null;
    return {
      title: pick(cs(title)),
      desc: pick(cs(desc)),
      groups: pick(cs(groups)),
      categories: pick(cs(catEl)),
      column: pick(cs(col)),
      footerCol: pick(cs(footerCol)),
      footerWidgets: pick(cs(footerW)),
      titleText: title?.textContent,
      cols: document.querySelectorAll('.categories__column').length,
      containerMax: getComputedStyle(document.documentElement).getPropertyValue('--container-max'),
      h4var: getComputedStyle(document.documentElement).getPropertyValue('--font-size-h4'),
    };
  });
  fs.writeFileSync(path.join(out, 'angular-metrics.json'), JSON.stringify(metrics, null, 2));
  console.log('ANGULAR METRICS', JSON.stringify(metrics, null, 2));

  const clonePath = path.resolve(__dirname, '..', 'pagina web clonada', 'index.html');
  const cloneUrl = 'file:///' + clonePath.replace(/\\/g, '/');
  await page.goto(cloneUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(out, 'clone-full.png'), fullPage: true });

  const deco = page.locator('h4 span, h4').filter({ hasText: 'Decor' }).first();
  if (await deco.count()) {
    await deco.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, 'clone-categories.png') });
  }
  const footer = page.locator('#footer-outer').first();
  if (await footer.count()) {
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, 'clone-footer.png') });
  }

  const cloneMetrics = await page.evaluate(() => {
    const h4 = document.querySelector('.full-width-section h4, h4');
    const h6 = document.querySelector('.full-width-section h6, h6');
    const col = document.querySelector('.vc_col-sm-4');
    const footerOuter = document.querySelector('#footer-outer');
    const textwidget = document.querySelector('#footer-widgets .textwidget p');
    const copyright = document.querySelector('#copyright p');
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const pick = (s) =>
      s
        ? {
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            lineHeight: s.lineHeight,
            letterSpacing: s.letterSpacing,
            color: s.color,
            width: s.width,
            paddingLeft: s.paddingLeft,
            paddingRight: s.paddingRight,
          }
        : null;
    return {
      h4: pick(cs(h4)),
      h6: pick(cs(h6)),
      col: pick(cs(col)),
      footerOuter: pick(cs(footerOuter)),
      textwidget: pick(cs(textwidget)),
      copyright: pick(cs(copyright)),
      h4Text: h4?.textContent?.trim(),
    };
  });
  fs.writeFileSync(path.join(out, 'clone-metrics.json'), JSON.stringify(cloneMetrics, null, 2));
  console.log('CLONE METRICS', JSON.stringify(cloneMetrics, null, 2));

  await browser.close();
  console.log('OK', out);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
