'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import '../globals-kea.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#050510] flex items-center justify-center overflow-hidden">
      {/* Mesh background */}
      <div className="kea-mesh-bg" />
      <div className="kea-mesh-lines" />

      {/* Floating orbs */}
      <div className="fixed top-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-blue-500/[0.03] blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          {/* KEA Logo */}
          <div className="relative w-20 h-20 mb-2">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-800/10 border border-white/10 backdrop-blur-sm" />
            <div className="absolute inset-[3px] rounded-2xl bg-[#0a0a1a] flex items-center justify-center">
              <span className="text-3xl font-black bg-gradient-to-b from-blue-400 to-white/60 bg-clip-text text-transparent tracking-tight">K</span>
            </div>
            <div className="absolute inset-[-2px] rounded-2xl border border-blue-500/20 kea-glow" />
          </div>

          <h1 className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            KEA
          </h1>
          <p className="text-xs tracking-[0.3em] text-white/30 uppercase mt-1">
            Knowledge Extraction Engine
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="kea-card p-8"
        >
          {children}
        </motion.div>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Powered by Black Wolf
          </Link>
        </motion.div>
      </div>

      {/* Grain overlay */}
      <div className="grain-overlay" />
    </div>
  );
}
