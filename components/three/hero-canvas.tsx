"use client"

import { Suspense, useMemo, useRef } from "react"
import { Canvas, useFrame, type RootState } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

/* ------------------------------ Ambient stars ------------------------------ */

function ParticleField({ count = 1200 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 5 + Math.random() * 7
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
    ref.current.rotation.y += delta * 0.03
    ref.current.rotation.x += delta * 0.008
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial
        transparent
        color={"#dcff50"}
        size={0.018}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

/* ------------------------------ Neural Network ------------------------------ */

// Architecture: input -> hidden -> hidden -> output (mimics real NN diagrams)
const LAYERS = [4, 6, 6, 3]
const LAYER_SPACING = 1.6
const NODE_RADIUS = 0.085

type Node = { pos: THREE.Vector3; layer: number; index: number }
type Edge = { a: Node; b: Node; speed: number; phase: number }

function buildGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const totalLayers = LAYERS.length
  const totalWidth = (totalLayers - 1) * LAYER_SPACING

  LAYERS.forEach((count, layerIdx) => {
    const x = layerIdx * LAYER_SPACING - totalWidth / 2
    // Vertical spacing inside the layer
    const vSpacing = 0.55
    const totalHeight = (count - 1) * vSpacing
    for (let i = 0; i < count; i++) {
      const y = i * vSpacing - totalHeight / 2
      // Slight z jitter so the graph feels 3D when rotated
      const z = (Math.random() - 0.5) * 0.4
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
          speed: 0.35 + Math.random() * 0.5,
          phase: Math.random(),
        })
      }
    }
  }

  return { nodes, edges }
}

function Edges({ edges }: { edges: Edge[] }) {
  // Static line geometry for all edges
  const geometry = useMemo(() => {
    const positions = new Float32Array(edges.length * 2 * 3)
    edges.forEach((e, i) => {
      const off = i * 6
      positions[off + 0] = e.a.pos.x
      positions[off + 1] = e.a.pos.y
      positions[off + 2] = e.a.pos.z
      positions[off + 3] = e.b.pos.x
      positions[off + 4] = e.b.pos.y
      positions[off + 5] = e.b.pos.z
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [edges])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color={"#dcff50"}
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function Pulses({ edges }: { edges: Edge[] }) {
  // One traveling "data packet" per edge, rendered as a Points cloud for cheapness
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
      // Loop 0..1 over time, offset per edge
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
    if (ref.current) ref.current.rotation.set(0, 0, 0)
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={"#ffffff"}
        size={0.07}
        transparent
        opacity={0.95}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function Nodes({ nodes }: { nodes: Node[] }) {
  const groupRef = useRef<THREE.Group>(null)
  const meshes = useRef<THREE.Mesh[]>([])

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime
    meshes.current.forEach((m, i) => {
      if (!m) return
      // Each node breathes at its own frequency
      const s = 1 + Math.sin(t * 1.2 + i * 0.6) * 0.15
      m.scale.setScalar(s)
      const mat = m.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.7 + (Math.sin(t * 1.6 + i * 0.4) * 0.5 + 0.5) * 1.2
    })
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) meshes.current[i] = m
          }}
          position={n.pos}
        >
          <sphereGeometry args={[NODE_RADIUS, 20, 20]} />
          <meshStandardMaterial
            color={"#0a0a0a"}
            emissive={"#dcff50"}
            emissiveIntensity={1.0}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
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
    // Slow autonomous rotation
    g.rotation.y = Math.sin(t * 0.18) * 0.55 + t * 0.04
    g.rotation.x = Math.sin(t * 0.22) * 0.18

    // Mouse parallax
    const px = state.pointer.x
    const py = state.pointer.y
    g.position.x = THREE.MathUtils.lerp(g.position.x, px * 0.35, 0.05)
    g.position.y = THREE.MathUtils.lerp(g.position.y, py * 0.25, 0.05)
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
      <color attach="background" args={["#0a0a0a"]} />
      <fog attach="fog" args={["#0a0a0a", 7, 20]} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.0} color={"#dcff50"} />
      <pointLight position={[-4, -2, -3]} intensity={0.6} color={"#ffffff"} />

      <NeuralGraph />
      <ParticleField count={1100} />
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
      camera={{ position: [0, 0, 5.5], fov: 45 }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}
