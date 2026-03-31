'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/sections/navbar';
import { Footer } from '@/components/sections/footer';
import { CursorFollower } from '@/components/ui/cursor-follower';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { SpaceBackground } from '@/components/ui/space-background';
import { ScrollNavigator } from '@/components/ui/page-transition';
import { AIChatWidget } from '@/components/ui/ai-chat-widget';

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKea = pathname.startsWith('/kea');

  if (isKea) {
    // KEA pages handle their own layout — render children only
    return <>{children}</>;
  }

  return (
    <>
      <SpaceBackground />
      <CursorFollower />
      <ScrollProgress />
      <ScrollNavigator />
      <div className="grain-overlay" />
      <Navbar />
      <main className="relative z-10">{children}</main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
