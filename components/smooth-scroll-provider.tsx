"use client"

import { useEffect } from "react"
import Lenis from "lenis"

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    const lenis = new Lenis({
      duration: 0.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    })

    // Pause scrolling while the loading screen is up
    if (document.documentElement.classList.contains("is-loading")) {
      lenis.stop()
      const observer = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("is-loading")) {
          lenis.start()
          // Make sure we're at the top after the loader exits
          window.scrollTo({ top: 0, behavior: "auto" })
          observer.disconnect()
        }
      })
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      })
    }

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Make anchor links work with Lenis
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a") as HTMLAnchorElement | null
      if (!link) return
      const href = link.getAttribute("href")
      if (!href || !href.startsWith("#") || href === "#") return
      const el = document.querySelector(href)
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el as HTMLElement, { offset: -64 })
    }
    document.addEventListener("click", handleAnchorClick)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("click", handleAnchorClick)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
