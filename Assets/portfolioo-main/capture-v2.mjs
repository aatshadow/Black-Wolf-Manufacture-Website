import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const SCREENSHOTS_DIR = './screenshots';
const EMAIL = 'alex@blackwolfsec.io';
const PASS = 'Blackwolf88';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // Go to the dashboard
  console.log('\n📍 Going to dashboard-ops-ashen.vercel.app...');
  await page.goto('https://dashboard-ops-ashen.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  // Log all form elements on the page
  const formInfo = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const buttons = Array.from(document.querySelectorAll('button'));
    const forms = Array.from(document.querySelectorAll('form'));
    return {
      inputs: inputs.map(i => ({
        type: i.type, name: i.name, id: i.id,
        placeholder: i.placeholder, value: i.value,
        classes: i.className
      })),
      buttons: buttons.map(b => ({
        type: b.type, text: b.textContent.trim(),
        classes: b.className
      })),
      forms: forms.length,
      url: window.location.href,
      title: document.title
    };
  });

  console.log('Page title:', formInfo.title);
  console.log('URL:', formInfo.url);
  console.log('Forms:', formInfo.forms);
  console.log('Inputs:', JSON.stringify(formInfo.inputs, null, 2));
  console.log('Buttons:', JSON.stringify(formInfo.buttons, null, 2));

  // Careful login: use keyboard to clear and type
  // Find email field
  const emailSel = 'input[type="email"], input[type="text"], input[name*="email"], input[id*="email"]';
  const emailInput = await page.$(emailSel);
  if (emailInput) {
    await emailInput.click();
    // Select all and delete
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await delay(200);
    // Type email character by character
    for (const char of EMAIL) {
      await page.keyboard.type(char, { delay: 50 });
    }
    console.log('✅ Email typed:', EMAIL);
  } else {
    console.log('❌ No email input found');
  }

  // Find password field
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click();
    await page.keyboard.down('Meta');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Meta');
    await page.keyboard.press('Backspace');
    await delay(200);
    for (const char of PASS) {
      await page.keyboard.type(char, { delay: 50 });
    }
    console.log('✅ Password typed');
  } else {
    console.log('❌ No password input found');
  }

  // Check field values before submitting
  const fieldValues = await page.evaluate(() => {
    const email = document.querySelector('input[type="email"], input[type="text"]');
    const pass = document.querySelector('input[type="password"]');
    return {
      emailValue: email?.value,
      passValue: pass?.value ? '***(' + pass.value.length + ' chars)' : 'empty'
    };
  });
  console.log('Field values before submit:', fieldValues);

  // Click login button
  await delay(500);
  const loginBtn = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const b of buttons) {
      const t = b.textContent.toLowerCase();
      if (t.includes('acceder') || t.includes('login') || t.includes('enter') || t.includes('sign') || t.includes('submit') || t.includes('iniciar')) {
        b.click();
        return b.textContent.trim();
      }
    }
    // Fallback: click first submit button
    const sub = document.querySelector('button[type="submit"]');
    if (sub) { sub.click(); return sub.textContent.trim(); }
    return null;
  });
  console.log('Clicked button:', loginBtn);

  // Wait for navigation
  console.log('Waiting for navigation...');
  await delay(3000);
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => console.log('  (navigation timeout, continuing...)'));
  await delay(3000);

  const afterLoginUrl = page.url();
  console.log('\n📍 After login URL:', afterLoginUrl);

  // Screenshot current state
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/debug_after_login.png`, type: 'png' });
  console.log('📸 debug_after_login.png');

  // Check for error messages
  const pageState = await page.evaluate(() => {
    const body = document.body?.innerText?.substring(0, 2000) || '';
    const errors = Array.from(document.querySelectorAll('[class*="error"], [class*="alert"], [role="alert"]'));
    const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
      text: a.textContent.trim().substring(0, 80),
      href: a.href
    })).filter(l => l.text);
    const navItems = Array.from(document.querySelectorAll('nav a, aside a, [class*="sidebar"] a, [class*="nav"] a')).map(a => ({
      text: a.textContent.trim().substring(0, 80),
      href: a.href
    })).filter(l => l.text);
    return {
      bodyText: body,
      errors: errors.map(e => e.textContent.trim()),
      links,
      navItems
    };
  });

  if (pageState.errors.length) {
    console.log('\n❌ Errors on page:', pageState.errors);
  }

  console.log('\n📋 Body text (first 1500 chars):');
  console.log(pageState.bodyText.substring(0, 1500));

  if (pageState.navItems.length) {
    console.log('\n🧭 Navigation items:');
    pageState.navItems.forEach(l => console.log(`  "${l.text}" → ${l.href}`));
  }

  console.log('\n🔗 All links:');
  pageState.links.slice(0, 30).forEach(l => console.log(`  "${l.text}" → ${l.href}`));

  // If we're logged in, look for Consola Central and capture
  if (!afterLoginUrl.includes('login') && !pageState.errors.length) {
    console.log('\n✅ Appears to be logged in!');

    // Capture the main dashboard view
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01_detras_leaderboards.png`, type: 'png' });
    console.log('📸 01_detras_leaderboards.png');

    // Look for navigation to other sections/apps
    const consolaLink = pageState.links.find(l => {
      const t = (l.text + l.href).toLowerCase();
      return t.includes('consola') || t.includes('central') || t.includes('console');
    });

    if (consolaLink) {
      console.log(`\n🎯 Found Consola Central: "${consolaLink.text}" → ${consolaLink.href}`);
      await page.goto(consolaLink.href, { waitUntil: 'networkidle2', timeout: 20000 });
      await delay(3000);
      await page.screenshot({ path: `${SCREENSHOTS_DIR}/debug_consola.png`, type: 'png' });

      // Now find links to SOC, GOL etc
      const appLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]')).map(a => ({
          text: a.textContent.trim().substring(0, 80),
          href: a.href
        })).filter(l => l.text);
      });
      console.log('\n🔗 Links in Consola Central:');
      appLinks.forEach(l => console.log(`  "${l.text}" → ${l.href}`));
    }

    // Try scrolling for charts view
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await delay(2000);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02_detras_charts.png`, type: 'png' });
    console.log('📸 02_detras_charts.png');
  }

  await browser.close();
  console.log('\n🔍 Done! Check debug screenshots.');
}

main().catch(console.error);
