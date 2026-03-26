"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

const clients: { name: string; logo?: string; textClass?: string }[] = [
  { name: "Instagram", textClass: "font-semibold italic tracking-tight" },
  { name: "Uber Eats", textClass: "font-bold tracking-tight" },
  { name: "NASA", textClass: "font-bold tracking-[0.15em]" },
  { name: "Kingly", textClass: "font-bold tracking-tight" },
  { name: "Favorit BG", textClass: "font-bold tracking-tight" },
  { name: "CreatorFounder", logo: "/img/logos/creatorfounder.png" },
  { name: "FBA Pro Academy", logo: "/img/logos/fba-academy.jpg" },
  { name: "studioOS", logo: "/img/logos/studioos.jpg" },
  { name: "Sales Capital", logo: "/img/logos/sales-capital.png" },
  { name: "Pedro Werbaum", logo: "/img/logos/pedro-werbaum.png" },
  { name: "EA", logo: "/img/logos/ea.png" },
];

export function LogoCloud() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="relative border-y border-white/[0.06] bg-transparent py-8 md:py-12" ref={ref}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <p className="mb-6 text-center text-[10px] font-medium tracking-[0.2em] text-white/20 md:mb-8 md:text-xs">
          TRUSTED BY
        </p>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050510] to-transparent md:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050510] to-transparent md:w-32" />

          <InfiniteSlider speed={35} speedOnHover={18} gap={60}>
            {clients.map((client, i) => (
              <div key={i} className="flex h-10 items-center px-4 md:h-12">
                {client.logo ? (
                  <div className="relative h-8 w-24 opacity-40 grayscale brightness-200 transition-all hover:opacity-70 hover:grayscale-0 md:h-10 md:w-28">
                    <Image
                      src={client.logo}
                      alt={client.name}
                      fill
                      className="object-contain"
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <span
                    className={`whitespace-nowrap text-lg text-white/30 transition-colors hover:text-white/50 md:text-xl ${client.textClass ?? ""}`}
                  >
                    {client.name}
                  </span>
                )}
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </motion.div>
    </section>
  );
}
