"use client"

import { useState, type FormEvent } from "react"
import { Mail, MessageSquare, Linkedin, Github, ArrowUpRight } from "lucide-react"
import { useReveal } from "@/hooks/use-reveal"

const socials = [
  {
    label: "Email",
    value: "oh_khiter@esi.dz",
    href: "mailto:oh_khiter@esi.dz",
    Icon: Mail,
  },
  {
    label: "Chat",
    value: "Open conversation",
    href: "#contact-form",
    Icon: MessageSquare,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/hamza-khiter-b2ba98284",
    href: "https://www.linkedin.com/in/hamza-khiter-b2ba98284",
    Icon: Linkedin,
  },
  {
    label: "GitHub",
    value: "github.com/khiter-hamza",
    href: "https://github.com/khiter-hamza",
    Icon: Github,
  },
]

export function ContactSection() {
  const ref = useReveal<HTMLElement>()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    // Frontend-only stub: gracefully simulate success.
    await new Promise((r) => setTimeout(r, 800))
    setSubmitting(false)
    setSubmitted(true)
  }

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 lg:py-40 border-t border-border overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0 bg-dots opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="reveal flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Get in touch
          </span>
        </div>

        <h2
          className="reveal mt-6 font-sans font-medium tracking-[-0.03em] text-4xl md:text-5xl lg:text-6xl text-balance"
          style={{ transitionDelay: "80ms" }}
        >
          Start your next project
        </h2>
        <p
          className="reveal mt-5 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
          style={{ transitionDelay: "140ms" }}
        >
          I am always looking for new opportunities and collaborations. Let&apos;s build
          something extraordinary together.
        </p>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Socials */}
          <ul className="lg:col-span-5 space-y-2">
            {socials.map(({ label, value, href, Icon }, i) => (
              <li
                key={label}
                className="reveal"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 px-5 py-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        {label}
                      </div>
                      <div className="text-sm text-foreground">{value}</div>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                </a>
              </li>
            ))}
          </ul>

          {/* Form */}
          <form
            id="contact-form"
            onSubmit={onSubmit}
            className="reveal lg:col-span-7 rounded-xl border border-border bg-card p-6 md:p-8 space-y-5"
            style={{ transitionDelay: "120ms" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  type="text"
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="type"
                  className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Project Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  <option value="web">Web Application</option>
                  <option value="ai">AI / Machine Learning</option>
                  <option value="automation">Automation System</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-y"
                placeholder="Tell me about your idea…"
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Replies typically within 24 hours.
              </p>
              <button
                type="submit"
                disabled={submitting || submitted}
                className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
              >
                {submitted
                  ? "Message sent"
                  : submitting
                    ? "Sending…"
                    : "Start Your Project"}
                <span className="text-base leading-none">✦</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
