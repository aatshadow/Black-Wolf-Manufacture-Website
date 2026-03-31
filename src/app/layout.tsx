import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/ui/site-shell";
import { LangFromPath } from "@/lib/i18n";

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
        <LangFromPath>
          <SiteShell>{children}</SiteShell>
        </LangFromPath>
      </body>
    </html>
  );
}
