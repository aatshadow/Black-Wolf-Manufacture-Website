'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/kea/dashboard/clients');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-white/30">Redirecting to Clients...</p>
    </div>
  );
}
