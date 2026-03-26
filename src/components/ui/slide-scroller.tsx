"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SlideScrollerProps {
  children: ReactNode[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function SlideScroller({ children }: SlideScrollerProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const touchStartY = useRef(0);
  const lastScrollTime = useRef(0);

  const total = children.length;

  const goTo = (index: number, dir: number) => {
    if (isTransitioning.current) return;
    if (index < 0 || index >= total) return;
    isTransitioning.current = true;
    setDirection(dir);
    setCurrent(index);
    setTimeout(() => {
      isTransitioning.current = false;
    }, 700);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime.current < 800) return;

      const delta = e.deltaY;
      if (Math.abs(delta) < 15) return;

      lastScrollTime.current = now;

      if (delta > 0 && current < total - 1) {
        goTo(current + 1, 1);
      } else if (delta < 0 && current > 0) {
        goTo(current - 1, -1);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastScrollTime.current < 800) return;

      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 50) return;

      lastScrollTime.current = now;

      if (diff > 0 && current < total - 1) {
        goTo(current + 1, 1);
      } else if (diff < 0 && current > 0) {
        goTo(current - 1, -1);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (current < total - 1) goTo(current + 1, 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (current > 0) goTo(current - 1, -1);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 200, damping: 30, mass: 1 },
            opacity: { duration: 0.3 },
          }}
          className="absolute inset-0 overflow-y-auto"
        >
          {children[current]}
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 md:right-6">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 1 : -1)}
            className="group relative flex h-6 w-6 items-center justify-center"
          >
            <motion.div
              animate={{
                scale: i === current ? 1 : 0.6,
                opacity: i === current ? 1 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === current ? "bg-blue-500" : "bg-white/40 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint on first slide */}
      {current === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-9 w-5 items-start justify-center rounded-full border border-white/15 p-1.5"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1 rounded-full bg-white/40"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
