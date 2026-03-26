import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const SCREENSHOTS_DIR = resolve('./screenshots');
const OUTPUT = resolve('./Blackwolf_Showcase.html');

const projects = [
  {
    id: 'detras', name: 'Detrás de Cámara', subtitle: 'Full Company Automation Platform',
    category: 'CLIENT PLATFORM', color: '#F97316', colorRgb: '249,115,22',
    description: 'Multi-tenant SaaS with real-time sales intelligence and AI-powered reporting across 3 deployments.',
    stats: ['3 Deployments', '€300k+ tracked', '7 team members'],
    screens: ['01_detras_leaderboards.png', '02_detras_charts.png']
  },
  {
    id: 'fba', name: 'FBA Academy Pro', subtitle: 'High-Ticket VSL Funnel',
    category: 'LEAD GENERATION', color: '#F59E0B', colorRgb: '245,158,11',
    description: 'Conversion-optimized landing page with video-first engagement and social proof engine.',
    stats: ['65 stores', '€300k/month', '5000+ students'],
    screens: ['03_fba_hero.png', '04_fba_testimonials.png']
  },
  {
    id: 'taskflow', name: 'TaskFlow', subtitle: 'AI-Powered Task Management',
    category: 'PROPRIETARY PRODUCT', color: '#8B5CF6', colorRgb: '139,92,246',
    description: 'Discord AI agent with zero-friction task capture, calendar sync, and full team visibility.',
    stats: ['AI Discord bot', 'Calendar sync', 'Role-based access'],
    screens: ['05_taskflow_calendar.png', '06_taskflow_tasks.png']
  },
  {
    id: 'soc', name: 'Blackwolf SOC', subtitle: 'Security Operations Center',
    category: 'SECURITY DIVISION', color: '#EF4444', colorRgb: '239,68,68',
    description: 'Enterprise-grade threat monitoring with SIGMA rules, UEBA analytics, and AI-driven detection.',
    stats: ['154K+ threats', '11 sensors', 'Real-time detection'],
    screens: ['07_soc_overview.png', '08_soc_threats.png']
  },
  {
    id: 'gol', name: 'Game of Life', subtitle: 'Gamified Life Operating System',
    category: 'PROPRIETARY SAAS', color: '#3B82F6', colorRgb: '59,130,246',
    description: 'HP/XP/Levels system integrating health, finance, and productivity. Privacy-first architecture.',
    stats: ['Life OS', 'Gamification', 'Data sovereignty'],
    screens: ['09_gol_command.png', '10_gol_biodome.png', '11_gol_landing.png']
  },
  {
    id: 'website', name: 'blackwolfsec.io', subtitle: 'Corporate Website',
    category: 'BRAND IDENTITY', color: '#FFFFFF', colorRgb: '255,255,255',
    description: 'Premium dark-aesthetic corporate site showcasing three divisions with global positioning.',
    stats: ['3 divisions', 'Enterprise-grade', 'Global reach'],
    screens: ['12_website_hero.png', '13_website_stats.png']
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(SCREENSHOTS_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function main() {
  console.log('📦 Encoding screenshots...');
  const allScreens = [];
  for (const p of projects) {
    p.images = [];
    for (const s of p.screens) {
      try {
        const b64 = await imageToBase64(s);
        p.images.push(b64);
        allScreens.push({ projectId: p.id, src: b64 });
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

  console.log('🔨 Building showcase...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLACKWOLF — Portfolio Showcase</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --accent: #F97316;
  --accent-rgb: 249,115,22;
  --bg: #050505;
  --screen-scroll-duration: 6s;
  --project-duration: 10s;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

body {
  background: var(--bg);
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  width: 100vw; height: 100vh;
  position: relative;
}

/* ═══════ BACKGROUND ═══════ */
.bg-layer {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
}
.bg-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-vignette {
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
}
.bg-glow-1, .bg-glow-2 {
  position: fixed; z-index: 0; pointer-events: none;
  border-radius: 50%;
  filter: blur(120px);
  transition: background 1.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.bg-glow-1 {
  width: 60vw; height: 60vw;
  top: -20vw; left: -15vw;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.1) 0%, transparent 70%);
}
.bg-glow-2 {
  width: 45vw; height: 45vw;
  bottom: -15vw; right: -10vw;
  background: radial-gradient(circle, rgba(var(--accent-rgb), 0.07) 0%, transparent 70%);
}

/* Particles */
.particles { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
.particle {
  position: absolute;
  width: 2px; height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 50%;
  animation: particlePulse var(--dur) ease-in-out infinite var(--delay);
}
@keyframes particlePulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(2); }
}

/* ═══════ HEADER ═══════ */
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 48px;
}
.brand { display: flex; align-items: center; gap: 14px; }
.brand-icon {
  width: 42px; height: 42px;
  background: #fff;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 23px; color: #000;
  box-shadow: 0 4px 24px rgba(255,255,255,0.1);
}
.brand-name { font-size: 16px; font-weight: 700; letter-spacing: 0.2em; }
.brand-sub { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 0.3em; margin-top: 2px; }

.project-counter {
  font-size: 13px; color: rgba(255,255,255,0.3);
  font-weight: 500; letter-spacing: 0.05em;
  font-variant-numeric: tabular-nums;
}
.project-counter span { color: #fff; font-weight: 700; font-size: 15px; }

/* ═══════ MAIN LAYOUT ═══════ */
.stage {
  position: relative; z-index: 10;
  width: 100vw; height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(40px, 5vw, 100px);
  padding: 0 clamp(30px, 5vw, 80px);
}

/* ═══════ PROJECT INFO (LEFT) ═══════ */
.info {
  flex: 0 0 clamp(280px, 25vw, 400px);
  transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 1;
  transform: translateY(0);
}
.info.out {
  opacity: 0;
  transform: translateY(30px);
}

.info-category {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.35em;
  color: var(--accent);
  margin-bottom: 16px;
  text-transform: uppercase;
  transition: color 1s ease;
}

.info-title {
  font-size: clamp(28px, 3.5vw, 48px);
  font-weight: 900;
  line-height: 1.08;
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.info-subtitle {
  font-size: clamp(16px, 1.5vw, 22px);
  color: rgba(255,255,255,0.3);
  font-weight: 400;
  margin-bottom: 20px;
}

.info-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.25);
  line-height: 1.7;
  margin-bottom: 28px;
  max-width: 360px;
}

.info-stats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 36px; }
.info-stat {
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02);
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  font-weight: 500;
}

/* Progress bar */
.progress-track {
  display: flex; gap: 6px; align-items: center;
}
.progress-dot {
  height: 5px; border-radius: 100px;
  background: rgba(255,255,255,0.1);
  width: 5px;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  border: none;
  padding: 0;
}
.progress-dot.active {
  width: 36px;
  background: var(--accent);
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 1s ease;
}
/* Animated fill inside active dot */
.progress-dot.active {
  position: relative;
  overflow: hidden;
  background: rgba(255,255,255,0.15);
}
.progress-dot.active::after {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent);
  border-radius: 100px;
  animation: progressFill var(--project-duration) linear;
}
@keyframes progressFill {
  from { width: 0%; }
  to { width: 100%; }
}

/* ═══════ MACBOOK ═══════ */
.laptop-wrapper {
  flex: 0 1 auto;
  max-width: clamp(500px, 52vw, 900px);
  width: 100%;
  animation: laptopFloat 7s ease-in-out infinite;
  filter: drop-shadow(0 40px 80px rgba(0,0,0,0.5));
  transition: filter 1.5s ease;
}
@keyframes laptopFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-8px) rotate(0.3deg); }
  66% { transform: translateY(-4px) rotate(-0.2deg); }
}

.laptop-lid {
  background: linear-gradient(180deg, #606060 0%, #3d3d3d 2%, #2c2c2c 50%, #1c1c1c 100%);
  border-radius: clamp(10px, 1.2vw, 18px) clamp(10px, 1.2vw, 18px) 0 0;
  padding: clamp(8px, 0.8vw, 14px);
  padding-top: clamp(16px, 1.5vw, 26px);
  position: relative;
}

.laptop-notch {
  position: absolute;
  top: 0; left: 50%; transform: translateX(-50%);
  width: clamp(60px, 7vw, 100px);
  height: clamp(12px, 1.2vw, 22px);
  background: #151515;
  border-radius: 0 0 clamp(6px, 0.6vw, 10px) clamp(6px, 0.6vw, 10px);
}
.laptop-notch::after {
  content: '';
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 6px; height: 6px; border-radius: 50%;
  background: #0d0d1a;
  box-shadow: inset 0 0 3px rgba(40,40,80,0.6);
}

.laptop-screen {
  background: #000;
  border-radius: clamp(4px, 0.5vw, 8px);
  overflow: hidden;
  aspect-ratio: 16 / 10;
  position: relative;
}

/* Screen content - scrolling images */
.screen-track {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  /* Height will be set dynamically based on image aspect ratios */
  transition: opacity 0.6s ease;
}
.screen-track.fading { opacity: 0; }

.screen-img {
  width: 100%;
  display: block;
  /* Natural image height */
}

/* The scroll animation */
.screen-track.scrolling {
  animation: screenScroll var(--screen-scroll-duration) cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}
@keyframes screenScroll {
  0% { transform: translateY(0); }
  15% { transform: translateY(0); } /* Pause at top */
  85% { transform: translateY(var(--scroll-distance)); } /* Scroll down */
  100% { transform: translateY(var(--scroll-distance)); } /* Pause at bottom */
}

/* Screen reflection */
.screen-reflection {
  position: absolute; inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.04) 0%,
    transparent 35%,
    transparent 65%,
    rgba(255,255,255,0.015) 100%
  );
  pointer-events: none;
  z-index: 10;
}

/* Scanline effect */
.screen-scanline {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.03) 2px,
    rgba(0,0,0,0.03) 4px
  );
  pointer-events: none;
  z-index: 11;
}

.laptop-base {
  height: clamp(8px, 0.8vw, 14px);
  background: linear-gradient(180deg, #4a4a4a 0%, #333 40%, #252525 100%);
  border-radius: 0 0 clamp(2px, 0.3vw, 4px) clamp(2px, 0.3vw, 4px);
  position: relative;
}
.laptop-hinge {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: clamp(80px, 10vw, 140px);
  height: clamp(3px, 0.3vw, 5px);
  background: #444;
  border-radius: 0 0 clamp(3px, 0.3vw, 5px) clamp(3px, 0.3vw, 5px);
}
.laptop-lip {
  position: absolute; bottom: 0; left: 8%; right: 8%;
  height: clamp(5px, 0.5vw, 8px);
  background: linear-gradient(180deg, #3a3a3a, #282828);
  border-radius: 0 0 clamp(5px, 0.5vw, 8px) clamp(5px, 0.5vw, 8px);
}

.laptop-shadow {
  width: 80%; height: clamp(20px, 3vw, 50px);
  margin: 0 auto;
  background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%);
  filter: blur(15px);
  margin-top: clamp(-5px, -0.3vw, -2px);
  transition: background 1.5s ease;
}

/* ═══════ FOOTER ═══════ */
.footer {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 20px 48px;
  display: flex; justify-content: space-between; align-items: center;
}
.footer-tagline {
  font-size: 10px; letter-spacing: 0.35em;
  color: rgba(255,255,255,0.1);
  font-weight: 500;
}
.footer-hint {
  font-size: 11px; color: rgba(255,255,255,0.15);
  display: flex; gap: 16px;
}
.footer-hint kbd {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 22px; height: 20px;
  padding: 0 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  font-size: 10px; font-family: inherit;
  color: rgba(255,255,255,0.3);
  margin: 0 3px;
}

/* ═══════ TRANSITIONS ═══════ */
.color-transition {
  transition: color 1s ease, background 1s ease, border-color 1s ease;
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .stage { flex-direction: column; gap: 24px; padding-top: 80px; }
  .info { flex: none; text-align: center; }
  .info-stats { justify-content: center; }
  .progress-track { justify-content: center; }
  .laptop-wrapper { max-width: 90vw; }
  .footer-hint { display: none; }
}
</style>
</head>
<body>

<!-- Background layers -->
<div class="bg-layer bg-grid"></div>
<div class="bg-layer bg-vignette"></div>
<div class="bg-glow-1"></div>
<div class="bg-glow-2"></div>
<div class="particles" id="particles"></div>

<!-- Header -->
<div class="header">
  <div class="brand">
    <div class="brand-icon">B</div>
    <div>
      <div class="brand-name">BLACKWOLF</div>
      <div class="brand-sub">PORTFOLIO</div>
    </div>
  </div>
  <div class="project-counter">
    <span id="counterCurrent">01</span> / <span id="counterTotal">06</span>
  </div>
</div>

<!-- Main Stage -->
<div class="stage">
  <!-- Project Info -->
  <div class="info" id="info">
    <div class="info-category" id="infoCategory"></div>
    <h1 class="info-title" id="infoTitle"></h1>
    <p class="info-subtitle" id="infoSubtitle"></p>
    <p class="info-desc" id="infoDesc"></p>
    <div class="info-stats" id="infoStats"></div>
    <div class="progress-track" id="progressTrack"></div>
  </div>

  <!-- Laptop -->
  <div class="laptop-wrapper">
    <div class="laptop-lid">
      <div class="laptop-notch"></div>
      <div class="laptop-screen" id="laptopScreen">
        <div class="screen-track" id="screenTrack"></div>
        <div class="screen-reflection"></div>
        <div class="screen-scanline"></div>
      </div>
    </div>
    <div class="laptop-base">
      <div class="laptop-hinge"></div>
      <div class="laptop-lip"></div>
    </div>
    <div class="laptop-shadow" id="laptopShadow"></div>
  </div>
</div>

<!-- Footer -->
<div class="footer">
  <div class="footer-tagline">PROTECT EXCELLENCE &bull; EMPOWER INNOVATION</div>
  <div class="footer-hint">
    <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate</span>
    <span><kbd>Space</kbd> Pause</span>
  </div>
</div>

<script>
const projects = ${projectsJSON};

let current = 0;
let screenPhase = 0; // which screen image within a project
let paused = false;
let projectTimer = null;
let screenTimer = null;
let isTransitioning = false;

const $ = id => document.getElementById(id);

// ── Init ──
function init() {
  createParticles();
  buildProgressDots();
  $('counterTotal').textContent = String(projects.length).padStart(2, '0');
  showProject(0, false);
  startAutoPlay();

  document.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
}

function createParticles() {
  const container = $('particles');
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText =
      'left:' + (5 + Math.random() * 90) + '%;' +
      'top:' + (5 + Math.random() * 90) + '%;' +
      '--dur:' + (2 + Math.random() * 4) + 's;' +
      '--delay:' + (Math.random() * 3) + 's;';
    container.appendChild(p);
  }
}

function buildProgressDots() {
  const track = $('progressTrack');
  track.innerHTML = '';
  projects.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'progress-dot' + (i === 0 ? ' active' : '');
    dot.dataset.i = i;
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      goTo(i);
    });
    track.appendChild(dot);
  });
}

// ── Show Project ──
function showProject(index, animate = true) {
  const p = projects[index];
  current = index;
  screenPhase = 0;

  // Update accent color
  document.documentElement.style.setProperty('--accent', p.color);
  document.documentElement.style.setProperty('--accent-rgb', p.colorRgb);

  // Update glow shadow
  $('laptopShadow').style.background =
    'radial-gradient(ellipse, rgba(' + p.colorRgb + ', 0.15) 0%, transparent 70%)';

  if (animate) {
    isTransitioning = true;

    // Fade out info
    $('info').classList.add('out');

    // Fade out screen
    const track = $('screenTrack');
    track.classList.add('fading');

    setTimeout(() => {
      updateInfo(p);
      updateScreen(p, 0);

      // Fade in
      $('info').classList.remove('out');
      track.classList.remove('fading');

      setTimeout(() => {
        isTransitioning = false;
        startScreenScroll(p);
      }, 100);
    }, 500);
  } else {
    updateInfo(p);
    updateScreen(p, 0);
    startScreenScroll(p);
  }

  // Counter
  $('counterCurrent').textContent = String(index + 1).padStart(2, '0');

  // Progress dots
  document.querySelectorAll('.progress-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    // Reset animation
    if (i === index) {
      dot.style.animation = 'none';
      dot.offsetHeight; // reflow
      dot.style.animation = '';
    }
  });
}

function updateInfo(p) {
  $('infoCategory').textContent = p.category;
  $('infoTitle').textContent = p.name;
  $('infoSubtitle').textContent = p.subtitle;
  $('infoDesc').textContent = p.description;
  $('infoStats').innerHTML = p.stats.map(s =>
    '<div class="info-stat">' + s + '</div>'
  ).join('');
}

function updateScreen(p, screenIndex) {
  const track = $('screenTrack');
  const img = p.images[screenIndex] || p.images[0];

  track.innerHTML = '<img class="screen-img" src="' + img + '" alt="' + p.name + '" draggable="false" />';
  track.className = 'screen-track';
  track.style.setProperty('--scroll-distance', '0px');
}

function startScreenScroll(p) {
  clearTimeout(screenTimer);

  const track = $('screenTrack');
  const screenEl = $('laptopScreen');
  const img = track.querySelector('.screen-img');

  if (!img) return;

  // Wait for image to load to calculate scroll distance
  const doScroll = () => {
    const screenHeight = screenEl.offsetHeight;
    const imgHeight = img.offsetHeight;
    const scrollDist = Math.max(0, imgHeight - screenHeight);

    if (scrollDist > 10) {
      track.style.setProperty('--scroll-distance', '-' + scrollDist + 'px');
      track.classList.add('scrolling');
    }

    // After scroll completes, show next screen image or next project
    const scrollTime = scrollDist > 10 ? 6000 : 3000;

    screenTimer = setTimeout(() => {
      if (paused) return;
      screenPhase++;

      if (screenPhase < p.images.length) {
        // Crossfade to next screen of same project
        track.classList.add('fading');
        setTimeout(() => {
          updateScreen(p, screenPhase);
          track.classList.remove('fading');
          setTimeout(() => startScreenScroll(p), 200);
        }, 400);
      } else {
        // Move to next project
        goToNext();
      }
    }, scrollTime);
  };

  if (img.complete) {
    doScroll();
  } else {
    img.onload = doScroll;
  }
}

// ── Navigation ──
function goTo(index) {
  if (index === current || isTransitioning) return;
  clearTimeout(screenTimer);
  clearTimeout(projectTimer);
  showProject(index);
  if (!paused) startAutoPlay();
}

function goToNext() {
  const next = (current + 1) % projects.length;
  showProject(next);
}

function goToPrev() {
  const prev = (current - 1 + projects.length) % projects.length;
  showProject(prev);
}

function startAutoPlay() {
  clearInterval(projectTimer);
  // Auto-play is driven by screen scroll timers, not a separate interval
}

function togglePause() {
  paused = !paused;
  if (!paused) {
    startScreenScroll(projects[current]);
  }
}

// ── Input ──
function onKey(e) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo((current + 1) % projects.length); }
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo((current - 1 + projects.length) % projects.length); }
  if (e.key === ' ') { e.preventDefault(); togglePause(); }
}

function onClick(e) {
  // Click on right half = next, left half = prev
  if (e.target.closest('.progress-dot') || e.target.closest('.brand')) return;
  const x = e.clientX / window.innerWidth;
  if (x > 0.65) goTo((current + 1) % projects.length);
  else if (x < 0.35) goTo((current - 1 + projects.length) % projects.length);
}

// ── Launch ──
document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;

  await writeFile(OUTPUT, html, 'utf-8');
  const sizeMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(1);
  console.log('\\n✅ Showcase saved: ' + OUTPUT);
  console.log('📦 Size: ' + sizeMB + ' MB');
}

main().catch(console.error);
