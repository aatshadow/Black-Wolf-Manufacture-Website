"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[200] h-[2px] origin-left bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400"
      style={{ scaleX }}
    />
  );
}
