"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  company: string;
  metric?: string;
};

export function AnimatedTestimonials({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) {
  const [active, setActive] = useState(0);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 6000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 md:px-8">
      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        {/* Left: Visual */}
        <div className="relative flex items-center justify-center">
          <div className="relative h-72 w-full max-w-md md:h-80">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, scale: 0.9, rotate: Math.random() * 10 - 5 }}
                  animate={{
                    opacity: index === active ? 1 : 0.5,
                    scale: index === active ? 1 : 0.9,
                    rotate: index === active ? 0 : Math.random() * 10 - 5,
                    zIndex: index === active ? 10 : testimonials.length - index,
                    y: index === active ? [0, -20, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-white/5 to-transparent p-8 backdrop-blur-sm">
                    <div className="mb-4 text-6xl font-black text-blue-500/30">&ldquo;</div>
                    {testimonial.metric && (
                      <div className="mb-2 text-4xl font-black text-blue-500">{testimonial.metric}</div>
                    )}
                    <div className="text-center text-sm text-white/60">{testimonial.company}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex flex-col justify-between py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <h3 className="text-2xl font-bold text-white">{testimonials[active].name}</h3>
            <p className="text-sm text-blue-400">{testimonials[active].designation}</p>
            <p className="text-xs text-white/40">{testimonials[active].company}</p>
            <motion.p className="mt-8 text-lg leading-relaxed text-white/70">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut", delay: 0.02 * index }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          <div className="flex gap-4 pt-12 md:pt-0">
            <button
              onClick={handlePrev}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <IconArrowLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
            >
              <IconArrowRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
