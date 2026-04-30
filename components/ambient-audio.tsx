"use client"

/**
 * Cinematic ambient soundtrack — inspired by Clair Obscur: Expedition 33 (Acte I intro).
 * Fully synthesized in-browser with Web Audio API, no external assets, royalty-free.
 *
 * Layers:
 *  - Cello drone   : sawtooth + sub-sine through low-pass with slow LFO sweep
 *  - Choir pad     : 3 detuned sawtooths through band-pass + vibrato
 *  - Piano motif   : slow notes in C minor (C, Eb, G, Ab, Bb) with sharp attack
 *  - Brass swell   : every ~24s a filter sweep adds tension
 *  - Hall reverb   : convolver with synthesized 3.4s exponential noise IR
 */

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

type Nodes = {
  ctx: AudioContext
  master: GainNode
  intervals: ReturnType<typeof setInterval>[]
}

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

/** Synthesized hall reverb impulse response. */
function buildImpulse(ctx: AudioContext, seconds = 3.4, decay = 2.6) {
  const rate = ctx.sampleRate
  const length = Math.floor(rate * seconds)
  const impulse = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / length
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay)
    }
  }
  return impulse
}

/** Cello-like drone. */
function buildCello(ctx: AudioContext, dest: AudioNode, freq: number) {
  const out = ctx.createGain()
  out.gain.value = 0
  out.connect(dest)

  const saw = ctx.createOscillator()
  saw.type = "sawtooth"
  saw.frequency.value = freq

  const sub = ctx.createOscillator()
  sub.type = "sine"
  sub.frequency.value = freq / 2

  const sawGain = ctx.createGain()
  sawGain.gain.value = 0.18
  const subGain = ctx.createGain()
  subGain.gain.value = 0.32

  const lp = ctx.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 380
  lp.Q.value = 6

  const lfo = ctx.createOscillator()
  lfo.type = "sine"
  lfo.frequency.value = 0.07
  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 220
  lfo.connect(lfoGain).connect(lp.frequency)

  saw.connect(sawGain).connect(lp)
  sub.connect(subGain).connect(lp)
  lp.connect(out)

  saw.start()
  sub.start()
  lfo.start()

  out.gain.setTargetAtTime(0.55, ctx.currentTime, 4)
  return out
}

/** Choir pad with detuned saws + vibrato. */
function buildChoir(ctx: AudioContext, dest: AudioNode, freqs: number[]) {
  const out = ctx.createGain()
  out.gain.value = 0
  out.connect(dest)

  const bp = ctx.createBiquadFilter()
  bp.type = "bandpass"
  bp.frequency.value = 800
  bp.Q.value = 1.2

  freqs.forEach((f, idx) => {
    const detuneCents = (idx - (freqs.length - 1) / 2) * 8

    const o1 = ctx.createOscillator()
    o1.type = "sawtooth"
    o1.frequency.value = f
    o1.detune.value = detuneCents

    const o2 = ctx.createOscillator()
    o2.type = "sawtooth"
    o2.frequency.value = f
    o2.detune.value = detuneCents + 6

    const vib = ctx.createOscillator()
    vib.type = "sine"
    vib.frequency.value = 4.5 + idx * 0.13
    const vibAmt = ctx.createGain()
    vibAmt.gain.value = 3
    vib.connect(vibAmt)
    vibAmt.connect(o1.frequency)
    vibAmt.connect(o2.frequency)

    const g = ctx.createGain()
    g.gain.value = 0.06
    o1.connect(g)
    o2.connect(g)
    g.connect(bp)
    o1.start()
    o2.start()
    vib.start()
  })

  bp.connect(out)
  out.gain.setTargetAtTime(0.32, ctx.currentTime + 4, 6)
  return out
}

/** Piano-like pluck with percussive ADSR. */
function pluckNote(ctx: AudioContext, dest: AudioNode, freq: number, velocity = 0.4) {
  const now = ctx.currentTime
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(velocity, now + 0.012)
  g.gain.exponentialRampToValueAtTime(velocity * 0.4, now + 0.4)
  g.gain.exponentialRampToValueAtTime(0.001, now + 4.5)
  g.connect(dest)

  const lp = ctx.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.setValueAtTime(2400, now)
  lp.frequency.exponentialRampToValueAtTime(600, now + 3.5)
  lp.connect(g)

  const o1 = ctx.createOscillator()
  o1.type = "sine"
  o1.frequency.value = freq
  const o1g = ctx.createGain()
  o1g.gain.value = 0.7
  o1.connect(o1g).connect(lp)

  const o2 = ctx.createOscillator()
  o2.type = "triangle"
  o2.frequency.value = freq * 2
  const o2g = ctx.createGain()
  o2g.gain.value = 0.18
  o2.connect(o2g).connect(lp)

  const o3 = ctx.createOscillator()
  o3.type = "sine"
  o3.frequency.value = freq * 3
  const o3g = ctx.createGain()
  o3g.gain.value = 0.06
  o3.connect(o3g).connect(lp)

  o1.start(now)
  o2.start(now)
  o3.start(now)
  o1.stop(now + 5)
  o2.stop(now + 5)
  o3.stop(now + 5)
}

/** Brass-like swell. */
function brassSwell(ctx: AudioContext, dest: AudioNode, freq: number) {
  const now = ctx.currentTime
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(0.22, now + 3.5)
  g.gain.exponentialRampToValueAtTime(0.001, now + 8)
  g.connect(dest)

  const lp = ctx.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.setValueAtTime(300, now)
  lp.frequency.linearRampToValueAtTime(1800, now + 3.5)
  lp.frequency.linearRampToValueAtTime(500, now + 8)
  lp.connect(g)

  const o1 = ctx.createOscillator()
  o1.type = "sawtooth"
  o1.frequency.value = freq
  const o2 = ctx.createOscillator()
  o2.type = "sawtooth"
  o2.frequency.value = freq * 1.005
  const o3 = ctx.createOscillator()
  o3.type = "sawtooth"
  o3.frequency.value = freq / 2

  const og = ctx.createGain()
  og.gain.value = 0.5
  o1.connect(og)
  o2.connect(og)
  o3.connect(og)
  og.connect(lp)

  o1.start(now)
  o2.start(now)
  o3.start(now)
  o1.stop(now + 8.2)
  o2.stop(now + 8.2)
  o3.stop(now + 8.2)
}

export function AmbientAudio() {
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const nodesRef = useRef<Nodes | null>(null)

  useEffect(() => {
    return () => {
      const n = nodesRef.current
      if (!n) return
      n.intervals.forEach(clearInterval)
      try {
        n.ctx.close()
      } catch {}
      nodesRef.current = null
    }
  }, [])

  const start = async () => {
    if (nodesRef.current) return
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    if (ctx.state === "suspended") await ctx.resume()

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    master.gain.setTargetAtTime(0.7, ctx.currentTime + 0.1, 1.4)

    // Reverb send
    const reverb = ctx.createConvolver()
    reverb.buffer = buildImpulse(ctx, 3.4, 2.6)
    const reverbGain = ctx.createGain()
    reverbGain.gain.value = 0.45
    const dryGain = ctx.createGain()
    dryGain.gain.value = 0.7

    reverb.connect(reverbGain).connect(master)
    dryGain.connect(master)

    const bus = ctx.createGain()
    bus.gain.value = 1
    bus.connect(dryGain)
    bus.connect(reverb)

    // C minor
    buildCello(ctx, bus, midiToFreq(36)) // C2
    buildChoir(ctx, bus, [midiToFreq(48), midiToFreq(51), midiToFreq(55)]) // C3, Eb3, G3

    const motif = [60, 63, 67, 70, 67, 63, 65, 60] // C4, Eb4, G4, Bb4, ...
    let step = 0
    const motifInterval = setInterval(() => {
      const note = motif[step % motif.length]
      const octaveShift = Math.random() < 0.25 ? -12 : 0
      pluckNote(ctx, bus, midiToFreq(note + octaveShift), 0.32 + Math.random() * 0.08)
      step++
    }, 2600)

    const swellInterval = setInterval(() => {
      const choices = [48, 51, 55, 53]
      const f = midiToFreq(choices[Math.floor(Math.random() * choices.length)])
      brassSwell(ctx, bus, f)
    }, 24000)

    nodesRef.current = {
      ctx,
      master,
      intervals: [motifInterval, swellInterval],
    }
    setPlaying(true)
    setMuted(false)
  }

  const toggleMute = () => {
    const n = nodesRef.current
    if (!n) return
    if (muted) {
      n.master.gain.setTargetAtTime(0.7, n.ctx.currentTime, 0.6)
      setMuted(false)
    } else {
      n.master.gain.setTargetAtTime(0, n.ctx.currentTime, 0.6)
      setMuted(true)
    }
  }

  const onClick = async () => {
    if (!playing) {
      await start()
    } else {
      toggleMute()
    }
  }

  const active = playing && !muted

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={
        !playing
          ? "Play ambient soundtrack"
          : muted
            ? "Unmute soundtrack"
            : "Mute soundtrack"
      }
      data-cursor="hover"
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-full border px-3 py-1.5 transition-all duration-300",
        active
          ? "border-primary/60 bg-primary/10 text-primary"
          : "border-border bg-card/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      <span className="relative flex items-end h-3 w-4 gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              "w-[2px] origin-bottom rounded-full",
              active ? "bg-primary" : "bg-muted-foreground/60",
            )}
            style={{
              height: "100%",
              animation: active ? `eq 0.9s ease-in-out ${i * 0.12}s infinite` : "none",
              transform: active ? undefined : "scaleY(0.35)",
              opacity: active ? 1 : 0.6,
            }}
          />
        ))}
      </span>
      {active ? (
        <Volume2 className="h-3.5 w-3.5" />
      ) : (
        <VolumeX className="h-3.5 w-3.5" />
      )}
      <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
        {!playing ? "Acte I" : muted ? "Muted" : "Playing"}
      </span>
    </button>
  )
}
