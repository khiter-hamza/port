"use client"

import { useEffect, useRef, useState } from "react"

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    // Skip on touch / coarse pointers / reduced motion
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduced) return
    setEnabled(true)

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const dot = { x: target.x, y: target.y }
    const ring = { x: target.x, y: target.y }

    let raf = 0
    const tick = () => {
      // Dot — fast follow
      dot.x += (target.x - dot.x) * 0.4
      dot.y += (target.y - dot.y) * 0.4
      // Ring — lazy follow
      ring.x += (target.x - ring.x) * 0.12
      ring.y += (target.y - ring.y) * 0.12

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
    }

    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      const interactive = el.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor='hover']",
      )
      setHovering(!!interactive)
    }

    const onDown = () => setPressed(true)
    const onUp = () => setPressed(false)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseover", onOver)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)

    document.documentElement.classList.add("custom-cursor-active")

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseover", onOver)
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      document.documentElement.classList.remove("custom-cursor-active")
    }
  }, [])

  if (!enabled) return null

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9998] hidden md:block"
        style={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          borderRadius: 999,
          border: "1px solid hsl(75 100% 60% / 0.55)",
          boxShadow: "0 0 24px hsl(75 100% 60% / 0.15)",
          transition: "width 220ms ease, height 220ms ease, opacity 220ms ease",
          mixBlendMode: "difference",
          opacity: pressed ? 0.6 : 1,
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
        style={{
          width: hovering ? 6 : 6,
          height: hovering ? 6 : 6,
          borderRadius: 999,
          background: "hsl(75 100% 60%)",
          boxShadow: "0 0 12px hsl(75 100% 60% / 0.8)",
          willChange: "transform",
        }}
      />
    </>
  )
}
