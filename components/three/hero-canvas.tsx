"use client"

import { Suspense, useMemo, useRef } from "react"
import { Canvas, useFrame, type RootState } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

/* ------------------------------ Ambient stars ------------------------------ */

function ParticleField({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 6 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((_state: RootState, delta: number) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.02
    ref.current.rotation.x += delta * 0.005
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={"#dcff50"}
        size={0.014}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
      />
    </Points>
  )
}

/* ------------------------------ Neural Network ------------------------------ */

// Symmetric architecture for a clean, professional silhouette
const LAYERS = [5, 8, 8, 5]
const LAYER_SPACING = 1.85
const NODE_RADIUS = 0.085
const HALO_RADIUS = 0.26

type NodeT = { pos: THREE.Vector3; layer: number; index: number }
type Edge = { a: NodeT; b: NodeT; speed: number; phase: number }

function buildGraph(): { nodes: NodeT[]; edges: Edge[] } {
  const nodes: NodeT[] = []
  const totalLayers = LAYERS.length
  const totalWidth = (totalLayers - 1) * LAYER_SPACING

  LAYERS.forEach((count, layerIdx) => {
    const x = layerIdx * LAYER_SPACING - totalWidth / 2
    const vSpacing = 0.5
    const totalHeight = (count - 1) * vSpacing
    for (let i = 0; i < count; i++) {
      const y = i * vSpacing - totalHeight / 2
      // small deterministic z offset gives subtle depth without chaos
      const z = Math.sin(layerIdx * 1.3 + i * 0.7) * 0.15
      nodes.push({
        pos: new THREE.Vector3(x, y, z),
        layer: layerIdx,
        index: i,
      })
    }
  })

  // Fully connect adjacent layers
  const edges: Edge[] = []
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const from = nodes.filter((n) => n.layer === l)
    const to = nodes.filter((n) => n.layer === l + 1)
    for (const a of from) {
      for (const b of to) {
        edges.push({
          a,
          b,
          speed: 0.3 + Math.random() * 0.4,
          phase: Math.random(),
        })
      }
    }
  }

  return { nodes, edges }
}

function Edges({ edges }: { edges: Edge[] }) {
  // Per-vertex colors: brighter near connection ends, dimmer toward middle gives depth
  const { geometry } = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3)
    const colors = new Float32Array(edges.length * 2 * 3)
    const accent = new THREE.Color("#dcff50")
    const cool = new THREE.Color("#7ee0ff")

    edges.forEach((e, i) => {
      const off = i * 6
      positions[off + 0] = e.a.pos.x
      positions[off + 1] = e.a.pos.y
      positions[off + 2] = e.a.pos.z
      positions[off + 3] = e.b.pos.x
      positions[off + 4] = e.b.pos.y
      positions[off + 5] = e.b.pos.z

      // Mix colors slightly per edge based on layer index for visual variety
      const t = e.a.layer / Math.max(1, LAYERS.length - 2)
      const col = new THREE.Color().lerpColors(accent, cool, t * 0.45)
      colors[off + 0] = col.r
      colors[off + 1] = col.g
      colors[off + 2] = col.b
      colors[off + 3] = col.r
      colors[off + 4] = col.g
      colors[off + 5] = col.b
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return { geometry: geo }
  }, [edges])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  )
}

function Pulses({ edges }: { edges: Edge[] }) {
  // Travelling "data packet" per edge with additive blend for a real glow feel
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(
    () => new Float32Array(edges.length * 3),
    [edges.length],
  )

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime
    edges.forEach((e, i) => {
      let p = (e.phase + t * e.speed) % 1
      if (p < 0) p += 1
      const x = e.a.pos.x + (e.b.pos.x - e.a.pos.x) * p
      const y = e.a.pos.y + (e.b.pos.y - e.a.pos.y) * p
      const z = e.a.pos.z + (e.b.pos.z - e.a.pos.z) * p
      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
    })
    const attr = geometry.attributes.position as THREE.BufferAttribute
    attr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={"#ffffff"}
        size={0.085}
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function NodeMesh({ node, i }: { node: NodeT; i: number }) {
  const coreRef = useRef<THREE.Mesh>(null)
  const haloRef = useRef<THREE.Mesh>(null)

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime
    const breathe = 0.5 + (Math.sin(t * 1.4 + i * 0.55) * 0.5 + 0.5) * 0.5
    if (coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1.2 + breathe * 1.2
    }
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.12 + breathe * 0.18
      const s = 0.95 + breathe * 0.15
      haloRef.current.scale.setScalar(s)
    }
  })

  return (
    <group position={node.pos}>
      {/* Soft outer halo for the bloom feel */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[HALO_RADIUS, 18, 18]} />
        <meshBasicMaterial
          color={"#dcff50"}
          transparent
          opacity={0.18}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Solid glowing core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[NODE_RADIUS, 24, 24]} />
        <meshStandardMaterial
          color={"#0a0a0a"}
          emissive={"#dcff50"}
          emissiveIntensity={1.6}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>
    </group>
  )
}

function Nodes({ nodes }: { nodes: NodeT[] }) {
  return (
    <group>
      {nodes.map((n, i) => (
        <NodeMesh key={i} node={n} i={i} />
      ))}
    </group>
  )
}

function NeuralGraph() {
  const groupRef = useRef<THREE.Group>(null)
  const { nodes, edges } = useMemo(() => buildGraph(), [])

  useFrame((state: RootState) => {
    const g = groupRef.current
    if (!g) return
    const t = state.clock.elapsedTime
    // Slow, controlled rotation — feels deliberate, not chaotic
    g.rotation.y = Math.sin(t * 0.12) * 0.35
    g.rotation.x = Math.sin(t * 0.16) * 0.08

    // Soft mouse parallax
    const px = state.pointer.x
    const py = state.pointer.y
    g.position.x = THREE.MathUtils.lerp(g.position.x, px * 0.25, 0.04)
    g.position.y = THREE.MathUtils.lerp(g.position.y, py * 0.18, 0.04)
  })

  return (
    <group ref={groupRef}>
      <Edges edges={edges} />
      <Pulses edges={edges} />
      <Nodes nodes={nodes} />
    </group>
  )
}

/* ------------------------------ Scene ------------------------------ */

function Scene() {
  return (
    <>
      <fog attach="fog" args={["#0a0a0a", 9, 22]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} color={"#dcff50"} />
      <pointLight position={[-4, -2, -3]} intensity={0.5} color={"#7ee0ff"} />

      <NeuralGraph />
      <ParticleField count={900} />
    </>
  )
}

/* ------------------------------ Component ------------------------------ */

export function HeroCanvas() {
  return (
    <Canvas
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: true,
      }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 42 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
