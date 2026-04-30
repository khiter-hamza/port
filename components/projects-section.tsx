"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { motion, useScroll, useTransform, useSpring } from "motion/react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"
import { useTilt } from "@/hooks/use-tilt"

type Category = "All" | "Web" | "AI/ML" | "Data" | "Automation"

interface Project {
  title: string
  category: Exclude<Category, "All">
  description: string
  tags: string[]
  image: string
}

const projects: Project[] = [
  {
    title: "MicroHack 3.0: Intelligence Engine & Strategic Surveillance",
    category: "AI/ML",
    description:
      "Advanced intelligence engine designed for strategic surveillance, real-time data harvesting, and multi-layered threat analysis.",
    tags: ["Python", "AI Agents", "Strategic Analytics", "Surveillance Systems"],
    image: "/dark-cybersecurity-dashboard-with-real-time-data-v.jpg",
  },
  {
    title: "Medical Question Answering with GPT-2 (Fine-Tuning)",
    category: "AI/ML",
    description:
      "Custom fine-tuned GPT-2 model specialized in medical literature, providing high-accuracy responses to complex clinical queries.",
    tags: ["GPT-2", "Fine-Tuning", "NLP", "PyTorch", "Medical Data"],
    image: "/abstract-neural-network-visualization-on-dark-back.jpg",
  },
  {
    title: "Sign Language MNIST Classifier (From Scratch)",
    category: "AI/ML",
    description:
      "Built a custom Convolutional Neural Network from the ground up using NumPy to recognize and classify sign language gestures.",
    tags: ["Computer Vision", "CNN", "NumPy", "Deep Learning"],
    image: "/hand-gesture-recognition-grid-of-sign-language-let.jpg",
  },
  {
    title: "Doxaa: AI Agent for Customer Support",
    category: "Automation",
    description:
      "Intelligent support bot leveraging LLMs to automate customer service workflows, resolve tickets, and integrate with helpdesk APIs.",
    tags: ["LangChain", "OpenAI", "Automation", "Customer Support"],
    image: "/minimal-chat-interface-with-ai-agent--dark-ui--gre.jpg",
  },
  {
    title: "Platform for Internship Management",
    category: "Web",
    description:
      "Full-stack ecosystem for managing end-to-end internship lifecycles, from student applications to company evaluations and grading.",
    tags: ["Next.js", "Express.js", "PostgreSQL", "Tailwind CSS"],
    image: "/clean-saas-dashboard-with-internship-management--d.jpg",
  },
  {
    title: "E-commerce Platform",
    category: "Web",
    description:
      "A modern, high-performance online store with real-time inventory, secure payments via Stripe, and a responsive admin dashboard.",
    tags: ["React", "Node.js", "Stripe", "Framer Motion"],
    image: "/sleek-modern-e-commerce-storefront-product-page--d.jpg",
  },
]

const categories: Category[] = ["All", "Web", "AI/ML", "Data", "Automation"]

/* ------------------------------ Tilt Card ------------------------------ */

function ProjectCard({ p, index }: { p: Project; index: number }) {
  const tiltRef = useTilt<HTMLElement>({
    max: 10,
    depth: 22,
    glare: 0.35,
    scale: 1.02,
  })

  return (
    <article
      ref={tiltRef}
      className={cn(
        "relative shrink-0 w-[78vw] md:w-[60vw] lg:w-[44vw] xl:w-[40vw]",
        "h-[68vh] md:h-[72vh] rounded-2xl border border-border bg-card overflow-hidden",
        "[transform-style:preserve-3d] will-change-transform",
        "hover:border-primary/40 transition-[border-color] duration-500",
        "shadow-[0_30px_80px_-30px_hsl(0_0%_0%/0.7)]",
      )}
    >
      {/* Image layer (deepest) */}
      <div className="relative h-[58%] overflow-hidden bg-secondary">
        <div data-tilt-layer="0.5" className="absolute inset-0">
          <Image
            src={p.image || "/placeholder.svg"}
            alt={p.title}
            fill
            className="object-cover transition-[transform,filter] duration-700 hover:scale-105"
            sizes="(max-width: 768px) 80vw, 50vw"
          />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent"
        />
        <div data-tilt-layer="3" className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
            <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            {p.category}
          </span>
        </div>
        <div data-tilt-layer="3" className="absolute top-4 right-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground bg-background/70 backdrop-blur rounded-full px-2.5 py-1 border border-border/60">
            {String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 md:p-7 h-[42%] flex flex-col">
        <div data-tilt-layer="2" className="flex items-start justify-between gap-4">
          <h3 className="font-sans text-lg md:text-xl font-medium tracking-[-0.01em] text-pretty">
            {p.title}
          </h3>
          <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        <p
          data-tilt-layer="1.5"
          className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3"
        >
          {p.description}
        </p>
        <div data-tilt-layer="2.5" className="mt-auto pt-4 flex flex-wrap gap-1.5">
          {p.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------ Section ------------------------------ */

export function ProjectsSection() {
  const reveal = useReveal<HTMLDivElement>()
  const [active, setActive] = useState<Category>("All")

  // Pinned horizontal scroll container
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  })
  const sp = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.5,
  })

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active)

  // Translate horizontally — 100vw of header padding plus enough to scroll all cards through
  // The total horizontal travel depends on number of cards. We tune it visually.
  const xRange = filtered.length <= 2 ? "-30%" : filtered.length <= 4 ? "-65%" : "-78%"
  const x = useTransform(sp, [0, 1], ["0%", xRange])

  // Scroll progress bar at bottom of pinned section
  const progressBarScale = useTransform(sp, (v) => Math.max(0.02, v))

  // Number of "screens" to scroll through. Each card adds ~ half a screen.
  const screens = Math.max(2, Math.ceil(filtered.length * 0.6) + 1)

  return (
    <section
      id="projects"
      className="relative border-t border-border"
    >
      {/* Tall outer track that drives the pinned timeline */}
      <div
        ref={trackRef}
        style={{ height: `${screens * 100}vh` }}
        className="relative"
      >
        {/* Sticky pinned viewport */}
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <div ref={reveal} className="absolute inset-0 flex flex-col">
            {/* Header — sits at top of pinned viewport */}
            <div className="mx-auto max-w-7xl w-full px-6 lg:px-10 pt-24 lg:pt-28">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div>
                  <div className="reveal flex items-center gap-3">
                    <span className="h-px w-10 bg-primary" />
                    <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                      Selected work
                    </span>
                  </div>
                  <h2
                    className="reveal mt-4 font-sans font-medium tracking-[-0.03em] text-4xl md:text-5xl lg:text-6xl"
                    style={{ transitionDelay: "80ms" }}
                  >
                    Featured projects
                  </h2>
                  <p
                    className="reveal mt-3 text-sm text-muted-foreground font-mono uppercase tracking-[0.2em]"
                    style={{ transitionDelay: "140ms" }}
                  >
                    Scroll to navigate the gallery
                  </p>
                </div>

                <div
                  className="reveal flex flex-wrap gap-1 rounded-full border border-border bg-secondary/40 p-1"
                  style={{ transitionDelay: "200ms" }}
                  role="tablist"
                >
                  {categories.map((c) => (
                    <button
                      key={c}
                      role="tab"
                      aria-selected={active === c}
                      onClick={() => {
                        setActive(c)
                        // Reset scroll position so user starts from the first card
                        const el = trackRef.current
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY
                          window.scrollTo({ top, behavior: "smooth" })
                        }
                      }}
                      className={cn(
                        "px-4 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full transition-all duration-300",
                        active === c
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Horizontal track */}
            <div className="relative flex-1 mt-8 lg:mt-12 [perspective:1400px]">
              <motion.div
                style={{ x }}
                className="absolute top-0 left-0 h-full flex items-center gap-6 md:gap-10 pl-6 md:pl-12 lg:pl-16 pr-[40vw] will-change-transform"
              >
                {filtered.map((p, i) => (
                  <ProjectCard key={`${p.title}-${active}`} p={p} index={i} />
                ))}
                {filtered.length === 0 && (
                  <p className="ml-10 text-center font-mono text-sm text-muted-foreground">
                    No projects in this category yet.
                  </p>
                )}
              </motion.div>
            </div>

            {/* Scroll progress bar */}
            <div className="mx-auto max-w-7xl w-full px-6 lg:px-10 pb-8">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Gallery
                </span>
                <div className="relative flex-1 h-px bg-border overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 h-full w-full bg-primary origin-left"
                    style={{ scaleX: progressBarScale }}
                  />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  {String(filtered.length).padStart(2, "0")} works
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
