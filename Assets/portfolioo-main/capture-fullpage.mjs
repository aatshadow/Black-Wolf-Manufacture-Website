import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const DIR = './fullpage';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Captures full-page screenshot (entire scrollable height)
async function captureFullPage(page, path) {
  await page.screenshot({ path, type: 'png', fullPage: true });
}

// Captures viewport-only screenshot
async function captureViewport(page, path) {
  await page.screenshot({ path, type: 'png' });
}

async function main() {
  await mkdir(DIR, { recursive: true });

  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // ═══════════════════════════════════════
  // FBA ACADEMY PRO
  // ═══════════════════════════════════════
  console.log('🟡 FBA Academy Pro...');
  await page.goto('https://fbaacademypro.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  // Full page scroll
  await captureFullPage(page, `${DIR}/fba_full_1.png`);
  console.log('  ✅ fba_full_1.png (full page)');

  // Try clicking nav links
  const fbaNavLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('nav a, header a, [class*="nav"] a')).map(a => ({
      text: a.textContent.trim(), href: a.href
    })).filter(l => l.text && !l.href.includes('#'));
  });
  console.log('  Nav links:', fbaNavLinks.map(l => l.text));

  // Click "QUIÉNES SOMOS" or similar sections
  for (const linkText of ['QUIÉNES SOMOS', 'TESTIMONIOS', 'Quiénes Somos', 'Testimonios']) {
    try {
      const link = await page.evaluate((text) => {
        const els = Array.from(document.querySelectorAll('a, button'));
        const match = els.find(el => el.textContent.trim().toUpperCase().includes(text.toUpperCase()));
        if (match) { match.click(); return true; }
        return false;
      }, linkText);
      if (link) {
        await delay(2000);
        await captureFullPage(page, `${DIR}/fba_full_${linkText.replace(/\s/g, '_').toLowerCase()}.png`);
        console.log(`  ✅ fba section: ${linkText}`);
      }
    } catch (e) {}
  }

  // ═══════════════════════════════════════
  // TASKFLOW
  // ═══════════════════════════════════════
  console.log('\n🟣 TaskFlow...');
  await page.goto('https://apartments-wool-brings-pine.trycloudflare.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(4000);

  await captureFullPage(page, `${DIR}/taskflow_full_1.png`);
  console.log('  ✅ taskflow_full_1.png');

  // Click through TaskFlow tabs: Dashboard, Calendario, Gestion
  for (const tabName of ['Dashboard', 'Calendario', 'Gestion', 'dashboard', 'calendario', 'gestion']) {
    try {
      const clicked = await page.evaluate((name) => {
        const els = Array.from(document.querySelectorAll('a, button, [role="tab"], nav *'));
        const match = els.find(el => el.textContent.trim().toLowerCase().includes(name.toLowerCase()));
        if (match) { match.click(); return match.textContent.trim(); }
        return null;
      }, tabName);
      if (clicked) {
        await delay(3000);
        await captureFullPage(page, `${DIR}/taskflow_${tabName.toLowerCase()}.png`);
        console.log(`  ✅ taskflow_${tabName.toLowerCase()}.png`);
      }
    } catch (e) {}
  }

  // ═══════════════════════════════════════
  // GAME OF LIFE - LANDING
  // ═══════════════════════════════════════
  console.log('\n🔵 Game of Life Landing...');
  await page.goto('https://gol.view.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  await captureFullPage(page, `${DIR}/gol_landing_full.png`);
  console.log('  ✅ gol_landing_full.png');

  // ═══════════════════════════════════════
  // BLACKWOLF WEBSITE
  // ═══════════════════════════════════════
  console.log('\n⬜ blackwolfsec.io...');
  await page.goto('https://blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  await captureFullPage(page, `${DIR}/website_home_full.png`);
  console.log('  ✅ website_home_full.png');

  // Navigate to sub-pages
  for (const pageName of ['development', 'security', 'growth', 'team']) {
    try {
      await page.goto(`https://blackwolfsec.io/en/${pageName}`, { waitUntil: 'networkidle2', timeout: 20000 });
      await delay(2000);
      await captureFullPage(page, `${DIR}/website_${pageName}_full.png`);
      console.log(`  ✅ website_${pageName}_full.png`);
    } catch (e) {
      console.log(`  ⚠️ ${pageName}: ${e.message.split('\n')[0]}`);
    }
  }

  // ═══════════════════════════════════════
  // AUTH-GATED APPS - Login screens (they still look great)
  // ═══════════════════════════════════════
  console.log('\n🟠 Detrás de Cámara (login)...');
  await page.goto('https://dashboard-ops-ashen.vercel.app', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await captureFullPage(page, `${DIR}/detras_login_full.png`);
  console.log('  ✅ detras_login_full.png');

  console.log('\n🔴 Blackwolf SOC (login)...');
  await page.goto('https://soc.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await captureFullPage(page, `${DIR}/soc_login_full.png`);
  console.log('  ✅ soc_login_full.png');

  console.log('\n🔵 Game of Life App (login)...');
  await page.goto('https://gol.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await captureFullPage(page, `${DIR}/gol_login_full.png`);
  console.log('  ✅ gol_login_full.png');

  await browser.close();

  // List all captured files
  const { readdirSync, statSync } = await import('fs');
  const files = readdirSync(DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`\n📋 Total captures: ${files.length}`);
  files.forEach(f => {
    const size = (statSync(`${DIR}/${f}`).size / 1024).toFixed(0);
    console.log(`  ${f} (${size}KB)`);
  });
}

main().catch(console.error);
