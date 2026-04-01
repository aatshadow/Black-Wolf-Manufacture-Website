'use client';

import { useEffect } from 'react';

export default function SignupPage() {
  useEffect(() => {
    window.location.href = '/kea/login';
  }, []);

  return (
    <div className="text-center py-8">
      <p className="text-sm text-white/30">Redirecting...</p>
    </div>
  );
}
