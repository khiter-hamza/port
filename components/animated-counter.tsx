"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  to: number
  duration?: number
  suffix?: string
  label: string
}

export function AnimatedCounter({
  to,
  duration = 1600,
  suffix = "",
  label,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [value, setValue] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true
            const start = performance.now()
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration)
              // easeOutCubic
              const eased = 1 - Math.pow(1 - t, 3)
              setValue(Math.round(eased * to))
              if (t < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <div ref={ref} className="group">
      <div className="flex items-baseline gap-1">
        <span className="font-sans font-medium tracking-[-0.02em] text-4xl md:text-5xl text-foreground">
          {value}
        </span>
        {suffix ? (
          <span className="text-2xl md:text-3xl text-primary font-medium">{suffix}</span>
        ) : null}
      </div>
      <div className="mt-2 h-px w-8 bg-border group-hover:w-full group-hover:bg-primary transition-all duration-500" />
      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
