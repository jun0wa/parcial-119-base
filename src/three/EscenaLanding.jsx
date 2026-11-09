import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import ModeloAlarma from './ModeloAlarma.jsx'
import { reproducirSonidoAlarma } from './alarmaSonido.js'

// Fallback visual mientras carga el modelo
function CargandoAlarma() {
  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.6, 1, 16]} />
      <meshStandardMaterial color="#dc2626" wireframe opacity={0.4} transparent />
    </mesh>
  )
}

export default function EscenaLanding() {
  const [activa, setActiva] = useState(false)
  const sonidoLimpiarRef = useRef(null)
  const autoApagadoRef = useRef(null)

  // Apagar la alarma: silencia el sonido, cancela el timer y apaga la luz
  const apagar = () => {
    if (sonidoLimpiarRef.current) {
      sonidoLimpiarRef.current()
      sonidoLimpiarRef.current = null
    }
    if (autoApagadoRef.current) {
      clearTimeout(autoApagadoRef.current)
      autoApagadoRef.current = null
    }
    setActiva(false)
  }

  // Encender la alarma: reproduce el sonido (2.2s) y programa el auto-apagado a los 8 segundos (7-9s)
  const encender = () => {
    if (sonidoLimpiarRef.current) {
      sonidoLimpiarRef.current()
    }
    if (autoApagadoRef.current) {
      clearTimeout(autoApagadoRef.current)
    }

    setActiva(true)

    // Reproducir sonido
    sonidoLimpiarRef.current = reproducirSonidoAlarma(2.2, () => {
      sonidoLimpiarRef.current = null
    })

    // Se apaga automáticamente a los 8 segundos
    autoApagadoRef.current = setTimeout(() => {
      apagar()
    }, 8000)
  }

  const alternarAlarma = () => {
    if (activa) {
      apagar()
    } else {
      encender()
    }
  }

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (sonidoLimpiarRef.current) sonidoLimpiarRef.current()
      if (autoApagadoRef.current) clearTimeout(autoApagadoRef.current)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
      <Canvas
        camera={{ position: [0, 1.1, 4.5], fov: 45 }}
        style={{ height: 350, width: '100%' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 5, 3]} intensity={1.4} />
        <directionalLight position={[-4, 2, -2]} intensity={0.45} color="#fee2e2" />

        <Suspense fallback={<CargandoAlarma />}>
          <ModeloAlarma activa={activa} onToggle={alternarAlarma} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          minDistance={3.0}
          maxDistance={7.0}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      <div
        onClick={alternarAlarma}
        style={{
          marginTop: 6,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          padding: '6px 14px',
          borderRadius: 20,
          background: activa ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0, 0, 0, 0.25)',
          border: activa ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.2)',
          userSelect: 'none',
          transition: 'all 0.2s ease',
        }}
        title="Clic para encender o apagar la alarma"
      >
        <span style={{ fontSize: 13, color: activa ? '#fca5a5' : '#fee2e2', fontWeight: 600 }}>
          {activa ? '🚨 Alarma activa · Clic para apagar (auto-apagado en 8s)' : '💡 Clic en la baliza para encender y sonar'}
        </span>
      </div>
    </div>
  )
}
