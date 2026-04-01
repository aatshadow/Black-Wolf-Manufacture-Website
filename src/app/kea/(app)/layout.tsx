'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/kea/supabase-client';
import { useAuthStore } from '@/lib/kea/stores/auth-store';
import { Header } from '@/components/kea/shared/Header';
import { Loader2 } from 'lucide-react';
import '../globals-kea.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setOrganization, setLoading, isLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      window.location.href = '/kea/onboarding';
      return;
    }

    setUser(profile);

    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (org) {
      setOrganization(org);
    }

    setLoading(false);
  }, [setUser, setOrganization, setLoading]);

  useEffect(() => {
    let mounted = true;

    // Check current session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (!session) {
        // No session — redirect to login
        setRedirecting(true);
        window.location.href = '/kea/login';
        return;
      }

      await loadProfile(session.user.id);
      setAuthChecked(true);
    });

    // Listen for auth state changes (login/logout while on page)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setRedirecting(true);
        window.location.href = '/kea/login';
        return;
      }

      if (session && authChecked) {
        await loadProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, authChecked]);

  // Show loading while checking auth
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center">
        <div className="kea-mesh-bg" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-white/10" />
            <div className="absolute inset-[3px] rounded-full bg-[#0a0a1a] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            </div>
          </div>
          <p className="text-sm text-white/30">
            {redirecting ? 'Redirecting...' : 'Loading KEA...'}
          </p>
        </div>
        <div className="grain-overlay" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050510]">
      <div className="kea-mesh-bg" />
      <div className="kea-mesh-lines" />

      <div className="relative z-10">
        <Header />
        <main className="px-6 py-6 max-w-[1400px] mx-auto">{children}</main>
      </div>

      <div className="grain-overlay" />
    </div>
  );
}
