"use client"

import Image from "next/image"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { AnimatedCounter } from "./animated-counter"
import { useReveal } from "@/hooks/use-reveal"
import { useTilt } from "@/hooks/use-tilt"

export function AboutSection() {
  const ref = useReveal<HTMLElement>()
  const portraitRef = useTilt<HTMLDivElement>({
    max: 14,
    depth: 28,
    glare: 0.4,
    scale: 1.03,
  })

  // Scroll-driven parallax for the portrait + headline
  const sectionRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  })
  const sp = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  })
  const portraitY = useTransform(sp, [0, 1], ["10%", "-10%"])
  const portraitRotate = useTransform(sp, [0, 1], [-2, 2])
  const textY = useTransform(sp, [0, 1], ["6%", "-6%"])

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 lg:py-40 border-t border-border"
    >
      <div ref={sectionRef} className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section label */}
        <div className="reveal flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Who I am
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: text */}
          <motion.div className="lg:col-span-7" style={{ y: textY }}>
            <h2
              className="reveal font-sans font-medium tracking-[-0.03em] text-pretty text-4xl md:text-5xl lg:text-6xl leading-[1.05]"
              style={{ transitionDelay: "60ms" }}
            >
              I don&apos;t just write code.{" "}
              <span className="text-muted-foreground">I build things that think.</span>
            </h2>

            <p
              className="reveal mt-8 max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground"
              style={{ transitionDelay: "140ms" }}
            >
              Khiter Hamza is a Full-Stack Developer specializing in AI, automation, and
              agentic systems. With a passion for building intelligent systems that solve
              real-world problems, I combine robust backend architectures with modern
              frontend experiences. My approach focuses on scalability, efficiency, and
              intelligence. Whether it&apos;s a complex SaaS platform or an autonomous AI
              agent, I ensure every line of code serves a purpose and delivers value.
            </p>

            <a
              href="#contact"
              className="reveal mt-10 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-primary hover:text-foreground transition-colors group"
              style={{ transitionDelay: "220ms" }}
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              Speak to Khiter &amp; collaborate
            </a>
          </motion.div>

          {/* Right: profile photo with 3D tilt + parallax */}
          <motion.div
            className="lg:col-span-5 [perspective:1200px]"
            style={{ y: portraitY, rotate: portraitRotate }}
          >
            <div
              ref={portraitRef}
              className="reveal-zoom relative aspect-[4/5] w-full max-w-sm mx-auto lg:ml-auto [transform-style:preserve-3d]"
              style={{ transitionDelay: "180ms" }}
            >
              <div
                data-tilt-layer="0.5"
                className="absolute -inset-3 rounded-md border border-primary/20 animate-float-slow"
              />
              <div
                data-tilt-layer="1"
                className="absolute inset-0 rounded-md overflow-hidden bg-secondary border border-border"
              >
                <Image
                  src="/portrait-of-a-young-male-full-stack-developer--mode.jpg"
                  alt="Portrait of Khiter Hamza"
                  fill
                  className="object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 768px) 80vw, 400px"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 60%, hsl(0 0% 4% / 0.6) 100%)",
                  }}
                />
              </div>
              <div
                data-tilt-layer="3"
                className="absolute -bottom-3 -left-3 rounded-full bg-background border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                <span className="text-primary">●</span> Online
              </div>
              {/* Floating accent on top corner */}
              <div
                data-tilt-layer="4"
                className="absolute -top-3 -right-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em]"
              >
                ✦ AI · Engineer
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="reveal mt-24 grid grid-cols-2 md:grid-cols-4 gap-10 border-t border-border pt-12">
          <AnimatedCounter to={4} suffix="+" label="Years coding" />
          <AnimatedCounter to={20} suffix="+" label="Projects" />
          <AnimatedCounter to={12} suffix="+" label="Models deployed" />
          <AnimatedCounter to={5} label="Domains mastered" />
        </div>
      </div>
    </section>
  )
}
