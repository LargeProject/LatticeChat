'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

function CryptoLattice() {
  const group = useRef<THREE.Group>(null!)

  const { positions, colors, lines } = useMemo(() => {
    const pointCount = 200
    const spread = 12
    const threshold = 2.8
    const thresholdSq = threshold * threshold

    const pts = new Float32Array(pointCount * 3)
    const pos = new Float32Array(pointCount * 3)
    const col = new Float32Array(pointCount * 3)

    for (let i = 0; i < pointCount; i++) {
      const x = THREE.MathUtils.randFloatSpread(spread)
      const y = THREE.MathUtils.randFloatSpread(spread)
      const z = THREE.MathUtils.randFloatSpread(spread)

      pts[i * 3] = x
      pts[i * 3 + 1] = y
      pts[i * 3 + 2] = z

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      const hue = Math.random() < 0.5 ? 0.55 : 0.8
      const saturation = 0.5 + Math.random() * 0.5
      const lightness = 0.5 + Math.random() * 0.1

      const c = new THREE.Color().setHSL(hue, saturation, lightness)

      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }

    const lineArray: number[] = []

    for (let i = 0; i < pointCount; i++) {
      for (let j = i + 1; j < pointCount; j++) {
        const dx = pts[i * 3] - pts[j * 3]
        const dy = pts[i * 3 + 1] - pts[j * 3 + 1]
        const dz = pts[i * 3 + 2] - pts[j * 3 + 2]

        const distSq = dx * dx + dy * dy + dz * dz

        if (distSq < thresholdSq) {
          lineArray.push(
            pts[i * 3],
            pts[i * 3 + 1],
            pts[i * 3 + 2],
            pts[j * 3],
            pts[j * 3 + 1],
            pts[j * 3 + 2],
          )
        }
      }
    }

    return {
      positions: pos,
      colors: col,
      lines: new Float32Array(lineArray),
    }
  }, [])

  const lastFrame = useRef(0)
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime()

    if (t - lastFrame.current < 1 / 40) return
    lastFrame.current = t

    group.current.position.y = Math.sin(t * 0.015) * 0.1

    const radius = 5 + Math.sin(t * 0.1) * 3
    const angle = t * 0.015

    camera.position.x = Math.cos(angle) * radius
    camera.position.z = Math.sin(angle) * radius

    camera.lookAt(0, 0, 0)
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
    texture.needsUpdate = true

    return texture
  }, [])

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
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
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>

        <lineBasicMaterial
          color="#5aa9ff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  )
}

export default function Lattice() {
  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 120 }}
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
    >
      <CryptoLattice />
    </Canvas>
  )
}
