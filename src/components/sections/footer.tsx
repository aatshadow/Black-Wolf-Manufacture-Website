"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang, translations, localePath } from "@/lib/i18n";

export function Footer() {
  const lang = useLang();
  const t = translations.footer[lang];
  const nav = translations.nav[lang];

  return (
    <footer className="border-t border-white/[0.06] bg-[#050510]">
      <div className="mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href={localePath("/", lang)} className="mb-3 flex items-center gap-3 md:mb-4">
              <Image src="/img/logo.png" alt="BlackWolf" width={32} height={32} className="rounded-lg" />
              <span className="text-sm font-bold tracking-[0.2em] text-white">BLACKWOLF</span>
            </Link>
            <p className="text-xs leading-relaxed text-white/40 md:text-sm">
              {t.description}
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold text-white md:mb-4 md:text-sm">{t.company}</h4>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <Link href={localePath("/services", lang)} className="text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">{nav.services}</Link>
              <Link href={localePath("/showcase", lang)} className="text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">{nav.showcase}</Link>
              <Link href={localePath("/about", lang)} className="text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">{nav.about}</Link>
              <Link href={localePath("/contact", lang)} className="text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">{nav.contact}</Link>
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold text-white md:mb-4 md:text-sm">{t.getInTouch}</h4>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <Link href={localePath("/contact", lang)} className="text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">{t.bookCall}</Link>
              <a href="mailto:contact@blackwolfsec.io" className="break-all text-xs text-white/40 transition-colors hover:text-white/70 md:text-sm">
                contact@blackwolfsec.io
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 md:mt-16 md:flex-row md:gap-4 md:pt-8">
          <span className="text-[10px] text-white/20 md:text-xs">{t.copyright}</span>
          <span className="text-[10px] text-white/20 md:text-xs">{t.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
