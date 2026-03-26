"use client";

import { useEffect, useRef, useState } from "react";

export function CursorFollower() {
  const [mounted, setMounted] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const borderPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current;
    const border = borderRef.current;
    if (!dot || !border) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      dot.style.opacity = "1";
      border.style.opacity = "1";
    };

    const handleMouseEnter = () => {
      border.style.width = "48px";
      border.style.height = "48px";
    };
    const handleMouseLeave = () => {
      border.style.width = "32px";
      border.style.height = "32px";
    };

    window.addEventListener("mousemove", handleMouseMove);

    const interactiveElements = document.querySelectorAll("a, button, input, textarea, select, [role='button']");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    let animationId: number;
    const loop = () => {
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.2);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.2);
      borderPos.current.x = lerp(borderPos.current.x, mousePos.current.x, 0.1);
      borderPos.current.y = lerp(borderPos.current.y, mousePos.current.y, 0.1);

      dot.style.transform = `translate(${dotPos.current.x - 4}px, ${dotPos.current.y - 4}px)`;
      border.style.transform = `translate(${borderPos.current.x}px, ${borderPos.current.y}px) translate(-50%, -50%)`;

      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
      cancelAnimationFrame(animationId);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-2 w-2 rounded-full bg-blue-600 opacity-0 mix-blend-difference"
        style={{ transition: "opacity 0.3s", willChange: "transform" }}
      />
      <div
        ref={borderRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-blue-500/60 opacity-0 mix-blend-difference"
        style={{ transition: "width 0.3s, height 0.3s, opacity 0.3s", willChange: "transform" }}
      />
    </div>
  );
}
