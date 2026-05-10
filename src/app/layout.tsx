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
  // Meta verification tag para Business Verification en Meta Business Manager.
  // Reemplazar "REPLACE-ME-WITH-META-CODE" por el código real que Meta proporcione
  // al añadir el dominio (Business Settings → Brand Safety → Domains → Verify).
  // Alternativa más simple: verificar por DNS TXT record en Cloudflare (no requiere
  // este meta tag). Ver SETUP-METAVERIFY.md en el root del repo ejambre.
  verification: {
    other: {
      "facebook-domain-verification": "REPLACE-ME-WITH-META-CODE",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-[#050510] text-[#E4E4E7] antialiased`} suppressHydrationWarning>
        {/* Catch Supabase auth redirect tokens in URL hash and redirect to KEA */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            if (window.location.hash && window.location.hash.includes('access_token')) {
              window.location.href = '/kea/dashboard' + window.location.hash;
            }
          })();
        `}} />
        <LangFromPath>
          <SiteShell>{children}</SiteShell>
        </LangFromPath>
      </body>
    </html>
  );
}
