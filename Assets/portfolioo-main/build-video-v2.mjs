import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';

const FULLPAGE_DIR = resolve('./fullpage');
const OUTPUT = resolve('./Blackwolf_Showcase.html');

const projects = [
  {
    id: 'fba', name: 'FBA Academy Pro', subtitle: 'High-Ticket VSL Funnel',
    category: 'LEAD GENERATION', color: '#F59E0B', colorRgb: '245,158,11',
    description: 'Conversion-optimized landing page with video-first engagement and social proof engine.',
    stats: ['65 stores', '€300k/month', '5000+ students'],
    screens: ['fba_full_1.png']
  },
  {
    id: 'taskflow', name: 'TaskFlow', subtitle: 'AI-Powered Task Management',
    category: 'PROPRIETARY PRODUCT', color: '#8B5CF6', colorRgb: '139,92,246',
    description: 'Discord AI agent with zero-friction task capture, calendar sync, and full team visibility.',
    stats: ['AI Discord bot', 'Calendar sync', 'Role-based access'],
    screens: ['taskflow_tareas.png', 'taskflow_dashboard.png', 'taskflow_calendario.png', 'taskflow_gestion.png']
  },
  {
    id: 'gol', name: 'Game of Life', subtitle: 'Gamified Life Operating System',
    category: 'PROPRIETARY SAAS', color: '#3B82F6', colorRgb: '59,130,246',
    description: 'HP/XP/Levels system integrating health, finance, and productivity with gamification.',
    stats: ['Life OS', 'Gamification', 'Data sovereignty'],
    screens: ['gol_landing_full.png']
  },
  {
    id: 'soc', name: 'Blackwolf SOC', subtitle: 'Security Operations Center',
    category: 'SECURITY DIVISION', color: '#EF4444', colorRgb: '239,68,68',
    description: 'Enterprise-grade threat monitoring with SIGMA rules, UEBA analytics, and AI-driven detection.',
    stats: ['154K+ threats', '11 sensors', 'Real-time detection'],
    screens: ['soc_login_full.png']
  },
  {
    id: 'detras', name: 'Detrás de Cámara', subtitle: 'Operations Platform',
    category: 'CLIENT PLATFORM', color: '#F97316', colorRgb: '249,115,22',
    description: 'Multi-tenant SaaS with real-time sales intelligence and AI-powered reporting.',
    stats: ['3 Deployments', '€300k+ tracked', '7 team members'],
    screens: ['detras_login_full.png']
  },
  {
    id: 'website', name: 'blackwolfsec.io', subtitle: 'Corporate Website',
    category: 'BRAND IDENTITY', color: '#FFFFFF', colorRgb: '255,255,255',
    description: 'Premium dark-aesthetic corporate site showcasing three divisions with global positioning.',
    stats: ['3 divisions', 'Enterprise-grade', 'Global reach'],
    screens: ['website_home_full.png']
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(FULLPAGE_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function getImageDimensions(filename) {
  // Simple PNG dimension reader
  const buf = await readFile(join(FULLPAGE_DIR, filename));
  // PNG header: width at offset 16 (4 bytes BE), height at offset 20 (4 bytes BE)
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return { width, height };
}

async function main() {
  console.log('📦 Loading full-page screenshots...');

  for (const p of projects) {
    p.screenData = [];
    for (const s of p.screens) {
      try {
        const b64 = await imageToBase64(s);
        const dims = await getImageDimensions(s);
        // Aspect ratio tells us how many "viewports" tall the page is
        const scrollRatio = dims.height / (dims.width * (10/16)); // relative to 16:10 viewport
        p.screenData.push({ src: b64, w: dims.width, h: dims.height, scrollRatio, filename: s });
        const sizeMB = (Buffer.byteLength(b64, 'utf-8') / 1024 / 1024).toFixed(1);
        console.log(`  ✅ ${s} (${dims.width}x${dims.height}, scroll: ${scrollRatio.toFixed(1)}x, ${sizeMB}MB)`);
      } catch (e) {
        console.log(`  ⚠️ ${s}: ${e.message}`);
      }
    }
  }

  const projectsJSON = JSON.stringify(projects.map(p => ({
    id: p.id, name: p.name, subtitle: p.subtitle, category: p.category,
    color: p.color, colorRgb: p.colorRgb, description: p.description,
    stats: p.stats,
    screenData: p.screenData.map(s => ({
      src: s.src, w: s.w, h: s.h, scrollRatio: s.scrollRatio
    }))
  })));

  console.log('🔨 Building cinematic showcase...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLACKWOLF — Portfolio</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --accent: #F59E0B;
  --accent-rgb: 245,158,11;
  --bg: #050505;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; }
body {
  background: var(--bg); color: #fff;
  font-family: 'Inter', -apple-system, sans-serif;
  overflow: hidden; width: 100vw; height: 100vh;
}

/* ═══ BG ═══ */
.bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.bg-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-vig { background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%); }
.glow {
  position: fixed; pointer-events: none; border-radius: 50%; filter: blur(120px);
  transition: background 2s cubic-bezier(0.16,1,0.3,1);
}
.glow-1 { width: 55vw; height: 55vw; top: -18vw; left: -12vw; background: radial-gradient(circle, rgba(var(--accent-rgb),0.1) 0%, transparent 70%); }
.glow-2 { width: 40vw; height: 40vw; bottom: -12vw; right: -8vw; background: radial-gradient(circle, rgba(var(--accent-rgb),0.06) 0%, transparent 70%); }

.particle {
  position: fixed; pointer-events: none;
  width: 2px; height: 2px; background: rgba(255,255,255,0.3); border-radius: 50%;
  animation: pulse var(--d) ease-in-out infinite var(--dl);
}
@keyframes pulse { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.6;transform:scale(2)} }

/* ═══ HEADER ═══ */
header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 44px;
}
.brand { display: flex; align-items: center; gap: 12px; }
.brand-icon {
  width: 38px; height: 38px; background: #fff; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 21px; color: #000;
  box-shadow: 0 4px 20px rgba(255,255,255,0.08);
}
.brand-name { font-size: 15px; font-weight: 700; letter-spacing: .2em; }
.brand-sub { font-size: 8px; color: rgba(255,255,255,.2); letter-spacing: .3em; margin-top: 1px; }
.counter { font-size: 13px; color: rgba(255,255,255,.25); font-variant-numeric: tabular-nums; }
.counter b { color: #fff; font-size: 15px; }

/* ═══ STAGE ═══ */
.stage {
  position: relative; z-index: 10;
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  gap: clamp(36px,4.5vw,90px); padding: 0 clamp(28px,4vw,70px);
}

/* ═══ INFO PANEL ═══ */
.info {
  flex: 0 0 clamp(260px,24vw,380px);
  transition: all .65s cubic-bezier(.16,1,.3,1);
}
.info.out { opacity: 0; transform: translateY(25px); }
.info-cat { font-size: 11px; font-weight: 700; letter-spacing: .35em; color: var(--accent); margin-bottom: 14px; transition: color 1.2s ease; }
.info-title { font-size: clamp(26px,3.2vw,44px); font-weight: 900; line-height: 1.08; margin-bottom: 8px; letter-spacing: -.03em; }
.info-sub { font-size: clamp(15px,1.4vw,20px); color: rgba(255,255,255,.3); margin-bottom: 18px; }
.info-desc { font-size: 13px; color: rgba(255,255,255,.22); line-height: 1.7; margin-bottom: 24px; max-width: 350px; }
.info-stats { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 32px; }
.info-stat { padding: 7px 14px; border-radius: 100px; border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.015); font-size: 11px; color: rgba(255,255,255,.4); font-weight: 500; }

/* Page indicator (which page of this project) */
.page-indicator { display: flex; gap: 4px; margin-bottom: 20px; }
.page-pip {
  width: 20px; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,.08);
  transition: all .4s ease;
}
.page-pip.active { background: var(--accent); width: 32px; }

/* Progress dots */
.dots { display: flex; gap: 6px; }
.dot {
  height: 5px; width: 5px; border-radius: 100px;
  background: rgba(255,255,255,.1); border: none; cursor: pointer; padding: 0;
  transition: all .5s cubic-bezier(.16,1,.3,1); position: relative; overflow: hidden;
}
.dot.active { width: 34px; background: rgba(255,255,255,.12); }
.dot.active::after {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent); border-radius: 100px;
  width: 0%; transition: width linear;
}
.dot.filling::after { width: 100%; }

/* ═══ LAPTOP ═══ */
.laptop-wrap {
  flex: 0 1 auto; max-width: clamp(480px,50vw,860px); width: 100%;
  animation: float 7s ease-in-out infinite;
  filter: drop-shadow(0 35px 70px rgba(0,0,0,.5));
}
@keyframes float {
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.lid {
  background: linear-gradient(180deg, #5a5a5a 0%, #3a3a3a 2%, #2a2a2a 50%, #1a1a1a 100%);
  border-radius: clamp(10px,1.1vw,16px) clamp(10px,1.1vw,16px) 0 0;
  padding: clamp(8px,.7vw,12px); padding-top: clamp(14px,1.3vw,22px);
  position: relative;
}
.notch {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: clamp(55px,6.5vw,90px); height: clamp(11px,1.1vw,20px);
  background: #131313; border-radius: 0 0 clamp(5px,.5vw,9px) clamp(5px,.5vw,9px);
}
.notch::after {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 5px; height: 5px; border-radius: 50%; background: #0d0d1a;
}

.screen {
  background: #000; border-radius: clamp(3px,.4vw,7px);
  overflow: hidden; aspect-ratio: 16/10; position: relative;
}

/* The scrolling content container */
.screen-content {
  position: absolute; top: 0; left: 0; width: 100%;
  will-change: transform;
  transition: opacity .5s ease;
}
.screen-content.hidden { opacity: 0; }
.screen-content img { width: 100%; display: block; }

/* Reflection & scanlines */
.screen::after {
  content: ''; position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: linear-gradient(135deg, rgba(255,255,255,.04) 0%, transparent 35%, transparent 65%, rgba(255,255,255,.01) 100%);
}
.scanlines {
  position: absolute; inset: 0; z-index: 6; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px);
}

.base {
  height: clamp(7px,.7vw,12px);
  background: linear-gradient(180deg, #484848 0%, #2a2a2a 100%);
  border-radius: 0 0 2px 2px; position: relative;
}
.hinge { position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: clamp(70px,9vw,130px); height: clamp(3px,.25vw,5px); background: #444; border-radius: 0 0 4px 4px; }
.lip { position: absolute; bottom: 0; left: 9%; right: 9%; height: clamp(4px,.4vw,7px); background: linear-gradient(180deg,#383838,#262626); border-radius: 0 0 6px 6px; }
.shadow {
  width: 75%; height: clamp(18px,2.5vw,40px); margin: 0 auto;
  background: radial-gradient(ellipse, rgba(0,0,0,.35) 0%, transparent 70%);
  filter: blur(12px); margin-top: -2px;
  transition: background 1.5s ease;
}

/* ═══ FOOTER ═══ */
footer {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 18px 44px; display: flex; justify-content: space-between; align-items: center;
}
.tagline { font-size: 10px; letter-spacing: .35em; color: rgba(255,255,255,.09); font-weight: 500; }
.hint { font-size: 11px; color: rgba(255,255,255,.12); }
.hint kbd {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 18px; padding: 0 5px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.07);
  border-radius: 3px; font-size: 10px; font-family: inherit; color: rgba(255,255,255,.25);
  margin: 0 2px;
}

@media (max-width:768px) {
  .stage { flex-direction: column; gap: 20px; padding-top: 80px; }
  .info { flex: none; text-align: center; }
  .info-stats { justify-content: center; }
  .dots { justify-content: center; }
  .page-indicator { justify-content: center; }
  .laptop-wrap { max-width: 92vw; }
  .hint { display: none; }
}
</style>
</head>
<body>

<div class="bg bg-grid"></div>
<div class="bg bg-vig"></div>
<div class="glow glow-1"></div>
<div class="glow glow-2"></div>
<div id="particles"></div>

<header>
  <div class="brand">
    <div class="brand-icon">B</div>
    <div><div class="brand-name">BLACKWOLF</div><div class="brand-sub">PORTFOLIO</div></div>
  </div>
  <div class="counter"><b id="cNum">01</b> / <span id="cTotal">06</span></div>
</header>

<div class="stage">
  <div class="info" id="info">
    <div class="info-cat" id="cat"></div>
    <h1 class="info-title" id="title"></h1>
    <p class="info-sub" id="sub"></p>
    <p class="info-desc" id="desc"></p>
    <div class="info-stats" id="stats"></div>
    <div class="page-indicator" id="pagePips"></div>
    <div class="dots" id="dots"></div>
  </div>

  <div class="laptop-wrap">
    <div class="lid">
      <div class="notch"></div>
      <div class="screen" id="screen">
        <div class="screen-content" id="screenContent"></div>
        <div class="scanlines"></div>
      </div>
    </div>
    <div class="base"><div class="hinge"></div><div class="lip"></div></div>
    <div class="shadow" id="shadow"></div>
  </div>
</div>

<footer>
  <div class="tagline">PROTECT EXCELLENCE &bull; EMPOWER INNOVATION</div>
  <div class="hint"><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate &nbsp; <kbd>Space</kbd> Pause</div>
</footer>

<script>
const P = ${projectsJSON};
let cur = 0, page = 0, paused = false, busy = false, scrollAnim = null, timers = [];

const $ = id => document.getElementById(id);

function init() {
  // Particles
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.cssText = 'left:'+(5+Math.random()*90)+'%;top:'+(5+Math.random()*90)+'%;--d:'+(2+Math.random()*4)+'s;--dl:'+(Math.random()*3)+'s;';
    $('particles').appendChild(d);
  }

  $('cTotal').textContent = String(P.length).padStart(2,'0');
  buildDots();
  show(0, false);

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go((cur+1)%P.length);
    else if (e.key === 'ArrowLeft') go((cur-1+P.length)%P.length);
    else if (e.key === ' ') { e.preventDefault(); paused = !paused; if (!paused) scheduleNext(); }
  });
}

function buildDots() {
  $('dots').innerHTML = P.map((_,i) =>
    '<button class="dot'+(i===0?' active':'')+'" data-i="'+i+'"></button>'
  ).join('');
  $('dots').querySelectorAll('.dot').forEach(d =>
    d.addEventListener('click', e => { e.stopPropagation(); go(+d.dataset.i); })
  );
}

function go(i) {
  if (i === cur && page === 0 || busy) return;
  clearTimers();
  cancelAnimationFrame(scrollAnim);
  page = 0;
  show(i, true);
}

function show(i, anim) {
  const p = P[i];
  cur = i;
  page = 0;

  // Colors
  document.documentElement.style.setProperty('--accent', p.color);
  document.documentElement.style.setProperty('--accent-rgb', p.colorRgb);
  $('shadow').style.background = 'radial-gradient(ellipse, rgba('+p.colorRgb+',.12) 0%, transparent 70%)';

  if (anim) {
    busy = true;
    $('info').classList.add('out');
    $('screenContent').classList.add('hidden');
    delay(450).then(() => {
      updateInfo(p);
      loadScreen(p, 0).then(() => {
        $('info').classList.remove('out');
        $('screenContent').classList.remove('hidden');
        delay(200).then(() => { busy = false; startScrollSequence(p); });
      });
    });
  } else {
    updateInfo(p);
    loadScreen(p, 0).then(() => startScrollSequence(p));
  }

  $('cNum').textContent = String(i+1).padStart(2,'0');
  updateDots(i);
}

function updateInfo(p) {
  $('cat').textContent = p.category;
  $('title').textContent = p.name;
  $('sub').textContent = p.subtitle;
  $('desc').textContent = p.description;
  $('stats').innerHTML = p.stats.map(s => '<div class="info-stat">'+s+'</div>').join('');

  // Page pips
  $('pagePips').innerHTML = p.screenData.map((_,i) =>
    '<div class="page-pip'+(i===0?' active':'')+'"></div>'
  ).join('');
}

function updateDots(active) {
  $('dots').querySelectorAll('.dot').forEach((d,i) => {
    d.classList.toggle('active', i === active);
    d.classList.remove('filling');
    if (i === active) {
      void d.offsetHeight;
    }
  });
}

function startDotFill(duration) {
  const dot = $('dots').querySelector('.dot.active');
  if (!dot) return;
  dot.style.setProperty('--fill-dur', duration + 'ms');
  dot.querySelector('::after')
  // Use CSS transition
  dot.style.cssText += '; --fill-dur:' + duration + 'ms;';
  const after = dot;
  after.style.setProperty('transition', 'none', 'important');
  void after.offsetHeight;
  // set after width via class
  after.classList.add('filling');
  // override transition on pseudo
}

function loadScreen(p, pageIdx) {
  return new Promise(resolve => {
    const sc = $('screenContent');
    const data = p.screenData[pageIdx];
    if (!data) { resolve(); return; }

    const img = new Image();
    img.onload = () => {
      sc.innerHTML = '';
      sc.appendChild(img);
      img.style.width = '100%';
      img.style.display = 'block';
      sc.style.transform = 'translateY(0)';
      resolve();
    };
    img.src = data.src;
    img.draggable = false;
  });
}

function startScrollSequence(p) {
  clearTimers();
  cancelAnimationFrame(scrollAnim);
  page = 0;
  updatePips(0);
  scrollCurrentPage(p);
}

function scrollCurrentPage(p) {
  const data = p.screenData[page];
  if (!data) { nextProject(); return; }

  const screenEl = $('screen');
  const sc = $('screenContent');
  const screenH = screenEl.offsetHeight;
  const imgEl = sc.querySelector('img');
  if (!imgEl) { nextProject(); return; }

  const imgH = imgEl.offsetHeight;
  const scrollDist = Math.max(0, imgH - screenH);

  if (scrollDist < 20) {
    // No scrolling needed — just hold for a few seconds then go to next page
    timers.push(setTimeout(() => {
      if (paused) return;
      goToNextPage(p);
    }, 3500));
    return;
  }

  // Smooth scroll animation using requestAnimationFrame
  const scrollDuration = Math.min(Math.max(scrollDist * 4, 4000), 12000); // 4-12 seconds based on length
  const holdTop = 1500;    // pause at top
  const holdBottom = 1500; // pause at bottom

  // Phase 1: Hold at top
  timers.push(setTimeout(() => {
    if (paused) return;

    // Phase 2: Smooth scroll down
    const startTime = performance.now();
    function animate(now) {
      if (paused) { scrollAnim = requestAnimationFrame(animate); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      // Easing: ease-in-out cubic
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const y = eased * scrollDist;
      sc.style.transform = 'translateY(-' + y + 'px)';

      if (progress < 1) {
        scrollAnim = requestAnimationFrame(animate);
      } else {
        // Phase 3: Hold at bottom, then next page
        timers.push(setTimeout(() => {
          if (paused) return;
          goToNextPage(p);
        }, holdBottom));
      }
    }
    scrollAnim = requestAnimationFrame(animate);
  }, holdTop));
}

function goToNextPage(p) {
  page++;
  if (page >= p.screenData.length) {
    nextProject();
    return;
  }

  updatePips(page);

  // Crossfade to next page
  const sc = $('screenContent');
  sc.classList.add('hidden');

  timers.push(setTimeout(() => {
    loadScreen(p, page).then(() => {
      sc.classList.remove('hidden');
      timers.push(setTimeout(() => scrollCurrentPage(p), 300));
    });
  }, 500));
}

function nextProject() {
  if (paused) return;
  const next = (cur + 1) % P.length;
  page = 0;
  show(next, true);
}

function scheduleNext() {
  // Resume current scroll
  scrollCurrentPage(P[cur]);
}

function updatePips(active) {
  $('pagePips').querySelectorAll('.page-pip').forEach((p, i) => {
    p.classList.toggle('active', i === active);
  });
}

function clearTimers() { timers.forEach(t => clearTimeout(t)); timers = []; }
function delay(ms) { return new Promise(r => { timers.push(setTimeout(r, ms)); }); }

document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;

  await writeFile(OUTPUT, html, 'utf-8');
  const sizeMB = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(1);
  console.log('\\n✅ Saved: ' + OUTPUT);
  console.log('📦 Size: ' + sizeMB + ' MB');
}

main().catch(console.error);
