import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const SCREENSHOTS_DIR = './screenshots';

const credentials = [
  { email: 'admin@blackwolfsec.io', pass: 'Blackwolf88' },
  { email: 'alex@blackwolfsec.io', pass: 'Blackwolf88' },
  { email: 'admin@blackwolfsec.io', pass: 'blackwolf88' },
  { email: 'alex@blackwolfsec.io', pass: 'blackwolf88' },
];

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function tryLogin(page, email, pass) {
  await page.goto('https://dashboard-ops-ashen.vercel.app', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);

  // Clear and type email
  const emailInput = await page.$('input[type="email"]');
  await emailInput.click();
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  await delay(100);
  await emailInput.type(email, { delay: 30 });

  // Clear and type password
  const passInput = await page.$('input[type="password"]');
  await passInput.click();
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  await delay(100);
  await passInput.type(pass, { delay: 30 });

  // Submit
  await delay(300);
  await page.click('button[type="submit"]');
  await delay(4000);
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  await delay(2000);

  // Check for errors
  const result = await page.evaluate(() => {
    const errors = document.body.innerText.includes('incorrectas') ||
                   document.body.innerText.includes('Invalid') ||
                   document.body.innerText.includes('error');
    return { url: window.location.href, hasError: errors, text: document.body.innerText.substring(0, 500) };
  });

  return result;
}

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  for (const cred of credentials) {
    console.log(`\n🔑 Trying: ${cred.email} / ${cred.pass}`);
    const result = await tryLogin(page, cred.email, cred.pass);
    console.log(`   URL: ${result.url}`);
    console.log(`   Error: ${result.hasError}`);

    if (!result.hasError || result.url !== 'https://dashboard-ops-ashen.vercel.app/') {
      console.log('   ✅ LOGIN WORKED!');
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/debug_success.png`, type: 'png' });

      // Explore the dashboard
      const content = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.textContent.trim().substring(0, 80), href: a.href
        })).filter(l => l.text);
        const navItems = Array.from(document.querySelectorAll('nav a, aside a, [class*="sidebar"] a, [class*="menu"] a, [role="navigation"] a')).map(a => ({
          text: a.textContent.trim().substring(0, 80), href: a.href
        })).filter(l => l.text);
        return { links, navItems, body: document.body.innerText.substring(0, 2000) };
      });

      console.log('\n📋 Dashboard content:');
      console.log(content.body.substring(0, 1500));
      console.log('\n🧭 Nav:', content.navItems);
      console.log('\n🔗 Links:', content.links.slice(0, 20));
      break;
    } else {
      console.log('   ❌ Failed');
    }
  }

  await browser.close();
}

main().catch(console.error);
