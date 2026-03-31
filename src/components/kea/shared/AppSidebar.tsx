'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  AlertTriangle,
  Users,
  Settings,
  Download,
  Radio,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/kea/supabase-client';
import { useAuthStore } from '@/lib/kea/stores/auth-store';

const navSections = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', href: '/kea/dashboard', icon: LayoutDashboard },
      { name: 'Chat', href: '/kea/chat', icon: MessageSquare },
    ],
  },
  {
    label: 'Data',
    items: [
      { name: 'Schemas', href: '/kea/dashboard/schemas', icon: Database },
      { name: 'Monitor', href: '/kea/dashboard/monitor', icon: Radio },
      { name: 'Export', href: '/kea/dashboard/export', icon: Download },
    ],
  },
  {
    label: 'Manage',
    items: [
      { name: 'Alerts', href: '/kea/dashboard/alerts', icon: AlertTriangle },
      { name: 'Users', href: '/kea/dashboard/users', icon: Users },
      { name: 'Settings', href: '/kea/dashboard/settings', icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const organization = useAuthStore((s) => s.organization);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/kea/login';
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="kea-sidebar fixed left-0 top-0 bottom-0 z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/[0.06]">
        <div className="relative w-9 h-9 shrink-0">
          <Image
            src="/img/kea-logo.png"
            alt="KEA"
            width={36}
            height={36}
            className="object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]"
          />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm font-bold text-white tracking-wide">KEA</p>
              <p className="text-[10px] text-white/25 tracking-widest uppercase">
                Knowledge Agent
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-2"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/kea/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`kea-sidebar-item ${isActive ? 'active' : ''} ${
                        collapsed ? 'justify-center px-0' : ''
                      }`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon size={18} className="shrink-0" />
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-white/[0.06] p-3 space-y-2">
        {/* User info */}
        <div
          className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/20 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-blue-400">
              {user?.full_name?.charAt(0) || '?'}
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0"
              >
                <p className="text-sm font-medium text-white/80 truncate">
                  {user?.full_name || 'User'}
                </p>
                <p className="text-[10px] text-white/25 truncate">
                  {organization?.name || 'Organization'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`kea-sidebar-item w-full text-red-400/50 hover:text-red-400 hover:bg-red-500/5 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 -right-3 w-6 h-6 rounded-full bg-[#0a0a1a] border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-blue-500/30 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
}
