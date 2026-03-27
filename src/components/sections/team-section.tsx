"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useLang, translations } from "@/lib/i18n";

const leaderImages = ["/img/team/ceo.jpg", "/img/team/cto.jpg", "/img/team/bd.jpg"];

export function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const lang = useLang();
  const t = translations.team[lang];

  return (
    <section className="relative bg-transparent py-16 md:py-32" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 text-center md:mb-16"
        >
          <h2 className="mb-3 text-[clamp(24px,3.5vw,48px)] font-light tracking-[-0.02em] text-white md:mb-4">
            {t.title}
          </h2>
          <p className="text-sm text-white/40 md:text-base">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Leadership — 3 columns */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-12 md:gap-6 lg:grid-cols-3">
          {t.leadership.map((member, i) => {
            const image = leaderImages[i];
            return (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="group flex flex-col items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center transition-all hover:bg-white/[0.04] md:p-8"
              >
                {/* Photo */}
                <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-white/[0.08] md:h-32 md:w-32">
                  <Image
                    src={image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>

                <h3 className="mb-0.5 text-lg font-medium text-white">{member.name}</h3>
                <p className="mb-3 text-xs font-medium tracking-wide text-blue-400/70">{member.role}</p>
                <p className="mb-5 text-sm leading-relaxed text-white/45">{member.description}</p>

                <div className="mt-auto flex flex-wrap justify-center gap-1.5">
                  {member.credentials.map((cred) => (
                    <span
                      key={cred}
                      className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[10px] text-white/45"
                    >
                      {cred}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Tech Team Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-blue-600/[0.06] via-white/[0.02] to-blue-600/[0.06] p-6 md:p-8"
        >
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:gap-8 md:text-left">
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-medium text-white md:text-xl">
                {t.engTitle}
              </h3>
              <p className="text-sm leading-relaxed text-white/50">
                {t.engDesc}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:flex-col md:gap-2">
              {t.techCreds.map((cred) => (
                <div
                  key={cred}
                  className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-600/[0.08] px-3.5 py-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500/60" />
                  <span className="text-xs font-medium text-blue-400/80">{cred}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
