import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const SCREENSHOTS_DIR = './screenshots';
const EMAIL = 'alex@blackwolfsec.io';
const PASS = 'Blackwolf88';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function captureDetras(browser) {
  console.log('\n🟠 Detrás de Cámara — logging in...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.goto('https://dashboard-ops-ashen.vercel.app', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  // Fill login form
  try {
    // Try to find email/password fields
    const inputs = await page.$$('input');
    console.log(`  Found ${inputs.length} input fields`);

    // Type into email field
    const emailInput = await page.$('input[type="email"], input[type="text"], input[placeholder*="mail"], input[placeholder*="Email"], input[name*="email"], input[name*="user"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(EMAIL, { delay: 30 });
      console.log('  ✅ Email entered');
    }

    // Type into password field
    const passInput = await page.$('input[type="password"], input[placeholder*="password"], input[placeholder*="Password"], input[name*="pass"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type(PASS, { delay: 30 });
      console.log('  ✅ Password entered');
    }

    // Click submit button
    const submitBtn = await page.$('button[type="submit"], button:not([type]), input[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      console.log('  ✅ Submit clicked');
    }

    await delay(5000);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await delay(3000);

    console.log('  Current URL:', page.url());

    // Screenshot 1 - main view (leaderboards)
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01_detras_leaderboards.png`, type: 'png' });
    console.log('  ✅ 01_detras_leaderboards.png');

    // Try to navigate to charts/analytics or scroll
    // Look for navigation links
    const navLinks = await page.$$('a, button, [role="tab"]');
    let foundCharts = false;
    for (const link of navLinks) {
      const text = await page.evaluate(el => el.textContent?.toLowerCase() || '', link);
      if (text.includes('chart') || text.includes('analytic') || text.includes('report') || text.includes('graph') || text.includes('ventas') || text.includes('dashboard')) {
        await link.click();
        await delay(3000);
        foundCharts = true;
        console.log(`  Navigated to: ${text.trim()}`);
        break;
      }
    }

    if (!foundCharts) {
      // Scroll to get different content
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(2000);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/02_detras_charts.png`, type: 'png' });
    console.log('  ✅ 02_detras_charts.png');

  } catch (err) {
    console.error('  ❌ Detrás error:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/01_detras_leaderboards.png`, type: 'png' });
  }

  await page.close();
}

async function captureSOC(browser) {
  console.log('\n🔴 Blackwolf SOC — logging in...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.goto('https://soc.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  try {
    const inputs = await page.$$('input');
    console.log(`  Found ${inputs.length} input fields`);

    // Check for domain field first
    const domainInput = await page.$('input[placeholder*="domain"], input[placeholder*="company"], input[name*="domain"]');
    if (domainInput) {
      await domainInput.click({ clickCount: 3 });
      await domainInput.type('', { delay: 30 }); // leave empty for superadmin
      console.log('  ✅ Domain left empty (superadmin)');
    }

    const emailInput = await page.$('input[type="email"], input[placeholder*="mail"], input[placeholder*="name@"], input[name*="email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(EMAIL, { delay: 30 });
      console.log('  ✅ Email entered');
    }

    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type(PASS, { delay: 30 });
      console.log('  ✅ Password entered');
    }

    const submitBtn = await page.$('button[type="submit"], button:not([type]):not([aria-label])');
    if (submitBtn) {
      await submitBtn.click();
      console.log('  ✅ Submit clicked');
    }

    await delay(5000);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await delay(4000);

    console.log('  Current URL:', page.url());

    // Screenshot 1 - overview
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07_soc_overview.png`, type: 'png' });
    console.log('  ✅ 07_soc_overview.png');

    // Navigate to threats
    const navLinks = await page.$$('a, button, [role="tab"], nav a, aside a');
    let foundThreats = false;
    for (const link of navLinks) {
      const text = await page.evaluate(el => el.textContent?.toLowerCase() || '', link);
      if (text.includes('threat') || text.includes('alert') || text.includes('incident') || text.includes('amenaz') || text.includes('detection')) {
        await link.click();
        await delay(3000);
        foundThreats = true;
        console.log(`  Navigated to: ${text.trim()}`);
        break;
      }
    }

    if (!foundThreats) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(2000);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/08_soc_threats.png`, type: 'png' });
    console.log('  ✅ 08_soc_threats.png');

  } catch (err) {
    console.error('  ❌ SOC error:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/07_soc_overview.png`, type: 'png' });
  }

  await page.close();
}

async function captureGOL(browser) {
  console.log('\n🔵 Game of Life — logging in...');
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.goto('https://gol.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(2000);

  try {
    const inputs = await page.$$('input');
    console.log(`  Found ${inputs.length} input fields`);

    const emailInput = await page.$('input[type="email"], input[type="text"], input[placeholder*="mail"], input[placeholder*="Email"]');
    if (emailInput) {
      await emailInput.click({ clickCount: 3 });
      await emailInput.type(EMAIL, { delay: 30 });
      console.log('  ✅ Email entered');
    }

    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      await passInput.click({ clickCount: 3 });
      await passInput.type(PASS, { delay: 30 });
      console.log('  ✅ Password entered');
    }

    const submitBtn = await page.$('button[type="submit"], button:not([type])');
    if (submitBtn) {
      await submitBtn.click();
      console.log('  ✅ Submit clicked');
    }

    await delay(5000);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await delay(4000);

    console.log('  Current URL:', page.url());

    // Screenshot 1 - command center / main dashboard
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/09_gol_command.png`, type: 'png' });
    console.log('  ✅ 09_gol_command.png');

    // Try to find another section
    const navLinks = await page.$$('a, button, [role="tab"], nav a, aside a');
    let foundSection = false;
    for (const link of navLinks) {
      const text = await page.evaluate(el => el.textContent?.toLowerCase() || '', link);
      if (text.includes('biodome') || text.includes('health') || text.includes('finance') || text.includes('quest') || text.includes('character') || text.includes('stats') || text.includes('profile')) {
        await link.click();
        await delay(3000);
        foundSection = true;
        console.log(`  Navigated to: ${text.trim()}`);
        break;
      }
    }

    if (!foundSection) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await delay(2000);
    }

    await page.screenshot({ path: `${SCREENSHOTS_DIR}/10_gol_biodome.png`, type: 'png' });
    console.log('  ✅ 10_gol_biodome.png');

  } catch (err) {
    console.error('  ❌ GOL error:', err.message);
    await page.screenshot({ path: `${SCREENSHOTS_DIR}/09_gol_command.png`, type: 'png' });
  }

  await page.close();
}

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  // Run sequentially to avoid issues
  await captureDetras(browser);
  await captureSOC(browser);
  await captureGOL(browser);

  await browser.close();
  console.log('\n🎉 Auth captures complete!');
}

main().catch(console.error);
