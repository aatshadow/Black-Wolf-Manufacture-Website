import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';

const FULLPAGE_DIR = resolve('./fullpage');
const OUTPUT = resolve('./Blackwolf_Showcase.html');
const LOGO_PATH = resolve('/Users/Zlatismac/Desktop/blackwolf/branding/hf_20260208_210116_fc78802e-7445-40a0-b0ef-076e24267ab6.png');
const WORDMARK_PATH = resolve('/Users/Zlatismac/Desktop/blackwolf/branding/wordmark-inverted.png');

const projects = [
  {
    id: 'detras', name: 'Detrás de Cámara', subtitle: 'Full Company Automation Platform',
    category: 'BLACKWOLF Development', color: '#F97316', colorRgb: '249,115,22',
    description: 'End-to-end company operations platform with real-time sales intelligence, automated reporting, and multi-tenant architecture serving production companies.',
    stats: ['3 white-label deployments', 'Full CRM, sales tracking & leaderboards', 'AI-generated daily summaries'],
    type: 'video', videoSrc: 'videos/detras.mov',
    division: 'development'
  },
  {
    id: 'taskflow', name: 'TaskFlow', subtitle: 'AI-Powered Task Management',
    category: 'BLACKWOLF Development', color: '#8B5CF6', colorRgb: '139,92,246',
    description: 'Intelligent task management system with Discord AI agent integration, zero-friction capture, calendar synchronization, and role-based team visibility.',
    stats: ['200% team efficiency increase', 'AI task prioritization', 'Discord integration'],
    type: 'slides', screens: ['taskflow_tareas.png', 'taskflow_dashboard.png', 'taskflow_calendario.png', 'taskflow_gestion.png'],
    division: 'development'
  },
  {
    id: 'game-of-life', name: 'Game of Life', subtitle: 'Gamified Life Operating System',
    category: 'BLACKWOLF Development', color: '#3B82F6', colorRgb: '59,130,246',
    description: 'Full life management OS with HP/XP/Level mechanics applied to health, finance, and productivity. Privacy-first architecture with complete data sovereignty.',
    stats: ['100+ lives transformed', 'Gamified personal development OS'],
    type: 'video', videoSrc: 'videos/gol.mov',
    landingScreens: ['gol_landing_full.png'],
    division: 'development'
  },
  {
    id: 'blackwolf-soc', name: 'Blackwolf SOC', subtitle: 'Security Operations Center',
    category: 'BLACKWOLF Security', color: '#EF4444', colorRgb: '239,68,68',
    description: 'Enterprise-grade security operations center with SIGMA rule detection, UEBA behavioral analytics, and AI-powered threat response across distributed sensor networks.',
    stats: ['100,000+ threats tracked', '200+ security alerts processed', '3,982 AI decisions in 7 days', '$7.15/mo for 1.19M tokens'],
    type: 'video', videoSrc: 'videos/blackwolfsec.mov',
    division: 'cybersecurity'
  },
  {
    id: 'fba', name: 'FBA Academy Pro', subtitle: 'High-Ticket VSL Funnel',
    category: 'BLACKWOLF Growth', color: '#F59E0B', colorRgb: '245,158,11',
    description: 'High-conversion VSL landing page engineered for Amazon FBA education. Video-first engagement with social proof architecture driving qualified leads at scale.',
    stats: ['Optimized lead capture process', 'Full pipeline visibility'],
    type: 'scroll', screens: ['fba_full_1.png'],
    division: 'growth'
  },
  {
    id: 'blackwolf-website', name: 'Blackwolf Website', subtitle: 'Corporate Website',
    category: 'BLACKWOLF Growth', color: '#FFFFFF', colorRgb: '255,255,255',
    description: 'Premium corporate presence for a technology holding company. Three-division architecture showcasing Development, Security, and RevOps capabilities to enterprise clients.',
    stats: ['+3M cash collected for clients', '+12 enterprise clients', '+10 applications deployed', '+15 companies protected'],
    type: 'scroll', screens: ['website_home_full.png'],
    division: 'growth'
  }
];

async function imageToBase64(filename) {
  const buf = await readFile(join(FULLPAGE_DIR, filename));
  return `data:image/png;base64,${buf.toString('base64')}`;
}

async function getImageDimensions(filename) {
  const buf = await readFile(join(FULLPAGE_DIR, filename));
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function main() {
  console.log('📦 Loading assets...');

  // Load brand assets
  const logoBuf = await readFile(LOGO_PATH);
  const logoB64 = `data:image/png;base64,${logoBuf.toString('base64')}`;
  console.log('  ✅ Wolf logo');
  const wordmarkBuf = await readFile(WORDMARK_PATH);
  const wordmarkB64 = `data:image/png;base64,${wordmarkBuf.toString('base64')}`;
  console.log('  ✅ Wordmark');

  for (const p of projects) {
    p.screenData = [];
    const allScreens = p.screens || p.landingScreens || [];
    for (const s of allScreens) {
      try {
        const b64 = await imageToBase64(s);
        const dims = await getImageDimensions(s);
        p.screenData.push({ src: b64, w: dims.width, h: dims.height });
        console.log(`  ✅ ${s} (${dims.width}x${dims.height})`);
      } catch (e) {
        console.log(`  ⚠️ ${s}: ${e.message}`);
      }
    }
  }

  const projectsJSON = JSON.stringify(projects.map(p => ({
    id: p.id, name: p.name, subtitle: p.subtitle, category: p.category,
    color: p.color, colorRgb: p.colorRgb, description: p.description,
    stats: p.stats, type: p.type,
    videoSrc: p.videoSrc || null,
    screenData: p.screenData,
    division: p.division
  })));

  console.log('🔨 Building showcase...');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BLACKWOLF — Portfolio</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root { --accent: #F97316; --accent-rgb: 249,115,22; --bg: #050505; }
*,*::before,*::after { margin:0; padding:0; box-sizing:border-box; }
html { -webkit-font-smoothing: antialiased; }
body { background:var(--bg); color:#fff; font-family:'Inter',-apple-system,sans-serif; overflow:hidden; width:100vw; height:100vh; cursor:none; }

/* ═══ CUSTOM CURSOR ═══ */
*, *::before, *::after { cursor:none !important; }
.cursor-dot { position:fixed; top:0; left:0; width:8px; height:8px; background:#fff; border-radius:50%; pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition:transform .12s ease, background .15s ease; mix-blend-mode:difference; }
.cursor-dot.click { transform:translate(-50%,-50%) scale(.4); }
.cursor-ring { position:fixed; top:0; left:0; width:36px; height:36px; border:1.5px solid rgba(255,255,255,.25); border-radius:50%; pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:width .25s cubic-bezier(.16,1,.3,1), height .25s cubic-bezier(.16,1,.3,1), border-color .25s ease; }
.cursor-ring.hover { width:52px; height:52px; border-color:rgba(255,255,255,.5); }
.cursor-ring.click { width:28px; height:28px; transition:width .1s ease, height .1s ease; }
@media(max-width:768px) { .cursor-dot, .cursor-ring { display:none; } *, *::before, *::after { cursor:auto !important; } body { cursor:auto; } }

/* ═══ BG ═══ */
.bg { position:fixed; inset:0; z-index:0; pointer-events:none; }
.bg-grid {
  background-image: linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
  background-size: 60px 60px;
}
.bg-vig { background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,.7) 100%); }
.glow { position:fixed; pointer-events:none; border-radius:50%; filter:blur(120px); transition: background 2s cubic-bezier(.16,1,.3,1); }
.glow-1 { width:55vw; height:55vw; top:-18vw; left:-12vw; background: radial-gradient(circle, rgba(var(--accent-rgb),.1) 0%, transparent 70%); }
.glow-2 { width:40vw; height:40vw; bottom:-12vw; right:-8vw; background: radial-gradient(circle, rgba(var(--accent-rgb),.06) 0%, transparent 70%); }

.particle { position:fixed; pointer-events:none; width:2px; height:2px; background:rgba(255,255,255,.3); border-radius:50%; animation:pulse var(--d) ease-in-out infinite var(--dl); }
@keyframes pulse { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.6;transform:scale(2)} }

/* ═══ INTRO SCREEN ═══ */
.intro { position:fixed; inset:0; z-index:200; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1); }
.intro.hidden { opacity:0; pointer-events:none; transform:scale(1.05); }
.intro-inner { display:flex; flex-direction:column; align-items:center; transition:transform .1s ease-out; }

/* Logo with glow halo */
.intro-logo-wrap { position:relative; margin-bottom:28px; opacity:0; transform:scale(.8); animation:logoReveal 1.2s cubic-bezier(.16,1,.3,1) .3s forwards; }
.intro-logo-halo {
  position:absolute; inset:-40px; border-radius:50%;
  background:radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 60%);
  animation:haloBreath 4s ease-in-out infinite;
}
.intro-logo-ring {
  position:absolute; inset:-20px; border-radius:50%;
  border:1px solid rgba(255,255,255,.04);
  animation:ringPulse 4s ease-in-out infinite;
}
.intro-icon { width:90px; height:90px; border-radius:20px; overflow:hidden; position:relative; z-index:1; }
.intro-icon img { width:100%; height:100%; object-fit:cover; }
@keyframes logoReveal { to { opacity:1; transform:scale(1); } }
@keyframes haloBreath { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:1} }
@keyframes ringPulse { 0%,100%{transform:scale(1);opacity:.3} 50%{transform:scale(1.08);opacity:.6} }

/* Wordmark with clip reveal */
.intro-wordmark { height:clamp(30px,4vw,52px); overflow:hidden; opacity:0; animation:wordmarkIn 1s cubic-bezier(.16,1,.3,1) .8s forwards; }
.intro-wordmark img { height:100%; width:auto; }
@keyframes wordmarkIn { from{opacity:0;clip-path:inset(0 100% 0 0)} to{opacity:1;clip-path:inset(0 0% 0 0)} }

/* Sweep line */
.intro-sweep { width:0; height:1px; margin:20px 0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); animation:sweepLine 1s cubic-bezier(.16,1,.3,1) 1.2s forwards; }
@keyframes sweepLine { to{width:clamp(200px,30vw,400px)} }

/* Subtitle */
.intro-sub { font-size:11px; letter-spacing:.5em; color:rgba(255,255,255,.2); margin-bottom:56px; opacity:0; transform:translateY(10px); animation:introIn .6s cubic-bezier(.16,1,.3,1) 1.5s forwards; }

/* Cards */
.intro-cards { display:flex; gap:28px; }

.intro-card {
  width:clamp(210px,18vw,270px); padding:32px 28px 36px; border-radius:16px;
  background:rgba(255,255,255,.015);
  cursor:pointer; transition:all .5s cubic-bezier(.16,1,.3,1);
  opacity:0; transform:translateY(40px);
  position:relative; overflow:hidden;
}
/* Animated gradient border */
.intro-card::before {
  content:''; position:absolute; inset:-1px; border-radius:17px; z-index:-1;
  background:conic-gradient(from var(--border-angle,0deg), transparent 40%, var(--card-color,rgba(255,255,255,.15)) 50%, transparent 60%);
  animation:borderSpin 4s linear infinite;
  opacity:0; transition:opacity .5s ease;
}
.intro-card::after {
  content:''; position:absolute; inset:0; border-radius:16px; z-index:-1;
  background:var(--bg);
}
.intro-card:hover::before { opacity:1; }
.intro-card:hover { transform:translateY(-6px) scale(1.02); }

@property --border-angle { syntax:'<angle>'; initial-value:0deg; inherits:false; }
@keyframes borderSpin { to{--border-angle:360deg} }

/* Card inner glow on hover */
.intro-card-glow {
  position:absolute; top:-50%; left:-50%; width:200%; height:200%;
  background:radial-gradient(circle at center, var(--card-color,rgba(255,255,255,.03)) 0%, transparent 50%);
  opacity:0; transition:opacity .6s ease; pointer-events:none; z-index:0;
}
.intro-card:hover .intro-card-glow { opacity:.15; }

.intro-card:nth-child(1) { animation:cardIn .8s cubic-bezier(.16,1,.3,1) 1.7s forwards; }
.intro-card:nth-child(2) { animation:cardIn .8s cubic-bezier(.16,1,.3,1) 1.9s forwards; }
.intro-card:nth-child(3) { animation:cardIn .8s cubic-bezier(.16,1,.3,1) 2.1s forwards; }
@keyframes cardIn { to { opacity:1; transform:translateY(0); } }

.intro-card-num { font-size:52px; font-weight:900; background:linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.01) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; line-height:1; margin-bottom:14px; font-variant-numeric:tabular-nums; position:relative; z-index:1; }
.intro-card-name { font-size:17px; font-weight:700; letter-spacing:.08em; margin-bottom:8px; position:relative; z-index:1; }
.intro-card-desc { font-size:12px; color:rgba(255,255,255,.2); line-height:1.65; margin-bottom:22px; position:relative; z-index:1; }
.intro-card-count { font-size:10px; letter-spacing:.3em; color:rgba(255,255,255,.1); position:relative; z-index:1; transition:color .4s ease; }
.intro-card:hover .intro-card-count { color:rgba(255,255,255,.25); }
.intro-card-arrow { font-size:20px; color:rgba(255,255,255,.06); transition:all .5s cubic-bezier(.16,1,.3,1); position:absolute; bottom:32px; right:28px; z-index:1; }
.intro-card:hover .intro-card-arrow { color:rgba(255,255,255,.5); transform:translateX(6px); }

@keyframes introIn { to { opacity:1; transform:translateY(0); } }

.intro-footer { position:absolute; bottom:32px; font-size:10px; letter-spacing:.4em; color:rgba(255,255,255,.06); opacity:0; animation:introIn .5s ease 2.4s forwards; }

/* ═══ HEADER ═══ */
header { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:22px 44px; opacity:0; transition:opacity .6s ease; }
header.visible { opacity:1; }
.brand { display:flex; align-items:center; gap:12px; }
.brand-icon { width:38px; height:38px; border-radius:10px; overflow:hidden; box-shadow:0 4px 20px rgba(255,255,255,.08); }
.brand-icon img { width:100%; height:100%; object-fit:cover; }
.brand-name { font-size:15px; font-weight:700; letter-spacing:.2em; }
.brand-sub { font-size:8px; color:rgba(255,255,255,.2); letter-spacing:.3em; margin-top:1px; }

/* ═══ NAV ═══ */
.nav-wrap { display:flex; align-items:center; gap:16px; }
.div-tabs { display:flex; gap:6px; }
.div-tab { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:100px; padding:7px 18px; font-size:11px; font-weight:600; letter-spacing:.12em; color:rgba(255,255,255,.3); cursor:pointer; font-family:inherit; transition:all .4s cubic-bezier(.16,1,.3,1); }
.div-tab:hover { background:rgba(255,255,255,.07); color:rgba(255,255,255,.5); }
.div-tab.active { background:rgba(255,255,255,.08); color:#fff; border-color:rgba(255,255,255,.12); }
.back-btn { background:none; border:1px solid rgba(255,255,255,.08); border-radius:100px; padding:7px 16px; font-size:11px; font-weight:500; letter-spacing:.08em; color:rgba(255,255,255,.3); cursor:pointer; font-family:inherit; transition:all .3s ease; display:flex; align-items:center; gap:6px; }
.back-btn:hover { color:rgba(255,255,255,.6); border-color:rgba(255,255,255,.15); }

/* ═══ STAGE ═══ */
.stage { position:relative; z-index:10; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; gap:clamp(36px,4.5vw,90px); padding:0 clamp(28px,4vw,70px); opacity:0; transition:opacity .6s ease; }
.stage.visible { opacity:1; }

/* ═══ INFO ═══ */
.info { flex:0 0 clamp(260px,24vw,380px); transition:all .65s cubic-bezier(.16,1,.3,1); }
.info.out { opacity:0; transform:translateY(25px); }
.info-cat { font-size:11px; font-weight:700; letter-spacing:.35em; color:var(--accent); margin-bottom:14px; transition:color 1.2s ease; }
.info-title { font-size:clamp(26px,3.2vw,44px); font-weight:900; line-height:1.08; margin-bottom:8px; letter-spacing:-.03em; }
.info-sub { font-size:clamp(15px,1.4vw,20px); color:rgba(255,255,255,.3); margin-bottom:18px; }
.info-desc { font-size:13px; color:rgba(255,255,255,.22); line-height:1.7; margin-bottom:24px; max-width:350px; }
.info-stats { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:32px; }
.info-stat { padding:7px 14px; border-radius:100px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.015); font-size:11px; color:rgba(255,255,255,.4); font-weight:500; }

.page-ind { display:flex; gap:4px; margin-bottom:20px; }
.pip { width:20px; height:3px; border-radius:2px; background:rgba(255,255,255,.08); transition:all .4s ease; }
.pip.active { background:var(--accent); width:32px; }

.dots { display:flex; gap:6px; }
.dot { height:5px; width:5px; border-radius:100px; background:rgba(255,255,255,.1); border:none; cursor:pointer; padding:0; transition:all .5s cubic-bezier(.16,1,.3,1); position:relative; overflow:hidden; }
.dot.active { width:34px; background:rgba(255,255,255,.12); }
.dot.active::after { content:''; position:absolute; left:0; top:0; bottom:0; background:var(--accent); border-radius:100px; width:0%; }
.dot.filling::after { transition: width linear; }

.counter { font-size:13px; color:rgba(255,255,255,.25); font-variant-numeric:tabular-nums; margin-bottom:6px; }
.counter b { color:#fff; font-size:15px; }

/* ═══ LAPTOP ═══ */
.laptop-wrap { flex:0 1 auto; max-width:clamp(480px,50vw,860px); width:100%; animation:float 7s ease-in-out infinite; filter:drop-shadow(0 35px 70px rgba(0,0,0,.5)); }
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.lid { background:linear-gradient(180deg,#5a5a5a 0%,#3a3a3a 2%,#2a2a2a 50%,#1a1a1a 100%); border-radius:clamp(10px,1.1vw,16px) clamp(10px,1.1vw,16px) 0 0; padding:clamp(8px,.7vw,12px); padding-top:clamp(14px,1.3vw,22px); position:relative; }
.notch { position:absolute; top:0; left:50%; transform:translateX(-50%); width:clamp(55px,6.5vw,90px); height:clamp(11px,1.1vw,20px); background:#131313; border-radius:0 0 clamp(5px,.5vw,9px) clamp(5px,.5vw,9px); }
.notch::after { content:''; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:5px; height:5px; border-radius:50%; background:#0d0d1a; }

.screen { background:#000; border-radius:clamp(3px,.4vw,7px); overflow:hidden; aspect-ratio:16/10; position:relative; }

.screen-content { position:absolute; top:0; left:0; width:100%; will-change:transform; transition:opacity .5s ease; }
.screen-content.hidden { opacity:0; }
.screen-content img { width:100%; display:block; }

.screen-video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; transition:opacity .5s ease; }
.screen-video.hidden { opacity:0; }

.screen::after { content:''; position:absolute; inset:0; z-index:5; pointer-events:none; background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 35%,transparent 65%,rgba(255,255,255,.01) 100%); }
.scanlines { position:absolute; inset:0; z-index:6; pointer-events:none; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.02) 2px,rgba(0,0,0,.02) 4px); }

.base { height:clamp(7px,.7vw,12px); background:linear-gradient(180deg,#484848 0%,#2a2a2a 100%); border-radius:0 0 2px 2px; position:relative; }
.hinge { position:absolute; top:0; left:50%; transform:translateX(-50%); width:clamp(70px,9vw,130px); height:clamp(3px,.25vw,5px); background:#444; border-radius:0 0 4px 4px; }
.lip { position:absolute; bottom:0; left:9%; right:9%; height:clamp(4px,.4vw,7px); background:linear-gradient(180deg,#383838,#262626); border-radius:0 0 6px 6px; }
.shadow { width:75%; height:clamp(18px,2.5vw,40px); margin:0 auto; background:radial-gradient(ellipse,rgba(0,0,0,.35) 0%,transparent 70%); filter:blur(12px); margin-top:-2px; transition:background 1.5s ease; }

/* ═══ FOOTER ═══ */
footer { position:fixed; bottom:0; left:0; right:0; z-index:100; padding:18px 44px; display:flex; justify-content:space-between; align-items:center; opacity:0; transition:opacity .6s ease; }
footer.visible { opacity:1; }
.tagline { font-size:10px; letter-spacing:.35em; color:rgba(255,255,255,.09); font-weight:500; }
.hint { font-size:11px; color:rgba(255,255,255,.12); }
.hint kbd { display:inline-flex; align-items:center; justify-content:center; min-width:20px; height:18px; padding:0 5px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); border-radius:3px; font-size:10px; font-family:inherit; color:rgba(255,255,255,.25); margin:0 2px; }

.type-label { font-size:9px; letter-spacing:.2em; color:rgba(255,255,255,.15); margin-bottom:10px; text-transform:uppercase; }

/* ═══ CINEMATIC INTRO ═══ */
.cinematic { position:fixed; inset:0; z-index:500; background:#000; display:flex; align-items:center; justify-content:center; transition:opacity 1.8s cubic-bezier(.16,1,.3,1); }
.cinematic.done { opacity:0; pointer-events:none; }

/* Film grain overlay */
.cin-grain { position:absolute; inset:0; z-index:1; pointer-events:none; opacity:.035;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size:128px 128px; animation:cinGrain 0.5s steps(4) infinite;
}
@keyframes cinGrain { 0%{transform:translate(0,0)} 25%{transform:translate(-2px,2px)} 50%{transform:translate(2px,-1px)} 75%{transform:translate(-1px,-2px)} 100%{transform:translate(1px,1px)} }

/* Vignette */
.cin-vignette { position:absolute; inset:0; z-index:2; pointer-events:none; background:radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%); }

/* Floating particles */
.cin-particle { position:absolute; pointer-events:none; z-index:1; border-radius:50%; background:rgba(255,255,255,var(--po,.2)); width:var(--ps,2px); height:var(--ps,2px); left:var(--px,50%); bottom:-10px; animation:cinFloat var(--pd,10s) linear var(--pdelay,0s) infinite; }
@keyframes cinFloat { 0%{transform:translate(0,0);opacity:0} 5%{opacity:var(--po,.2)} 85%{opacity:var(--po,.2)} 100%{transform:translate(var(--pdx,0px),-105vh);opacity:0} }

/* Scan line */
.cin-scan { position:absolute; left:0; right:0; height:1px; z-index:4; pointer-events:none; background:linear-gradient(90deg,transparent 5%,rgba(255,255,255,.04) 30%,rgba(255,255,255,.07) 50%,rgba(255,255,255,.04) 70%,transparent 95%); box-shadow:0 0 15px rgba(255,255,255,.02); animation:cinScanMove 7s linear infinite; }
@keyframes cinScanMove { 0%{top:-2px} 100%{top:100%} }

/* Flash overlay */
.cin-flash { position:absolute; inset:0; z-index:20; background:#fff; opacity:0; pointer-events:none; }

/* Ripple ping on scene activation */
.cin-ping { position:absolute; top:50%; left:50%; width:0; height:0; border-radius:50%; border:1px solid rgba(255,255,255,.08); transform:translate(-50%,-50%); pointer-events:none; z-index:2; animation:cinPingGrow 2s cubic-bezier(.16,1,.3,1) forwards; }
@keyframes cinPingGrow { 0%{width:0;height:0;opacity:.5} 100%{width:140vmax;height:140vmax;opacity:0} }

/* Character-by-character reveal */
.cin-char { display:inline-block; opacity:0; transform:translateY(12px) scale(.8); filter:blur(4px); transition:opacity .35s ease, transform .5s cubic-bezier(.16,1,.3,1), filter .5s ease; }
.cin-char.revealed { opacity:1; transform:translateY(0) scale(1); filter:blur(0); }
.cin-char.space { width:.3em; }

/* Text scramble monospace look */
.cin-scramble { font-variant-numeric:tabular-nums; }

.cin-scene { position:absolute; inset:0; z-index:3; display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 1.2s cubic-bezier(.16,1,.3,1); pointer-events:none; padding:0 24px; }
.cin-scene.active { opacity:1; }
.cin-scene.exit { opacity:0; transform:scale(1.03); filter:blur(4px); transition:opacity .8s ease, transform .8s ease, filter .8s ease; }

/* Horizontal sweep line between scenes */
.cin-wipe { position:fixed; top:50%; left:50%; z-index:10; width:0; height:1px; transform:translate(-50%,-50%); background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),rgba(255,255,255,.9),rgba(255,255,255,.6),transparent); pointer-events:none; transition:none; }
.cin-wipe.fire { width:110vw; transition:width .45s cubic-bezier(.16,1,.3,1); }
.cin-wipe.fade { opacity:0; transition:opacity .3s ease .2s; }

/* Skip button — white and prominent */
.cin-skip { position:fixed; bottom:40px; right:44px; z-index:520; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.35); border-radius:100px; padding:11px 30px; font-size:13px; font-weight:600; letter-spacing:.2em; color:rgba(255,255,255,.8); cursor:pointer; font-family:inherit; opacity:0; transition:opacity .8s ease, background .3s ease, border-color .3s ease, transform .3s ease; backdrop-filter:blur(8px); }
.cin-skip.visible { opacity:1; }
.cin-skip:hover { background:rgba(255,255,255,.12); border-color:rgba(255,255,255,.6); color:#fff; transform:scale(1.04); }

/* Progress bar */
.cin-progress { position:fixed; top:0; left:0; height:2px; background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.25),rgba(255,255,255,.4)); z-index:520; width:0; box-shadow:0 0 12px rgba(255,255,255,.15); }

/* Scene counter */
.cin-counter { position:fixed; bottom:44px; left:44px; z-index:510; font-size:12px; font-weight:400; letter-spacing:.3em; color:rgba(255,255,255,.2); font-variant-numeric:tabular-nums; opacity:0; transition:opacity .6s ease; }
.cin-counter.visible { opacity:1; }
.cin-counter b { color:rgba(255,255,255,.6); font-weight:600; }

/* ── Scene 1 — Logo ── */
.cin-logo-wrap { position:relative; margin-bottom:40px; }
.cin-logo-glow { position:absolute; inset:-80px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.08) 0%,transparent 60%); opacity:0; }
.cin-scene.active .cin-logo-glow { animation:cinGlowIn 2.5s ease forwards, cinGlowPulse 4s ease-in-out 2.5s infinite; }
@keyframes cinGlowIn { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }
@keyframes cinGlowPulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.2);opacity:1} }

.cin-logo-ring { position:absolute; inset:-30px; border-radius:50%; border:1px solid rgba(255,255,255,0); z-index:0; }
.cin-scene.active .cin-logo-ring { animation:cinRingExpand 2s cubic-bezier(.16,1,.3,1) .6s forwards, cinRingPulse 4s ease-in-out 2.6s infinite; }
@keyframes cinRingExpand { from{inset:-10px;border-color:rgba(255,255,255,0);opacity:0} to{inset:-35px;border-color:rgba(255,255,255,.08);opacity:1} }
@keyframes cinRingPulse { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.06);opacity:1} }

.cin-logo { width:120px; height:120px; border-radius:26px; overflow:hidden; position:relative; z-index:1; opacity:0; transform:scale(.7) rotate(-3deg); }
.cin-scene.active .cin-logo { animation:cinLogoIn 1.2s cubic-bezier(.16,1,.3,1) .2s forwards; }
@keyframes cinLogoIn { to{opacity:1;transform:scale(1) rotate(0deg)} }
.cin-logo img { width:100%; height:100%; object-fit:cover; }
.cin-logo::after { content:''; position:absolute; inset:0; background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.12) 43%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.12) 57%,transparent 65%); transform:translateX(-180%); }
.cin-scene.active .cin-logo::after { animation:cinShimmer 1.2s cubic-bezier(.16,1,.3,1) 1.2s forwards; }
@keyframes cinShimmer { to{transform:translateX(180%)} }

.cin-wordmark { height:clamp(38px,5.5vw,56px); opacity:0; margin-bottom:30px; overflow:hidden; }
.cin-scene.active .cin-wordmark { animation:cinClipIn 1s cubic-bezier(.16,1,.3,1) .9s forwards; }
@keyframes cinClipIn { from{opacity:0;clip-path:inset(0 100% 0 0)} to{opacity:1;clip-path:inset(0 0% 0 0)} }
.cin-wordmark img { height:100%; width:auto; filter:brightness(0) invert(1); }

.cin-tagline { font-size:clamp(12px,1.4vw,16px); letter-spacing:.5em; color:rgba(255,255,255,.6); font-weight:300; opacity:0; }
.cin-scene.active .cin-tagline { animation:cinFadeUp .8s cubic-bezier(.16,1,.3,1) 1.8s forwards; }

@keyframes cinFadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }

/* ── Scene 2 — Pillars ── */
.cin-pillars { display:flex; flex-direction:column; align-items:center; gap:clamp(44px,6vh,72px); }
.cin-pillar { text-align:center; opacity:0; transform:translateY(35px); }
.cin-pillar-line { width:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent); margin:0 auto 18px; }
.cin-pillar-name { font-size:clamp(28px,5vw,56px); font-weight:800; letter-spacing:.25em; margin-bottom:12px; text-transform:uppercase; }
.cin-pillar-desc { font-size:clamp(14px,1.5vw,18px); color:rgba(255,255,255,.55); font-weight:300; letter-spacing:.08em; }

/* ── Scene 3 — Problem ── */
.cin-problem { display:flex; flex-direction:column; align-items:center; gap:clamp(28px,5vh,48px); max-width:800px; text-align:center; }
.cin-problem-line { opacity:0; transform:translateY(24px); }
.cin-problem-line:nth-child(1) { font-size:clamp(22px,3.2vw,42px); font-weight:300; color:rgba(255,255,255,.9); }
.cin-problem-line:nth-child(2) { font-size:clamp(15px,1.7vw,22px); font-weight:300; color:rgba(255,255,255,.5); line-height:1.8; }
.cin-problem-line:nth-child(3) { font-size:clamp(38px,6vw,72px); font-weight:900; letter-spacing:-.02em; }
.cin-problem-line.scramble-in { opacity:1!important; transform:translateY(0) scale(.7)!important; transition:transform 1s cubic-bezier(.16,1,.3,1), text-shadow 1.5s ease!important; }
.cin-problem-line.scramble-done { transform:translateY(0) scale(1)!important; text-shadow:0 0 80px rgba(255,255,255,.4), 0 0 160px rgba(255,255,255,.15); }

/* ── Scene 4 — Solution ── */
.cin-solution { display:flex; flex-direction:column; align-items:center; gap:clamp(32px,5vh,50px); }
.cin-solution-text { font-size:clamp(18px,2.2vw,28px); font-weight:300; color:rgba(255,255,255,.7); opacity:0; letter-spacing:.05em; }
.cin-tags { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; max-width:720px; }
.cin-tag { padding:12px 28px; border:1px solid rgba(255,255,255,.15); border-radius:100px; font-size:clamp(12px,1.3vw,15px); font-weight:400; color:rgba(255,255,255,.6); letter-spacing:.06em; opacity:0; transform:translateY(16px) scale(.94); }
.cin-tag.float { animation:cinTagFloat 4s ease-in-out infinite; }
@keyframes cinTagFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

/* ── Scene 5 — Industries ── */
.cin-industries { display:flex; flex-direction:column; align-items:center; gap:clamp(32px,5vh,46px); }
.cin-industries-title { font-size:clamp(30px,4.5vw,54px); font-weight:800; letter-spacing:-.02em; opacity:0; }
.cin-ind-list { display:flex; flex-wrap:wrap; justify-content:center; gap:10px 32px; max-width:750px; }
.cin-ind { font-size:clamp(14px,1.5vw,18px); color:rgba(255,255,255,.5); font-weight:300; letter-spacing:.06em; opacity:0; }

/* ── Scene 6 — Results ── */
.cin-results { display:flex; flex-direction:column; align-items:center; gap:clamp(18px,3vh,32px); }
.cin-results-title { font-size:clamp(20px,2.8vw,38px); font-weight:300; color:rgba(255,255,255,.85); opacity:0; text-align:center; }
.cin-results-nda { font-size:clamp(10px,1.1vw,13px); letter-spacing:.35em; color:rgba(255,255,255,.18); font-weight:400; text-transform:uppercase; opacity:0; }
.cin-results-line { width:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent); transition:width 1.2s cubic-bezier(.16,1,.3,1); }
.cin-stats { display:flex; gap:clamp(14px,2vw,36px); justify-content:center; flex-wrap:wrap; }
.cin-stat { text-align:center; opacity:0; transform:translateY(24px); padding:clamp(16px,2vw,30px) clamp(12px,1.6vw,26px); border-radius:14px; background:rgba(255,255,255,.015); border:1px solid rgba(255,255,255,.04); min-width:clamp(100px,12vw,165px); transition:border-color .6s ease, background .6s ease, box-shadow .6s ease; }
.cin-stat.counted { border-color:rgba(255,255,255,.1); background:rgba(255,255,255,.03); box-shadow:0 0 30px rgba(255,255,255,.03); }
.cin-stat-num { font-size:clamp(30px,4.5vw,58px); font-weight:900; font-variant-numeric:tabular-nums; line-height:1.1; margin-bottom:8px; background:linear-gradient(180deg,#fff 0%,rgba(255,255,255,.5) 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
.cin-stat-label { font-size:clamp(8px,.95vw,11px); color:rgba(255,255,255,.3); font-weight:500; letter-spacing:.14em; line-height:1.5; text-transform:uppercase; }

/* ── Scene 7 — Final ── */
.cin-final { display:flex; flex-direction:column; align-items:center; gap:clamp(24px,4vh,36px); text-align:center; }
.cin-final-1 { font-size:clamp(24px,3.5vw,46px); font-weight:300; color:rgba(255,255,255,.85); opacity:0; }
.cin-final-2 { font-size:clamp(16px,2vw,24px); color:rgba(255,255,255,.5); font-weight:300; letter-spacing:.08em; opacity:0; }
.cin-final-line { width:0; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); transition:width 1.2s cubic-bezier(.16,1,.3,1); }

/* Cinematic ambient bg (website-style) */
.cin-grid { position:absolute; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.012) 1px,transparent 1px); background-size:60px 60px; }
.cin-ambient { position:absolute; pointer-events:none; border-radius:50%; filter:blur(140px); z-index:0; }
.cin-ambient-1 { width:50vw; height:50vw; top:-18vw; left:-12vw; background:radial-gradient(circle,rgba(255,255,255,.035) 0%,transparent 70%); }
.cin-ambient-2 { width:35vw; height:35vw; bottom:-12vw; right:-8vw; background:radial-gradient(circle,rgba(255,255,255,.025) 0%,transparent 70%); }

@media(max-width:768px) {
  .stage { flex-direction:column; gap:20px; padding-top:80px; }
  .info { flex:none; text-align:center; }
  .info-stats { justify-content:center; }
  .dots,.page-ind { justify-content:center; }
  .laptop-wrap { max-width:92vw; }
  .hint { display:none; }
  .div-tabs { gap:4px; }
  .div-tab { padding:5px 12px; font-size:10px; }
  .intro-cards { flex-direction:column; gap:16px; }
  .intro-card { width:clamp(260px,80vw,340px); padding:28px 24px; }
  .cin-skip { bottom:20px; right:20px; padding:8px 20px; font-size:11px; }
  .cin-counter { bottom:20px; left:20px; font-size:10px; }
  .cin-pillars { gap:28px; }
  .cin-pillar-name { letter-spacing:.12em; }
  .cin-tags { gap:8px; }
  .cin-tag { padding:8px 18px; }
  .cin-stats { gap:10px; }
  .cin-stat { min-width:clamp(80px,40vw,160px); padding:14px 12px; }
  .cin-stat-num { font-size:clamp(28px,8vw,44px); }
}
</style>
</head>
<body>

<div class="cursor-dot" id="cursorDot"></div>
<div class="cursor-ring" id="cursorRing"></div>

<!-- ═══ CINEMATIC INTRO ═══ -->
<div class="cinematic" id="cinematic">
  <div class="cin-grid"></div>
  <div class="cin-ambient cin-ambient-1"></div>
  <div class="cin-ambient cin-ambient-2"></div>
  <div class="cin-grain"></div>
  <div class="cin-vignette"></div>
  <div class="cin-progress" id="cinProgress"></div>
  <div class="cin-wipe" id="cinWipe"></div>
  <div class="cin-counter" id="cinCounter"><b>01</b> / 07</div>
  <div class="cin-scan"></div>
  <div class="cin-flash" id="cinFlash"></div>

  <div class="cin-scene" id="cinScene1">
    <div class="cin-logo-wrap">
      <div class="cin-logo-glow"></div>
      <div class="cin-logo-ring"></div>
      <div class="cin-logo"><img src="${logoB64}" alt="Blackwolf"></div>
    </div>
    <div class="cin-wordmark"><img src="${wordmarkB64}" alt="BLACKWOLF"></div>
    <div class="cin-tagline">Protect Excellence. Empower Innovation.</div>
  </div>

  <div class="cin-scene" id="cinScene2">
    <div class="cin-pillars">
      <div class="cin-pillar"><div class="cin-pillar-line"></div><div class="cin-pillar-name">Development</div><div class="cin-pillar-desc">We build what you envision</div></div>
      <div class="cin-pillar"><div class="cin-pillar-line"></div><div class="cin-pillar-name">Security</div><div class="cin-pillar-desc">We protect what you&rsquo;ve built</div></div>
      <div class="cin-pillar"><div class="cin-pillar-line"></div><div class="cin-pillar-name">Growth</div><div class="cin-pillar-desc">We scale what works</div></div>
    </div>
  </div>

  <div class="cin-scene" id="cinScene3">
    <div class="cin-problem">
      <div class="cin-problem-line">You built a great business.</div>
      <div class="cin-problem-line">But without the right systems &mdash; manual work piles up, resources drain, growth slows.</div>
      <div class="cin-problem-line">We fix that.</div>
    </div>
  </div>

  <div class="cin-scene" id="cinScene4">
    <div class="cin-solution">
      <div class="cin-solution-text">Everything you need. Built to order.</div>
      <div class="cin-tags">
        <div class="cin-tag">CRMs</div><div class="cin-tag">ERPs</div><div class="cin-tag">Apps</div>
        <div class="cin-tag">Web Platforms</div><div class="cin-tag">Automations</div><div class="cin-tag">Chatbots</div>
        <div class="cin-tag">Protection</div><div class="cin-tag">Growth Systems</div><div class="cin-tag">and more&hellip;</div>
      </div>
    </div>
  </div>

  <div class="cin-scene" id="cinScene5">
    <div class="cin-industries">
      <div class="cin-industries-title">For every niche.</div>
      <div class="cin-ind-list">
        <div class="cin-ind">Manufacturing</div><div class="cin-ind">Law Firms</div><div class="cin-ind">Clinics</div>
        <div class="cin-ind">Hospitality</div><div class="cin-ind">Architecture</div><div class="cin-ind">Agencies</div>
        <div class="cin-ind">Retail</div><div class="cin-ind">&hellip;and more</div>
      </div>
    </div>
  </div>

  <div class="cin-scene" id="cinScene6">
    <div class="cin-results">
      <div class="cin-results-title">Results speak louder than promises.</div>
      <div class="cin-results-line" id="cinResultsLine"></div>
      <div class="cin-results-nda">Client identities protected under NDA</div>
      <div class="cin-stats">
        <div class="cin-stat"><div class="cin-stat-num" id="cinStat1">+0</div><div class="cin-stat-label">Cash Collected<br>for Clients</div></div>
        <div class="cin-stat"><div class="cin-stat-num" id="cinStat2">+0</div><div class="cin-stat-label">Clients</div></div>
        <div class="cin-stat"><div class="cin-stat-num" id="cinStat3">+0</div><div class="cin-stat-label">Apps Built</div></div>
        <div class="cin-stat"><div class="cin-stat-num" id="cinStat4">+0</div><div class="cin-stat-label">Companies<br>Protected</div></div>
      </div>
    </div>
  </div>

  <div class="cin-scene" id="cinScene7">
    <div class="cin-final">
      <div class="cin-final-1">Technology should serve people.</div>
      <div class="cin-final-line" id="cinFinalLine"></div>
      <div class="cin-final-2">Here are some of our projects.</div>
    </div>
  </div>

  <button class="cin-skip" id="cinSkip">SKIP &rarr;</button>
</div>

<div class="bg bg-grid"></div>
<div class="bg bg-vig"></div>
<div class="glow glow-1"></div>
<div class="glow glow-2"></div>
<div id="particles"></div>

<!-- ═══ INTRO SCREEN ═══ -->
<div class="intro" id="intro">
  <div class="intro-inner" id="introInner">
    <div class="intro-logo-wrap">
      <div class="intro-logo-halo"></div>
      <div class="intro-logo-ring"></div>
      <div class="intro-icon"><img src="${logoB64}" alt="Blackwolf"></div>
    </div>
    <div class="intro-wordmark"><img src="${wordmarkB64}" alt="BLACKWOLF"></div>
    <div class="intro-sweep"></div>
    <div class="intro-sub">SELECT A DIVISION</div>

    <div class="intro-cards">
      <div class="intro-card" data-div="development" style="--card-color:rgba(139,92,246,.5)">
        <div class="intro-card-glow"></div>
        <div class="intro-card-num">01</div>
        <div class="intro-card-name">Development</div>
        <div class="intro-card-desc">Full-stack applications, AI-powered platforms, and automation systems built from the ground up.</div>
        <div class="intro-card-count">3 PROJECTS</div>
        <div class="intro-card-arrow">&rarr;</div>
      </div>
      <div class="intro-card" data-div="cybersecurity" style="--card-color:rgba(239,68,68,.5)">
        <div class="intro-card-glow"></div>
        <div class="intro-card-num">02</div>
        <div class="intro-card-name">Cybersecurity</div>
        <div class="intro-card-desc">AI-driven threat detection, autonomous security operations, and 24/7 protection infrastructure.</div>
        <div class="intro-card-count">1 PROJECT</div>
        <div class="intro-card-arrow">&rarr;</div>
      </div>
      <div class="intro-card" data-div="growth" style="--card-color:rgba(245,158,11,.5)">
        <div class="intro-card-glow"></div>
        <div class="intro-card-num">03</div>
        <div class="intro-card-name">Growth</div>
        <div class="intro-card-desc">High-conversion landing pages, brand identity systems, and revenue-generating digital presence.</div>
        <div class="intro-card-count">2 PROJECTS</div>
        <div class="intro-card-arrow">&rarr;</div>
      </div>
    </div>
  </div>

  <div class="intro-footer">PROTECT EXCELLENCE &bull; EMPOWER INNOVATION</div>
</div>

<!-- ═══ SHOWCASE ═══ -->
<header id="header">
  <div class="brand">
    <div class="brand-icon"><img src="${logoB64}" alt="Blackwolf"></div>
    <div><div class="brand-name"><img src="${wordmarkB64}" alt="BLACKWOLF" style="height:14px;width:auto;"></div><div class="brand-sub">PORTFOLIO</div></div>
  </div>
  <div class="nav-wrap">
    <div class="div-tabs" id="divTabs">
      <button class="div-tab" data-div="development">DEVELOPMENT</button>
      <button class="div-tab" data-div="cybersecurity">CYBERSECURITY</button>
      <button class="div-tab" data-div="growth">GROWTH</button>
    </div>
    <button class="back-btn" id="backBtn">&larr; Back</button>
  </div>
</header>

<div class="stage" id="stage">
  <div class="info" id="info">
    <div class="info-cat" id="cat"></div>
    <h1 class="info-title" id="title"></h1>
    <p class="info-sub" id="sub"></p>
    <p class="info-desc" id="desc"></p>
    <div class="info-stats" id="stats"></div>
    <div class="type-label" id="typeLabel"></div>
    <div class="counter"><b id="cNum">01</b> / <span id="cTotal">01</span></div>
    <div class="page-ind" id="pagePips"></div>
    <div class="dots" id="dots"></div>
  </div>

  <div class="laptop-wrap">
    <div class="lid">
      <div class="notch"></div>
      <div class="screen" id="screen">
        <div class="screen-content hidden" id="screenContent"></div>
        <video class="screen-video hidden" id="screenVideo" muted playsinline></video>
        <div class="scanlines"></div>
      </div>
    </div>
    <div class="base"><div class="hinge"></div><div class="lip"></div></div>
    <div class="shadow" id="shadow"></div>
  </div>
</div>

<footer id="footer">
  <div class="tagline">PROTECT EXCELLENCE &bull; EMPOWER INNOVATION</div>
  <div class="hint"><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate &nbsp; <kbd>Space</kbd> Pause</div>
</footer>

<script>
const ALL = ${projectsJSON};
let filtered = [], cur = 0, page = 0, paused = false, busy = false, scrollAnim = null, timers = [];
let currentDiv = 'development';
let showcaseActive = false;
const $ = id => document.getElementById(id);

// ═══ CUSTOM CURSOR ═══
const cursorDot = $('cursorDot');
const cursorRing = $('cursorRing');
let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;

document.addEventListener('mousemove', function(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursorDot) { cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px'; }
});

(function animateRing() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;
  if (cursorRing) { cursorRing.style.left = ringX + 'px'; cursorRing.style.top = ringY + 'px'; }
  requestAnimationFrame(animateRing);
})();

document.addEventListener('mouseover', function(e) {
  if (e.target.closest && e.target.closest('button, .intro-card, .cin-skip, a, .dot, .div-tab, .back-btn')) {
    if (cursorRing) cursorRing.classList.add('hover');
  }
});
document.addEventListener('mouseout', function(e) {
  if (e.target.closest && e.target.closest('button, .intro-card, .cin-skip, a, .dot, .div-tab, .back-btn')) {
    if (cursorRing) cursorRing.classList.remove('hover');
  }
});

// ═══ CLICK SOUND (Web Audio API) ═══
var audioCtx = null;
function playClickSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Layered click: short percussive hit + subtle tail
    var t = audioCtx.currentTime;
    // Layer 1: sharp tick
    var osc1 = audioCtx.createOscillator();
    var g1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1200, t);
    osc1.frequency.exponentialRampToValueAtTime(400, t + 0.06);
    g1.gain.setValueAtTime(0.12, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.connect(g1); g1.connect(audioCtx.destination);
    osc1.start(t); osc1.stop(t + 0.08);
    // Layer 2: low thud
    var osc2 = audioCtx.createOscillator();
    var g2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(150, t);
    osc2.frequency.exponentialRampToValueAtTime(80, t + 0.1);
    g2.gain.setValueAtTime(0.06, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc2.connect(g2); g2.connect(audioCtx.destination);
    osc2.start(t); osc2.stop(t + 0.12);
  } catch(e) {}
}

document.addEventListener('click', function() {
  playClickSound();
  if (cursorDot) { cursorDot.classList.add('click'); setTimeout(function() { cursorDot.classList.remove('click'); }, 120); }
  if (cursorRing) { cursorRing.classList.add('click'); setTimeout(function() { cursorRing.classList.remove('click'); }, 120); }
});

function init() {
  for (let i = 0; i < 22; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.cssText = 'left:'+(5+Math.random()*90)+'%;top:'+(5+Math.random()*90)+'%;--d:'+(2+Math.random()*4)+'s;--dl:'+(Math.random()*3)+'s;';
    $('particles').appendChild(d);
  }

  // Mouse parallax on intro
  document.addEventListener('mousemove', e => {
    if (showcaseActive || cinRunning) return;
    const inner = $('introInner');
    if (!inner) return;
    const cx = (e.clientX / window.innerWidth - .5) * 2;
    const cy = (e.clientY / window.innerHeight - .5) * 2;
    inner.style.transform = 'translate('+(-cx*12)+'px,'+(-cy*8)+'px)';
  });

  // Intro card click handlers
  document.querySelectorAll('.intro-card').forEach(card => {
    card.addEventListener('click', () => enterShowcase(card.dataset.div));
  });

  // Tab click handlers
  $('divTabs').querySelectorAll('.div-tab').forEach(tab => {
    tab.addEventListener('click', () => switchDivision(tab.dataset.div));
  });

  // Back button
  $('backBtn').addEventListener('click', goToIntro);

  document.addEventListener('keydown', e => {
    if (!showcaseActive) return;
    if (e.key==='ArrowRight') go((cur+1)%filtered.length);
    else if (e.key==='ArrowLeft') go((cur-1+filtered.length)%filtered.length);
    else if (e.key===' ') { e.preventDefault(); paused=!paused; if(!paused) resumeCurrent(); }
    else if (e.key==='Escape') goToIntro();
  });

  $('screenVideo').addEventListener('ended', () => {
    const p = filtered[cur];
    if (p.type === 'video' && p.screenData && p.screenData.length > 0) {
      switchToLandingScroll(p);
    } else {
      nextProject();
    }
  });

  startCinematic();
}

function enterShowcase(div) {
  showcaseActive = true;
  $('intro').classList.add('hidden');
  setTimeout(() => {
    $('header').classList.add('visible');
    $('stage').classList.add('visible');
    $('footer').classList.add('visible');
    switchDivision(div);
  }, 400);
}

function goToIntro() {
  showcaseActive = false;
  clearAll();
  hideScreen();
  $('header').classList.remove('visible');
  $('stage').classList.remove('visible');
  $('footer').classList.remove('visible');
  setTimeout(() => {
    $('intro').classList.remove('hidden');
  }, 300);
}

function switchDivision(div) {
  currentDiv = div;
  clearAll();
  cur = 0;
  page = 0;

  $('divTabs').querySelectorAll('.div-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.div === div);
  });

  filtered = ALL.filter(p => p.division === div);
  $('cTotal').textContent = String(filtered.length).padStart(2,'0');
  buildDots();
  show(0, false);
}

function buildDots() {
  $('dots').innerHTML = filtered.map((_,i) => '<button class="dot'+(i===0?' active':'')+'" data-i="'+i+'"></button>').join('');
  $('dots').querySelectorAll('.dot').forEach(d => d.addEventListener('click', e => { e.stopPropagation(); go(+d.dataset.i); }));
}

function go(i) {
  if ((i===cur && page===0) || busy) return;
  clearAll();
  page = 0;
  show(i, true);
}

function show(i, anim) {
  if (filtered.length === 0) return;
  const p = filtered[i];
  cur = i;
  page = 0;

  document.documentElement.style.setProperty('--accent', p.color);
  document.documentElement.style.setProperty('--accent-rgb', p.colorRgb);
  $('shadow').style.background = 'radial-gradient(ellipse,rgba('+p.colorRgb+',.12) 0%,transparent 70%)';

  if (anim) {
    busy = true;
    $('info').classList.add('out');
    hideScreen();
    wait(450).then(() => {
      updateInfo(p);
      showScreen(p).then(() => {
        $('info').classList.remove('out');
        wait(200).then(() => { busy = false; });
      });
    });
  } else {
    updateInfo(p);
    showScreen(p);
  }

  $('cNum').textContent = String(i+1).padStart(2,'0');
  $('dots').querySelectorAll('.dot').forEach((d,idx) => {
    d.classList.toggle('active', idx===i);
    d.classList.remove('filling');
  });
}

function updateInfo(p) {
  $('cat').textContent = p.category;
  $('title').textContent = p.name;
  $('sub').textContent = p.subtitle;
  $('desc').textContent = p.description;
  $('stats').innerHTML = p.stats.map(s => '<div class="info-stat">'+s+'</div>').join('');

  const labels = { video: 'LIVE DEMO', scroll: 'FULL PAGE', slides: 'APP WALKTHROUGH' };
  $('typeLabel').textContent = labels[p.type] || '';

  let pipCount = 0;
  if (p.type === 'video' && p.screenData.length > 0) pipCount = 2;
  else if (p.type === 'slides') pipCount = p.screenData.length;
  else if (p.type === 'scroll') pipCount = p.screenData.length;
  else pipCount = 1;

  $('pagePips').innerHTML = Array.from({length: pipCount}, (_,i) =>
    '<div class="pip'+(i===0?' active':'')+'"></div>'
  ).join('');
}

function updatePips(idx) {
  $('pagePips').querySelectorAll('.pip').forEach((p,i) => p.classList.toggle('active', i===idx));
}

function hideScreen() {
  $('screenContent').classList.add('hidden');
  $('screenVideo').classList.add('hidden');
  $('screenVideo').pause();
}

async function showScreen(p) {
  hideScreen();

  if (p.type === 'video') {
    const vid = $('screenVideo');
    vid.src = p.videoSrc;
    vid.currentTime = 0;
    vid.classList.remove('hidden');
    try { await vid.play(); } catch(e) { console.log('autoplay blocked'); }

  } else if (p.type === 'scroll') {
    if (p.screenData.length > 0) {
      await loadImage(p.screenData[0].src);
      $('screenContent').classList.remove('hidden');
      startScroll(p.screenData[0]);
    }

  } else if (p.type === 'slides') {
    page = 0;
    if (p.screenData.length > 0) {
      await loadImage(p.screenData[0].src);
      $('screenContent').classList.remove('hidden');
      $('screenContent').style.transform = 'translateY(0)';
      scheduleSlides(p);
    }
  }
}

function loadImage(src) {
  return new Promise(resolve => {
    const sc = $('screenContent');
    const img = new Image();
    img.onload = () => {
      sc.innerHTML = '';
      sc.appendChild(img);
      img.style.width = '100%';
      img.style.display = 'block';
      sc.style.transform = 'translateY(0)';
      resolve();
    };
    img.onerror = resolve;
    img.src = src;
    img.draggable = false;
  });
}

function startScroll(data) {
  const screenEl = $('screen');
  const sc = $('screenContent');
  const imgEl = sc.querySelector('img');
  if (!imgEl) { scheduleNextProject(); return; }

  const doScroll = () => {
    const screenH = screenEl.offsetHeight;
    const imgH = imgEl.offsetHeight;
    const scrollDist = Math.max(0, imgH - screenH);

    if (scrollDist < 20) {
      scheduleNextProject(4000);
      return;
    }

    const duration = Math.min(Math.max(scrollDist * 4, 4000), 14000);
    const holdTop = 1800;
    const holdBottom = 1800;

    timers.push(setTimeout(() => {
      if (paused) return;
      const start = performance.now();
      function animate(now) {
        if (paused) { scrollAnim = requestAnimationFrame(animate); return; }
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress < .5 ? 4*progress*progress*progress : 1-Math.pow(-2*progress+2,3)/2;
        sc.style.transform = 'translateY(-'+(eased*scrollDist)+'px)';
        if (progress < 1) scrollAnim = requestAnimationFrame(animate);
        else timers.push(setTimeout(() => { if(!paused) nextProject(); }, holdBottom));
      }
      scrollAnim = requestAnimationFrame(animate);
    }, holdTop));
  };

  if (imgEl.complete) doScroll();
  else imgEl.onload = doScroll;
}

function scheduleSlides(p) {
  const holdTime = 1800;

  const showNext = () => {
    page++;
    if (page >= p.screenData.length) { nextProject(); return; }
    updatePips(page);

    $('screenContent').classList.add('hidden');
    timers.push(setTimeout(() => {
      loadImage(p.screenData[page].src).then(() => {
        $('screenContent').style.transform = 'translateY(0)';
        $('screenContent').classList.remove('hidden');
        timers.push(setTimeout(() => { if(!paused) showNext(); }, holdTime));
      });
    }, 500));
  };

  timers.push(setTimeout(() => { if(!paused) showNext(); }, holdTime));
}

function switchToLandingScroll(p) {
  updatePips(1);
  $('screenVideo').classList.add('hidden');

  loadImage(p.screenData[0].src).then(() => {
    $('screenContent').classList.remove('hidden');
    startScroll(p.screenData[0]);
  });
}

function nextProject() {
  if (paused) return;
  clearAll();
  const next = (cur + 1) % filtered.length;
  page = 0;
  show(next, true);
}

function scheduleNextProject(ms) {
  timers.push(setTimeout(() => { if(!paused) nextProject(); }, ms || 3000));
}

function resumeCurrent() {
  const p = filtered[cur];
  if (p.type === 'video') {
    const vid = $('screenVideo');
    if (vid.paused) vid.play();
  }
}

function clearAll() {
  timers.forEach(t => clearTimeout(t));
  timers = [];
  cancelAnimationFrame(scrollAnim);
  $('screenVideo').pause();
}

function wait(ms) { return new Promise(r => { timers.push(setTimeout(r,ms)); }); }

// ═══ CINEMATIC INTRO CONTROLLER ═══
let cinTimers = [];
let cinRunning = false;
let cinStartTime = 0;
let cinCurrentScene = 0;
const cinTotalDuration = 30000;
const cinWait = ms => new Promise(r => { cinTimers.push(setTimeout(r, ms)); });

// ── Utility: floating particles ──
function createCinParticles() {
  var cin = $('cinematic');
  if (!cin) return;
  for (var i = 0; i < 40; i++) {
    var p = document.createElement('div');
    p.className = 'cin-particle';
    var sz = (1 + Math.random() * 2.5).toFixed(1);
    var op = (.08 + Math.random() * .25).toFixed(2);
    var dur = (7 + Math.random() * 12).toFixed(1);
    var del = (Math.random() * parseFloat(dur)).toFixed(1);
    var px = (Math.random() * 100).toFixed(1);
    var dx = (-40 + Math.random() * 80).toFixed(0);
    p.style.cssText = '--ps:'+sz+'px;--po:'+op+';--pd:'+dur+'s;--pdelay:'+del+'s;--px:'+px+'%;--pdx:'+dx+'px;';
    cin.appendChild(p);
  }
}

// ── Utility: text scramble decode ──
function textScramble(el, finalText, duration) {
  return new Promise(function(resolve) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&';
    var len = finalText.length;
    var perChar = duration / len;
    var revealed = 0;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    el.classList.add('scramble-in');
    function tick() {
      if (!cinRunning) { resolve(); return; }
      var out = '';
      for (var i = 0; i < len; i++) {
        if (finalText[i] === ' ') { out += '\\u00A0'; }
        else if (i < revealed) { out += finalText[i]; }
        else { out += chars[Math.floor(Math.random() * chars.length)]; }
      }
      el.textContent = out;
      revealed++;
      if (revealed <= len) { cinTimers.push(setTimeout(tick, perChar)); }
      else { el.textContent = finalText; resolve(); }
    }
    tick();
  });
}

// ── Utility: character-by-character reveal ──
function charReveal(el, stagger, startDelay) {
  var text = el.textContent;
  el.innerHTML = '';
  for (var i = 0; i < text.length; i++) {
    var span = document.createElement('span');
    if (text[i] === ' ') { span.innerHTML = '&nbsp;'; span.className = 'cin-char space'; }
    else { span.textContent = text[i]; span.className = 'cin-char'; }
    el.appendChild(span);
  }
  var spans = el.querySelectorAll('.cin-char');
  for (var j = 0; j < spans.length; j++) {
    (function(s, idx) {
      cinTimers.push(setTimeout(function() {
        if (!cinRunning) return;
        s.classList.add('revealed');
      }, (startDelay || 0) + idx * (stagger || 35)));
    })(spans[j], j);
  }
}

// ── Utility: flash effect ──
function cinFlash(intensity) {
  var fl = $('cinFlash');
  if (!fl) return;
  fl.style.transition = 'none';
  fl.style.opacity = String(intensity || .18);
  fl.offsetHeight;
  cinTimers.push(setTimeout(function() {
    fl.style.transition = 'opacity .8s ease';
    fl.style.opacity = '0';
  }, 50));
}

// ── Utility: ripple ping on scene enter ──
function cinPing() {
  var cin = $('cinematic');
  if (!cin) return;
  var ring = document.createElement('div');
  ring.className = 'cin-ping';
  cin.appendChild(ring);
  cinTimers.push(setTimeout(function() { ring.remove(); }, 2200));
}

// ── Start ──
function startCinematic() {
  cinRunning = true;
  cinStartTime = Date.now();
  var introEl = $('intro');
  introEl.style.opacity = '0';
  introEl.style.pointerEvents = 'none';

  createCinParticles();

  cinTimers.push(setTimeout(function() {
    if (cinRunning) {
      $('cinSkip').classList.add('visible');
      $('cinCounter').classList.add('visible');
    }
  }, 1200));
  $('cinSkip').addEventListener('click', endCinematic);

  var cinKeyHandler = function(e) {
    if (!cinRunning) return;
    if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); endCinematic(); }
  };
  document.addEventListener('keydown', cinKeyHandler);

  updateCinProgress();
  runCinematicSequence();
}

function updateCinProgress() {
  if (!cinRunning) return;
  var pct = Math.min(((Date.now() - cinStartTime) / cinTotalDuration) * 100, 100);
  var bar = $('cinProgress');
  if (bar) bar.style.width = pct + '%';
  if (pct < 100) requestAnimationFrame(updateCinProgress);
}

function updateCinCounter(n) {
  cinCurrentScene = n;
  var counter = $('cinCounter');
  if (counter) counter.innerHTML = '<b>0' + n + '</b> / 07';
}

function cinWipeTransition() {
  return new Promise(function(resolve) {
    var wipe = $('cinWipe');
    if (!wipe) { resolve(); return; }
    wipe.className = 'cin-wipe';
    wipe.offsetHeight;
    wipe.classList.add('fire');
    cinTimers.push(setTimeout(function() {
      wipe.classList.add('fade');
      cinTimers.push(setTimeout(function() {
        wipe.className = 'cin-wipe';
        resolve();
      }, 350));
    }, 350));
  });
}

function cinExitScene(n) {
  var s = $('cinScene' + n);
  if (s) { s.classList.remove('active'); s.classList.add('exit'); }
}
function cinResetScene(n) {
  var s = $('cinScene' + n);
  if (s) { s.classList.remove('exit'); }
}

// ── Main sequence ──
async function runCinematicSequence() {
  // Scene 1: Logo + Wordmark + Tagline (3.5s)
  if (!cinRunning) return;
  updateCinCounter(1);
  cinActivate(1);
  cinPing();
  await cinWait(3500);

  if (!cinRunning) return;
  cinExitScene(1);
  await cinWipeTransition();
  cinResetScene(1);

  // Scene 2: Three pillars — char-by-char reveals (5s)
  if (!cinRunning) return;
  updateCinCounter(2);
  cinActivate(2);
  cinPing();
  cinAnimatePillars();
  await cinWait(5000);

  if (!cinRunning) return;
  cinExitScene(2);
  await cinWipeTransition();
  cinResetScene(2);

  // Scene 3: Problem — text scramble "We fix that." (5.5s)
  if (!cinRunning) return;
  updateCinCounter(3);
  cinActivate(3);
  cinPing();
  cinAnimateProblem();
  await cinWait(5500);

  if (!cinRunning) return;
  cinExitScene(3);
  await cinWipeTransition();
  cinResetScene(3);

  // Scene 4: Solution tags (4s)
  if (!cinRunning) return;
  updateCinCounter(4);
  cinActivate(4);
  cinPing();
  cinAnimateSolution();
  await cinWait(4000);

  if (!cinRunning) return;
  cinExitScene(4);
  await cinWipeTransition();
  cinResetScene(4);

  // Scene 5: Industries (3.5s)
  if (!cinRunning) return;
  updateCinCounter(5);
  cinActivate(5);
  cinPing();
  cinAnimateIndustries();
  await cinWait(3500);

  if (!cinRunning) return;
  cinExitScene(5);
  await cinWipeTransition();
  cinResetScene(5);

  // Scene 6: Results (5s)
  if (!cinRunning) return;
  updateCinCounter(6);
  cinActivate(6);
  cinPing();
  cinAnimateResults();
  await cinWait(5000);

  if (!cinRunning) return;
  cinExitScene(6);
  await cinWipeTransition();
  cinResetScene(6);

  // Scene 7: Final statement (3.5s)
  if (!cinRunning) return;
  updateCinCounter(7);
  cinActivate(7);
  cinPing();
  cinAnimateFinal();
  await cinWait(3500);

  if (cinRunning) endCinematic();
}

function cinActivate(n) { var s = $('cinScene'+n); if(s) s.classList.add('active'); }

// ── Scene 2: Pillars with char-by-char name reveals ──
function cinAnimatePillars() {
  var pillars = document.querySelectorAll('.cin-pillar');
  var lines = document.querySelectorAll('.cin-pillar-line');
  var names = document.querySelectorAll('.cin-pillar-name');
  var descs = document.querySelectorAll('.cin-pillar-desc');
  pillars.forEach(function(p, i) {
    cinTimers.push(setTimeout(function() {
      if (!cinRunning) return;
      p.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1), transform 1.2s cubic-bezier(.16,1,.3,1)';
      p.style.opacity = '1';
      p.style.transform = 'translateY(0)';
      if (lines[i]) {
        lines[i].style.transition = 'width 1.4s cubic-bezier(.16,1,.3,1)';
        lines[i].style.width = '80px';
      }
      // Character-by-character name reveal
      if (names[i]) { charReveal(names[i], 30, 150); }
      // Fade in description after name
      if (descs[i]) {
        descs[i].style.opacity = '0';
        descs[i].style.transform = 'translateY(8px)';
        cinTimers.push(setTimeout(function() {
          descs[i].style.transition = 'opacity .6s ease, transform .6s ease';
          descs[i].style.opacity = '1';
          descs[i].style.transform = 'translateY(0)';
        }, 400));
      }
    }, i * 1300));
  });
}

// ── Scene 3: Problem — scramble decode for "We fix that." + flash ──
function cinAnimateProblem() {
  var lines = document.querySelectorAll('.cin-problem-line');
  // Line 1: gentle fade
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    lines[0].style.transition = 'opacity 1.4s cubic-bezier(.16,1,.3,1), transform 1.4s cubic-bezier(.16,1,.3,1)';
    lines[0].style.opacity = '1';
    lines[0].style.transform = 'translateY(0)';
  }, 0));
  // Line 2: fade in
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    lines[1].style.transition = 'opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1)';
    lines[1].style.opacity = '1';
    lines[1].style.transform = 'translateY(0)';
  }, 1400));
  // Line 3: THE moment — scramble decode + scale up + flash
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    textScramble(lines[2], 'We fix that.', 600).then(function() {
      if (!cinRunning) return;
      cinFlash(.22);
      lines[2].classList.add('scramble-done');
    });
  }, 3000));
}

// ── Scene 4: Solution — staggered tags with varied entrance ──
function cinAnimateSolution() {
  var txt = document.querySelector('.cin-solution-text');
  if (txt) {
    txt.style.transition = 'opacity 1.2s cubic-bezier(.16,1,.3,1)';
    txt.style.opacity = '1';
  }
  var tags = document.querySelectorAll('.cin-tag');
  tags.forEach(function(t, i) {
    // Randomize entrance direction for variety
    var rx = (-20 + Math.random() * 40).toFixed(0);
    var ry = (10 + Math.random() * 20).toFixed(0);
    t.style.transform = 'translate(' + rx + 'px,' + ry + 'px) scale(.9)';
    cinTimers.push(setTimeout(function() {
      if (!cinRunning) return;
      t.style.transition = 'opacity .6s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1)';
      t.style.opacity = '1';
      t.style.transform = 'translate(0,0) scale(1)';
      cinTimers.push(setTimeout(function() {
        t.classList.add('float');
        t.style.animationDelay = (i * 0.35) + 's';
      }, 900));
    }, 500 + i * 120));
  });
}

// ── Scene 5: Industries — title char reveal + stagger list ──
function cinAnimateIndustries() {
  var title = document.querySelector('.cin-industries-title');
  if (title) {
    title.style.opacity = '1';
    charReveal(title, 28, 0);
  }
  var inds = document.querySelectorAll('.cin-ind');
  inds.forEach(function(ind, i) {
    cinTimers.push(setTimeout(function() {
      if (!cinRunning) return;
      ind.style.transition = 'opacity .4s cubic-bezier(.16,1,.3,1), transform .4s cubic-bezier(.16,1,.3,1)';
      ind.style.opacity = '1';
      ind.style.transform = 'translateY(0)';
    }, 500 + i * 150));
  });
}

// ── Scene 6: Results — count-up stats ──
function cinAnimateResults() {
  var title = document.querySelector('.cin-results-title');
  var nda = document.querySelector('.cin-results-nda');
  var line = $('cinResultsLine');
  var stats = document.querySelectorAll('.cin-stat');

  // Title — char reveal
  if (title) { title.style.opacity = '1'; charReveal(title, 16, 0); }

  // Line expand
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    if (line) line.style.width = 'clamp(80px,18vw,220px)';
  }, 600));

  // NDA note fade
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    if (nda) { nda.style.transition = 'opacity .6s ease'; nda.style.opacity = '1'; }
  }, 800));

  // Stat cards — staggered entrance + count-up
  var configs = [
    { target: 3, suffix: 'M', id: 'cinStat1' },
    { target: 12, suffix: '', id: 'cinStat2' },
    { target: 10, suffix: '', id: 'cinStat3' },
    { target: 15, suffix: '', id: 'cinStat4' }
  ];
  stats.forEach(function(card, i) {
    cinTimers.push(setTimeout(function() {
      if (!cinRunning) return;
      card.style.transition = 'opacity .6s cubic-bezier(.16,1,.3,1), transform .6s cubic-bezier(.16,1,.3,1), border-color .6s ease, background .6s ease, box-shadow .6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
      var cfg = configs[i];
      var numEl = $(cfg.id);
      if (numEl) {
        cinCountUp(numEl, cfg.target, cfg.suffix, 1000);
        cinTimers.push(setTimeout(function() { card.classList.add('counted'); }, 1100));
      }
    }, 1200 + i * 220));
  });
}

function cinCountUp(el, target, suffix, duration) {
  var startTime = null;
  function tick(ts) {
    if (!cinRunning) return;
    if (!startTime) startTime = ts;
    var p = Math.min((ts - startTime) / duration, 1);
    var eased = 1 - Math.pow(1 - p, 3);
    var val = Math.round(eased * target);
    el.textContent = '+' + val + (suffix || '');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = '+' + target + (suffix || '');
  }
  requestAnimationFrame(tick);
}

// ── Scene 7: Final — char reveal + expanding line ──
function cinAnimateFinal() {
  var f1 = document.querySelector('.cin-final-1');
  var f2 = document.querySelector('.cin-final-2');
  var fLine = $('cinFinalLine');
  if (f1) {
    f1.style.opacity = '1';
    charReveal(f1, 22, 0);
  }
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    if (fLine) fLine.style.width = 'clamp(100px,22vw,280px)';
  }, 900));
  cinTimers.push(setTimeout(function() {
    if (!cinRunning) return;
    if (f2) { f2.style.transition = 'opacity 1s cubic-bezier(.16,1,.3,1)'; f2.style.opacity = '1'; }
  }, 1400));
}

// ── End cinematic ──
function endCinematic() {
  if (!cinRunning) return;
  cinRunning = false;
  cinTimers.forEach(function(t) { clearTimeout(t); });
  cinTimers = [];

  var cin = $('cinematic');
  if (cin) cin.classList.add('done');
  var skip = $('cinSkip');
  if (skip) skip.classList.remove('visible');
  var counter = $('cinCounter');
  if (counter) counter.classList.remove('visible');

  var introEl = $('intro');
  setTimeout(function() {
    if (introEl) {
      introEl.style.transition = 'opacity 1.2s cubic-bezier(.16,1,.3,1)';
      introEl.style.opacity = '1';
      introEl.style.pointerEvents = '';
    }
  }, 700);

  setTimeout(function() {
    if (introEl) {
      introEl.style.transition = '';
      introEl.style.opacity = '';
      introEl.style.pointerEvents = '';
    }
  }, 2200);

  setTimeout(function() { if (cin) cin.remove(); }, 3000);
}

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
