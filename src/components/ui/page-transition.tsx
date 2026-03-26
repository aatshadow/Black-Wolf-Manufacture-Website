"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const PAGE_ORDER = ["/", "/services", "/showcase", "/about", "/contact"];

export function ScrollNavigator() {
  const pathname = usePathname();
  const router = useRouter();
  const isTransitioning = useRef(false);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const scrollAccumulator = useRef(0);

  const currentIndex = PAGE_ORDER.indexOf(pathname);

  const navigate = useCallback(
    (dir: number) => {
      if (isTransitioning.current) return;
      const nextIndex = currentIndex + dir;
      if (nextIndex < 0 || nextIndex >= PAGE_ORDER.length) return;

      isTransitioning.current = true;
      router.push(PAGE_ORDER[nextIndex]);
    },
    [currentIndex, router]
  );

  // Reset transition lock after pathname changes
  useEffect(() => {
    const timer = setTimeout(() => {
      isTransitioning.current = false;
      scrollAccumulator.current = 0;
    }, 1200);
    window.scrollTo(0, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (currentIndex === -1) return;

    const SCROLL_THRESHOLD = 120;
    const COOLDOWN = 1000;

    const handleWheel = (e: WheelEvent) => {
      if (isTransitioning.current) return;

      const now = Date.now();
      if (now - lastScrollTime.current < COOLDOWN) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (e.deltaY > 0 && atBottom) {
        scrollAccumulator.current += Math.abs(e.deltaY);
        if (scrollAccumulator.current >= SCROLL_THRESHOLD) {
          lastScrollTime.current = now;
          scrollAccumulator.current = 0;
          navigate(1);
        }
      } else if (e.deltaY < 0 && atTop) {
        scrollAccumulator.current += Math.abs(e.deltaY);
        if (scrollAccumulator.current >= SCROLL_THRESHOLD) {
          lastScrollTime.current = now;
          scrollAccumulator.current = 0;
          navigate(-1);
        }
      } else {
        scrollAccumulator.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioning.current) return;

      const now = Date.now();
      if (now - lastScrollTime.current < COOLDOWN) return;

      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 80) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const atTop = scrollTop <= 10;

      if (diff > 0 && atBottom) {
        lastScrollTime.current = now;
        navigate(1);
      } else if (diff < 0 && atTop) {
        lastScrollTime.current = now;
        navigate(-1);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [currentIndex, navigate]);

  // Page position indicator
  if (currentIndex === -1) return null;

  return (
    <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2 md:right-6">
      {PAGE_ORDER.map((path, i) => (
        <button
          key={path}
          onClick={() => {
            if (i !== currentIndex && !isTransitioning.current) {
              isTransitioning.current = true;
              router.push(path);
            }
          }}
          className="group relative flex h-6 w-6 items-center justify-center"
          title={path === "/" ? "Home" : path.slice(1).charAt(0).toUpperCase() + path.slice(2)}
        >
          <motion.div
            animate={{
              scale: i === currentIndex ? 1 : 0.6,
              opacity: i === currentIndex ? 1 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            className={`h-2 w-2 rounded-full transition-colors ${
              i === currentIndex
                ? "bg-blue-500"
                : "bg-white/40 group-hover:bg-white/60"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
