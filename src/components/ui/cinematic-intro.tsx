"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import Image from "next/image";
import { useLang, translations } from "@/lib/i18n";

type CinematicT = (typeof translations.cinematic)[keyof typeof translations.cinematic];

/* ─── TRANSITION GRAPHIC ─── */
function TransitionLine() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 0.6, 0.6, 0] }}
      transition={{ duration: 0.8, times: [0, 0.3, 0.7, 1] }}
      className="absolute left-[10%] right-[10%] top-1/2 z-30 h-[1px] origin-left bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
    />
  );
}

/* ─── SCENE COMPONENTS ─── */

function Scene1({ t }: { t: CinematicT }) {
  const words = t.scene1.split(" ");
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.3 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block text-4xl font-normal tracking-tight text-white md:text-6xl"
            style={{ marginRight: "0.3em" }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function Scene2({ t }: { t: CinematicT }) {
  const painWords = t.scene2words;
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      <motion.p
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-xl font-normal text-white/80 md:text-3xl"
      >
        {t.scene2intro}
      </motion.p>
      <div className="flex flex-col items-center gap-3 md:flex-row md:gap-8">
        {painWords.map((word, i) => (
          <motion.span
            key={word}
            initial={{ opacity: 0, x: 50, filter: "blur(6px)" }}
            animate={{
              opacity: 1,
              x: [50, -4, 2, 0],
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.6,
              delay: 0.8 + i * 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-3xl font-semibold text-blue-400 md:text-5xl"
          >
            {word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

function Scene3({ t }: { t: CinematicT }) {
  const lines = [
    { text: t.scene3[0], from: "left" },
    { text: t.scene3[1], from: "right" },
  ];
  return (
    <div className="flex flex-col items-center gap-5 md:gap-8">
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, x: line.from === "left" ? -60 : 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3 + i * 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`text-center text-xl font-normal md:text-3xl ${
            i === 1 ? "text-white" : "text-white/70"
          }`}
        >
          {line.text}
        </motion.p>
      ))}
    </div>
  );
}

function Scene4({ t }: { t: CinematicT }) {
  return (
    <div className="flex flex-col items-center gap-5 md:gap-8">
      <motion.p
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-2xl font-normal text-white md:text-4xl"
      >
        {t.scene4a}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 0.8, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-base font-normal text-white/60 md:text-xl"
      >
        {t.scene4b}
      </motion.p>
    </div>
  );
}

function CostCounter({ counterText }: { counterText: string }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");
  const targetRef = useRef(999999);

  useEffect(() => {
    // Never stops — keeps climbing until scene changes
    const controls = animate(motionVal, targetRef.current, {
      duration: 30,
      delay: 0.8,
      ease: "linear",
      onUpdate: (v) => setDisplay(Math.floor(v).toLocaleString("en-US")),
    });
    return controls.stop;
  }, [motionVal]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="relative flex flex-col items-center gap-3"
    >
      <motion.div
        animate={{ opacity: [0, 0.12, 0.25], scale: [0.8, 1.1, 1.3] }}
        transition={{ duration: 4, delay: 1 }}
        className="absolute -inset-16 rounded-full bg-blue-600 blur-[100px] md:-inset-20"
      />
      <span className="relative text-5xl font-normal tabular-nums text-blue-400 md:text-7xl">
        €{display}
      </span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1.5 }}
        className="relative text-base text-white/50 md:text-lg"
      >
        {counterText}
      </motion.span>
    </motion.div>
  );
}

function Scene5({ t }: { t: CinematicT }) {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-10">
      <motion.p
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-2xl font-normal text-white md:text-4xl"
      >
        {t.scene5}
      </motion.p>
      <CostCounter counterText={t.scene5counter} />
    </div>
  );
}

function Scene6({ t }: { t: CinematicT }) {
  const modules = t.scene6modules.map((m, i) => ({ ...m, delay: 1.0 + i * 0.4 }));
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      <motion.p
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-2xl font-normal text-white md:text-4xl"
      >
        {t.scene6title}
      </motion.p>
      <div className="flex w-full max-w-lg flex-col gap-3 md:max-w-xl md:gap-4">
        {modules.map((mod, i) => (
          <motion.div
            key={mod.tag}
            initial={{
              opacity: 0,
              x: i % 2 === 0 ? -40 : 40,
              y: 10,
            }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: mod.delay, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-4"
          >
            <span className="w-14 shrink-0 rounded-lg border border-blue-500/30 bg-blue-600/[0.15] py-1.5 text-center text-sm font-bold text-blue-400 md:w-16 md:text-base">
              {mod.tag}
            </span>
            <span className="text-sm font-normal text-white/70 md:text-base">
              {mod.desc}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Scene7({ t }: { t: CinematicT }) {
  return (
    <div className="flex flex-col items-center gap-5 md:gap-6">
      <motion.p
        initial={{ opacity: 0, filter: "blur(12px)" }}
        animate={{ opacity: 1, filter: "blur(0px)", x: [0, -3, 4, -2, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-center text-3xl font-normal text-white md:text-5xl"
      >
        {t.scene7a}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="text-center text-base font-normal text-white/50 md:text-lg"
      >
        {t.scene7b}
      </motion.p>
    </div>
  );
}

function Scene8({ t }: { t: CinematicT }) {
  return (
    <div className="flex flex-col items-center gap-5 md:gap-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <div className="h-24 w-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm md:h-28 md:w-28">
          <Image src="/img/logo.png" alt="BlackWolf" width={112} height={112} className="h-full w-full object-contain" />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3] }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute -inset-12 rounded-full bg-blue-600/20 blur-[60px]"
        />
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
      />
      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center text-3xl font-normal tracking-tight text-white md:text-5xl"
      >
        {t.scene8a}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="text-sm tracking-[0.25em] text-white/50 md:text-base"
      >
        {t.scene8b}
      </motion.p>
    </div>
  );
}

/* ─── SCENE CONFIG ─── */

const scenes = [
  { id: "hook", duration: 3500, component: Scene1 },
  { id: "pain", duration: 4500, component: Scene2 },
  { id: "deeper", duration: 4500, component: Scene3 },
  { id: "trap", duration: 4000, component: Scene4 },
  { id: "cost", duration: 5000, component: Scene5 },
  { id: "solution", duration: 5500, component: Scene6 },
  { id: "edge", duration: 3500, component: Scene7 },
  { id: "blackwolf", duration: 3500, component: Scene8 },
];

/* ─── AMBIENT ELEMENTS (CSS only for performance) ─── */

/* ─── MAIN COMPONENT ─── */

export function CinematicIntro() {
  const [currentScene, setCurrentScene] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const lang = useLang();
  const ct = translations.cinematic[lang];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("bw-intro-seen")) {
      setVisible(false);
      return;
    }
    setMounted(true);
    document.body.style.overflow = "hidden";
  }, []);

  const skip = useCallback(() => {
    sessionStorage.setItem("bw-intro-seen", "1");
    document.body.style.overflow = "";
    setVisible(false);
  }, []);

  // Scene progression
  useEffect(() => {
    if (!mounted || !visible) return;
    const timer = setTimeout(() => {
      if (currentScene < scenes.length - 1) {
        // Show transition graphic
        setShowTransition(true);
        setTimeout(() => {
          setCurrentScene((prev) => prev + 1);
          setShowTransition(false);
        }, 400);
      } else {
        skip();
      }
    }, scenes[currentScene].duration);
    return () => clearTimeout(timer);
  }, [currentScene, mounted, visible, skip]);

  // Keyboard skip
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") skip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, skip]);

  if (!visible) return null;
  if (!mounted) {
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#050510]" />
    );
  }

  const SceneComponent = scenes[currentScene].component;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-[#050510]"
        >
          {/* Space background — CSS only, matching the main site */}
          <div className="absolute inset-0" style={{
            background:
              "radial-gradient(ellipse 120% 80% at 30% 20%, rgba(15,23,60,0.6) 0%, transparent 60%), " +
              "radial-gradient(ellipse 100% 60% at 70% 80%, rgba(10,15,50,0.5) 0%, transparent 50%)",
          }} />
          <div
            className="absolute left-[25%] top-[20%] h-[700px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[200px] will-change-transform animate-[nebulaPulse_12s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.5) 0%, rgba(30,58,95,0.3) 50%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[10%] right-[15%] h-[600px] w-[600px] rounded-full blur-[180px] will-change-transform animate-[nebulaPulse_16s_ease-in-out_3s_infinite]"
            style={{ background: "radial-gradient(circle, rgba(88,28,235,0.4) 0%, rgba(30,64,175,0.2) 50%, transparent 70%)" }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,16,0.7)_85%,#050510_100%)]" />

          {/* Letterbox bars */}
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-x-0 top-0 z-10 h-[6%] origin-top bg-black/60"
          />
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute inset-x-0 bottom-0 z-10 h-[6%] origin-bottom bg-black/60"
          />

          {/* Transition graphic */}
          <AnimatePresence>
            {showTransition && <TransitionLine key="transition" />}
          </AnimatePresence>

          {/* Scene content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 w-full max-w-3xl px-6 md:px-8"
            >
              <SceneComponent t={ct} />
            </motion.div>
          </AnimatePresence>

          {/* Progress bar */}
          <div className="absolute bottom-[8%] left-1/2 z-20 w-32 -translate-x-1/2 md:w-48">
            <div className="h-[2px] w-full bg-white/[0.08]">
              <motion.div
                className="h-full bg-blue-500/50"
                animate={{
                  width: `${((currentScene + 1) / scenes.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Scene counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-[8%] right-6 z-20 text-xs tracking-widest text-white/30 md:right-10 md:text-sm"
          >
            <span className="font-semibold text-white/50">
              0{currentScene + 1}
            </span>{" "}
            / 0{scenes.length}
          </motion.div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            onClick={skip}
            className="absolute right-6 top-[8%] z-20 rounded-full border border-white/15 px-5 py-2 text-xs tracking-wider text-white/40 transition-colors hover:border-white/25 hover:text-white/60 md:right-10 md:text-sm"
          >
            {ct.skip}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
