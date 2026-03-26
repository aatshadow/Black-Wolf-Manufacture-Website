"use client";

import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useRef, useEffect, useState } from "react";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, target, {
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => setDisplay(Math.floor(v).toLocaleString()),
      });
      return controls.stop;
    }
  }, [isInView, count, target]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const stats = [
  { value: 5, suffix: "", label: "Weeks to Deploy" },
  { value: 0, suffix: "", label: "Security Monitoring", display: "24/7" },
  { value: 80, suffix: "%", label: "Operational Efficiency Gain", prefix: ">" },
  { value: 3, suffix: "", label: "Core Systems in One" },
];

export function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative border-y border-white/[0.06] bg-transparent py-12 md:py-20" ref={ref}>
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="mb-1 text-2xl font-light text-white md:mb-2 md:text-4xl">
                {stat.prefix || ""}
                {stat.display ? (
                  stat.display
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                )}
              </div>
              <div className="text-[10px] font-medium tracking-wide text-white/40 md:text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
