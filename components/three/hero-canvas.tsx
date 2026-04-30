"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree, type RootState } from "@react-three/fiber"
import { Float, RoundedBox, Text } from "@react-three/drei"
import * as THREE from "three"

/* =====================================================================
   Holographic Developer Workspace — 3D hero scene
   ---------------------------------------------------------------------
   What you see (universally readable as "developer / full-stack"):
     1. Reflective dark floor with neon grid + scanline glow
     2. Floating MacBook-style laptop (open) with a live-typing code
        screen drawn into a CanvasTexture (animated each frame)
     3. A ring of orbiting holographic tech badges
        (React, Next.js, Node, TypeScript, Python, AI)
     4. A swarm of floating code-symbol particles: </> { } ; ()
     5. Soft star/dust field in the deep background
   Interaction:
     - Mouse parallax tilts the entire rig
     - Scroll dollies the camera back & rotates the laptop slightly
   ===================================================================== */

const ACCENT = "#dcff50"
const ACCENT_DIM = "#9ad030"
const PANEL = "#0a0e07"
const SCREEN_BG = "#070a05"

/* --------------------- 1. Animated code screen texture --------------------- */
/* A CanvasTexture that paints scrolling, syntax-highlighted code lines.
   Repainted ~12fps for performance.                                          */

const CODE_LINES = [
  "import { Agent } from '@khiter/core'",
  "",
  "export async function build() {",
  "  const ai = new Agent({",
  "    model: 'gpt-5-mini',",
  "    tools: [search, code, deploy],",
  "  })",
  "",
  "  const plan = await ai.plan(spec)",
  "  for (const step of plan) {",
  "    await step.run()",
  "  }",
  "",
  "  return ai.ship({",
  "    runtime: 'edge',",
  "    region: 'all',",
  "  })",
  "}",
  "",
  "// → automation • agentic • full-stack",
]

const KW = /\b(import|from|export|async|function|const|let|return|for|of|new|await)\b/g
const STR = /(['"`])(?:(?=(\\?))\2.)*?\1/g
const NUM = /\b\d+\b/g
const COMMENT = /\/\/.*$/g

function paintCode(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  // background
  ctx.fillStyle = SCREEN_BG
  ctx.fillRect(0, 0, w, h)

  // top window chrome
  ctx.fillStyle = "#10160a"
  ctx.fillRect(0, 0, w, 40)
  const dots = ["#ff5f56", "#ffbd2e", "#27c93f"]
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(24 + i * 22, 20, 7, 0, Math.PI * 2)
    ctx.fillStyle = dots[i]
    ctx.fill()
  }
  ctx.fillStyle = "#5b6b3a"
  ctx.font = "16px 'Geist Mono', monospace"
  ctx.fillText("agent.ts — khiter.dev", w / 2 - 90, 26)

  // code area
  ctx.font = "20px 'Geist Mono', ui-monospace, Menlo, monospace"
  ctx.textBaseline = "top"

  const lineH = 28
  const startY = 60
  const startX = 28
  const totalLines = CODE_LINES.length
  // scrolling offset (loop)
  const scroll = Math.floor((t * 0.6) % totalLines)
  // typed columns for the current line (typing effect)
  const typedCols = Math.floor(((t * 14) % 90) + 8)

  for (let i = 0; i < 18; i++) {
    const lineIndex = (scroll + i) % totalLines
    const raw = CODE_LINES[lineIndex] ?? ""
    const isCurrent = i === 6
    const text = isCurrent ? raw.slice(0, Math.min(raw.length, typedCols)) : raw
    const y = startY + i * lineH

    // line number gutter
    ctx.fillStyle = "#2d361c"
    ctx.fillText(String(lineIndex + 1).padStart(2, " "), 4, y)

    if (!text) continue

    // tokenize quickly
    const ranges: { s: number; e: number; color: string }[] = []
    const pushAll = (re: RegExp, color: string) => {
      re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(text)) !== null) {
        ranges.push({ s: m.index, e: m.index + m[0].length, color })
      }
    }
    pushAll(KW, "#dcff50")
    pushAll(STR, "#bde87a")
    pushAll(NUM, "#ffd966")
    pushAll(COMMENT, "#4a5a2a")
    ranges.sort((a, b) => a.s - b.s)

    // draw char by char with color overrides
    let cursor = 0
    let x = startX
    const drawChunk = (s: string, color: string) => {
      ctx.fillStyle = color
      ctx.fillText(s, x, y)
      x += ctx.measureText(s).width
    }
    for (const r of ranges) {
      if (r.s < cursor) continue
      if (r.s > cursor) drawChunk(text.slice(cursor, r.s), "#cbd5b0")
      drawChunk(text.slice(r.s, r.e), r.color)
      cursor = r.e
    }
    if (cursor < text.length) drawChunk(text.slice(cursor), "#cbd5b0")

    // blinking cursor on current line
    if (isCurrent && Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = "#dcff50"
      ctx.fillRect(x + 1, y + 2, 10, 22)
    }
  }

  // subtle scanlines
  ctx.globalAlpha = 0.06
  ctx.fillStyle = "#dcff50"
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1)
  ctx.globalAlpha = 1
}

function useCodeTexture() {
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null
    const c = document.createElement("canvas")
    c.width = 1024
    c.height = 640
    return c
  }, [])
  const texture = useMemo(() => {
    if (!canvas) return null
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.minFilter = THREE.LinearFilter
    t.magFilter = THREE.LinearFilter
    return t
  }, [canvas])

  const lastPaint = useRef(0)
  useFrame((state) => {
    if (!canvas || !texture) return
    const t = state.clock.elapsedTime
    if (t - lastPaint.current < 1 / 14) return
    lastPaint.current = t
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    paintCode(ctx, canvas.width, canvas.height, t)
    texture.needsUpdate = true
  })

  return texture
}

/* --------------------- 2. The Laptop --------------------- */

function Laptop({ scrollY }: { scrollY: { current: number } }) {
  const group = useRef<THREE.Group>(null!)
  const screenPivot = useRef<THREE.Group>(null!)
  const tex = useCodeTexture()

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    // gentle hover bob
    group.current.position.y = Math.sin(t * 0.8) * 0.08 - 0.05
    // base auto-rotate + scroll-linked tilt
    const s = Math.min(scrollY.current / 800, 1)
    group.current.rotation.y = Math.sin(t * 0.25) * 0.18 + s * 0.6
    group.current.rotation.x = -0.05 + s * 0.18
    // screen open angle subtly breathes
    if (screenPivot.current) {
      screenPivot.current.rotation.x = -1.95 + Math.sin(t * 0.4) * 0.02
    }
  })

  return (
    <group ref={group} position={[0, -0.3, 0]}>
      {/* Base */}
      <RoundedBox args={[3.2, 0.16, 2.2]} radius={0.06} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1f12" metalness={0.85} roughness={0.35} />
      </RoundedBox>
      {/* keyboard inset */}
      <mesh position={[0, 0.082, 0.05]}>
        <boxGeometry args={[2.9, 0.005, 1.6]} />
        <meshStandardMaterial color="#0d1108" metalness={0.6} roughness={0.6} />
      </mesh>
      {/* trackpad */}
      <mesh position={[0, 0.085, 0.85]}>
        <boxGeometry args={[1.2, 0.005, 0.7]} />
        <meshStandardMaterial color="#181d10" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* keys grid */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 14 }).map((__, col) => (
          <mesh key={`${row}-${col}`} position={[-1.3 + col * 0.2, 0.09, -0.55 + row * 0.22]}>
            <boxGeometry args={[0.16, 0.015, 0.16]} />
            <meshStandardMaterial color="#252b18" metalness={0.5} roughness={0.5} />
          </mesh>
        )),
      )}

      {/* Screen pivot at hinge */}
      <group ref={screenPivot} position={[0, 0.08, -1.05]} rotation={[-1.95, 0, 0]}>
        {/* lid */}
        <RoundedBox args={[3.2, 2.0, 0.08]} radius={0.06} smoothness={4} position={[0, 1.0, 0]}>
          <meshStandardMaterial color="#1a1f12" metalness={0.85} roughness={0.3} />
        </RoundedBox>
        {/* bezel */}
        <mesh position={[0, 1.0, 0.045]}>
          <planeGeometry args={[3.0, 1.85]} />
          <meshStandardMaterial color="#05060a" />
        </mesh>
        {/* live code screen */}
        <mesh position={[0, 1.0, 0.05]}>
          <planeGeometry args={[2.85, 1.72]} />
          {tex ? (
            <meshBasicMaterial map={tex} toneMapped={false} />
          ) : (
            <meshBasicMaterial color={SCREEN_BG} />
          )}
        </mesh>
        {/* screen glow plate */}
        <mesh position={[0, 1.0, 0.052]}>
          <planeGeometry args={[3.05, 1.92]} />
          <meshBasicMaterial color={ACCENT} transparent opacity={0.06} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* logo on lid back */}
        <Text
          position={[0, 1.0, -0.06]}
          rotation={[0, Math.PI, 0]}
          fontSize={0.42}
          color={ACCENT}
          anchorX="center"
          anchorY="middle"
          letterSpacing={-0.05}
        >
          {"</>"}
        </Text>
      </group>
    </group>
  )
}

/* --------------------- 3. Orbiting tech badges --------------------- */

const STACK = [
  { label: "React", color: "#61dafb" },
  { label: "Next.js", color: "#ffffff" },
  { label: "Node", color: "#8cc84b" },
  { label: "TypeScript", color: "#3178c6" },
  { label: "Python", color: "#ffd34d" },
  { label: "AI", color: "#dcff50" },
]

function TechBadge({
  label,
  color,
  angle,
  radius,
  speed,
  yOffset,
}: {
  label: string
  color: string
  angle: number
  radius: number
  speed: number
  yOffset: number
}) {
  const ref = useRef<THREE.Group>(null!)
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const a = angle + t * speed
    const x = Math.cos(a) * radius
    const z = Math.sin(a) * radius
    const y = yOffset + Math.sin(t * 1.2 + angle) * 0.15
    if (ref.current) {
      ref.current.position.set(x, y, z)
      // billboard towards center but with a tilt
      ref.current.lookAt(0, y, 0)
      ref.current.rotation.y += Math.PI
    }
  })
  return (
    <group ref={ref}>
      <RoundedBox args={[1.05, 0.42, 0.08]} radius={0.08} smoothness={3}>
        <meshPhysicalMaterial
          color={PANEL}
          metalness={0.4}
          roughness={0.25}
          transmission={0.35}
          thickness={0.4}
          emissive={color}
          emissiveIntensity={0.08}
        />
      </RoundedBox>
      {/* color dot */}
      <mesh position={[-0.38, 0, 0.05]}>
        <circleGeometry args={[0.08, 24]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <Text
        position={[0.05, 0, 0.05]}
        fontSize={0.16}
        color="#e8f0d8"
        anchorX="center"
        anchorY="middle"
        letterSpacing={-0.02}
      >
        {label}
      </Text>
      {/* edge glow */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[1.25, 0.6]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

function OrbitRing() {
  const ring = useRef<THREE.Group>(null!)
  useFrame((state) => {
    if (!ring.current) return
    ring.current.rotation.y = state.clock.elapsedTime * 0.05
  })
  return (
    <group ref={ring} position={[0, 0.4, 0]}>
      {STACK.map((s, i) => (
        <TechBadge
          key={s.label}
          label={s.label}
          color={s.color}
          angle={(i / STACK.length) * Math.PI * 2}
          radius={3.6}
          speed={0.18 + (i % 2) * 0.05}
          yOffset={(i % 3) * 0.35 - 0.2}
        />
      ))}
      {/* faint orbit guide ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.55, 3.62, 128]} />
        <meshBasicMaterial color={ACCENT_DIM} transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

/* --------------------- 4. Floating code-symbol particles --------------------- */

const SYMBOLS = ["</>", "{ }", "( )", ";", "=>", "[ ]", "##", "::"]

function CodeParticles({ count = 38 }: { count?: number }) {
  const group = useRef<THREE.Group>(null!)
  const items = useMemo(() => {
    const arr: {
      sym: string
      pos: [number, number, number]
      speed: number
      phase: number
      scale: number
    }[] = []
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 4
      const a = Math.random() * Math.PI * 2
      arr.push({
        sym: SYMBOLS[i % SYMBOLS.length],
        pos: [Math.cos(a) * r, (Math.random() - 0.5) * 4, Math.sin(a) * r],
        speed: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        scale: 0.18 + Math.random() * 0.18,
      })
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.children.forEach((child, i) => {
      const it = items[i]
      child.position.y = it.pos[1] + Math.sin(t * it.speed + it.phase) * 0.6
      child.rotation.y = t * 0.2 + it.phase
      child.rotation.x = Math.sin(t * 0.3 + it.phase) * 0.2
    })
  })

  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Float key={i} speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
          <Text
            position={it.pos}
            fontSize={it.scale}
            color={i % 4 === 0 ? ACCENT : "#7a8a55"}
            anchorX="center"
            anchorY="middle"
            outlineColor="#000"
            outlineOpacity={0.6}
            outlineWidth={0.005}
          >
            {it.sym}
          </Text>
        </Float>
      ))}
    </group>
  )
}

/* --------------------- 5. Glowing grid floor --------------------- */

function GridFloor() {
  const grid = useMemo(() => {
    const g = new THREE.GridHelper(40, 40, ACCENT, ACCENT_DIM)
    const m = g.material as THREE.LineBasicMaterial | THREE.LineBasicMaterial[]
    if (Array.isArray(m)) {
      m.forEach((mm) => {
        mm.transparent = true
        mm.opacity = 0.18
      })
    } else {
      m.transparent = true
      m.opacity = 0.18
    }
    g.position.y = -1.6
    return g
  }, [])
  // pulsing center
  const pulse = useRef<THREE.Mesh>(null!)
  useFrame((state) => {
    if (!pulse.current) return
    const t = state.clock.elapsedTime
    const m = pulse.current.material as THREE.MeshBasicMaterial
    m.opacity = 0.18 + Math.sin(t * 1.5) * 0.08
  })
  return (
    <group>
      <primitive object={grid} />
      <mesh ref={pulse} position={[0, -1.59, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 6, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.18} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* deep ground plane to catch a shadow gradient */}
      <mesh position={[0, -1.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#04060a" />
      </mesh>
    </group>
  )
}

/* --------------------- 6. Background dust --------------------- */

function Dust({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 40
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = -10 - Math.random() * 30
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return g
  }, [count])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.05} color="#88a050" transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* --------------------- 7. Camera rig (mouse + scroll) --------------------- */

function Rig({ scrollY }: { scrollY: { current: number } }) {
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3(0, 0.3, 0))
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("mousemove", onMove, { passive: true })
    return () => window.removeEventListener("mousemove", onMove)
  }, [])

  useFrame((_state: RootState, delta) => {
    const s = Math.min(scrollY.current / 900, 1)
    // base position with scroll dolly
    const baseX = mouse.current.x * 1.2
    const baseY = 0.6 + mouse.current.y * 0.4 - s * 0.6
    const baseZ = 7.2 + s * 2.8
    camera.position.x += (baseX - camera.position.x) * Math.min(delta * 4, 1)
    camera.position.y += (baseY - camera.position.y) * Math.min(delta * 4, 1)
    camera.position.z += (baseZ - camera.position.z) * Math.min(delta * 4, 1)
    camera.lookAt(target.current)
  })
  return null
}

/* --------------------- 8. Orchestrator --------------------- */

function SceneContent({ scrollY }: { scrollY: { current: number } }) {
  return (
    <>
      <color attach="background" args={["#03050a"]} />
      <fog attach="fog" args={["#03050a", 12, 28]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[0, 2, 3]} intensity={2.2} color={ACCENT} distance={12} />
      <pointLight position={[-4, -1, 2]} intensity={0.8} color="#5a8aff" distance={10} />

      <Suspense fallback={null}>
        <Dust />
        <GridFloor />
        <Laptop scrollY={scrollY} />
        <OrbitRing />
        <CodeParticles />
      </Suspense>

      <Rig scrollY={scrollY} />
    </>
  )
}

export default function HeroCanvas() {
  const [ready, setReady] = useState(false)
  const scrollY = useRef(0)

  useEffect(() => {
    setReady(true)
    const onScroll = () => {
      scrollY.current = window.scrollY
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!ready) return null

  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.6, 7.2], fov: 42, near: 0.1, far: 80 }}
      style={{ width: "100%", height: "100%" }}
    >
      <SceneContent scrollY={scrollY} />
    </Canvas>
  )
}
