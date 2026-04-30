"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRef } from "react"
import { ArrowDown, Download, ArrowUpRight } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"

const HeroCanvas = dynamic(
  () => import("@/components/three/hero-canvas").then((m) => m.HeroCanvas),
  { ssr: false },
)

export function HeroSection() {
  const ref = useRef<HTMLElement>(null)

  // Scroll-linked parallax — animates as the hero leaves the viewport.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Spring-smoothed progress so transforms feel fluid, not stuck to wheel ticks.
  const sp = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.5 })

  const headlineY = useTransform(sp, [0, 1], ["0%", "-30%"])
  const headlineScale = useTransform(sp, [0, 1], [1, 1.18])
  const headlineBlur = useTransform(sp, [0, 1], ["0px", "8px"])
  const headlineFilter = useTransform(headlineBlur, (v) => `blur(${v})`)
  const subY = useTransform(sp, [0, 1], ["0%", "-60%"])
  const subOpacity = useTransform(sp, [0, 0.5, 1], [1, 0.6, 0])
  const canvasY = useTransform(sp, [0, 1], ["0%", "20%"])
  const canvasScale = useTransform(sp, [0, 1], [1, 1.08])
  const overlayOpacity = useTransform(sp, [0, 1], [0.7, 1])

  return (
    <section
      id="top"
      ref={ref}
      className="relative min-h-[100svh] w-full overflow-hidden flex items-center pt-20"
    >
      {/* 3D scene fills the hero — scroll parallax */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-0"
        style={{ y: canvasY, scale: canvasScale }}
      >
        <HeroCanvas />
      </motion.div>

      {/* Background grid + radial glow */}
      <div aria-hidden className="absolute inset-0 z-[1] bg-grid opacity-25 mix-blend-overlay" />
      <div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 70% 30%, hsl(75 100% 60% / 0.10), transparent 60%), radial-gradient(50% 40% at 20% 80%, hsl(75 100% 60% / 0.06), transparent 60%)",
        }}
      />
      {/* Subtle vignette so text reads against the 3D scene */}
      <motion.div
        aria-hidden
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: overlayOpacity,
          background:
            "radial-gradient(120% 80% at 50% 50%, transparent 40%, hsl(0 0% 4% / 0.7) 100%)",
        }}
      />

      {/* Floating accent dots */}
      <span
        aria-hidden
        className="absolute top-32 left-10 h-1.5 w-1.5 rounded-full bg-primary animate-float-slow"
      />
      <span
        aria-hidden
        className="absolute top-1/2 right-16 h-1 w-1 rounded-full bg-primary/70 animate-float-slow"
        style={{ animationDelay: "1.4s" }}
      />
      <span
        aria-hidden
        className="absolute bottom-32 left-1/3 h-2 w-2 rounded-full bg-primary/40 animate-float-slow"
        style={{ animationDelay: "2.2s" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 w-full">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Available for hire
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
            Algeria
          </span>
        </div>

        {/* Deploy label */}
        <div
          className="mt-10 flex items-center gap-3 animate-fade-in-up"
          style={{ animationDelay: "120ms" }}
        >
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Ready to deploy →
          </span>
        </div>

        {/* Headline — scroll-linked parallax */}
        <motion.h1
          className="mt-4 font-sans font-medium tracking-[-0.04em] text-balance text-foreground text-[16vw] sm:text-[14vw] md:text-[11vw] lg:text-[10vw] leading-[0.92] animate-fade-in-up will-change-transform"
          style={{
            animationDelay: "200ms",
            y: headlineY,
            scale: headlineScale,
            filter: headlineFilter,
          }}
        >
          <span className="block">Khiter</span>
          <span className="block">
            <span className="text-shimmer">Hamza</span>
          </span>
        </motion.h1>

        {/* Tagline */}
        <motion.div
          className="mt-8 flex items-start gap-4 max-w-2xl animate-fade-in-up"
          style={{ animationDelay: "320ms", y: subY, opacity: subOpacity }}
        >
          <span aria-hidden className="mt-1 inline-block h-7 w-px bg-primary animate-blink" />
          <p className="text-base md:text-lg text-muted-foreground text-pretty leading-relaxed">
            I build systems that work, scale, and think.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up"
          style={{ animationDelay: "440ms", y: subY, opacity: subOpacity }}
        >
          <a
            href="/khiter-hamza-cv.pdf"
            download
            className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            Download CV
          </a>
          <Link
            href="#projects"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 px-5 py-3 text-sm hover:border-primary hover:text-primary transition-all duration-300"
          >
            See projects
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <Link
          href="#about"
          className="absolute bottom-8 left-6 lg:left-10 inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground hover:text-primary transition-colors"
          aria-label="Scroll to about"
        >
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          Scroll
        </Link>
      </div>
    </section>
  )
}
