"use client"

import { Suspense, useMemo, useRef } from "react"
import { Canvas, useFrame, type RootState } from "@react-three/fiber"
import { Float, Stars, Trail } from "@react-three/drei"
import * as THREE from "three"
import { SIMPLEX_NOISE_3D } from "./glsl-noise"

/* =====================================================================
   Cognitive Field — multi-layer AI-themed 3D hero scene
   ---------------------------------------------------------------------
   Layers (back → front):
     1. Stars + nebula sparkles  (drei Stars + custom point cloud)
     2. Neural cloud — sphere of nodes + electric pulses on edges
     3. Orbital data satellites with motion trails (Lissajous orbits)
     4. Wireframe icosahedron lattice (the "data shell")
     5. Shader-distorted core — custom GLSL with Simplex noise + Fresnel
     6. Volumetric glow halo (additive plane)

   Camera: mouse parallax + scroll-driven dolly back via window.scrollY.
   ===================================================================== */

const ACCENT = "#dcff50"
const ACCENT_DARK = "#9ad030"
const RIM = "#e8ffd0"

/* --------------------- 1. Distorted Core (custom shader) --------------------- */

const coreVertex = /* glsl */ `
  uniform float uTime;
  uniform float uDistort;
  uniform float uFreq;
  uniform float uPulse;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDisp;

  ${SIMPLEX_NOISE_3D}

  void main() {
    // Layered fbm-style noise for richer surface motion
    float n1 = snoise(position * uFreq + vec3(uTime * 0.35));
    float n2 = snoise(position * uFreq * 2.1 + vec3(uTime * 0.55, 0.0, uTime * 0.2));
    float n  = (n1 * 0.65 + n2 * 0.35);

    float displacement = n * uDistort * (0.85 + uPulse * 0.4);
    vec3 displaced = position + normal * displacement;

    vDisp = n;

    vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
    vViewPos = mv.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`

const coreFragment = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorRim;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vDisp;

  void main() {
    vec3 viewDir = normalize(-vViewPos);
    float fres = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.6);

    // Surface gradient driven by displacement field
    float t = smoothstep(-0.6, 0.6, vDisp);
    vec3 base = mix(uColorA, uColorB, t);

    // Iridescent shimmer along normals
    float shimmer = sin(vDisp * 6.0 + uTime * 1.5) * 0.5 + 0.5;
    base += uColorRim * shimmer * 0.08;

    // Fresnel rim glow
    vec3 col = base + uColorRim * fres * 1.4;
    // Sparkle on extreme edges
    col += pow(fres, 4.0) * vec3(1.0) * 0.55;

    gl_FragColor = vec4(col, 1.0);
  }
`

function DistortedCore({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistort: { value: 0.32 },
      uFreq: { value: 1.6 },
      uPulse: { value: 0 },
      uColorA: { value: new THREE.Color("#0e1a0a") },
      uColorB: { value: new THREE.Color(ACCENT) },
      uColorRim: { value: new THREE.Color(RIM) },
    }),
    [],
  )

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime
    uniforms.uTime.value = t
    uniforms.uPulse.value = pulseRef.current
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.18
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.25
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.05, 64]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
        />
      </mesh>
    </Float>
  )
}

/* --------------------- 2. Wireframe Lattice Shell --------------------- */

function LatticeShell() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime
    if (!ref.current) return
    ref.current.rotation.y = -t * 0.08
    ref.current.rotation.z = t * 0.05
    const s = 1 + Math.sin(t * 0.9) * 0.03
    ref.current.scale.setScalar(s)
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1.55, 1]} />
      <meshBasicMaterial
        color={ACCENT}
        wireframe
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </mesh>
  )
}

/* --------------------- 3. Orbital Satellites with Trails --------------------- */

interface SatelliteParams {
  ax: number
  ay: number
  az: number
  fx: number
  fy: number
  fz: number
  px: number
  py: number
  pz: number
  speed: number
  size: number
}

function buildSatellites(count: number): SatelliteParams[] {
  const arr: SatelliteParams[] = []
  for (let i = 0; i < count; i++) {
    arr.push({
      ax: 2.4 + Math.random() * 0.6,
      ay: 1.6 + Math.random() * 0.8,
      az: 2.2 + Math.random() * 0.5,
      fx: 0.6 + Math.random() * 0.6,
      fy: 0.8 + Math.random() * 0.7,
      fz: 0.5 + Math.random() * 0.6,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      pz: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.35,
      size: 0.06 + Math.random() * 0.05,
    })
  }
  return arr
}

function Satellite({ params }: { params: SatelliteParams }) {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime * params.speed
    const x = Math.sin(t * params.fx + params.px) * params.ax
    const y = Math.sin(t * params.fy + params.py) * params.ay
    const z = Math.cos(t * params.fz + params.pz) * params.az
    if (ref.current) {
      ref.current.position.set(x, y, z)
      ref.current.rotation.x = t * 1.2
      ref.current.rotation.y = t * 0.9
    }
  })

  return (
    <Trail
      width={0.25}
      length={5}
      color={ACCENT}
      attenuation={(t) => t * t}
    >
      <mesh ref={ref}>
        <octahedronGeometry args={[params.size, 0]} />
        <meshStandardMaterial
          color={"#0a0a0a"}
          emissive={ACCENT}
          emissiveIntensity={1.6}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
    </Trail>
  )
}

function Satellites({ count = 6 }: { count?: number }) {
  const params = useMemo(() => buildSatellites(count), [count])
  return (
    <>
      {params.map((p, i) => (
        <Satellite key={i} params={p} />
      ))}
    </>
  )
}

/* --------------------- 4. Neural Cloud — sphere + edges + pulses --------------------- */

interface NeuralData {
  positions: Float32Array
  edges: { a: number; b: number; speed: number; phase: number }[]
}

function buildNeural(nodeCount: number, radius: number, k: number): NeuralData {
  const positions = new Float32Array(nodeCount * 3)
  const pts: THREE.Vector3[] = []
  // Fibonacci sphere distribution for even coverage
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    // jitter so it doesn't look perfectly geometric
    const jitter = 0.07
    const px = (x + (Math.random() - 0.5) * jitter) * radius
    const py = (y + (Math.random() - 0.5) * jitter) * radius
    const pz = (z + (Math.random() - 0.5) * jitter) * radius
    positions[i * 3 + 0] = px
    positions[i * 3 + 1] = py
    positions[i * 3 + 2] = pz
    pts.push(new THREE.Vector3(px, py, pz))
  }

  // For each node, connect to its k-nearest neighbors. Dedupe pairs.
  const edgeSet = new Set<string>()
  const edges: NeuralData["edges"] = []
  for (let i = 0; i < pts.length; i++) {
    const dists: { j: number; d: number }[] = []
    for (let j = 0; j < pts.length; j++) {
      if (i === j) continue
      dists.push({ j, d: pts[i].distanceTo(pts[j]) })
    }
    dists.sort((a, b) => a.d - b.d)
    for (let n = 0; n < k; n++) {
      const j = dists[n].j
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (edgeSet.has(key)) continue
      edgeSet.add(key)
      edges.push({
        a: i < j ? i : j,
        b: i < j ? j : i,
        speed: 0.35 + Math.random() * 0.55,
        phase: Math.random(),
      })
    }
  }
  return { positions, edges }
}

function NeuralCloud({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const NODE_COUNT = 90
  const RADIUS = 2.6
  const K = 3

  const data = useMemo(() => buildNeural(NODE_COUNT, RADIUS, K), [])
  const groupRef = useRef<THREE.Group>(null)

  // Edge line geometry — static positions
  const edgeGeometry = useMemo(() => {
    const arr = new Float32Array(data.edges.length * 2 * 3)
    data.edges.forEach((e, i) => {
      const o = i * 6
      arr[o + 0] = data.positions[e.a * 3 + 0]
      arr[o + 1] = data.positions[e.a * 3 + 1]
      arr[o + 2] = data.positions[e.a * 3 + 2]
      arr[o + 3] = data.positions[e.b * 3 + 0]
      arr[o + 4] = data.positions[e.b * 3 + 1]
      arr[o + 5] = data.positions[e.b * 3 + 2]
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3))
    return g
  }, [data])

  // Pulse positions (one per edge) updated each frame
  const pulsePositions = useMemo(
    () => new Float32Array(data.edges.length * 3),
    [data.edges.length],
  )
  const pulseGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3))
    return g
  }, [pulsePositions])

  // Node geometry as Points
  const nodesGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3))
    return g
  }, [data])

  useFrame((state: RootState) => {
    const t = state.clock.elapsedTime

    // Animate pulses along their edge
    for (let i = 0; i < data.edges.length; i++) {
      const e = data.edges[i]
      let p = (e.phase + t * e.speed) % 1
      if (p < 0) p += 1
      const ax = data.positions[e.a * 3 + 0]
      const ay = data.positions[e.a * 3 + 1]
      const az = data.positions[e.a * 3 + 2]
      const bx = data.positions[e.b * 3 + 0]
      const by = data.positions[e.b * 3 + 1]
      const bz = data.positions[e.b * 3 + 2]
      pulsePositions[i * 3 + 0] = ax + (bx - ax) * p
      pulsePositions[i * 3 + 1] = ay + (by - ay) * p
      pulsePositions[i * 3 + 2] = az + (bz - az) * p
    }
    ;(pulseGeometry.attributes.position as THREE.BufferAttribute).needsUpdate = true

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.06
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.2
      const scale = 1 + pulseRef.current * 0.04
      groupRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial
          color={ACCENT_DARK}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={nodesGeometry}>
        <pointsMaterial
          color={ACCENT}
          size={0.05}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points geometry={pulseGeometry}>
        <pointsMaterial
          color={"#ffffff"}
          size={0.06}
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

/* --------------------- 5. Volumetric Glow Halo (additive billboard) --------------------- */

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const haloFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - 0.5;
    float d = length(p);
    float core = smoothstep(0.5, 0.0, d);
    float ring = smoothstep(0.5, 0.46, d) - smoothstep(0.46, 0.42, d);
    float pulse = 0.6 + sin(uTime * 1.4) * 0.15;
    float a = core * 0.45 * pulse + ring * 0.4;
    gl_FragColor = vec4(uColor, a);
  }
`

function Halo() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(ACCENT) },
    }),
    [],
  )
  useFrame((state: RootState) => {
    uniforms.uTime.value = state.clock.elapsedTime
  })
  return (
    <mesh position={[0, 0, -0.4]}>
      <planeGeometry args={[6, 6]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={haloVertex}
        fragmentShader={haloFragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/* --------------------- 6. Camera Rig — mouse + scroll dolly --------------------- */

function CameraRig({ pulseRef }: { pulseRef: React.MutableRefObject<number> }) {
  const target = useRef(new THREE.Vector3(0, 0, 5.5))
  const scrollRef = useRef(0)

  useFrame((state: RootState, dt: number) => {
    // Read scroll only on the main thread, normalized 0..1 across hero height
    if (typeof window !== "undefined") {
      const max = Math.max(1, window.innerHeight)
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / max))
    }

    // Audio-style "pulse" modulated by mouse + time so the core feels alive
    const t = state.clock.elapsedTime
    const mouseSpeed = Math.hypot(state.pointer.x, state.pointer.y)
    pulseRef.current =
      0.5 + Math.sin(t * 2.0) * 0.25 + mouseSpeed * 0.5

    // Mouse parallax (subtle)
    const px = state.pointer.x
    const py = state.pointer.y
    target.current.x = px * 0.8
    target.current.y = py * 0.5
    // Scroll dollies camera back + slight tilt down
    target.current.z = 5.5 + scrollRef.current * 3.5

    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      target.current.x,
      4,
      dt,
    )
    state.camera.position.y = THREE.MathUtils.damp(
      state.camera.position.y,
      target.current.y,
      4,
      dt,
    )
    state.camera.position.z = THREE.MathUtils.damp(
      state.camera.position.z,
      target.current.z,
      3,
      dt,
    )
    state.camera.lookAt(0, 0, 0)
  })

  return null
}

/* --------------------- Scene Assembly --------------------- */

function Scene() {
  const pulseRef = useRef(0)

  return (
    <>
      <color attach="background" args={["#070707"]} />
      <fog attach="fog" args={["#070707", 8, 24]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color={ACCENT} />
      <pointLight position={[-4, -2, -3]} intensity={0.6} color={"#ffffff"} />
      <pointLight position={[0, 0, 0]} intensity={1.2} color={ACCENT} distance={4} />

      <CameraRig pulseRef={pulseRef} />

      {/* Background nebula */}
      <Stars
        radius={60}
        depth={40}
        count={2200}
        factor={3}
        saturation={0.2}
        fade
        speed={0.6}
      />

      {/* Mid layers */}
      <NeuralCloud pulseRef={pulseRef} />
      <Satellites count={6} />

      {/* Foreground core stack */}
      <Halo />
      <LatticeShell />
      <DistortedCore pulseRef={pulseRef} />
    </>
  )
}

/* --------------------- Public component --------------------- */

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
