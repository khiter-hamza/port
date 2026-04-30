"use client"

import { useEffect, useRef } from "react"

/**
 * Adds `is-visible` to descendants with `.reveal` once they enter the viewport.
 * Waits for the loading screen to finish before observing, so on-screen
 * elements animate fresh after the loader exits instead of pre-animating
 * underneath it.
 *
 * Stagger via inline `transition-delay` style on each `.reveal` element.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    let io: IntersectionObserver | null = null
    let mo: MutationObserver | null = null
    let started = false

    const start = () => {
      if (started) return
      started = true

      const targets = root.querySelectorAll<HTMLElement>(
        ".reveal, .reveal-zoom, .reveal-scale, .reveal-left, .reveal-right, .reveal-curtain",
      )
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-visible")
              io?.unobserve(e.target)
            }
          })
        },
        { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
      )
      targets.forEach((t) => io!.observe(t))
    }

    if (document.documentElement.classList.contains("is-loading")) {
      // Wait for the loader to finish before kicking off reveals.
      mo = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("is-loading")) {
          start()
          mo?.disconnect()
        }
      })
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      })
      // Hard fallback in case the class never flips for some reason.
      const fallback = window.setTimeout(start, 6000)
      return () => {
        window.clearTimeout(fallback)
        mo?.disconnect()
        io?.disconnect()
      }
    }

    start()
    return () => {
      io?.disconnect()
      mo?.disconnect()
    }
  }, [])

  return ref
}
