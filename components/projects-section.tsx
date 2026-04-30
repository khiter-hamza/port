"use client"

import Image from "next/image"
import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"

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
    image:
      "/dark-cybersecurity-dashboard-with-real-time-data-v.jpg",
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

export function ProjectsSection() {
  const ref = useReveal<HTMLElement>()
  const [active, setActive] = useState<Category>("All")

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active)

  return (
    <section
      id="projects"
      ref={ref}
      className="relative py-32 lg:py-40 border-t border-border"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="reveal flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                Selected work
              </span>
            </div>
            <h2
              className="reveal mt-6 font-sans font-medium tracking-[-0.03em] text-4xl md:text-5xl lg:text-6xl"
              style={{ transitionDelay: "80ms" }}
            >
              Featured projects
            </h2>
          </div>

          {/* Filter tabs */}
          <div
            className="reveal flex flex-wrap gap-1 rounded-full border border-border bg-secondary/40 p-1"
            style={{ transitionDelay: "140ms" }}
            role="tablist"
          >
            {categories.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={active === c}
                onClick={() => setActive(c)}
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

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {filtered.map((p, i) => (
            <article
              key={p.title}
              className="reveal-zoom group relative overflow-hidden rounded-xl border border-border bg-card hover:border-primary/40 transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1"
              style={{ transitionDelay: `${i * 110}ms` }}
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <Image
                  src={p.image || "/placeholder.svg"}
                  alt={p.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:saturate-150"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent"
                />
                <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-primary">
                  {p.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 md:p-7">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-sans text-lg md:text-xl font-medium tracking-[-0.01em] text-pretty">
                    {p.title}
                  </h3>
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-secondary/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300">
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
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
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-14 text-center font-mono text-sm text-muted-foreground">
            No projects in this category yet.
          </p>
        )}
      </div>
    </section>
  )
}
