const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:3002';
const OUT = path.join(__dirname, 'screenshots');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });
  const page = await browser.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // disable scroll fade animations so screenshots show content
  await page.addStyleTag({ content: '*{animation: none !important; transition: none !important;}' });

  // Force scroll-fade sections visible
  await page.evaluate(() => {
    document.querySelectorAll('[class*="opacity-0"]').forEach(el => {
      el.classList.remove('opacity-0', 'translate-y-10');
      el.classList.add('opacity-100', 'translate-y-0');
    });
  });

  // 1. Hero (viewport)
  await page.screenshot({ path: path.join(OUT, '01_hero.png'), fullPage: false });

  // 2. Full page
  await page.screenshot({ path: path.join(OUT, '02_fullpage.png'), fullPage: true });

  // 3. Marquee section - scroll to it
  await page.evaluate(() => {
    const marquee = document.querySelector('.reflecta-marquee')?.closest('.w-full');
    if (marquee) marquee.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '03_marquee.png'), fullPage: false });

  // 4. Features - capture journal feature
  await page.evaluate(() => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '04_features_journal.png'), fullPage: false });

  // 5. Analytics feature
  await page.evaluate(() => {
    document.getElementById('analytics')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '05_features_analytics.png'), fullPage: false });

  // 6. Science feature
  await page.evaluate(() => {
    document.getElementById('science')?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '06_features_science.png'), fullPage: false });

  // 7. Reviews
  await page.evaluate(() => {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '07_reviews.png'), fullPage: false });

  // 8. CTA + Footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '08_cta_footer.png'), fullPage: false });

  // 9. Login state - click "Log In"
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button'));
    const login = btns.find(b => b.textContent.trim() === 'Log In');
    login?.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT, '09_login.png'), fullPage: false });

  // 10. Signup mode
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signup = btns.find(b => b.textContent.trim() === 'Sign Up');
    signup?.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT, '10_signup.png'), fullPage: false });

  // 11. Mobile menu - emulate mobile
  await page.setViewport({ width: 414, height: 896, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const btn = document.querySelector('nav .md\\:hidden button');
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(OUT, '11_mobile_menu.png'), fullPage: false });

  await browser.close();
  console.log('done');
})();
