const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const out = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    out.push({ type: 'console', text: msg.text() });
  });

  page.on('request', req => {
    out.push({ type: 'request', url: req.url(), method: req.method() });
  });

  page.on('response', async res => {
    try {
      const ct = res.headers()['content-type'] || '';
      let body = '';
      if (ct.includes('application/json')) {
        body = await res.json();
      } else {
        body = await res.text().catch(() => '');
      }
      out.push({ type: 'response', url: res.url(), status: res.status(), body });
    } catch (e) {
      out.push({ type: 'response', url: res.url(), status: res.status(), body: '<unreadable>' });
    }
  });

  // navigate to site
  await page.goto('http://localhost:8000', { waitUntil: 'networkidle2', timeout: 30000 });

  // ensure register page visible; switch to login
  try {
    await page.click('#to-login-from-register');
  } catch (e) { /* ignore */ }

  // fill login form
  await page.type('#login-email', 'user@example.com');
  await page.type('#login-password', 'password123');

  // click login
  await page.click('#login-btn');

  // wait for some time to let flow animate
  await page.waitForTimeout(6000);

  // capture DOM snapshot of login-flow
  const dom = await page.evaluate(() => {
    const steps = Array.from(document.querySelectorAll('#login-flow .step')).map(s => ({
      step: s.getAttribute('data-step'),
      classes: s.className,
      html: s.innerHTML.slice(0,200)
    }));
    return { steps, location: location.href };
  });

  out.push({ type: 'domSnapshot', data: dom });

  await browser.close();

  fs.writeFileSync('tools/headless-login-output.json', JSON.stringify(out, null, 2));
  console.log('Headless test finished. Output: tools/headless-login-output.json');
})();