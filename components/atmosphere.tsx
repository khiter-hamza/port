export function Atmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
    >
      {/* Slow drifting gradient blobs — depth + cinematic glow */}
      <div className="absolute -top-1/4 -left-1/4 h-[60vmax] w-[60vmax] rounded-full opacity-[0.18] blur-[120px] animate-blob-a"
        style={{ background: "radial-gradient(closest-side, hsl(75 100% 60% / 0.55), transparent 70%)" }}
      />
      <div className="absolute top-1/3 -right-1/4 h-[55vmax] w-[55vmax] rounded-full opacity-[0.12] blur-[140px] animate-blob-b"
        style={{ background: "radial-gradient(closest-side, hsl(180 80% 55% / 0.4), transparent 70%)" }}
      />
      <div className="absolute -bottom-1/4 left-1/4 h-[50vmax] w-[50vmax] rounded-full opacity-[0.10] blur-[120px] animate-blob-c"
        style={{ background: "radial-gradient(closest-side, hsl(280 80% 60% / 0.35), transparent 70%)" }}
      />

      {/* Subtle scanlines for cinematic CRT feel */}
      <div className="absolute inset-0 bg-scanlines opacity-50 mix-blend-overlay" />

      {/* Animated grain — most cinematic touch */}
      <div className="absolute inset-0 bg-grain opacity-[0.07] mix-blend-overlay" />
    </div>
  )
}
