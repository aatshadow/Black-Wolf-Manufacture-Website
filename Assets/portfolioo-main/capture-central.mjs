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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // Step 1: Find the Consola Central - try common URLs
  const candidates = [
    'https://console.blackwolfsec.io',
    'https://central.blackwolfsec.io',
    'https://admin.blackwolfsec.io',
    'https://app.blackwolfsec.io',
    'https://portal.blackwolfsec.io',
    'https://blackwolfsec.io/admin',
    'https://blackwolfsec.io/console',
    'https://blackwolfsec.io/login',
  ];

  // First check the main site for a console link
  console.log('\n🔍 Checking blackwolfsec.io for Consola Central link...');
  await page.goto('https://blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);

  // Look for any links containing "consola", "console", "admin", "login", "portal", "central"
  const allLinks = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    return links.map(a => ({ text: a.textContent.trim(), href: a.href }));
  });
  console.log('  Links found on main site:');
  allLinks.forEach(l => {
    if (l.text && l.href && !l.href.includes('#') && !l.href.includes('mailto:')) {
      console.log(`    "${l.text}" → ${l.href}`);
    }
  });

  // Look specifically for console/admin links
  const consoleLink = allLinks.find(l =>
    l.text.toLowerCase().includes('consola') ||
    l.text.toLowerCase().includes('console') ||
    l.text.toLowerCase().includes('admin') ||
    l.text.toLowerCase().includes('portal') ||
    l.text.toLowerCase().includes('central') ||
    l.href.includes('console') ||
    l.href.includes('admin') ||
    l.href.includes('portal') ||
    l.href.includes('central')
  );

  if (consoleLink) {
    console.log(`\n✅ Found console link: "${consoleLink.text}" → ${consoleLink.href}`);
    await page.goto(consoleLink.href, { waitUntil: 'networkidle2', timeout: 20000 });
    await delay(2000);
  } else {
    // Try each candidate URL
    console.log('\n🔍 Trying candidate URLs...');
    for (const url of candidates) {
      try {
        console.log(`  Trying ${url}...`);
        const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
        const status = resp?.status();
        const finalUrl = page.url();
        console.log(`    Status: ${status}, Final URL: ${finalUrl}`);

        if (status && status < 400) {
          console.log(`  ✅ Found working URL: ${finalUrl}`);
          break;
        }
      } catch (e) {
        console.log(`    ❌ ${e.message.split('\n')[0]}`);
      }
    }
  }

  await delay(2000);
  console.log(`\n📍 Current URL: ${page.url()}`);

  // Take a screenshot to see what we're looking at
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/debug_console_1.png`, type: 'png' });
  console.log('  📸 debug_console_1.png saved');

  // Now try to log in wherever we are
  console.log('\n🔑 Attempting login...');

  // Clear and fill all input fields carefully
  const inputs = await page.$$('input');
  console.log(`  Found ${inputs.length} input fields`);

  for (const input of inputs) {
    const type = await page.evaluate(el => ({
      type: el.type,
      name: el.name,
      placeholder: el.placeholder,
      id: el.id
    }), input);
    console.log(`  Input: type=${type.type}, name=${type.name}, placeholder="${type.placeholder}", id=${type.id}`);
  }

  // Handle login - clear fields first, then type
  const emailInput = await page.$('input[type="email"], input[name*="email"], input[placeholder*="mail"], input[placeholder*="Email"], input[type="text"]:not([name*="domain"]):not([placeholder*="domain"])');
  if (emailInput) {
    await emailInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await delay(100);
    await emailInput.type(EMAIL, { delay: 20 });
    console.log('  ✅ Email entered');
  }

  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await delay(100);
    await passInput.type(PASS, { delay: 20 });
    console.log('  ✅ Password entered');
  }

  // Submit
  await delay(500);
  const submitBtn = await page.$('button[type="submit"], button:has-text("Acceder"), button:has-text("Login"), button:has-text("Enter"), button:has-text("Access")');
  if (submitBtn) {
    await submitBtn.click();
    console.log('  ✅ Submit clicked');
  } else {
    // Try pressing Enter
    await page.keyboard.press('Enter');
    console.log('  ✅ Enter pressed');
  }

  await delay(6000);
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await delay(3000);

  console.log(`\n📍 After login URL: ${page.url()}`);
  await page.screenshot({ path: `${SCREENSHOTS_DIR}/debug_console_2.png`, type: 'png' });
  console.log('  📸 debug_console_2.png saved');

  // Check page content for app links / navigation
  const pageContent = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const buttons = Array.from(document.querySelectorAll('button'));
    const allText = document.body?.innerText?.substring(0, 3000) || '';
    return {
      links: links.map(a => ({ text: a.textContent?.trim().substring(0, 60), href: a.href })).filter(l => l.text),
      buttons: buttons.map(b => b.textContent?.trim().substring(0, 60)).filter(Boolean),
      bodyText: allText
    };
  });

  console.log('\n📋 Page content after login:');
  console.log('  Body text (first 1000 chars):', pageContent.bodyText.substring(0, 1000));
  console.log('\n  Links:');
  pageContent.links.forEach(l => console.log(`    "${l.text}" → ${l.href}`));
  console.log('\n  Buttons:');
  pageContent.buttons.forEach(b => console.log(`    "${b}"`));

  // Look for links to SOC, GOL, Detras, Dashboard, etc.
  const appLinks = pageContent.links.filter(l => {
    const t = (l.text + l.href).toLowerCase();
    return t.includes('soc') || t.includes('gol') || t.includes('game') ||
           t.includes('detras') || t.includes('dashboard') || t.includes('taskflow') ||
           t.includes('consola') || t.includes('central');
  });

  if (appLinks.length > 0) {
    console.log('\n🎯 App links found:');
    appLinks.forEach(l => console.log(`  "${l.text}" → ${l.href}`));
  }

  await browser.close();
  console.log('\n🔍 Exploration complete! Check debug screenshots.');
}

main().catch(console.error);
