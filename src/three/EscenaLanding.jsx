import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef } from 'react'

// Escena 3D de la landing con React Three Fiber.
// Esto es solo un punto de partida (una "sirena" que gira) para comprobar que R3F funciona.
// TODO (estudiantes): reemplazarla por su propia escena (sección 5 del enunciado).
function Sirena() {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 2
  })
  return (
    <group ref={ref}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 1, 32]} />
        <meshStandardMaterial color="#dc2626" emissive="#dc2626" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}

export default function EscenaLanding() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3.5], fov: 45 }} style={{ height: 320 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} />
      <Sirena />
      <OrbitControls enableZoom={false} />
    </Canvas>
  )
}
