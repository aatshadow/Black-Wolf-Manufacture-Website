import React, { useState, useEffect } from 'react';

const projects = [
  {
    id: 1,
    name: "Detrás de Cámara",
    subtitle: "Full Company Automation Platform",
    category: "CLIENT PLATFORM",
    color: "#F97316",
    gradient: "from-orange-500 to-amber-500",
    description: "Multi-tenant SaaS • Real-time sales intelligence • AI-powered reporting",
    stats: ["3 Deployments", "€300k+ tracked", "7 team members"]
  },
  {
    id: 2,
    name: "Blackwolf SOC",
    subtitle: "Security Operations Center", 
    category: "SECURITY DIVISION",
    color: "#EF4444",
    gradient: "from-red-500 to-rose-500",
    description: "Enterprise-grade threat monitoring • SIGMA rules • UEBA • AI Agent",
    stats: ["154K+ threats", "11 sensors", "Real-time"]
  },
  {
    id: 3,
    name: "Game of Life",
    subtitle: "Gamified Life Operating System",
    category: "PROPRIETARY SAAS",
    color: "#3B82F6",
    gradient: "from-blue-500 to-cyan-500",
    description: "HP/XP/Levels • Health, Finance, Productivity integrated • Privacy-first",
    stats: ["Life OS", "Gamification", "Data sovereignty"]
  },
  {
    id: 4,
    name: "TaskFlow",
    subtitle: "AI-Powered Task Management",
    category: "PROPRIETARY PRODUCT", 
    color: "#8B5CF6",
    gradient: "from-violet-500 to-purple-500",
    description: "Discord AI agent • Zero-friction capture • Full team visibility",
    stats: ["AI Discord bot", "Calendar sync", "Role-based"]
  },
  {
    id: 5,
    name: "FBA Academy Pro",
    subtitle: "High-Ticket VSL Funnel",
    category: "LEAD GENERATION",
    color: "#F59E0B",
    gradient: "from-amber-500 to-yellow-500",
    description: "Conversion-optimized • Video-first engagement • Social proof",
    stats: ["65 stores", "€300k/month", "5000+ students"]
  }
];

// Floating MacBook mockup
const MacBookMockup = ({ children, className = "", float = true }) => (
  <div 
    className={`relative ${className}`}
    style={float ? { animation: 'float 6s ease-in-out infinite' } : {}}
  >
    <div className="relative">
      {/* Screen bezel */}
      <div className="bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 rounded-t-2xl p-3 shadow-2xl">
        {/* Camera notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-zinc-900 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-zinc-700" />
        </div>
        {/* Screen */}
        <div className="bg-zinc-950 rounded-lg overflow-hidden">
          <div className="aspect-[16/10] relative">
            {children}
            {/* Screen glare */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
      {/* Base */}
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-b-sm" />
        <div className="absolute inset-x-8 top-2 h-2 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-b-lg" />
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-zinc-500 rounded-b-lg" />
      </div>
    </div>
    {/* Shadow */}
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/30 blur-xl rounded-full" />
  </div>
);

// iPhone mockup
const IPhoneMockup = ({ children, className = "", float = true }) => (
  <div 
    className={`relative ${className}`}
    style={float ? { animation: 'float 6s ease-in-out infinite 0.5s' } : {}}
  >
    <div className="relative bg-zinc-900 rounded-[3rem] p-2 shadow-2xl border-4 border-zinc-800">
      {/* Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-10" />
      {/* Screen */}
      <div className="bg-black rounded-[2.5rem] overflow-hidden">
        <div className="aspect-[9/19.5] relative">
          {children}
        </div>
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
    </div>
  </div>
);

// Floating orb background
const GlowOrb = ({ color, size = "lg", position }) => {
  const sizes = { sm: "w-48 h-48", md: "w-72 h-72", lg: "w-96 h-96", xl: "w-[500px] h-[500px]" };
  return (
    <div 
      className={`absolute ${sizes[size]} rounded-full blur-3xl opacity-30 transition-all duration-1000`}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, ...position }}
    />
  );
};

// App screen placeholder with gradient
const AppScreen = ({ gradient, title, stats }) => (
  <div className={`w-full h-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center p-4`}>
    <div className="text-white/90 font-bold text-lg mb-2">{title}</div>
    <div className="flex gap-2 flex-wrap justify-center">
      {stats?.map((stat, i) => (
        <div key={i} className="bg-black/30 backdrop-blur px-3 py-1 rounded-full text-white/80 text-xs">
          {stat}
        </div>
      ))}
    </div>
  </div>
);

export default function BlackwolfShowcase() {
  const [activeProject, setActiveProject] = useState(0);
  const [viewMode, setViewMode] = useState('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const project = projects[activeProject];

  // Auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveProject(prev => (prev + 1) % projects.length);
        setTimeout(() => setIsTransitioning(false), 100);
      }, 400);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const changeProject = (index) => {
    if (index === activeProject) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveProject(index);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden relative font-sans">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
        <GlowOrb color={project.color} size="xl" position={{ top: '-10%', left: '-10%' }} />
        <GlowOrb color={project.color} size="lg" position={{ bottom: '-5%', right: '-5%' }} />
        
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/20">
              <span className="text-black font-black text-xl">B</span>
            </div>
            <div>
              <div className="text-lg font-bold tracking-[0.2em]">BLACKWOLF</div>
              <div className="text-[10px] text-zinc-500 tracking-widest">PROJECT SHOWCASE</div>
            </div>
          </div>
          
          {/* View toggle */}
          <div className="flex bg-zinc-900/80 backdrop-blur rounded-full p-1 border border-zinc-800">
            {['hero', 'devices', 'grid'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  viewMode === mode 
                    ? 'bg-white text-black shadow-lg' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center px-8 pb-8">
          <div className="w-full max-w-7xl mx-auto">
            
            {/* Hero View */}
            {viewMode === 'hero' && (
              <div className="flex items-center gap-16">
                {/* Left: Info */}
                <div className={`flex-1 transition-all duration-500 ${isTransitioning ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>
                  <div 
                    className="text-xs font-bold tracking-[0.3em] mb-4"
                    style={{ color: project.color }}
                  >
                    {project.category}
                  </div>
                  <h1 className="text-6xl font-black mb-3 leading-none">
                    {project.name}
                  </h1>
                  <p className="text-2xl text-zinc-400 mb-6">
                    {project.subtitle}
                  </p>
                  <p className="text-zinc-500 mb-8 max-w-md">
                    {project.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex gap-3 mb-12">
                    {project.stats.map((stat, i) => (
                      <div 
                        key={i}
                        className="px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/50 text-sm"
                      >
                        {stat}
                      </div>
                    ))}
                  </div>

                  {/* Progress dots */}
                  <div className="flex gap-2">
                    {projects.map((p, i) => (
                      <button
                        key={p.id}
                        onClick={() => changeProject(i)}
                        className={`h-2 rounded-full transition-all duration-500 ${
                          i === activeProject ? 'w-10' : 'w-2 hover:w-4'
                        }`}
                        style={{ 
                          backgroundColor: i === activeProject ? project.color : 'rgba(255,255,255,0.2)'
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Right: Floating mockups */}
                <div className={`flex-1 relative h-[500px] transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-90 rotate-3' : 'opacity-100 scale-100 rotate-0'}`}>
                  <div 
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ perspective: '2000px' }}
                  >
                    {/* Main MacBook */}
                    <MacBookMockup className="w-[500px]">
                      <AppScreen 
                        gradient={project.gradient} 
                        title={project.name}
                        stats={project.stats}
                      />
                    </MacBookMockup>

                    {/* Floating iPhone */}
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                      <IPhoneMockup className="w-32">
                        <AppScreen 
                          gradient={project.gradient}
                          title=""
                        />
                      </IPhoneMockup>
                    </div>

                    {/* Decorative elements */}
                    <div 
                      className="absolute -left-8 top-8 w-20 h-20 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur"
                      style={{ animation: 'float 8s ease-in-out infinite 1s' }}
                    />
                    <div 
                      className="absolute right-12 -bottom-4 w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900/30 backdrop-blur"
                      style={{ animation: 'float 7s ease-in-out infinite 0.5s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Devices View - Isometric */}
            {viewMode === 'devices' && (
              <div className="flex items-center justify-center py-8">
                <div 
                  className="relative"
                  style={{ 
                    transform: 'perspective(2000px) rotateX(10deg) rotateY(-20deg)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {projects.map((p, i) => (
                    <div
                      key={p.id}
                      onClick={() => changeProject(i)}
                      className={`absolute w-80 rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer ${
                        i === activeProject 
                          ? 'border-white/30 shadow-2xl z-50' 
                          : 'border-zinc-800 opacity-60 hover:opacity-80'
                      }`}
                      style={{
                        transform: `
                          translateZ(${(i - activeProject) * 80}px) 
                          translateX(${(i - activeProject) * 60}px)
                          translateY(${(i - activeProject) * 30}px)
                        `,
                        boxShadow: i === activeProject ? `0 40px 80px -20px ${p.color}50` : 'none'
                      }}
                    >
                      <div className="aspect-video">
                        <AppScreen gradient={p.gradient} title={p.name} stats={p.stats} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-3 gap-6 py-4">
                {projects.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => changeProject(i)}
                    className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                      i === activeProject 
                        ? 'ring-2 ring-white/50 scale-105' 
                        : 'hover:scale-102 opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      boxShadow: i === activeProject ? `0 20px 40px -10px ${p.color}40` : 'none'
                    }}
                  >
                    <div className="aspect-video">
                      <AppScreen gradient={p.gradient} title={p.name} stats={p.stats} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div>
                        <div className="text-xs font-bold tracking-wider mb-1" style={{ color: p.color }}>
                          {p.category}
                        </div>
                        <div className="font-bold">{p.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center">
          <p className="text-zinc-600 text-sm tracking-[0.2em]">
            PROTECT EXCELLENCE • EMPOWER INNOVATION
          </p>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
