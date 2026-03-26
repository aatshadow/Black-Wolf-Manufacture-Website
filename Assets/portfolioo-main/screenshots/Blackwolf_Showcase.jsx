import React, { useState, useEffect } from 'react';

const projects = [
  { id: 1, name: "Detrás de Cámara", subtitle: "Full Company Automation Platform", category: "CLIENT PLATFORM", color: "#F97316", gradient: "from-orange-500 to-amber-600", description: "Multi-tenant SaaS • Real-time sales intelligence • AI-powered reporting", stats: ["3 Deployments", "€300k+ tracked", "7 team"] },
  { id: 2, name: "Blackwolf SOC", subtitle: "Security Operations Center", category: "SECURITY DIVISION", color: "#EF4444", gradient: "from-red-500 to-rose-600", description: "Enterprise-grade threat monitoring • SIGMA rules • UEBA • AI Agent", stats: ["154K+ threats", "11 sensors", "Real-time"] },
  { id: 3, name: "Game of Life", subtitle: "Gamified Life Operating System", category: "PROPRIETARY SAAS", color: "#3B82F6", gradient: "from-blue-500 to-indigo-600", description: "HP/XP/Levels • Health, Finance, Productivity integrated • Privacy-first", stats: ["Life OS", "Gamification", "Privacy-first"] },
  { id: 4, name: "TaskFlow", subtitle: "AI-Powered Task Management", category: "PROPRIETARY PRODUCT", color: "#8B5CF6", gradient: "from-violet-500 to-purple-600", description: "Discord AI agent • Zero-friction capture • Full team visibility", stats: ["AI Discord", "Calendar", "Role-based"] },
  { id: 5, name: "FBA Academy", subtitle: "High-Ticket VSL Funnel", category: "LEAD GENERATION", color: "#F59E0B", gradient: "from-amber-400 to-orange-500", description: "Conversion-optimized • Video-first engagement • Social proof", stats: ["65 stores", "€300k/mo", "5000+ students"] }
];

const MacBook = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-t-xl p-2 shadow-2xl">
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-3 bg-zinc-900 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
      </div>
      <div className="bg-zinc-950 rounded-lg overflow-hidden">
        <div className="aspect-[16/10] relative">{children}<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" /></div>
      </div>
    </div>
    <div className="h-3"><div className="h-1.5 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-b-sm" /><div className="mx-6 h-1.5 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-b-lg" /></div>
    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-lg rounded-full" />
  </div>
);

const IPhone = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <div className="bg-zinc-900 rounded-[2rem] p-1.5 shadow-2xl border-2 border-zinc-800">
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
      <div className="bg-black rounded-[1.75rem] overflow-hidden"><div className="aspect-[9/19] relative">{children}</div></div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
    </div>
  </div>
);

const Screen = ({ gradient, title, stats, compact }) => (
  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-3`}>
    {title && <div className={`text-white/90 font-bold ${compact ? 'text-xs' : 'text-base'} mb-1 text-center`}>{title}</div>}
    {stats && !compact && <div className="flex gap-1.5 flex-wrap justify-center">{stats.slice(0,2).map((s,i) => <div key={i} className="bg-black/30 backdrop-blur px-2 py-0.5 rounded-full text-white/80 text-[10px]">{s}</div>)}</div>}
  </div>
);

export default function App() {
  const [active, setActive] = useState(0);
  const [view, setView] = useState('hero');
  const [trans, setTrans] = useState(false);
  const p = projects[active];

  useEffect(() => {
    const i = setInterval(() => { setTrans(true); setTimeout(() => { setActive(x => (x+1) % projects.length); setTimeout(() => setTrans(false), 100); }, 400); }, 5000);
    return () => clearInterval(i);
  }, []);

  const go = (i) => { if (i === active) return; setTrans(true); setTimeout(() => { setActive(i); setTimeout(() => setTrans(false), 100); }, 300); };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
      <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 top-0 -left-40 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)` }} />
      <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-20 bottom-0 -right-40 transition-all duration-1000" style={{ background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)` }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10"><span className="text-black font-black text-lg">B</span></div>
            <div><div className="text-sm font-bold tracking-[0.15em]">BLACKWOLF</div><div className="text-[8px] text-zinc-500 tracking-widest">PROJECT SHOWCASE</div></div>
          </div>
          <div className="flex bg-zinc-900/80 backdrop-blur rounded-full p-0.5 border border-zinc-800">
            {['hero', 'devices', 'grid'].map(m => <button key={m} onClick={() => setView(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${view === m ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>)}
          </div>
        </header>

        <main className="flex-1 flex items-center px-6 pb-4">
          <div className="w-full max-w-6xl mx-auto">
            {view === 'hero' && (
              <div className="flex items-center gap-12">
                <div className={`flex-1 transition-all duration-500 ${trans ? 'opacity-0 -translate-x-6' : 'opacity-100 translate-x-0'}`}>
                  <div className="text-[10px] font-bold tracking-[0.3em] mb-3" style={{ color: p.color }}>{p.category}</div>
                  <h1 className="text-4xl font-black mb-2 leading-none">{p.name}</h1>
                  <p className="text-lg text-zinc-400 mb-4">{p.subtitle}</p>
                  <p className="text-zinc-500 text-sm mb-6 max-w-sm">{p.description}</p>
                  <div className="flex gap-2 mb-8 flex-wrap">{p.stats.map((s,i) => <div key={i} className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs">{s}</div>)}</div>
                  <div className="flex gap-1.5">{projects.map((x,i) => <button key={x.id} onClick={() => go(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? 'w-8' : 'w-1.5 hover:w-3'}`} style={{ backgroundColor: i === active ? p.color : 'rgba(255,255,255,0.2)' }} />)}</div>
                </div>
                <div className={`flex-1 relative h-96 transition-all duration-700 ${trans ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                  <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '1500px' }}>
                    <div style={{ animation: 'float 6s ease-in-out infinite' }}><MacBook className="w-96"><Screen gradient={p.gradient} title={p.name} stats={p.stats} /></MacBook></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{ animation: 'float 6s ease-in-out infinite 0.5s' }}><IPhone className="w-24"><Screen gradient={p.gradient} compact /></IPhone></div>
                    <div className="absolute -left-4 top-4 w-12 h-12 rounded-xl border border-zinc-800 bg-zinc-900/30 backdrop-blur" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />
                    <div className="absolute right-8 -bottom-2 w-8 h-8 rounded-full border border-zinc-800 bg-zinc-900/30 backdrop-blur" style={{ animation: 'float 7s ease-in-out infinite 0.5s' }} />
                  </div>
                </div>
              </div>
            )}

            {view === 'devices' && (
              <div className="flex items-center justify-center py-4">
                <div className="relative" style={{ transform: 'perspective(1500px) rotateX(8deg) rotateY(-15deg)', transformStyle: 'preserve-3d' }}>
                  {projects.map((x,i) => <div key={x.id} onClick={() => go(i)} className={`absolute w-64 rounded-xl overflow-hidden border transition-all duration-500 cursor-pointer ${i === active ? 'border-white/30 shadow-2xl z-50' : 'border-zinc-800 opacity-50 hover:opacity-70'}`} style={{ transform: `translateZ(${(i-active)*60}px) translateX(${(i-active)*50}px) translateY(${(i-active)*25}px)`, boxShadow: i === active ? `0 30px 60px -15px ${x.color}50` : 'none' }}><div className="aspect-video"><Screen gradient={x.gradient} title={x.name} stats={x.stats} /></div></div>)}
                </div>
              </div>
            )}

            {view === 'grid' && (
              <div className="grid grid-cols-3 gap-4 py-2">
                {projects.map((x,i) => <div key={x.id} onClick={() => go(i)} className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${i === active ? 'ring-2 ring-white/50 scale-105' : 'hover:scale-102 opacity-60 hover:opacity-100'}`} style={{ boxShadow: i === active ? `0 15px 30px -8px ${x.color}40` : 'none' }}><div className="aspect-video"><Screen gradient={x.gradient} title={x.name} stats={x.stats} /></div><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><div><div className="text-[10px] font-bold tracking-wider mb-0.5" style={{ color: x.color }}>{x.category}</div><div className="text-sm font-bold">{x.name}</div></div></div></div>)}
              </div>
            )}
          </div>
        </main>
        <footer className="p-3 text-center"><p className="text-zinc-600 text-[10px] tracking-[0.2em]">PROTECT EXCELLENCE • EMPOWER INNOVATION</p></footer>
      </div>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }`}</style>
    </div>
  );
}
