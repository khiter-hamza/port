"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AmbientAudio } from "@/components/ambient-audio"

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "backdrop-blur-xl bg-background/70 border-b border-border"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link
          href="#top"
          className="font-mono text-sm tracking-tight flex items-center gap-1 group"
          aria-label="Khiter Hamza"
        >
          <span className="text-foreground group-hover:text-primary transition-colors">
            KhiterHamza
          </span>
          <span className="text-primary text-base leading-none animate-pulse">✦</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="relative text-muted-foreground hover:text-foreground transition-colors py-2 group"
              >
                {l.label}
                <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <AmbientAudio />
          <Link
            href="#contact"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary px-4 py-2 text-sm transition-all duration-300"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary group-hover:bg-primary-foreground animate-pulse-dot" />
            Let&apos;s Talk
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <AmbientAudio />

          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            className="p-2 text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-[max-height] duration-500 ease-in-out border-b border-border bg-background/95 backdrop-blur-xl",
          open ? "max-h-96" : "max-h-0",
        )}
      >
        <ul className="px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center w-full rounded-full bg-primary text-primary-foreground py-2 text-sm font-medium"
            >
              Let&apos;s Talk
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
