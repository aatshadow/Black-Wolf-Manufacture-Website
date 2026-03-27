"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLang, translations, localePath } from "@/lib/i18n";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const pathname = usePathname();
  const lang = useLang();
  const t = translations.nav[lang];

  const navItems = [
    { name: t.home, href: localePath("/", lang) },
    { name: t.services, href: localePath("/services", lang) },
    { name: t.showcase, href: localePath("/showcase", lang) },
    { name: t.about, href: localePath("/about", lang) },
    { name: t.contact, href: localePath("/contact", lang) },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 h-[72px] transition-all duration-400 ${
          scrolled
            ? "bg-[#050510]/90 border-b border-white/[0.06] backdrop-blur-xl"
            : "bg-[#050510]/60 border-b border-transparent backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo.png" alt="BlackWolf" width={36} height={36} className="rounded-lg" />
            <span className="text-[16px] font-bold tracking-[0.2em] text-white">BLACKWOLF</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onMouseEnter={() => setHoveredTab(item.name)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className={`relative rounded-full px-4 py-2 text-[13px] font-medium tracking-wide transition-colors ${
                    isActive ? "text-white" : "text-white/45 hover:text-white/60"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/[0.06]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {hoveredTab === item.name && !isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 rounded-full bg-white/[0.04]"
                    />
                  )}
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href={localePath("/contact", lang)}
              className="rounded-full bg-blue-600 px-5 py-2 text-[13px] font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_24px_rgba(37,99,235,0.3)]"
            >
              {t.bookCall}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="flex flex-col gap-[5px] p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
              className="block h-[2px] w-[22px] rounded-full bg-white"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block h-[2px] w-[22px] rounded-full bg-white"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
              className="block h-[2px] w-[22px] rounded-full bg-white"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center gap-6 bg-[#050510]/95 backdrop-blur-xl md:hidden"
          >
            {navItems.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`text-2xl font-medium transition-colors ${
                    pathname === item.href ? "text-blue-500" : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                href={localePath("/contact", lang)}
                className="mt-4 rounded-full bg-blue-600 px-8 py-3 text-base font-semibold text-white"
              >
                {t.bookCall}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
