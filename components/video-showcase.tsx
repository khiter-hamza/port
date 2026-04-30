"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCcw,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useReveal } from "@/hooks/use-reveal"

/* ------------------------------ Data ------------------------------ */

interface VideoItem {
  id: string
  title: string
  meta: string
  src: string
  poster: string
}

const videos: VideoItem[] = [
  {
    id: "bbb",
    title: "Big Buck Bunny",
    meta: "Open-source · 4K Demo",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
  },
  {
    id: "ed",
    title: "Elephant's Dream",
    meta: "Cinematic · Animation",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
  },
  {
    id: "blz",
    title: "For Bigger Blazes",
    meta: "Motion · Stock",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
  },
  {
    id: "sintel",
    title: "Sintel",
    meta: "Cinematic · Animation",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
  },
  {
    id: "tears",
    title: "Tears of Steel",
    meta: "Sci-Fi · VFX",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    poster:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
  },
]

/* ------------------------------ Effects ------------------------------ */

interface Effect {
  id: string
  label: string
  filter: string
}

const effects: Effect[] = [
  { id: "none", label: "Original", filter: "none" },
  { id: "noir", label: "Noir", filter: "grayscale(1) contrast(1.2)" },
  { id: "sepia", label: "Sepia", filter: "sepia(0.85) saturate(1.2)" },
  {
    id: "neon",
    label: "Neon",
    filter: "saturate(1.8) contrast(1.15) hue-rotate(40deg)",
  },
  {
    id: "matrix",
    label: "Matrix",
    filter: "hue-rotate(90deg) saturate(2) contrast(1.2) brightness(0.95)",
  },
  { id: "cool", label: "Cool", filter: "hue-rotate(-20deg) saturate(1.3) brightness(1.05)" },
  { id: "invert", label: "Invert", filter: "invert(1) hue-rotate(180deg)" },
  { id: "blur", label: "Dream", filter: "blur(2px) saturate(1.4) brightness(1.05)" },
]

/* ------------------------------ Helpers ------------------------------ */

function formatTime(t: number) {
  if (!isFinite(t) || t < 0) return "0:00"
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

/* ------------------------------ Component ------------------------------ */

export function VideoShowcase() {
  const reveal = useReveal<HTMLElement>()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const [activeId, setActiveId] = useState(videos[0].id)
  const [effectId, setEffectId] = useState("none")
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(0.8)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  const active = useMemo(
    () => videos.find((v) => v.id === activeId) ?? videos[0],
    [activeId],
  )
  const filter = useMemo(
    () => effects.find((e) => e.id === effectId)?.filter ?? "none",
    [effectId],
  )

  /* ------- Synthetic spectrum (tied to play state, not Web Audio) ------- */

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const bars = 56
      const gap = Math.max(2, Math.floor(w / (bars * 6)))
      const barWidth = (w - gap * (bars - 1)) / bars

      const t = performance.now() / 1000
      const intensity = playing && !muted ? 1 : playing ? 0.6 : 0.25

      for (let i = 0; i < bars; i++) {
        // Layered sines for organic spectrum motion
        const a = Math.sin(i * 0.32 + t * 2.1)
        const b = Math.sin(i * 0.13 + t * 3.3 + 1.7)
        const c = Math.sin(i * 0.07 + t * 0.9 + 3.1)
        const v = Math.max(0.05, ((a + b + c) / 3 + 1) / 2) * intensity

        const bh = Math.max(2, v * h * 0.95)
        const x = i * (barWidth + gap)
        const y = (h - bh) / 2

        const grad = ctx.createLinearGradient(0, y, 0, y + bh)
        grad.addColorStop(0, "rgba(220, 255, 80, 0.95)")
        grad.addColorStop(0.5, "rgba(180, 255, 60, 0.9)")
        grad.addColorStop(1, "rgba(220, 255, 80, 0.6)")
        ctx.fillStyle = grad

        const r = Math.min(barWidth / 2, 6)
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + barWidth - r, y)
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r)
        ctx.lineTo(x + barWidth, y + bh - r)
        ctx.quadraticCurveTo(x + barWidth, y + bh, x + barWidth - r, y + bh)
        ctx.lineTo(x + r, y + bh)
        ctx.quadraticCurveTo(x, y + bh, x, y + bh - r)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.closePath()
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [playing, muted])

  /* ------- Video element wiring (direct, no Web Audio routing) ------- */

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
  }, [volume])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
  }, [muted])

  // When changing video, reset state
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    setProgress(0)
    setDuration(0)
    v.load()
    if (playing) {
      v.play().catch(() => {
        /* autoplay can be blocked */
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const handleTogglePlay = useCallback(async () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      try {
        await v.play()
        setPlaying(true)
      } catch {
        // If unmuted play was blocked, fall back to muted autoplay so it still works
        v.muted = true
        setMuted(true)
        try {
          await v.play()
          setPlaying(true)
        } catch {
          /* ignore */
        }
      }
    } else {
      v.pause()
      setPlaying(false)
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const next = !muted
    v.muted = next
    if (!next && v.volume === 0) {
      v.volume = 0.8
      setVolume(0.8)
    }
    setMuted(next)
  }, [muted])

  const handleRestart = () => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
    setPlaying(true)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v || !duration) return
    const pct = Number(e.target.value)
    v.currentTime = (pct / 100) * duration
    setProgress(pct)
  }

  const handleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {})
    else document.exitFullscreen?.()
  }

  return (
    <section
      id="showreel"
      ref={reveal}
      className="relative py-32 lg:py-40 border-t border-border overflow-hidden"
    >
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="reveal flex items-center gap-3">
              <span className="h-px w-10 bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
                Showreel
              </span>
            </div>
            <h2
              className="reveal mt-6 font-sans font-medium tracking-[-0.03em] text-4xl md:text-5xl lg:text-6xl text-balance"
              style={{ transitionDelay: "60ms" }}
            >
              Visuals in motion
            </h2>
            <p
              className="reveal mt-4 max-w-xl text-base text-muted-foreground leading-relaxed"
              style={{ transitionDelay: "120ms" }}
            >
              A live audio-reactive showcase. Pick a clip, apply an effect, and watch the
              spectrum dance with the soundtrack.
            </p>
          </div>

          <div
            className="reveal hidden lg:flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            style={{ transitionDelay: "160ms" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Audio reactive
          </div>
        </div>

        {/* Player */}
        <div
          ref={containerRef}
          className="reveal mt-12 relative rounded-2xl border border-border bg-card overflow-hidden group"
          style={{ transitionDelay: "200ms" }}
        >
          {/* Video */}
          <div className="relative aspect-video bg-black">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={videoRef}
              key={active.id}
              src={active.src}
              poster={active.poster}
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-500"
              style={{ filter }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
              onTimeUpdate={(e) => {
                const d = e.currentTarget.duration
                if (d > 0) setProgress((e.currentTarget.currentTime / d) * 100)
              }}
            />

            {/* Top overlay: title chip */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 backdrop-blur px-3 py-1.5 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              <span className="font-mono uppercase tracking-wider text-foreground">
                {active.title}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-muted-foreground">{active.meta}</span>
            </div>

            {/* Mute hint chip */}
            {playing && muted && (
              <button
                onClick={handleToggleMute}
                className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/70 backdrop-blur px-3 py-1.5 text-xs hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors animate-fade-in"
              >
                <VolumeX className="h-3.5 w-3.5" />
                <span className="font-mono uppercase tracking-wider">Tap to unmute</span>
              </button>
            )}

            {/* Big play button when paused */}
            {!playing && (
              <button
                onClick={handleTogglePlay}
                aria-label="Play"
                data-cursor="hover"
                className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[2px] hover:bg-background/40 transition-colors animate-fade-in"
              >
                <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_60px_-10px_hsl(75_100%_60%_/_0.7)] transition-transform hover:scale-105">
                  <Play className="h-7 w-7 translate-x-0.5" />
                </span>
              </button>
            )}

            {/* Spectrum overlay (bottom) */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 md:h-28">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 0%, hsl(0 0% 0% / 0.6) 100%)",
                }}
              />
              <canvas
                ref={canvasRef}
                aria-hidden
                className="relative h-full w-full"
              />
            </div>
          </div>

          {/* Controls bar */}
          <div className="px-4 md:px-5 py-3 md:py-4 border-t border-border bg-background/60 backdrop-blur">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                {formatTime((progress / 100) * duration)}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={progress}
                onChange={handleSeek}
                aria-label="Seek"
                className="range-accent flex-1"
              />
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums w-10">
                {formatTime(duration)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTogglePlay}
                  aria-label={playing ? "Pause" : "Play"}
                  data-cursor="hover"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition"
                >
                  {playing ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 translate-x-[1px]" />
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  aria-label="Restart"
                  data-cursor="hover"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary transition"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <div className="ml-1 flex items-center gap-2">
                  <button
                    onClick={handleToggleMute}
                    aria-label={muted ? "Unmute" : "Mute"}
                    data-cursor="hover"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary transition"
                  >
                    {muted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => {
                      const v = Number(e.target.value)
                      setVolume(v)
                      if (v > 0 && muted) setMuted(false)
                    }}
                    aria-label="Volume"
                    className="range-accent w-24 hidden sm:block"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {playing ? (muted ? "Audio · muted" : "Audio · live") : "Audio · idle"}
                </span>
                <button
                  onClick={handleFullscreen}
                  aria-label="Fullscreen"
                  data-cursor="hover"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:border-primary hover:text-primary transition"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Effects row */}
        <div className="reveal mt-8" style={{ transitionDelay: "260ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Effects
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="flex flex-wrap gap-2">
            {effects.map((e) => {
              const isActive = effectId === e.id
              return (
                <button
                  key={e.id}
                  onClick={() => setEffectId(e.id)}
                  aria-pressed={isActive}
                  data-cursor="hover"
                  className={cn(
                    "px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40",
                  )}
                >
                  {e.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Thumbnails row */}
        <div className="reveal mt-10" style={{ transitionDelay: "320ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Reels
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {videos.map((v) => {
              const isActive = v.id === activeId
              return (
                <li key={v.id}>
                  <button
                    onClick={() => setActiveId(v.id)}
                    aria-pressed={isActive}
                    aria-label={`Play ${v.title}`}
                    data-cursor="hover"
                    className={cn(
                      "group relative block w-full overflow-hidden rounded-lg border bg-card aspect-video transition-all duration-300",
                      isActive
                        ? "border-primary ring-2 ring-primary/40"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.poster || "/placeholder.svg"}
                      alt={v.title}
                      className={cn(
                        "absolute inset-0 h-full w-full object-cover transition-all duration-500",
                        isActive
                          ? "saturate-110"
                          : "grayscale group-hover:grayscale-0 group-hover:scale-105",
                      )}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
                    />
                    <span className="absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-background/80 backdrop-blur border border-border text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                      <Play className="h-3 w-3 translate-x-[1px]" />
                    </span>
                    <div className="absolute bottom-0 inset-x-0 p-2.5 text-left">
                      <div className="text-xs font-medium text-foreground line-clamp-1">
                        {v.title}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground line-clamp-1">
                        {v.meta}
                      </div>
                    </div>
                    {isActive && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider">
                        <span className="h-1 w-1 rounded-full bg-primary-foreground animate-pulse" />
                        Now playing
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
