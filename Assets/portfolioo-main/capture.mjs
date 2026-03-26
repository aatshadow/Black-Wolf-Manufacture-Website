import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';

const SCREENSHOTS_DIR = './screenshots';

const captures = [
  // Detrás de Cámara
  { url: 'https://dashboard-ops-ashen.vercel.app', name: '01_detras_leaderboards', wait: 5000, width: 1920, height: 1080 },
  { url: 'https://dashboard-ops-ashen.vercel.app', name: '02_detras_charts', wait: 5000, width: 1920, height: 1080, scroll: true },

  // FBA Academy Pro
  { url: 'https://fbaacademypro.com', name: '03_fba_hero', wait: 5000, width: 1920, height: 1080 },
  { url: 'https://fbaacademypro.com', name: '04_fba_testimonials', wait: 5000, width: 1920, height: 1080, scroll: true },

  // TaskFlow
  { url: 'https://apartments-wool-brings-pine.trycloudflare.com', name: '05_taskflow_calendar', wait: 6000, width: 1920, height: 1080 },
  { url: 'https://apartments-wool-brings-pine.trycloudflare.com', name: '06_taskflow_tasks', wait: 6000, width: 1920, height: 1080, scroll: true },

  // Blackwolf SOC
  { url: 'https://soc.blackwolfsec.io', name: '07_soc_overview', wait: 5000, width: 1920, height: 1080 },
  { url: 'https://soc.blackwolfsec.io', name: '08_soc_threats', wait: 5000, width: 1920, height: 1080, scroll: true },

  // Game of Life
  { url: 'https://gol.blackwolfsec.io', name: '09_gol_command', wait: 5000, width: 1920, height: 1080 },
  { url: 'https://gol.blackwolfsec.io', name: '10_gol_biodome', wait: 5000, width: 1920, height: 1080, scroll: true },
  { url: 'https://gol.view.blackwolfsec.io', name: '11_gol_landing', wait: 5000, width: 1920, height: 1080 },

  // Blackwolf Corporate
  { url: 'https://blackwolfsec.io', name: '12_website_hero', wait: 5000, width: 1920, height: 1080 },
  { url: 'https://blackwolfsec.io', name: '13_website_stats', wait: 5000, width: 1920, height: 1080, scroll: true },
];

async function captureScreenshot(browser, config) {
  const page = await browser.newPage();
  await page.setViewport({ width: config.width, height: config.height, deviceScaleFactor: 2 });

  try {
    console.log(`📸 Capturing ${config.name} from ${config.url}...`);
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, config.wait || 3000));

    if (config.scroll) {
      // Scroll down to get a different section
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
      await new Promise(r => setTimeout(r, 2000));
    }

    const path = `${SCREENSHOTS_DIR}/${config.name}.png`;
    await page.screenshot({ path, type: 'png' });
    console.log(`✅ Saved: ${config.name}.png`);
    return { name: config.name, success: true };
  } catch (err) {
    console.error(`❌ Failed ${config.name}: ${err.message}`);
    return { name: config.name, success: false, error: err.message };
  } finally {
    await page.close();
  }
}

async function main() {
  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  // Capture in batches of 3 to avoid overwhelming
  const results = [];
  const batchSize = 3;
  for (let i = 0; i < captures.length; i += batchSize) {
    const batch = captures.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(c => captureScreenshot(browser, c)));
    results.push(...batchResults);
  }

  await browser.close();

  console.log('\n📋 Summary:');
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  console.log(`  ✅ ${succeeded.length} captured successfully`);
  if (failed.length > 0) {
    console.log(`  ❌ ${failed.length} failed:`);
    failed.forEach(f => console.log(`     - ${f.name}: ${f.error}`));
  }
}

main().catch(console.error);
