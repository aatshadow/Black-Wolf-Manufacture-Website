"use client";

import { useState, useEffect, useMemo } from "react";

function Starfield({ count, className }: { count: number; className?: string }) {
  const shadow = useMemo(() => {
    const stars: string[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.round(Math.random() * 2000);
      const y = Math.round(Math.random() * 2000);
      const bright = Math.random() > 0.85;
      const opacity = bright ? 0.5 + Math.random() * 0.5 : 0.08 + Math.random() * 0.2;
      stars.push(`${x}px ${y}px 0 rgba(255,255,255,${opacity.toFixed(2)})`);
      if (bright) {
        stars.push(`${x}px ${y}px ${2 + Math.random() * 3}px rgba(147,197,253,0.25)`);
      }
    }
    return stars.join(",");
  }, [count]);

  return (
    <div
      className={`absolute top-0 left-0 h-[1px] w-[1px] ${className ?? ""}`}
      style={{ boxShadow: shadow }}
    />
  );
}

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-0 bg-[#050510]" />;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Deep space base */}
      <div className="absolute inset-0 bg-[#050510]" />

      {/* Space gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 30% 20%, rgba(15,23,60,0.6) 0%, transparent 60%), " +
            "radial-gradient(ellipse 100% 60% at 70% 80%, rgba(10,15,50,0.5) 0%, transparent 50%)",
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.025,
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Nebulas — CSS animations (GPU accelerated) */}
      <div
        className="absolute left-[25%] top-[20%] h-[700px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px] will-change-transform animate-[nebulaPulse_12s_ease-in-out_infinite]"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.5) 0%, rgba(30,58,95,0.3) 50%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[10%] right-[15%] h-[600px] w-[600px] rounded-full blur-[180px] will-change-transform animate-[nebulaPulse_16s_ease-in-out_3s_infinite]"
        style={{ background: "radial-gradient(circle, rgba(88,28,235,0.4) 0%, rgba(30,64,175,0.2) 50%, transparent 70%)" }}
      />
      <div
        className="absolute right-[25%] top-[15%] h-[500px] w-[500px] rounded-full blur-[170px] will-change-transform animate-[nebulaPulse_20s_ease-in-out_6s_infinite]"
        style={{ background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(37,99,235,0.15) 50%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[35%] left-[8%] h-[400px] w-[400px] rounded-full blur-[150px] will-change-transform animate-[nebulaPulse_14s_ease-in-out_8s_infinite]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(37,99,235,0.15) 50%, transparent 70%)" }}
      />

      {/* Stars — box-shadow technique, zero JS animation overhead */}
      <Starfield count={100} className="animate-[twinkle_4s_ease-in-out_infinite]" />
      <Starfield count={60} className="animate-[twinkle_6s_ease-in-out_2s_infinite]" />

      {/* Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,16,0.7)_85%,#050510_100%)]" />
    </div>
  );
}
