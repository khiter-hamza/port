"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

const PHRASES = [
  "Initializing systems",
  "Compiling shaders",
  "Awakening agents",
  "Calibrating neural net",
  "Entering the expedition",
]

export function LoadingScreen() {
  const [count, setCount] = useState(0)
  const [done, setDone] = useState(false)
  const [phrase, setPhrase] = useState(PHRASES[0])

  useEffect(() => {
    // Lock body scroll while loading
    document.documentElement.classList.add("is-loading")

    // Make sure we start at the top
    window.scrollTo(0, 0)

    let raf = 0
    const start = performance.now()
    const duration = 1800 // ms

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = Math.floor(eased * 100)
      setCount(value)
      const idx = Math.min(PHRASES.length - 1, Math.floor(eased * PHRASES.length))
      setPhrase(PHRASES[idx])
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setDone(true), 250)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      // Safety: never leave the page in a locked state if unmounted early
      document.documentElement.classList.remove("is-loading")
    }
  }, [])

  useEffect(() => {
    if (done) {
      document.documentElement.classList.remove("is-loading")
    }
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] },
          }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
        >
          {/* Layered background panels that split open on exit */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/2 bg-background border-b border-primary/10"
            initial={{ y: 0 }}
            exit={{ y: "-100%", transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-1/2 bg-background border-t border-primary/10"
            initial={{ y: 0 }}
            exit={{ y: "100%", transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } }}
          />

          {/* Subtle grid + radial glow */}
          <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(40% 40% at 50% 50%, hsl(75 100% 60% / 0.10), transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-3xl px-8 flex flex-col items-center">
            {/* Brand mark */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3"
            >
              <div className="relative h-10 w-10">
                <motion.span
                  className="absolute inset-0 rounded-full border border-primary/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                />
                <span className="absolute inset-2 rounded-full bg-primary/20" />
                <span className="absolute inset-[14px] rounded-full bg-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  Khiter / Hamza
                </span>
                <span className="mt-1 font-sans text-sm tracking-[-0.01em] text-foreground">
                  Portfolio
                </span>
              </div>
            </motion.div>

            {/* Big counter */}
            <div className="mt-16 flex items-end gap-2 font-sans tracking-[-0.04em]">
              <motion.span
                key="num"
                className="text-[18vw] md:text-[12rem] leading-none font-medium text-foreground"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                {String(count).padStart(2, "0")}
              </motion.span>
              <span className="mb-3 md:mb-6 font-mono text-base md:text-2xl text-primary">
                %
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 w-full max-w-md h-px bg-border overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                style={{ width: `${count}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            {/* Status line */}
            <div className="mt-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={phrase}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  {phrase}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom corner labels */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
          >
            Acte I — Préparation
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute bottom-6 right-6 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
          >
            v 1.0 / 2026
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
