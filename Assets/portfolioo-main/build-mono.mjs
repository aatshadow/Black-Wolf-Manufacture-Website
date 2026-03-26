import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const FULLPAGE_DIR = resolve('./fullpage');
const OUTPUT = resolve('./Blackwolf_Monochrome.html');

const projects = [
  {
    id: 'detras', name: 'Detrás de Cámara', subtitle: 'Business Automation Platform',
    category: 'CLIENT PLATFORM', number: '01',
    description: 'End-to-end company operations platform with real-time sales intelligence, automated reporting, and multi-tenant architecture serving production companies.',
    results: ['3 Active Deployments', '€300k+ Revenue Tracked', '7 Team Members Managed'],
    type: 'video', videoSrc: 'videos/detras.mov',
    screens: []
  },
  {
    id: 'fba', name: 'FBA Academy Pro', subtitle: 'Lead Generation Funnel',
    category: 'LEAD GENERATION', number: '02',
    description: 'High-conversion VSL landing page engineered for Amazon FBA education. Video-first engagement with social proof architecture driving qualified leads at scale.',
    results: ['65 Stores Launched', '€300k Monthly Revenue', '5,000+ Students Enrolled'],
    type: 'scroll',
    screens: ['fba_full_1.png']
  },
  {
    id: 'taskflow', name: 'TaskFlow', subtitle: 'AI-Powered Task Management',
    category: 'PROPRIETARY PRODUCT', number: '03',
    description: 'Intelligent task management system with Discord AI agent integration, zero-friction capture, calendar synchronization, and role-based team visibility.',
    results: ['AI-Driven Task Capture', 'Multi-View Dashboard', 'Real-Time Team Sync'],
    type: 'slides',
    screens: ['taskflow_tareas.png', 'taskflow_dashboard.png', 'taskflow_calendario.png', 'taskflow_gestion.png']
  },
  {
    id: 'soc', name: 'Blackwolf SOC', subtitle: 'Security Operations Center',
    category: 'SECURITY DIVISION', number: '04',
    description: 'Enterprise-grade security operations center with SIGMA rule detection, UEBA behavioral analytics, and AI-powered threat response across distributed sensor networks.',
    results: ['154,000+ Threats Analyzed', '11 Active Sensors', 'Real-Time Detection Engine'],
    type: 'video', videoSrc: 'videos/blackwolfsec.mov',
    screens: []
  },
  {
    id: 'gol', name: 'Game of Life', subtitle: 'Gamified Life Operating System',
    category: 'PROPRIETARY SAAS', number: '05',
    description: 'Full life management OS with HP/XP/Level mechanics applied to health, finance, and productivity. Privacy-first architecture with complete data sovereignty.',
    results: ['Complete Life OS', 'Gamification Engine', 'Zero Data Leakage'],
    type: 'video', videoSrc: 'videos/gol.mov',
    screens: ['gol_landing_full.png']
  },
  {
    id: 'website', name: 'blackwolfsec.io', subtitle: 'Corporate Website',
    category: 'BRAND IDENTITY', number: '06',
    description: 'Premium corporate presence for a technology holding company. Three-division architecture showcasing Development, Security, and RevOps capabilities to enterprise clients.',
    results: ['3 Division Showcase', 'Enterprise Positioning', 'Multilingual (EN/ES/BG)'],
    type: 'scroll',
    screens: ['website_home_full.png']
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(FULLPAGE_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function main() {
  console.log('📦 Loading assets...');
  for (const p of projects) {
    p.screenData = [];
    for (const s of p.screens) {
      try {
        const b64 = await imageToBase64(s);
        const buf = await readFile(join(FULLPAGE_DIR, s));
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        p.screenData.push({ src: b64, w, h });
        console.log(`  ✅ ${s} (${w}x${h})`);
      } catch (e) { console.log(`  ⚠️ ${s}: ${e.message}`); }
    }
  }

  const PJ = JSON.stringify(projects.map(p => ({
    id: p.id, name: p.name, subtitle: p.subtitle, category: p.category,
    number: p.number, description: p.description, results: p.results,
    type: p.type, videoSrc: p.videoSrc || null, screenData: p.screenData
  })));

  console.log('🔨 Building monochrome showcase...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLACKWOLF — Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root {
  --black: #000000;
  --white: #FFFFFF;
  --gray-900: #0a0a0a;
  --gray-800: #1a1a1a;
  --gray-700: #333333;
  --gray-600: #444444;
  --gray-500: #666666;
  --gray-400: #888888;
  --gray-300: #aaaaaa;
  --gray-200: #cccccc;
  --gray-100: #F5F5F5;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
::selection { background: rgba(255,255,255,.15); }

body {
  background: var(--gray-900);
  color: var(--white);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

/* ══════════════════════════════════════
   BACKGROUND
   ══════════════════════════════════════ */
.bg-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 60px 60px;
}
.bg-vignette {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,.8) 100%);
}
.bg-noise {
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* Ambient light */
.ambient {
  position: fixed; z-index: 0; pointer-events: none;
  border-radius: 50%; filter: blur(150px);
  transition: opacity 2s ease;
}
.ambient-1 {
  width: 50vw; height: 50vw; top: -20vw; right: -10vw;
  background: radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%);
}
.ambient-2 {
  width: 35vw; height: 35vw; bottom: -10vw; left: -5vw;
  background: radial-gradient(circle, rgba(255,255,255,.025) 0%, transparent 70%);
}

/* Particles */
#particles { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
.particle {
  position: absolute;
  width: 1.5px; height: 1.5px;
  background: rgba(255,255,255,.25);
  border-radius: 50%;
  animation: pFloat var(--d) ease-in-out infinite var(--dl);
}
@keyframes pFloat {
  0%, 100% { opacity: .1; transform: translateY(0) scale(1); }
  50% { opacity: .5; transform: translateY(-8px) scale(1.5); }
}

/* ══════════════════════════════════════
   HEADER
   ══════════════════════════════════════ */
header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px 48px;
}
.brand { display: flex; align-items: center; gap: 14px; }
.brand-mark {
  width: 40px; height: 40px;
  border: 2px solid var(--white);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 18px; color: var(--white);
  letter-spacing: -.02em;
}
.brand-text { font-size: 14px; font-weight: 700; letter-spacing: .22em; color: var(--white); }
.brand-sub { font-size: 8px; color: var(--gray-500); letter-spacing: .3em; margin-top: 2px; }

.header-right { display: flex; align-items: center; gap: 28px; }
.proj-counter {
  font-size: 32px; font-weight: 200; color: var(--gray-700);
  letter-spacing: -.02em; line-height: 1;
  font-variant-numeric: tabular-nums;
}
.proj-counter b { color: var(--white); font-weight: 600; }

/* ══════════════════════════════════════
   LAYOUT
   ══════════════════════════════════════ */
.stage {
  position: relative; z-index: 10;
  width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  gap: clamp(40px, 5vw, 100px);
  padding: 0 clamp(32px, 5vw, 80px);
}

/* ══════════════════════════════════════
   INFO PANEL
   ══════════════════════════════════════ */
.info {
  flex: 0 0 clamp(280px, 26vw, 420px);
  transition: all .7s cubic-bezier(.16,1,.3,1);
}
.info.out { opacity: 0; transform: translateY(30px); }

.info-num {
  font-size: 64px; font-weight: 900; line-height: 1;
  color: var(--gray-800);
  letter-spacing: -.04em;
  margin-bottom: 4px;
  transition: color .8s ease;
}

.info-cat {
  font-size: 10px; font-weight: 600; letter-spacing: .4em;
  color: var(--gray-500);
  margin-bottom: 20px;
  text-transform: uppercase;
}

.info-title {
  font-size: clamp(28px, 3.4vw, 50px);
  font-weight: 800;
  line-height: 1.06;
  letter-spacing: -.03em;
  margin-bottom: 6px;
  color: var(--white);
}

.info-sub {
  font-size: clamp(14px, 1.3vw, 18px);
  color: var(--gray-500);
  font-weight: 400;
  margin-bottom: 24px;
}

.info-desc {
  font-size: 13px; line-height: 1.75;
  color: var(--gray-500);
  margin-bottom: 28px;
  max-width: 380px;
}

.info-divider {
  width: 32px; height: 1px;
  background: var(--gray-700);
  margin-bottom: 20px;
}

.info-results { display: flex; flex-direction: column; gap: 8px; margin-bottom: 36px; }
.info-result {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; color: var(--gray-400); font-weight: 500;
}
.info-result::before {
  content: '';
  width: 4px; height: 4px;
  background: var(--gray-500);
  border-radius: 1px;
  flex-shrink: 0;
}

/* Page pips */
.pips { display: flex; gap: 3px; margin-bottom: 24px; }
.pip {
  width: 16px; height: 2px; border-radius: 1px;
  background: var(--gray-800);
  transition: all .4s ease;
}
.pip.active { background: var(--white); width: 28px; }

/* Navigation dots */
.nav { display: flex; gap: 8px; }
.nav-dot {
  width: 8px; height: 8px; border-radius: 50%;
  border: 1.5px solid var(--gray-700);
  background: transparent;
  cursor: pointer; padding: 0;
  transition: all .4s ease;
  position: relative;
}
.nav-dot.active {
  border-color: var(--white);
  background: var(--white);
}
.nav-dot:hover:not(.active) { border-color: var(--gray-400); }

/* ══════════════════════════════════════
   LAPTOP MOCKUP
   ══════════════════════════════════════ */
.laptop-container {
  flex: 0 1 auto;
  max-width: clamp(500px, 52vw, 880px);
  width: 100%;
  perspective: 1800px;
}

.laptop {
  transform: rotateX(2deg) rotateY(-3deg);
  transform-style: preserve-3d;
  animation: laptopFloat 8s ease-in-out infinite;
}
@keyframes laptopFloat {
  0%, 100% { transform: rotateX(2deg) rotateY(-3deg) translateY(0); }
  50% { transform: rotateX(2deg) rotateY(-3deg) translateY(-6px); }
}

/* Lid/Screen */
.laptop-lid {
  background: linear-gradient(180deg, #3a3a3a 0%, #252525 2%, #1c1c1c 50%, #111 100%);
  border-radius: clamp(10px, 1.2vw, 16px) clamp(10px, 1.2vw, 16px) 0 0;
  padding: clamp(8px, .8vw, 13px);
  padding-top: clamp(16px, 1.5vw, 24px);
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}

.laptop-cam {
  position: absolute;
  top: clamp(5px, .5vw, 9px);
  left: 50%; transform: translateX(-50%);
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #0d0d14;
  box-shadow: 0 0 0 2px #1a1a1a, inset 0 0 2px rgba(50,50,100,.4);
}

.laptop-screen {
  background: #000;
  border-radius: clamp(3px, .4vw, 6px);
  overflow: hidden;
  aspect-ratio: 16 / 10;
  position: relative;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.03);
}

/* Screen content layers */
.scr-content {
  position: absolute; top: 0; left: 0; width: 100%;
  will-change: transform;
  transition: opacity .5s ease;
}
.scr-content.hidden { opacity: 0; }
.scr-content img { width: 100%; display: block; }

.scr-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: opacity .5s ease;
}
.scr-video.hidden { opacity: 0; }

/* Screen effects */
.scr-glare {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
  background: linear-gradient(
    125deg,
    rgba(255,255,255,.035) 0%,
    transparent 30%,
    transparent 70%,
    rgba(255,255,255,.01) 100%
  );
}
.scr-edge {
  position: absolute; inset: 0; z-index: 4; pointer-events: none;
  box-shadow: inset 0 0 30px rgba(0,0,0,.3);
}

/* Base */
.laptop-base-bar {
  height: clamp(8px, .8vw, 13px);
  background: linear-gradient(180deg, #444 0%, #333 30%, #252525 100%);
  border-radius: 0 0 2px 2px;
  position: relative;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
}
.laptop-hinge {
  position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  width: clamp(80px, 10vw, 140px);
  height: clamp(3px, .3vw, 5px);
  background: linear-gradient(180deg, #555, #3a3a3a);
  border-radius: 0 0 4px 4px;
}

/* Keyboard area */
.laptop-keyboard {
  height: clamp(12px, 1.2vw, 20px);
  background: linear-gradient(180deg, #2a2a2a 0%, #222 40%, #1a1a1a 100%);
  border-radius: 0 0 clamp(8px, 1vw, 14px) clamp(8px, 1vw, 14px);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
}
/* Trackpad indication */
.laptop-trackpad {
  position: absolute;
  bottom: 2px; left: 50%; transform: translateX(-50%);
  width: clamp(40px, 5vw, 70px);
  height: clamp(4px, .4vw, 8px);
  border-radius: 2px;
  border: 1px solid rgba(255,255,255,.04);
  background: rgba(255,255,255,.01);
}

/* Shadow */
.laptop-shadow {
  width: 85%;
  height: clamp(20px, 3vw, 45px);
  margin: clamp(5px,.5vw,10px) auto 0;
  background: radial-gradient(ellipse, rgba(255,255,255,.025) 0%, transparent 70%);
  filter: blur(15px);
}

/* ══════════════════════════════════════
   FOOTER
   ══════════════════════════════════════ */
footer {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
  padding: 20px 48px;
  display: flex; justify-content: space-between; align-items: center;
}
.foot-tag {
  font-size: 9px; letter-spacing: .4em;
  color: var(--gray-700); font-weight: 500;
}
.foot-keys {
  font-size: 11px; color: rgba(255,255,255,.1);
  display: flex; gap: 14px;
}
.foot-keys kbd {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 17px; padding: 0 5px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 3px;
  font-size: 9px; font-family: inherit;
  color: rgba(255,255,255,.2);
  margin: 0 2px;
}

@media (max-width: 800px) {
  .stage { flex-direction: column; gap: 20px; padding-top: 90px; }
  .info { flex: none; text-align: center; }
  .info-results { align-items: center; }
  .pips, .nav { justify-content: center; }
  .laptop-container { max-width: 95vw; }
  .foot-keys { display: none; }
  .info-num { font-size: 40px; }
}
</style>
</head>
<body>

<div class="bg-grid"></div>
<div class="bg-vignette"></div>
<div class="bg-noise"></div>
<div class="ambient ambient-1"></div>
<div class="ambient ambient-2"></div>
<div id="particles"></div>

<header>
  <div class="brand">
    <div class="brand-mark">B</div>
    <div>
      <div class="brand-text">BLACKWOLF</div>
      <div class="brand-sub">TECHNOLOGY HOLDING</div>
    </div>
  </div>
  <div class="header-right">
    <div class="proj-counter"><b id="cN">01</b><span> / 06</span></div>
  </div>
</header>

<div class="stage">
  <div class="info" id="info">
    <div class="info-num" id="num">01</div>
    <div class="info-cat" id="cat"></div>
    <h1 class="info-title" id="ttl"></h1>
    <p class="info-sub" id="sub"></p>
    <p class="info-desc" id="dsc"></p>
    <div class="info-divider"></div>
    <div class="info-results" id="res"></div>
    <div class="pips" id="pips"></div>
    <div class="nav" id="nav"></div>
  </div>

  <div class="laptop-container">
    <div class="laptop">
      <div class="laptop-lid">
        <div class="laptop-cam"></div>
        <div class="laptop-screen" id="scr">
          <div class="scr-content hidden" id="scrC"></div>
          <video class="scr-video hidden" id="scrV" muted playsinline></video>
          <div class="scr-glare"></div>
          <div class="scr-edge"></div>
        </div>
      </div>
      <div class="laptop-base-bar"><div class="laptop-hinge"></div></div>
      <div class="laptop-keyboard"><div class="laptop-trackpad"></div></div>
      <div class="laptop-shadow"></div>
    </div>
  </div>
</div>

<footer>
  <div class="foot-tag">PROTECT EXCELLENCE &middot; EMPOWER INNOVATION</div>
  <div class="foot-keys">
    <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate</span>
    <span><kbd>Space</kbd> Pause</span>
  </div>
</footer>

<script>
const P = ${PJ};
let cur = 0, pg = 0, paused = false, busy = false, sAnim = null, T = [];
const $ = id => document.getElementById(id);

function init() {
  // Particles
  const pc = $('particles');
  for (let i = 0; i < 30; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.cssText =
      'left:'+(3+Math.random()*94)+'%;top:'+(3+Math.random()*94)+
      '%;--d:'+(3+Math.random()*5)+'s;--dl:'+(Math.random()*4)+'s;';
    pc.appendChild(d);
  }

  buildNav();
  show(0, false);

  document.addEventListener('keydown', e => {
    if (e.key==='ArrowRight') go((cur+1)%P.length);
    else if (e.key==='ArrowLeft') go((cur-1+P.length)%P.length);
    else if (e.key===' ') { e.preventDefault(); paused=!paused; if(!paused) resume(); }
  });

  $('scrV').addEventListener('ended', () => {
    const p = P[cur];
    if (p.screenData && p.screenData.length > 0) switchToScroll(p);
    else nextProj();
  });
}

function buildNav() {
  $('nav').innerHTML = P.map((_,i) =>
    '<button class="nav-dot'+(i===0?' active':'')+'" data-i="'+i+'"></button>'
  ).join('');
  $('nav').querySelectorAll('.nav-dot').forEach(d =>
    d.addEventListener('click', e => { e.stopPropagation(); go(+d.dataset.i); })
  );
}

function go(i) {
  if ((i===cur && pg===0) || busy) return;
  clr(); pg = 0; show(i, true);
}

function show(i, anim) {
  const p = P[i]; cur = i; pg = 0;

  if (anim) {
    busy = true;
    $('info').classList.add('out');
    hideScr();
    wait(450).then(() => {
      setInfo(p);
      showScr(p).then(() => {
        $('info').classList.remove('out');
        wait(200).then(() => { busy = false; });
      });
    });
  } else {
    setInfo(p);
    showScr(p);
  }

  $('cN').textContent = p.number;
  $('nav').querySelectorAll('.nav-dot').forEach((d,idx) =>
    d.classList.toggle('active', idx===i)
  );
}

function setInfo(p) {
  $('num').textContent = p.number;
  $('cat').textContent = p.category;
  $('ttl').textContent = p.name;
  $('sub').textContent = p.subtitle;
  $('dsc').textContent = p.description;
  $('res').innerHTML = p.results.map(r => '<div class="info-result">'+r+'</div>').join('');

  let n = 1;
  if (p.type==='video' && p.screenData.length) n = 2;
  else if (p.type==='slides') n = p.screenData.length;
  $('pips').innerHTML = Array.from({length:n}, (_,i) =>
    '<div class="pip'+(i===0?' active':'')+'"></div>'
  ).join('');
}

function updPips(idx) {
  $('pips').querySelectorAll('.pip').forEach((p,i) => p.classList.toggle('active', i===idx));
}

// ═══ SCREEN ═══

function hideScr() {
  $('scrC').classList.add('hidden');
  $('scrV').classList.add('hidden');
  $('scrV').pause();
}

async function showScr(p) {
  hideScr();
  if (p.type==='video') {
    const v = $('scrV');
    v.src = p.videoSrc;
    v.currentTime = 0;
    v.classList.remove('hidden');
    try { await v.play(); } catch(e) {}
  } else if (p.type==='scroll') {
    if (p.screenData[0]) {
      await loadImg(p.screenData[0].src);
      $('scrC').classList.remove('hidden');
      doScroll(p.screenData[0]);
    }
  } else if (p.type==='slides') {
    pg = 0;
    if (p.screenData[0]) {
      await loadImg(p.screenData[0].src);
      $('scrC').style.transform = 'translateY(0)';
      $('scrC').classList.remove('hidden');
      runSlides(p);
    }
  }
}

function loadImg(src) {
  return new Promise(res => {
    const c = $('scrC');
    const img = new Image();
    img.onload = () => { c.innerHTML=''; c.appendChild(img); img.style.width='100%'; img.style.display='block'; c.style.transform='translateY(0)'; res(); };
    img.onerror = res;
    img.src = src; img.draggable = false;
  });
}

function doScroll(data) {
  const scrEl = $('scr'), c = $('scrC'), imgEl = c.querySelector('img');
  if (!imgEl) { sched(3500); return; }

  const run = () => {
    const sH = scrEl.offsetHeight, iH = imgEl.offsetHeight;
    const dist = Math.max(0, iH - sH);
    if (dist < 20) { sched(4000); return; }

    const dur = Math.min(Math.max(dist*4, 4000), 14000);
    T.push(setTimeout(() => {
      if (paused) return;
      const t0 = performance.now();
      function anim(now) {
        if (paused) { sAnim = requestAnimationFrame(anim); return; }
        const p = Math.min((now-t0)/dur, 1);
        const e = p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
        c.style.transform = 'translateY(-'+(e*dist)+'px)';
        if (p<1) sAnim = requestAnimationFrame(anim);
        else T.push(setTimeout(() => { if(!paused) nextProj(); }, 1800));
      }
      sAnim = requestAnimationFrame(anim);
    }, 1800));
  };

  imgEl.complete ? run() : (imgEl.onload = run);
}

function runSlides(p) {
  const hold = 1800;
  const next = () => {
    pg++;
    if (pg >= p.screenData.length) { nextProj(); return; }
    updPips(pg);
    $('scrC').classList.add('hidden');
    T.push(setTimeout(() => {
      loadImg(p.screenData[pg].src).then(() => {
        $('scrC').style.transform = 'translateY(0)';
        $('scrC').classList.remove('hidden');
        T.push(setTimeout(() => { if(!paused) next(); }, hold));
      });
    }, 400));
  };
  T.push(setTimeout(() => { if(!paused) next(); }, hold));
}

function switchToScroll(p) {
  updPips(1);
  $('scrV').classList.add('hidden');
  loadImg(p.screenData[0].src).then(() => {
    $('scrC').classList.remove('hidden');
    doScroll(p.screenData[0]);
  });
}

function nextProj() { if(paused) return; clr(); show((cur+1)%P.length, true); }
function sched(ms) { T.push(setTimeout(() => { if(!paused) nextProj(); }, ms)); }
function resume() { const p=P[cur]; if(p.type==='video'){ const v=$('scrV'); if(v.paused) v.play(); } }
function clr() { T.forEach(t=>clearTimeout(t)); T=[]; cancelAnimationFrame(sAnim); $('scrV').pause(); }
function wait(ms) { return new Promise(r => { T.push(setTimeout(r,ms)); }); }

document.addEventListener('DOMContentLoaded', init);
</script>
</body>
</html>`;

  await writeFile(OUTPUT, html, 'utf-8');
  const mb = (Buffer.byteLength(html, 'utf-8') / 1024 / 1024).toFixed(1);
  console.log('\\n✅ ' + OUTPUT);
  console.log('📦 ' + mb + ' MB');
}

main().catch(console.error);
