'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  LayoutDashboard,
  MessageSquare,
  Database,
  Radio,
  Download,
  AlertTriangle,
  Users,
  Settings,
  LogOut,
  Building2,
  Home,
  Globe,
} from 'lucide-react';
import { supabase } from '@/lib/kea/supabase-client';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { useKeaLang, localeConfig, useT, type KeaLocale, type TranslationKey } from '@/lib/kea/i18n';
import Image from 'next/image';

const pageTitles: Record<string, string> = {
  '/kea/dashboard': 'Dashboard',
  '/kea/chat': 'Chat',
  '/kea/dashboard/schemas': 'Schema Builder',
  '/kea/dashboard/monitor': 'Live Monitor',
  '/kea/dashboard/export': 'Export Data',
  '/kea/dashboard/alerts': 'Alerts',
  '/kea/dashboard/users': 'User Management',
  '/kea/dashboard/clients': 'Clients',
  '/kea/dashboard/settings': 'Settings',
  '/kea/onboarding': 'Setup',
};

const navItems: { section: TranslationKey; items: { nameKey: TranslationKey; href: string; icon: typeof LayoutDashboard }[] }[] = [
  { section: 'nav.section.main', items: [
    { nameKey: 'nav.dashboard', href: '/kea/dashboard', icon: LayoutDashboard },
    { nameKey: 'nav.chat', href: '/kea/chat', icon: MessageSquare },
    { nameKey: 'nav.clients', href: '/kea/dashboard/clients', icon: Building2 },
  ]},
  { section: 'nav.section.data', items: [
    { nameKey: 'nav.schemas', href: '/kea/dashboard/schemas', icon: Database },
    { nameKey: 'nav.monitor', href: '/kea/dashboard/monitor', icon: Radio },
    { nameKey: 'nav.export', href: '/kea/dashboard/export', icon: Download },
  ]},
  { section: 'nav.section.manage', items: [
    { nameKey: 'nav.alerts', href: '/kea/dashboard/alerts', icon: AlertTriangle },
    { nameKey: 'nav.users', href: '/kea/dashboard/users', icon: Users },
    { nameKey: 'nav.settings', href: '/kea/dashboard/settings', icon: Settings },
  ]},
];

const locales: KeaLocale[] = ['en', 'bg', 'es'];

export function Header() {
  const pathname = usePathname();
  const organization = useAuthStore((s) => s.organization);
  const user = useAuthStore((s) => s.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useKeaLang();
  const t = useT();

  const title = pageTitles[pathname] || 'KEA';

  // Close menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    if (menuOpen || langOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen, langOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/kea/login';
  };

  return (
    <header className="h-14 border-b border-white/[0.06] bg-[#050510]/80 backdrop-blur-xl flex items-center justify-between px-5 sticky top-0 z-40">
      {/* Left: Menu + Logo + Home */}
      <div className="flex items-center gap-3">
        {/* Menu button */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              menuOpen
                ? 'bg-white/[0.08] border border-white/[0.12] text-white'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10'
            }`}
          >
            <Menu size={16} />
          </button>

          {/* Dropdown Navigation */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-12 w-[260px] rounded-2xl bg-[#111118] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-blue-400">
                      {user?.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{user?.full_name || 'User'}</p>
                    <p className="text-[10px] text-white/25 truncate">{organization?.name}</p>
                  </div>
                </div>

                {/* Nav sections */}
                <div className="py-2 max-h-[60vh] overflow-y-auto">
                  {navItems.map((section) => (
                    <div key={section.section}>
                      <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-white/20 uppercase tracking-widest">
                        {t(section.section)}
                      </p>
                      {section.items.map((item) => {
                        const isActive = pathname === item.href ||
                          (item.href !== '/kea/dashboard' && pathname.startsWith(item.href));
                        const Icon = item.icon;
                        return (
                          <Link key={item.href} href={item.href}>
                            <div className={`mx-2 px-3 py-2 rounded-lg flex items-center gap-3 transition-all ${
                              isActive
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                            }`}>
                              <Icon size={16} className="shrink-0" />
                              <span className="text-sm">{t(item.nameKey)}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-white/[0.06] p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full mx-0 px-3 py-2 rounded-lg flex items-center gap-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition-all"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">{t('nav.signout')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo */}
        <Link href="/kea/dashboard" className="flex items-center gap-2">
          <Image src="/img/kea-logo.png" alt="KEA" width={28} height={28} className="object-contain" />
          <span className="text-sm font-bold text-white tracking-wide hidden sm:inline">KEA</span>
        </Link>

        <div className="w-px h-6 bg-white/[0.06] mx-1" />

        {/* Home / page title */}
        <Link href="/kea/dashboard" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors">
          <Home size={14} />
          <span className="text-xs font-medium hidden sm:inline">{t('nav.home')}</span>
        </Link>

        {pathname !== '/kea/dashboard' && (
          <>
            <span className="text-white/15 text-xs">/</span>
            <span className="text-sm font-medium text-white">{title}</span>
          </>
        )}
      </div>

      {/* Right: Language + Search + Notifications */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <div ref={langRef} className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className={`h-9 px-2.5 rounded-xl flex items-center gap-1.5 transition-all text-xs font-medium ${
              langOpen
                ? 'bg-white/[0.08] border border-white/[0.12] text-white'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/70 hover:border-white/10'
            }`}
          >
            <Globe size={14} />
            <span>{localeConfig[locale].short}</span>
          </button>

          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-12 w-[160px] rounded-xl bg-[#111118] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                <div className="py-1.5">
                  {locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={`w-full px-3 py-2 flex items-center gap-2.5 text-sm transition-all ${
                        locale === loc
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-white/50 hover:bg-white/[0.04] hover:text-white/80'
                      }`}
                    >
                      <span className="text-base">{localeConfig[loc].flag}</span>
                      <span>{localeConfig[loc].label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/10 transition-all">
          <Search size={16} />
        </button>
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/10 transition-all">
          <Bell size={16} />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-[#050510]" />
        </button>
      </div>
    </header>
  );
}
