import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const SCREENSHOTS_DIR = resolve('./screenshots');
const OUTPUT = resolve('./Blackwolf_Portfolio_Showcase.html');

const projects = [
  {
    id: 'detras', name: 'Detrás de Cámara', subtitle: 'Full Company Automation Platform',
    category: 'CLIENT PLATFORM', color: '#F97316', colorRgb: '249,115,22',
    description: 'Multi-tenant SaaS • Real-time sales intelligence • AI-powered reporting',
    stats: ['3 Deployments', '€300k+ tracked', '7 team members'],
    screens: ['01_detras_leaderboards.png', '02_detras_charts.png']
  },
  {
    id: 'fba', name: 'FBA Academy Pro', subtitle: 'High-Ticket VSL Funnel',
    category: 'LEAD GENERATION', color: '#F59E0B', colorRgb: '245,158,11',
    description: 'Conversion-optimized • Video-first engagement • Social proof engine',
    stats: ['65 stores', '€300k/month', '5000+ students'],
    screens: ['03_fba_hero.png', '04_fba_testimonials.png']
  },
  {
    id: 'taskflow', name: 'TaskFlow', subtitle: 'AI-Powered Task Management',
    category: 'PROPRIETARY PRODUCT', color: '#8B5CF6', colorRgb: '139,92,246',
    description: 'Discord AI agent • Zero-friction capture • Full team visibility',
    stats: ['AI Discord bot', 'Calendar sync', 'Role-based access'],
    screens: ['05_taskflow_calendar.png', '06_taskflow_tasks.png']
  },
  {
    id: 'soc', name: 'Blackwolf SOC', subtitle: 'Security Operations Center',
    category: 'SECURITY DIVISION', color: '#EF4444', colorRgb: '239,68,68',
    description: 'Enterprise-grade threat monitoring • SIGMA rules • UEBA • AI Agent',
    stats: ['154K+ threats', '11 sensors', 'Real-time detection'],
    screens: ['07_soc_overview.png', '08_soc_threats.png']
  },
  {
    id: 'gol', name: 'Game of Life', subtitle: 'Gamified Life Operating System',
    category: 'PROPRIETARY SAAS', color: '#3B82F6', colorRgb: '59,130,246',
    description: 'HP/XP/Levels • Health, Finance, Productivity integrated • Privacy-first',
    stats: ['Life OS', 'Gamification', 'Data sovereignty'],
    screens: ['09_gol_command.png', '10_gol_biodome.png', '11_gol_landing.png']
  },
  {
    id: 'website', name: 'blackwolfsec.io', subtitle: 'Corporate Website',
    category: 'BRAND IDENTITY', color: '#FFFFFF', colorRgb: '255,255,255',
    description: 'Premium dark aesthetic • Three divisions showcase • Global positioning',
    stats: ['3 divisions', 'Enterprise-grade', 'Global reach'],
    screens: ['12_website_hero.png', '13_website_stats.png']
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(SCREENSHOTS_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function main() {
  console.log('📦 Encoding screenshots to base64...');

  // Load all images
  for (const p of projects) {
    p.images = [];
    for (const s of p.screens) {
      try {
        p.images.push(await imageToBase64(s));
        console.log(`  ✅ ${s}`);
      } catch (e) {
        console.log(`  ⚠️ ${s}: ${e.message}`);
      }
    }
  }

  const projectsJSON = JSON.stringify(projects.map(p => ({
    id: p.id, name: p.name, subtitle: p.subtitle, category: p.category,
    color: p.color, colorRgb: p.colorRgb, description: p.description,
    stats: p.stats, images: p.images
  })));

  console.log('🔨 Building HTML showcase...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLACKWOLF — Project Showcase</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --bg: #050505;
  --accent: #F97316;
  --accent-rgb: 249,115,22;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { font-size: 16px; -webkit-font-smoothing: antialiased; }

body {
  background: var(--bg);
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

/* ═══ BACKGROUND ═══ */
.bg-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 60px 60px;
}

.bg-glow {
  position: fixed; z-index: 0; pointer-events: none;
  border-radius: 50%;
  filter: blur(100px);
  transition: all 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.bg-glow-1 {
  width: 50vw; height: 50vw; top: -15vw; left: -15vw;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%);
}
.bg-glow-2 {
  width: 40vw; height: 40vw; bottom: -10vw; right: -10vw;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 70%);
}
.bg-glow-3 {
  width: 30vw; height: 30vw; top: 40%; left: 45%;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.06) 0%, transparent 60%);
}

/* Particles */
.particle {
  position: fixed; z-index: 1; pointer-events: none;
  width: 2px; height: 2px;
  background: rgba(255,255,255,0.4);
  border-radius: 50%;
  animation: particlePulse var(--dur) ease-in-out infinite var(--delay);
}
@keyframes particlePulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.8); }
}

/* ═══ HEADER ═══ */
header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 40px;
  background: rgba(5,5,5,0.8);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.brand {
  display: flex; align-items: center; gap: 14px;
}
.brand-icon {
  width: 40px; height: 40px;
  background: #fff;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 22px; color: #000;
  box-shadow: 0 4px 20px rgba(255,255,255,0.1);
}
.brand-name {
  font-size: 16px; font-weight: 700;
  letter-spacing: 0.18em; color: #fff;
}
.brand-tagline {
  font-size: 9px; color: rgba(255,255,255,0.3);
  letter-spacing: 0.25em; margin-top: 2px;
}

/* View toggle */
.view-toggle {
  display: flex;
  background: rgba(255,255,255,0.04);
  border-radius: 100px;
  padding: 4px;
  border: 1px solid rgba(255,255,255,0.06);
}
.view-btn {
  padding: 8px 20px;
  border-radius: 100px;
  border: none; cursor: pointer;
  font-family: inherit;
  font-size: 13px; font-weight: 500;
  color: rgba(255,255,255,0.4);
  background: transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  letter-spacing: 0.02em;
}
.view-btn.active {
  background: #fff;
  color: #000;
  box-shadow: 0 4px 20px rgba(255,255,255,0.15);
}
.view-btn:hover:not(.active) { color: rgba(255,255,255,0.7); }

/* Project nav dots */
.nav-dots {
  display: flex; gap: 6px; align-items: center;
}
.nav-dot {
  height: 6px; border-radius: 100px;
  border: none; cursor: pointer;
  background: rgba(255,255,255,0.15);
  width: 6px;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.nav-dot.active {
  width: 32px;
  background: var(--accent);
}

/* ═══ MAIN ═══ */
main {
  position: relative; z-index: 10;
  min-height: 100vh;
  padding-top: 80px;
  display: flex; align-items: center; justify-content: center;
}

/* ═══ HERO VIEW ═══ */
.hero-view {
  width: 100%; max-width: 1400px;
  padding: 40px;
  display: flex; align-items: center; gap: 60px;
  min-height: calc(100vh - 80px);
}

.hero-info {
  flex: 0 0 420px;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.hero-info.transitioning {
  opacity: 0; transform: translateX(-30px);
}

.hero-category {
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.35em;
  color: var(--accent);
  margin-bottom: 16px;
}

.hero-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 900;
  line-height: 1.05;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: clamp(18px, 2.5vw, 24px);
  color: rgba(255,255,255,0.35);
  margin-bottom: 24px;
  font-weight: 400;
}

.hero-description {
  font-size: 14px;
  color: rgba(255,255,255,0.3);
  line-height: 1.7;
  margin-bottom: 32px;
  max-width: 380px;
}

.hero-stats {
  display: flex; flex-wrap: wrap; gap: 10px;
  margin-bottom: 40px;
}
.hero-stat {
  padding: 10px 20px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  font-weight: 500;
}

/* Devices container */
.hero-devices {
  flex: 1;
  position: relative;
  height: 520px;
  display: flex; align-items: center; justify-content: center;
  perspective: 2000px;
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.hero-devices.transitioning {
  opacity: 0; transform: scale(0.92) rotateY(5deg);
}

/* MacBook */
.macbook {
  position: relative;
  width: min(700px, 55vw);
  animation: macFloat 6s ease-in-out infinite;
}
@keyframes macFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

.mac-bezel {
  background: linear-gradient(180deg, #555 0%, #333 3%, #2a2a2a 50%, #1a1a1a 100%);
  border-radius: 16px 16px 0 0;
  padding: 12px 12px 8px;
  position: relative;
}
.mac-notch {
  position: absolute; top: 4px; left: 50%;
  transform: translateX(-50%);
  width: 80px; height: 18px;
  background: #111; border-radius: 0 0 10px 10px;
}
.mac-notch::after {
  content: ''; position: absolute;
  top: 6px; left: 50%; transform: translateX(-50%);
  width: 6px; height: 6px; border-radius: 50%;
  background: #1a1a2e;
}
.mac-screen {
  background: #000; border-radius: 6px;
  overflow: hidden; aspect-ratio: 16/10;
  position: relative;
}
.mac-screen img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
  transition: opacity 0.5s ease;
}
.mac-screen::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 40%);
  pointer-events: none;
}
.mac-base {
  height: 12px;
  background: linear-gradient(180deg, #444 0%, #2a2a2a 100%);
  border-radius: 0 0 3px 3px;
  position: relative;
}
.mac-hinge {
  position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 120px; height: 4px;
  background: #3a3a3a; border-radius: 0 0 4px 4px;
}
.mac-shadow {
  position: absolute; bottom: -30px;
  left: 15%; right: 15%;
  height: 40px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
  filter: blur(15px);
}

/* iPhone */
.iphone {
  position: absolute;
  right: -20px; top: 50%;
  transform: translateY(-42%);
  width: min(160px, 14vw);
  animation: phoneFloat 6s ease-in-out infinite 0.8s;
  z-index: 20;
}
@keyframes phoneFloat {
  0%, 100% { transform: translateY(-42%); }
  50% { transform: translateY(calc(-42% - 10px)); }
}

.phone-body {
  background: #1a1a1a;
  border-radius: 28px;
  padding: 8px;
  border: 2px solid #333;
  position: relative;
}
.phone-island {
  position: absolute; top: 12px; left: 50%;
  transform: translateX(-50%);
  width: 60px; height: 18px;
  background: #000; border-radius: 12px;
  z-index: 10;
}
.phone-screen {
  background: #000; border-radius: 22px;
  overflow: hidden; aspect-ratio: 9/19.5;
  position: relative;
}
.phone-screen img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: top;
  display: block;
  transition: opacity 0.5s ease;
}
.phone-screen::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(160deg, rgba(255,255,255,0.07) 0%, transparent 30%);
  pointer-events: none;
}
.phone-bar {
  position: absolute; bottom: 6px; left: 50%;
  transform: translateX(-50%);
  width: 60px; height: 3px;
  background: rgba(255,255,255,0.2);
  border-radius: 100px;
}

/* Floating decorations */
.float-deco {
  position: absolute;
  border: 1px solid rgba(255,255,255,0.04);
  background: rgba(255,255,255,0.015);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  animation: decoFloat var(--dur) ease-in-out infinite var(--delay);
}
@keyframes decoFloat {
  0%, 100% { transform: translateY(0) rotate(var(--rot)); }
  50% { transform: translateY(-10px) rotate(var(--rot)); }
}

/* ═══ ISOMETRIC VIEW ═══ */
.iso-view {
  width: 100%; min-height: calc(100vh - 80px);
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
  perspective: 2500px;
}

.iso-scene {
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(20deg) rotateY(-30deg) rotateZ(3deg);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.iso-card {
  position: absolute;
  width: min(550px, 45vw);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform-style: preserve-3d;
}
.iso-card img {
  width: 100%; display: block;
  aspect-ratio: 16/10;
  object-fit: cover;
}
.iso-card::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%);
  pointer-events: none;
}
.iso-card.active {
  border-color: rgba(255,255,255,0.2);
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(var(--accent-rgb), 0.1);
}
.iso-card:not(.active) { opacity: 0.5; }
.iso-card:not(.active):hover { opacity: 0.7; }

.iso-label {
  position: fixed;
  bottom: 80px; left: 60px; z-index: 50;
  transition: all 0.5s ease;
}
.iso-label-cat {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.35em; color: var(--accent);
  margin-bottom: 8px;
}
.iso-label-name {
  font-size: 42px; font-weight: 900;
  line-height: 1.1; letter-spacing: -0.02em;
}
.iso-label-sub {
  font-size: 18px; color: rgba(255,255,255,0.3);
  margin-top: 4px;
}

/* ═══ GRID VIEW ═══ */
.grid-view {
  width: 100%; max-width: 1300px;
  padding: 40px;
  min-height: calc(100vh - 80px);
  display: flex; align-items: center;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.grid-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.04);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(255,255,255,0.02);
}
.grid-card img {
  width: 100%; display: block;
  aspect-ratio: 16/10;
  object-fit: cover;
  transition: transform 0.6s ease;
}
.grid-card:hover img { transform: scale(1.03); }
.grid-card.active {
  border-color: rgba(255,255,255,0.15);
  transform: scale(1.03);
  box-shadow: 0 20px 50px rgba(var(--accent-rgb), 0.15);
}
.grid-card:not(.active) { opacity: 0.55; }
.grid-card:not(.active):hover { opacity: 0.85; }

.grid-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%);
  display: flex; flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.grid-card:hover .grid-overlay,
.grid-card.active .grid-overlay { opacity: 1; }

.grid-overlay-cat {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.3em; color: var(--accent);
  margin-bottom: 4px;
}
.grid-overlay-name {
  font-size: 18px; font-weight: 700;
}
.grid-overlay-sub {
  font-size: 12px; color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

/* ═══ FOOTER ═══ */
footer {
  position: fixed; bottom: 0; left: 0; right: 0;
  z-index: 100;
  padding: 16px;
  text-align: center;
  background: linear-gradient(to top, rgba(5,5,5,0.9) 0%, transparent 100%);
  pointer-events: none;
}
footer p {
  font-size: 11px; letter-spacing: 0.3em;
  color: rgba(255,255,255,0.12);
  font-weight: 500;
}

/* ═══ VIEW TRANSITIONS ═══ */
.view-container {
  display: none;
  animation: viewIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.view-container.active { display: flex; }

@keyframes viewIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══ RESPONSIVE ═══ */
@media (max-width: 900px) {
  .hero-view { flex-direction: column; gap: 30px; padding: 20px; }
  .hero-info { flex: none; width: 100%; text-align: center; }
  .hero-stats { justify-content: center; }
  .hero-devices { height: 350px; }
  .iphone { display: none; }
  .grid-container { grid-template-columns: repeat(2, 1fr); }
  header { padding: 16px 20px; }
}

/* ═══ SCREEN IMAGE CYCLING ═══ */
.screen-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.8s ease;
}
.screen-img.visible { opacity: 1; }
</style>
</head>
<body>

<div class="bg-grid"></div>
<div class="bg-glow bg-glow-1"></div>
<div class="bg-glow bg-glow-2"></div>
<div class="bg-glow bg-glow-3"></div>

<header>
  <div class="brand">
    <div class="brand-icon">B</div>
    <div>
      <div class="brand-name">BLACKWOLF</div>
      <div class="brand-tagline">PROJECT SHOWCASE</div>
    </div>
  </div>
  <div class="view-toggle">
    <button class="view-btn active" data-view="hero">Hero</button>
    <button class="view-btn" data-view="iso">Isometric</button>
    <button class="view-btn" data-view="grid">Grid</button>
  </div>
  <div class="nav-dots" id="navDots"></div>
</header>

<main>
  <!-- HERO VIEW -->
  <div class="view-container active" id="heroView" data-view="hero">
    <div class="hero-view">
      <div class="hero-info" id="heroInfo">
        <div class="hero-category" id="heroCat"></div>
        <h1 class="hero-title" id="heroTitle"></h1>
        <p class="hero-subtitle" id="heroSubtitle"></p>
        <p class="hero-description" id="heroDesc"></p>
        <div class="hero-stats" id="heroStats"></div>
        <div class="nav-dots" id="heroNav"></div>
      </div>
      <div class="hero-devices" id="heroDevices">
        <div class="macbook">
          <div class="mac-bezel">
            <div class="mac-notch"></div>
            <div class="mac-screen" id="macScreen"></div>
          </div>
          <div class="mac-base"><div class="mac-hinge"></div></div>
          <div class="mac-shadow"></div>
        </div>
        <div class="iphone">
          <div class="phone-body">
            <div class="phone-island"></div>
            <div class="phone-screen" id="phoneScreen"></div>
            <div class="phone-bar"></div>
          </div>
        </div>
        <div class="float-deco" style="width:80px;height:80px;top:40px;right:60px;--dur:7s;--delay:0s;--rot:12deg;border-radius:20px;"></div>
        <div class="float-deco" style="width:50px;height:50px;bottom:80px;left:-20px;--dur:8s;--delay:1s;--rot:-8deg;border-radius:50%;"></div>
        <div class="float-deco" style="width:40px;height:40px;bottom:40px;right:120px;--dur:6s;--delay:0.5s;--rot:20deg;"></div>
      </div>
    </div>
  </div>

  <!-- ISO VIEW -->
  <div class="view-container" id="isoView" data-view="iso">
    <div class="iso-view">
      <div class="iso-scene" id="isoScene"></div>
    </div>
    <div class="iso-label" id="isoLabel">
      <div class="iso-label-cat" id="isoCat"></div>
      <div class="iso-label-name" id="isoName"></div>
      <div class="iso-label-sub" id="isoSub"></div>
    </div>
  </div>

  <!-- GRID VIEW -->
  <div class="view-container" id="gridView" data-view="grid">
    <div class="grid-view">
      <div class="grid-container" id="gridContainer"></div>
    </div>
  </div>
</main>

<footer>
  <p>PROTECT EXCELLENCE &nbsp;&bull;&nbsp; EMPOWER INNOVATION</p>
</footer>

<script>
const projects = ${projectsJSON};

let activeProject = 0;
let activeView = 'hero';
let transitioning = false;
let autoTimer = null;
let screenCycleTimer = null;
let currentScreenIndex = 0;

// ── Init ──
function init() {
  createParticles();
  renderNavDots();
  renderGrid();
  renderIsoCards();
  setProject(0, false);
  startAutoRotate();
  startScreenCycle();

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  });
}

function createParticles() {
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = \`left:\${8+Math.random()*84}%;top:\${8+Math.random()*84}%;--dur:\${2+Math.random()*3}s;--delay:\${Math.random()*3}s;\`;
    document.body.appendChild(p);
  }
}

// ── Navigation ──
function renderNavDots() {
  ['navDots', 'heroNav'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = projects.map((_, i) =>
      \`<button class="nav-dot \${i === 0 ? 'active' : ''}" data-i="\${i}"></button>\`
    ).join('');
    el.querySelectorAll('.nav-dot').forEach(dot => {
      dot.addEventListener('click', () => goTo(+dot.dataset.i));
    });
  });
}

function updateDots() {
  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeProject);
    if (i === activeProject) dot.style.background = projects[activeProject].color;
    else dot.style.background = '';
  });
}

// ── Set active project ──
function setProject(index, animate = true) {
  if (transitioning) return;
  const p = projects[index];
  activeProject = index;

  // Update CSS variables
  document.documentElement.style.setProperty('--accent', p.color);
  document.documentElement.style.setProperty('--accent-rgb', p.colorRgb);

  if (animate) {
    transitioning = true;
    document.getElementById('heroInfo')?.classList.add('transitioning');
    document.getElementById('heroDevices')?.classList.add('transitioning');

    setTimeout(() => {
      updateProjectContent(p);
      document.getElementById('heroInfo')?.classList.remove('transitioning');
      document.getElementById('heroDevices')?.classList.remove('transitioning');
      setTimeout(() => { transitioning = false; }, 100);
    }, 350);
  } else {
    updateProjectContent(p);
  }

  updateDots();
  updateIsoCards();
  updateGridCards();
  currentScreenIndex = 0;
}

function updateProjectContent(p) {
  const el = (id) => document.getElementById(id);
  el('heroCat').textContent = p.category;
  el('heroTitle').textContent = p.name;
  el('heroSubtitle').textContent = p.subtitle;
  el('heroDesc').textContent = p.description;
  el('heroStats').innerHTML = p.stats.map(s => \`<div class="hero-stat">\${s}</div>\`).join('');

  // Mac screen
  const macScreen = el('macScreen');
  macScreen.innerHTML = '';
  p.images.forEach((img, i) => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imgEl.className = 'screen-img' + (i === 0 ? ' visible' : '');
    imgEl.draggable = false;
    macScreen.appendChild(imgEl);
  });

  // Phone screen
  const phoneScreen = el('phoneScreen');
  phoneScreen.innerHTML = '';
  const phoneImg = p.images[p.images.length > 1 ? 1 : 0];
  const pEl = document.createElement('img');
  pEl.src = phoneImg;
  pEl.className = 'screen-img visible';
  pEl.draggable = false;
  phoneScreen.appendChild(pEl);
}

// ── Screen image cycling within a project ──
function startScreenCycle() {
  clearInterval(screenCycleTimer);
  screenCycleTimer = setInterval(() => {
    const p = projects[activeProject];
    if (p.images.length <= 1) return;

    const macScreen = document.getElementById('macScreen');
    const imgs = macScreen?.querySelectorAll('.screen-img');
    if (!imgs || imgs.length <= 1) return;

    imgs.forEach(img => img.classList.remove('visible'));
    currentScreenIndex = (currentScreenIndex + 1) % imgs.length;
    imgs[currentScreenIndex].classList.add('visible');
  }, 4000);
}

// ── Auto-rotate projects ──
function startAutoRotate() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    goTo((activeProject + 1) % projects.length);
  }, 8000);
}

function goTo(i) {
  if (i === activeProject) return;
  setProject(i);
  startAutoRotate();
  currentScreenIndex = 0;
}

// ── View switching ──
function setView(view) {
  activeView = view;
  document.querySelectorAll('.view-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.view === view)
  );
  document.querySelectorAll('.view-container').forEach(v => {
    v.classList.toggle('active', v.dataset.view === view);
  });
}

// ── Isometric ──
function renderIsoCards() {
  const scene = document.getElementById('isoScene');
  scene.innerHTML = projects.map((p, i) => \`
    <div class="iso-card \${i === 0 ? 'active' : ''}" data-i="\${i}"
      style="transform: translateX(\${(i - activeProject) * 80}px) translateY(\${(i - activeProject) * 40}px) translateZ(\${(i - activeProject) * -100}px);">
      <img src="\${p.images[0]}" alt="\${p.name}" draggable="false" />
    </div>
  \`).join('');

  scene.querySelectorAll('.iso-card').forEach(card => {
    card.addEventListener('click', () => goTo(+card.dataset.i));
  });
}

function updateIsoCards() {
  const cards = document.querySelectorAll('.iso-card');
  const p = projects[activeProject];
  cards.forEach((card, i) => {
    const diff = i - activeProject;
    card.style.transform = \`translateX(\${diff * 80}px) translateY(\${diff * 40}px) translateZ(\${diff * -100}px)\`;
    card.classList.toggle('active', i === activeProject);
    if (i === activeProject) {
      card.style.boxShadow = \`0 40px 80px rgba(0,0,0,0.5), 0 0 60px rgba(\${p.colorRgb}, 0.12)\`;
    } else {
      card.style.boxShadow = '';
    }
  });

  document.getElementById('isoCat').textContent = p.category;
  document.getElementById('isoName').textContent = p.name;
  document.getElementById('isoSub').textContent = p.subtitle;
}

// ── Grid ──
function renderGrid() {
  const container = document.getElementById('gridContainer');
  container.innerHTML = projects.map((p, i) => \`
    <div class="grid-card \${i === 0 ? 'active' : ''}" data-i="\${i}">
      <img src="\${p.images[0]}" alt="\${p.name}" draggable="false" />
      <div class="grid-overlay">
        <div class="grid-overlay-cat">\${p.category}</div>
        <div class="grid-overlay-name">\${p.name}</div>
        <div class="grid-overlay-sub">\${p.subtitle}</div>
      </div>
    </div>
  \`).join('');

  container.querySelectorAll('.grid-card').forEach(card => {
    card.addEventListener('click', () => goTo(+card.dataset.i));
  });
}

function updateGridCards() {
  document.querySelectorAll('.grid-card').forEach((card, i) => {
    card.classList.toggle('active', i === activeProject);
  });
}

// ── Keyboard ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goTo((activeProject + 1) % projects.length);
  if (e.key === 'ArrowLeft') goTo((activeProject - 1 + projects.length) % projects.length);
  if (e.key === '1') setView('hero');
  if (e.key === '2') setView('iso');
  if (e.key === '3') setView('grid');
});

// ── Launch ──
document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;

  await writeFile(OUTPUT, html, 'utf-8');
  const sizeMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Showcase saved: ${OUTPUT}`);
  console.log(`📦 File size: ${sizeMB} MB`);
}

main().catch(console.error);
