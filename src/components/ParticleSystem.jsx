import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { generateTextCoordinates, analyzeGesture } from '../utils/helpers'

const COUNT = 6000

const ParticleSystem = ({ handRef }) => {
  const { viewport } = useThree()
  const meshRef = useRef()
  
  const textTargets = useMemo(() => 
    generateTextCoordinates("I LOVE YOU", 800, 400, COUNT), 
  [])

  const particles = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT * 3)
    const color = new Float32Array(COUNT * 3)
    
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
      
      color[i * 3] = 0.2
      color[i * 3 + 1] = 0.6
      color[i * 3 + 2] = 1.0
    }
    return { pos, vel, color }
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const gesture = analyzeGesture(handRef.current)
    const positions = meshRef.current.geometry.attributes.position.array
    const colors = meshRef.current.geometry.attributes.color.array

    let targetX = 0, targetY = 0
    if (gesture.position) {
      targetX = (1 - gesture.position.x) * viewport.width - viewport.width / 2
      targetY = (1 - gesture.position.y) * viewport.height - viewport.height / 2
    }

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      let px = positions[i3]
      let py = positions[i3 + 1]
      let pz = positions[i3 + 2]

      let vx = particles.vel[i3]
      let vy = particles.vel[i3 + 1]
      let vz = particles.vel[i3 + 2]

      if (gesture.type === 'LOVE') {
        const tx = textTargets[i3]
        const ty = textTargets[i3 + 1]
        const tz = textTargets[i3 + 2]

        vx += (tx - px) * 0.08
        vy += (ty - py) * 0.08
        vz += (tz - pz) * 0.08
        
        vx *= 0.7
        vy *= 0.7
        vz *= 0.7

        colors[i3] = THREE.MathUtils.lerp(colors[i3], 1.0, 0.1)
        colors[i3 + 1] = THREE.MathUtils.lerp(colors[i3 + 1], 0.0, 0.1)
        colors[i3 + 2] = THREE.MathUtils.lerp(colors[i3 + 2], 0.3, 0.1)

      } else {
        if (gesture.type === 'OPEN_PALM') {
           const dx = px - targetX
           const dy = py - targetY
           const dist = Math.sqrt(dx * dx + dy * dy)
           if (dist < 6) {
             const force = (6 - dist) * 0.08
             vx += (dx / dist) * force
             vy += (dy / dist) * force
           }
        } else if (gesture.type === 'POINT') {
           const dx = targetX - px
           const dy = targetY - py
           const dist = Math.sqrt(dx * dx + dy * dy)
           if (dist < 8) {
             vx += dx * 0.003
             vy += dy * 0.003
           }
        }

        const noiseX = Math.sin(time * 0.3 + py * 0.5) * 0.003
        const noiseY = Math.cos(time * 0.2 + px * 0.5) * 0.003
        
        const returnForce = 0.0001
        vx -= px * returnForce + noiseX
        vy -= py * returnForce + noiseY
        vz -= pz * returnForce

        vx *= 0.96
        vy *= 0.96
        vz *= 0.96

        colors[i3] = THREE.MathUtils.lerp(colors[i3], 0.2, 0.05)
        colors[i3 + 1] = THREE.MathUtils.lerp(colors[i3 + 1], 0.8, 0.05)
        colors[i3 + 2] = THREE.MathUtils.lerp(colors[i3 + 2], 1.0, 0.05)
      }

      positions[i3] += vx
      positions[i3 + 1] += vy
      positions[i3 + 2] += vz
      
      particles.vel[i3] = vx
      particles.vel[i3 + 1] = vy
      particles.vel[i3 + 2] = vz
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.color.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={particles.pos}
          itemSize={3}
        />
        <bufferAttribute
            attach="attributes-color"
            count={COUNT}
            array={particles.color}
            itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        opacity={0.8}
      />
    </points>
  )
}

export default ParticleSystem
    
