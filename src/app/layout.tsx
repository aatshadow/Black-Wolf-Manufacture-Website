import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { CursorFollower } from "@/components/ui/cursor-follower";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CinematicIntro } from "@/components/ui/cinematic-intro";
import { SpaceBackground } from "@/components/ui/space-background";
import { ScrollNavigator } from "@/components/ui/page-transition";
import { AIChatWidget } from "@/components/ui/ai-chat-widget";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BLACKWOLF — Digital Infrastructure for Manufacturing",
  description:
    "All-in-one digital infrastructure for manufacturing companies. Operations, security, and intelligence — implemented in 5 weeks.",
  icons: { icon: "/img/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#050510] text-[#E4E4E7] antialiased`} suppressHydrationWarning>
        <CinematicIntro />
        <SpaceBackground />
        <CursorFollower />
        <ScrollProgress />
        <ScrollNavigator />
        <div className="grain-overlay" />
        <Navbar />
        <main className="relative z-10">{children}</main>
        <Footer />
        <AIChatWidget />
      </body>
    </html>
  );
}
