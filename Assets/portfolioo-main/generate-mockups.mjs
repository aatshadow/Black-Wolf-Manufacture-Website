import puppeteer from 'puppeteer';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const SCREENSHOTS_DIR = resolve('./screenshots');
const MOCKUPS_DIR = resolve('./mockups');
const ISOMETRIC_DIR = resolve('./isometric');

const projects = [
  {
    id: 'detras',
    name: 'Detrás de Cámara',
    subtitle: 'Operations Platform',
    category: 'CLIENT PLATFORM',
    color: '#F97316',
    colorRgb: '249, 115, 22',
    screens: ['01_detras_leaderboards.png', '02_detras_charts.png'],
    stats: ['3 Deployments', '€300k+ tracked', '7 team members']
  },
  {
    id: 'fba',
    name: 'FBA Academy Pro',
    subtitle: 'Landing Page',
    category: 'LEAD GENERATION',
    color: '#F59E0B',
    colorRgb: '245, 158, 11',
    screens: ['03_fba_hero.png', '04_fba_testimonials.png'],
    stats: ['65 stores', '€300k/month', '5000+ students']
  },
  {
    id: 'taskflow',
    name: 'TaskFlow',
    subtitle: 'AI Task Management',
    category: 'PROPRIETARY PRODUCT',
    color: '#8B5CF6',
    colorRgb: '139, 92, 246',
    screens: ['05_taskflow_calendar.png', '06_taskflow_tasks.png'],
    stats: ['AI Discord bot', 'Calendar sync', 'Role-based']
  },
  {
    id: 'soc',
    name: 'Blackwolf SOC',
    subtitle: 'Security Operations Center',
    category: 'SECURITY DIVISION',
    color: '#EF4444',
    colorRgb: '239, 68, 68',
    screens: ['07_soc_overview.png', '08_soc_threats.png'],
    stats: ['154K+ threats', '11 sensors', 'Real-time']
  },
  {
    id: 'gol',
    name: 'Game of Life',
    subtitle: 'Gamified Life OS',
    category: 'PROPRIETARY SAAS',
    color: '#3B82F6',
    colorRgb: '59, 130, 246',
    screens: ['09_gol_command.png', '10_gol_biodome.png', '11_gol_landing.png'],
    stats: ['Life OS', 'Gamification', 'Data sovereignty']
  },
  {
    id: 'website',
    name: 'blackwolfsec.io',
    subtitle: 'Corporate Website',
    category: 'BRAND IDENTITY',
    color: '#FFFFFF',
    colorRgb: '255, 255, 255',
    screens: ['12_website_hero.png', '13_website_stats.png'],
    stats: ['3 divisions', 'Enterprise-grade', 'Global reach']
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(SCREENSHOTS_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

function generateMockupHTML(project, img1b64, img2b64) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  body {
    width: 3840px; height: 2160px;
    background: #0a0a0a;
    font-family: 'Inter', -apple-system, sans-serif;
    overflow: hidden;
    position: relative;
  }

  /* Subtle grid */
  .grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  /* Glow orbs */
  .glow-1 {
    position: absolute;
    width: 1400px; height: 1400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${project.colorRgb}, 0.15) 0%, transparent 70%);
    top: -200px; left: -200px;
    filter: blur(80px);
  }
  .glow-2 {
    position: absolute;
    width: 1000px; height: 1000px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${project.colorRgb}, 0.1) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    filter: blur(60px);
  }
  .glow-3 {
    position: absolute;
    width: 600px; height: 600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${project.colorRgb}, 0.25) 0%, transparent 60%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    filter: blur(120px);
  }

  /* Content layout */
  .content {
    position: relative; z-index: 10;
    width: 100%; height: 100%;
    display: flex;
    align-items: center;
    padding: 120px 180px;
  }

  .info {
    flex: 0 0 900px;
    padding-right: 80px;
  }

  .category {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.35em;
    color: ${project.color};
    margin-bottom: 30px;
    text-transform: uppercase;
  }

  .title {
    font-size: 96px;
    font-weight: 900;
    color: #fff;
    line-height: 1.05;
    margin-bottom: 20px;
    letter-spacing: -0.02em;
  }

  .subtitle {
    font-size: 40px;
    color: rgba(255,255,255,0.4);
    font-weight: 400;
    margin-bottom: 50px;
  }

  .stats {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .stat {
    padding: 14px 28px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.03);
    color: rgba(255,255,255,0.6);
    font-size: 18px;
    font-weight: 500;
    backdrop-filter: blur(10px);
  }

  /* Branding */
  .brand {
    position: absolute;
    top: 60px; left: 180px;
    display: flex; align-items: center; gap: 16px;
  }
  .brand-icon {
    width: 52px; height: 52px;
    background: #fff;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 28px; color: #000;
    box-shadow: 0 8px 32px rgba(255,255,255,0.15);
  }
  .brand-text {
    font-size: 20px; font-weight: 700;
    letter-spacing: 0.2em; color: #fff;
  }
  .brand-sub {
    font-size: 10px; color: rgba(255,255,255,0.3);
    letter-spacing: 0.3em; margin-top: 2px;
  }

  /* MacBook */
  .devices {
    flex: 1;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .macbook {
    position: relative;
    width: 1600px;
    filter: drop-shadow(0 60px 100px rgba(0,0,0,0.6));
    transform: perspective(2000px) rotateY(-3deg) rotateX(2deg);
  }

  .macbook-bezel {
    background: linear-gradient(180deg, #555 0%, #333 5%, #2a2a2a 50%, #1a1a1a 100%);
    border-radius: 24px 24px 0 0;
    padding: 18px 18px 12px;
    position: relative;
  }

  .macbook-notch {
    position: absolute;
    top: 6px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 24px;
    background: #111;
    border-radius: 0 0 12px 12px;
  }
  .macbook-notch::after {
    content: '';
    position: absolute;
    top: 8px; left: 50%;
    transform: translateX(-50%);
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #1a1a2a;
    box-shadow: inset 0 0 2px rgba(50,50,100,0.5);
  }

  .macbook-screen {
    background: #000;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 16/10;
    position: relative;
  }
  .macbook-screen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .macbook-screen::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.02) 100%);
    pointer-events: none;
  }

  .macbook-base {
    height: 18px;
    background: linear-gradient(180deg, #444 0%, #333 40%, #2a2a2a 100%);
    border-radius: 0 0 4px 4px;
    position: relative;
  }
  .macbook-base::after {
    content: '';
    position: absolute;
    bottom: 0; left: 10%; right: 10%;
    height: 10px;
    background: linear-gradient(180deg, #3a3a3a, #2a2a2a);
    border-radius: 0 0 8px 8px;
  }
  .macbook-hinge {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 180px; height: 6px;
    background: #3a3a3a;
    border-radius: 0 0 6px 6px;
  }

  .macbook-shadow {
    position: absolute;
    bottom: -50px;
    left: 10%; right: 10%;
    height: 60px;
    background: radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%);
    filter: blur(20px);
  }

  /* iPhone */
  .iphone {
    position: absolute;
    right: -40px;
    top: 50%;
    transform: translateY(-45%) perspective(1500px) rotateY(-8deg);
    width: 340px;
    filter: drop-shadow(0 40px 80px rgba(0,0,0,0.7));
    z-index: 20;
  }

  .iphone-body {
    background: #1a1a1a;
    border-radius: 52px;
    padding: 12px;
    border: 3px solid #333;
    position: relative;
  }

  .iphone-dynamic-island {
    position: absolute;
    top: 18px; left: 50%;
    transform: translateX(-50%);
    width: 110px; height: 32px;
    background: #000;
    border-radius: 20px;
    z-index: 10;
  }

  .iphone-screen {
    background: #000;
    border-radius: 42px;
    overflow: hidden;
    aspect-ratio: 9/19.5;
    position: relative;
  }
  .iphone-screen img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    display: block;
  }
  .iphone-screen::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 30%);
    pointer-events: none;
  }

  .iphone-bar {
    position: absolute;
    bottom: 10px; left: 50%;
    transform: translateX(-50%);
    width: 120px; height: 5px;
    background: rgba(255,255,255,0.25);
    border-radius: 100px;
  }

  /* Floating decorative elements */
  .float-element {
    position: absolute;
    border: 1px solid rgba(255,255,255,0.05);
    background: rgba(255,255,255,0.02);
    backdrop-filter: blur(10px);
  }
  .float-1 {
    width: 120px; height: 120px;
    border-radius: 24px;
    top: 200px; right: 100px;
    transform: rotate(15deg);
  }
  .float-2 {
    width: 80px; height: 80px;
    border-radius: 50%;
    bottom: 300px; left: 920px;
    transform: rotate(-10deg);
  }
  .float-3 {
    width: 60px; height: 60px;
    border-radius: 16px;
    bottom: 200px; right: 200px;
    transform: rotate(30deg);
    border-color: rgba(${project.colorRgb}, 0.15);
  }

  /* Bottom tagline */
  .tagline {
    position: absolute;
    bottom: 60px; left: 0; right: 0;
    text-align: center;
    font-size: 14px;
    letter-spacing: 0.35em;
    color: rgba(255,255,255,0.15);
    font-weight: 500;
  }
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="glow-3"></div>

  <div class="brand">
    <div class="brand-icon">B</div>
    <div>
      <div class="brand-text">BLACKWOLF</div>
      <div class="brand-sub">PROJECT SHOWCASE</div>
    </div>
  </div>

  <div class="content">
    <div class="info">
      <div class="category">${project.category}</div>
      <div class="title">${project.name}</div>
      <div class="subtitle">${project.subtitle}</div>
      <div class="stats">
        ${project.stats.map(s => `<div class="stat">${s}</div>`).join('')}
      </div>
    </div>
    <div class="devices">
      <div class="macbook">
        <div class="macbook-bezel">
          <div class="macbook-notch"></div>
          <div class="macbook-screen">
            <img src="${img1b64}" alt="screen" />
          </div>
        </div>
        <div class="macbook-base">
          <div class="macbook-hinge"></div>
        </div>
        <div class="macbook-shadow"></div>
      </div>
      <div class="iphone">
        <div class="iphone-body">
          <div class="iphone-dynamic-island"></div>
          <div class="iphone-screen">
            <img src="${img2b64 || img1b64}" alt="mobile" />
          </div>
          <div class="iphone-bar"></div>
        </div>
      </div>
      <div class="float-element float-1"></div>
      <div class="float-element float-2"></div>
      <div class="float-element float-3"></div>
    </div>
  </div>

  <div class="tagline">PROTECT EXCELLENCE &nbsp;&bull;&nbsp; EMPOWER INNOVATION</div>
</body></html>`;
}

function generateIsometricHTML(project, images) {
  const cards = images.map((img, i) => {
    const offset = i * 100;
    const zOffset = i * -120;
    return `
      <div class="iso-card" style="
        transform: translateX(${offset}px) translateY(${offset * 0.5}px) translateZ(${zOffset}px);
        z-index: ${images.length - i};
      ">
        <img src="${img}" alt="screen ${i + 1}" />
        <div class="card-shine"></div>
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  body {
    width: 3840px; height: 2160px;
    background: #0a0a0a;
    font-family: 'Inter', -apple-system, sans-serif;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .glow-center {
    position: absolute;
    width: 1600px; height: 1600px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${project.colorRgb}, 0.12) 0%, transparent 60%);
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    filter: blur(100px);
  }

  .glow-accent {
    position: absolute;
    width: 800px; height: 800px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(${project.colorRgb}, 0.2) 0%, transparent 50%);
    top: 30%; left: 40%;
    filter: blur(80px);
  }

  .scene {
    position: relative;
    transform: perspective(2500px) rotateX(25deg) rotateY(-35deg) rotateZ(5deg);
    transform-style: preserve-3d;
  }

  .iso-card {
    position: absolute;
    width: 1200px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow:
      0 30px 60px rgba(0,0,0,0.5),
      0 0 0 1px rgba(255,255,255,0.05),
      0 0 80px rgba(${project.colorRgb}, 0.08);
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }
  .iso-card img {
    width: 100%;
    display: block;
    aspect-ratio: 16/10;
    object-fit: cover;
  }
  .card-shine {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%);
    pointer-events: none;
  }

  .label {
    position: absolute;
    bottom: 140px; left: 180px;
    z-index: 100;
    transform: perspective(2500px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  .label-category {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.35em;
    color: ${project.color};
    margin-bottom: 12px;
  }
  .label-title {
    font-size: 72px;
    font-weight: 900;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }
  .label-subtitle {
    font-size: 28px;
    color: rgba(255,255,255,0.35);
    margin-top: 8px;
  }

  .brand {
    position: absolute;
    top: 60px; left: 180px; z-index: 100;
    display: flex; align-items: center; gap: 16px;
  }
  .brand-icon {
    width: 48px; height: 48px; background: #fff; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 26px; color: #000;
    box-shadow: 0 8px 32px rgba(255,255,255,0.1);
  }
  .brand-text { font-size: 18px; font-weight: 700; letter-spacing: 0.2em; color: #fff; }
  .brand-sub { font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 0.3em; margin-top: 2px; }

  .tagline {
    position: absolute;
    bottom: 50px; right: 180px; z-index: 100;
    font-size: 13px; letter-spacing: 0.3em;
    color: rgba(255,255,255,0.12); font-weight: 500;
  }
</style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="glow-center"></div>
  <div class="glow-accent"></div>

  <div class="brand">
    <div class="brand-icon">B</div>
    <div>
      <div class="brand-text">BLACKWOLF</div>
      <div class="brand-sub">PROJECT SHOWCASE</div>
    </div>
  </div>

  <div class="scene">${cards}</div>

  <div class="label">
    <div class="label-category">${project.category}</div>
    <div class="label-title">${project.name}</div>
    <div class="label-subtitle">${project.subtitle}</div>
  </div>

  <div class="tagline">PROTECT EXCELLENCE &nbsp;&bull;&nbsp; EMPOWER INNOVATION</div>
</body></html>`;
}

async function main() {
  await mkdir(MOCKUPS_DIR, { recursive: true });
  await mkdir(ISOMETRIC_DIR, { recursive: true });

  console.log('🚀 Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files']
  });

  for (const project of projects) {
    // Load images as base64
    const images = [];
    for (const screen of project.screens) {
      try {
        images.push(await imageToBase64(screen));
      } catch (e) {
        console.log(`  ⚠️ Skipping ${screen}: ${e.message}`);
      }
    }

    if (images.length === 0) {
      console.log(`❌ No images for ${project.name}, skipping`);
      continue;
    }

    // === DEVICE MOCKUP ===
    console.log(`🖥️  Generating device mockup: ${project.name}...`);
    const mockupHTML = generateMockupHTML(project, images[0], images[1] || images[0]);
    const mockupPath = join(MOCKUPS_DIR, `${project.id}_mockup_temp.html`);
    await writeFile(mockupPath, mockupHTML);

    const mockupPage = await browser.newPage();
    await mockupPage.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
    await mockupPage.goto(`file://${mockupPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await mockupPage.screenshot({
      path: join(MOCKUPS_DIR, `${project.id}_device_mockup.png`),
      type: 'png'
    });
    await mockupPage.close();
    console.log(`  ✅ ${project.id}_device_mockup.png`);

    // === ISOMETRIC COMPOSITION ===
    console.log(`📐 Generating isometric: ${project.name}...`);
    const isoHTML = generateIsometricHTML(project, images);
    const isoPath = join(ISOMETRIC_DIR, `${project.id}_iso_temp.html`);
    await writeFile(isoPath, isoHTML);

    const isoPage = await browser.newPage();
    await isoPage.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 });
    await isoPage.goto(`file://${isoPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await isoPage.screenshot({
      path: join(ISOMETRIC_DIR, `${project.id}_isometric.png`),
      type: 'png'
    });
    await isoPage.close();
    console.log(`  ✅ ${project.id}_isometric.png`);
  }

  await browser.close();
  console.log('\n🎉 All mockups and isometric compositions generated!');
}

main().catch(console.error);
