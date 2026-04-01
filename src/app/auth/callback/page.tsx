'use client';

import { useEffect } from 'react';

export default function AuthCallbackPage() {
  useEffect(() => {
    // Supabase sends the token in the URL hash after email confirmation
    // Redirect to KEA dashboard
    window.location.href = '/kea/dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <p className="text-white/40 text-sm">Redirecting...</p>
    </div>
  );
}
