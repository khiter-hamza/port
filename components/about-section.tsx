"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { AnimatedCounter } from "./animated-counter"
import { useReveal } from "@/hooks/use-reveal"

export function AboutSection() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-32 lg:py-40 border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section label */}
        <div className="reveal flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Who I am
          </span>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: text */}
          <div className="lg:col-span-7">
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
          </div>

          {/* Right: profile photo */}
          <div className="lg:col-span-5">
            <div
              className="reveal-zoom relative aspect-[4/5] w-full max-w-sm mx-auto lg:ml-auto"
              style={{ transitionDelay: "180ms" }}
            >
              <div className="absolute -inset-3 rounded-md border border-primary/20 animate-float-slow" />
              <div className="absolute inset-0 rounded-md overflow-hidden bg-secondary border border-border">
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
              <div className="absolute -bottom-3 -left-3 rounded-full bg-background border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span className="text-primary">●</span> Online
              </div>
            </div>
          </div>
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
