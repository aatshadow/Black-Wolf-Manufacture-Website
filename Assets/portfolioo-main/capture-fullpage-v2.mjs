import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const DIR = './fullpage';

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  await mkdir(DIR, { recursive: true });

  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  // Helper: scroll page slowly to trigger lazy-loaded images, then scroll back to top
  async function triggerLazyLoad(page) {
    await page.evaluate(async () => {
      const scrollStep = 300;
      const delayMs = 150;
      const maxScroll = document.body.scrollHeight;
      for (let y = 0; y < maxScroll; y += scrollStep) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, delayMs));
      }
      // Wait at bottom for any final loads
      await new Promise(r => setTimeout(r, 1500));
      // Scroll back to top
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 500));
    });
  }

  // ═══════════════════════════════════════
  // FBA ACADEMY PRO - full landing page
  // ═══════════════════════════════════════
  console.log('🟡 FBA Academy Pro (full landing with lazy load)...');
  await page.goto('https://fbaacademypro.com', { waitUntil: 'networkidle2', timeout: 45000 });
  await delay(3000);

  // Slowly scroll to trigger all lazy-loaded images/videos
  console.log('  Scrolling to trigger lazy load...');
  await triggerLazyLoad(page);
  await delay(3000);

  // Wait for any remaining images
  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
        setTimeout(resolve, 5000);
      });
    }));
  });
  await delay(2000);

  await page.screenshot({ path: `${DIR}/fba_full_1.png`, type: 'png', fullPage: true });
  console.log('  ✅ fba_full_1.png');

  // ═══════════════════════════════════════
  // TASKFLOW - capture each tab as viewport only (no scroll)
  // ═══════════════════════════════════════
  console.log('\n🟣 TaskFlow (tabs - viewport only, no scroll)...');
  await page.goto('https://apartments-wool-brings-pine.trycloudflare.com', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(4000);

  // Tareas tab (default)
  await page.screenshot({ path: `${DIR}/taskflow_tareas.png`, type: 'png' });
  console.log('  ✅ taskflow_tareas.png (Tareas)');

  // Dashboard tab
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, [role="tab"], nav *'));
    const match = els.find(el => el.textContent.trim().toLowerCase().includes('dashboard'));
    if (match) match.click();
  });
  await delay(3000);
  await page.screenshot({ path: `${DIR}/taskflow_dashboard.png`, type: 'png' });
  console.log('  ✅ taskflow_dashboard.png (Dashboard)');

  // Calendario tab
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, [role="tab"], nav *'));
    const match = els.find(el => el.textContent.trim().toLowerCase().includes('calendario'));
    if (match) match.click();
  });
  await delay(3000);
  await page.screenshot({ path: `${DIR}/taskflow_calendario.png`, type: 'png' });
  console.log('  ✅ taskflow_calendario.png (Calendario)');

  // Gestion tab
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button, [role="tab"], nav *'));
    const match = els.find(el => el.textContent.trim().toLowerCase().includes('gestion'));
    if (match) match.click();
  });
  await delay(3000);
  await page.screenshot({ path: `${DIR}/taskflow_gestion.png`, type: 'png' });
  console.log('  ✅ taskflow_gestion.png (Gestion)');

  // ═══════════════════════════════════════
  // GOL LANDING - full page with lazy load
  // ═══════════════════════════════════════
  console.log('\n🔵 Game of Life Landing (full with lazy load)...');
  await page.goto('https://gol.view.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  console.log('  Scrolling to trigger lazy load...');
  await triggerLazyLoad(page);
  await delay(3000);

  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
        setTimeout(resolve, 5000);
      });
    }));
  });
  await delay(2000);

  await page.screenshot({ path: `${DIR}/gol_landing_full.png`, type: 'png', fullPage: true });
  console.log('  ✅ gol_landing_full.png');

  // ═══════════════════════════════════════
  // BLACKWOLF WEBSITE - home page only, full page with lazy load
  // ═══════════════════════════════════════
  console.log('\n⬜ blackwolfsec.io (home only, full with lazy load)...');
  await page.goto('https://blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  console.log('  Scrolling to trigger lazy load...');
  await triggerLazyLoad(page);
  await delay(3000);

  await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    await Promise.all(imgs.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
        setTimeout(resolve, 5000);
      });
    }));
  });
  await delay(2000);

  await page.screenshot({ path: `${DIR}/website_home_full.png`, type: 'png', fullPage: true });
  console.log('  ✅ website_home_full.png');

  // ═══════════════════════════════════════
  // AUTH-GATED - login screens
  // ═══════════════════════════════════════
  console.log('\n🟠 Detrás de Cámara (login)...');
  await page.goto('https://dashboard-ops-ashen.vercel.app', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await page.screenshot({ path: `${DIR}/detras_login_full.png`, type: 'png', fullPage: true });
  console.log('  ✅ detras_login_full.png');

  console.log('\n🔴 Blackwolf SOC (login)...');
  await page.goto('https://soc.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await page.screenshot({ path: `${DIR}/soc_login_full.png`, type: 'png', fullPage: true });
  console.log('  ✅ soc_login_full.png');

  console.log('\n🔵 Game of Life App (login)...');
  await page.goto('https://gol.blackwolfsec.io', { waitUntil: 'networkidle2', timeout: 20000 });
  await delay(2000);
  await page.screenshot({ path: `${DIR}/gol_login_full.png`, type: 'png', fullPage: true });
  console.log('  ✅ gol_login_full.png');

  await browser.close();

  // Summary
  const { readdirSync, statSync } = await import('fs');
  const files = readdirSync(DIR).filter(f => f.endsWith('.png')).sort();
  console.log('\n📋 Captures:');
  files.forEach(f => {
    const s = (statSync(`${DIR}/${f}`).size / 1024).toFixed(0);
    console.log(`  ${f} (${s}KB)`);
  });
}

main().catch(console.error);
