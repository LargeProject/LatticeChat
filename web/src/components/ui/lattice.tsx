import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function CryptoLattice({
  animate = true,
  position = [0, 0, 0],
}: {
  animate?: boolean
  position?: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null!)

  const { positions, colors, lines } = useMemo(() => {
    const pointCount = 180
    const spread = 11
    const threshold = 2
    const thresholdSq = threshold * threshold

    const positions = new Float32Array(pointCount * 3)
    const colors = new Float32Array(pointCount * 3)

    const c = new THREE.Color()

    for (let i = 0; i < pointCount; i++) {
      const i3 = i * 3
      const x = THREE.MathUtils.randFloatSpread(spread)
      const y = THREE.MathUtils.randFloatSpread(spread)
      const z = THREE.MathUtils.randFloatSpread(spread)

      positions[i3] = x
      positions[i3 + 1] = y
      positions[i3 + 2] = z

      const hue = Math.random() < 0.5 ? 0.55 : 0.8
      const saturation = 0.5 + Math.random() * 0.5
      const lightness = 0.5 + Math.random() * 0.1

      c.setHSL(hue, saturation, lightness)

      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    const lineArray: number[] = []

    for (let i = 0; i < pointCount; i++) {
      const i3 = i * 3
      for (let j = i + 1; j < pointCount; j++) {
        const j3 = j * 3
        const dx = positions[i * 3] - positions[j * 3]
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1]
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2]

        const distSq = dx * dx + dy * dy + dz * dz

        if (distSq < thresholdSq) {
          lineArray.push(
            positions[i3],
            positions[i3 + 1],
            positions[i3 + 2],
            positions[j3],
            positions[j3 + 1],
            positions[j3 + 2],
          )
        }
      }
    }

    return {
      positions,
      colors,
      lines: new Float32Array(lineArray),
    }
  }, [])

  const acc = useRef(0)

  useFrame((state, delta) => {
    if (!animate) return

    acc.current += delta
    if (acc.current < 1 / 40) return
    acc.current = 0

    const t = state.clock.elapsedTime

    group.current.rotation.y = t * 0.05
    group.current.rotation.x = Math.sin(t * 0.05) * 0.2

    // ✅ preserve external position, animate relative to it
    const baseZ = position[2]
    group.current.position.z = baseZ + Math.sin(t * 0.25) * 1
  })

  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32

    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)
    texture.generateMipmaps = false
    texture.needsUpdate = false

    return texture
  }, [])

  return (
    <group ref={group} position={position}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            usage={THREE.StaticDrawUsage}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            usage={THREE.StaticDrawUsage}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.3}
          vertexColors
          transparent
          depthWrite={false}
          map={circleTexture}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lines, 3]}
            usage={THREE.StaticDrawUsage}
          />
        </bufferGeometry>

        <lineBasicMaterial
          color="#5aa9ff"
          transparent
          opacity={0.6}
          depthWrite={false}
          depthTest={false}
        />
      </lineSegments>
    </group>
  )
}

export default function LatticeAnimation({
  zoom = 5,
  autoRotateCamera = false,
  animateLattice = true,
  position = [0, 0, 0],
}: {
  zoom?: number
  autoRotateCamera?: boolean
  animateLattice?: boolean
  position?: [number, number, number]
}) {
  return (
    <Canvas camera={{ position: [0, 0, zoom], fov: 100 }}>
      <OrbitControls
        enableRotate
        enableZoom
        enablePan
        autoRotate={autoRotateCamera}
      />

      <CryptoLattice
        animate={animateLattice}
        position={position}
      />
    </Canvas>
  )
}