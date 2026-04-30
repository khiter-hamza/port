"use client"

import { useEffect, useRef } from "react"

interface TiltOptions {
  /** Maximum rotation angle in degrees */
  max?: number
  /** Damping smoothness (lower = snappier, higher = smoother) */
  damping?: number
  /** Multiplier for parallax depth on inner [data-tilt-layer] elements */
  depth?: number
  /** Glare highlight strength (0..1). 0 disables. */
  glare?: number
  /** Scale-up factor on hover */
  scale?: number
}

/**
 * Cinematic 3D tilt + parallax + glare on mouse hover.
 *
 * Usage:
 *   const ref = useTilt<HTMLDivElement>({ max: 14, depth: 30, glare: 0.4 })
 *   <div ref={ref} className="[transform-style:preserve-3d] perspective-[1000px]">
 *     <div data-tilt-layer="6">...</div>
 *   </div>
 *
 * Children with `data-tilt-layer="N"` will be translated outward in Z,
 * creating a parallax depth illusion.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: TiltOptions = {},
) {
  const { max = 12, damping = 0.12, depth = 24, glare = 0.35, scale = 1.02 } =
    options
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(pointer: coarse)").matches) return

    let targetRX = 0
    let targetRY = 0
    let targetTZ = 0
    let targetScale = 1
    let targetGX = 50
    let targetGY = 50
    let targetGA = 0

    let curRX = 0
    let curRY = 0
    let curTZ = 0
    let curScale = 1
    let curGX = 50
    let curGY = 50
    let curGA = 0

    let raf = 0
    let active = false

    // Inject glare layer if needed
    let glareEl: HTMLDivElement | null = null
    if (glare > 0) {
      glareEl = document.createElement("div")
      glareEl.setAttribute("aria-hidden", "true")
      glareEl.style.cssText = [
        "position:absolute",
        "inset:0",
        "pointer-events:none",
        "border-radius:inherit",
        "mix-blend-mode:overlay",
        "opacity:0",
        "transition:opacity 300ms ease",
        "transform:translateZ(40px)",
        "z-index:5",
      ].join(";")
      // Make sure parent is positioned
      const cs = getComputedStyle(el)
      if (cs.position === "static") el.style.position = "relative"
      el.appendChild(glareEl)
    }

    el.style.transformStyle = "preserve-3d"
    el.style.willChange = "transform"

    const layerEls = Array.from(
      el.querySelectorAll<HTMLElement>("[data-tilt-layer]"),
    )
    layerEls.forEach((l) => {
      l.style.transformStyle = "preserve-3d"
      l.style.willChange = "transform"
    })

    const tick = () => {
      curRX += (targetRX - curRX) * damping
      curRY += (targetRY - curRY) * damping
      curTZ += (targetTZ - curTZ) * damping
      curScale += (targetScale - curScale) * damping
      curGX += (targetGX - curGX) * damping
      curGY += (targetGY - curGY) * damping
      curGA += (targetGA - curGA) * damping

      el.style.transform = `perspective(1000px) rotateX(${curRX.toFixed(
        2,
      )}deg) rotateY(${curRY.toFixed(2)}deg) translateZ(${curTZ.toFixed(
        2,
      )}px) scale(${curScale.toFixed(3)})`

      // Parallax inner layers
      layerEls.forEach((l) => {
        const z = Number(l.dataset.tiltLayer || "1")
        const tx = -curRY * (z * 0.3)
        const ty = curRX * (z * 0.3)
        l.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
          2,
        )}px, ${(z * depth).toFixed(2)}px)`
      })

      if (glareEl) {
        glareEl.style.opacity = String(curGA)
        glareEl.style.background = `radial-gradient(circle at ${curGX}% ${curGY}%, hsl(75 100% 75% / ${
          glare
        }) 0%, transparent 55%)`
      }

      if (
        active ||
        Math.abs(curRX) > 0.01 ||
        Math.abs(curRY) > 0.01 ||
        Math.abs(curTZ) > 0.01 ||
        Math.abs(curScale - 1) > 0.001 ||
        curGA > 0.001
      ) {
        raf = requestAnimationFrame(tick)
      } else {
        raf = 0
      }
    }

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      // x,y in 0..1
      targetRY = (x - 0.5) * 2 * max // left/right
      targetRX = -(y - 0.5) * 2 * max // up/down (inverted for natural feel)
      targetTZ = 8
      targetScale = scale
      targetGX = x * 100
      targetGY = y * 100
      targetGA = 1
      active = true
      start()
    }
    const onEnter = () => {
      active = true
      start()
    }
    const onLeave = () => {
      targetRX = 0
      targetRY = 0
      targetTZ = 0
      targetScale = 1
      targetGA = 0
      active = false
      start()
    }

    el.addEventListener("pointerenter", onEnter)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)

    return () => {
      el.removeEventListener("pointerenter", onEnter)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      if (raf) cancelAnimationFrame(raf)
      if (glareEl && glareEl.parentNode === el) el.removeChild(glareEl)
      el.style.transform = ""
      layerEls.forEach((l) => {
        l.style.transform = ""
      })
    }
  }, [max, damping, depth, glare, scale])

  return ref
}
