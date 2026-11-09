import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense, useState, useRef, useEffect } from 'react'
import ModeloAlarma from './ModeloAlarma.jsx'
import { reproducirSonidoAlarma } from './alarmaSonido.js'

// Geometría provisional que se muestra mientras se descarga el modelo 3D.
function CargandoAlarma() {
  return (
    <mesh position={[0, 0, 0]}>
      <cylinderGeometry args={[0.5, 0.6, 1, 16]} />
      <meshStandardMaterial color="#dc2626" wireframe opacity={0.4} transparent />
    </mesh>
  )
}

// Orquesta el lienzo 3D, gestiona el estado de la baliza y redirige las acciones de clic hacia el sonido y la luz.
export default function EscenaLanding() {
  const [activa, setActiva] = useState(false)
  const sonidoLimpiarRef = useRef(null)
  const autoApagadoRef = useRef(null)

  // Apaga la baliza: silencia el audio inmediatamente, cancela el temporizador y redirige el estado a inactivo.
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

  // Enciende la baliza: activa la iluminación, redirige al sintetizador de audio (2.2s) y programa el auto-apagado a los 8 segundos.
  const encender = () => {
    if (sonidoLimpiarRef.current) {
      sonidoLimpiarRef.current()
    }
    if (autoApagadoRef.current) {
      clearTimeout(autoApagadoRef.current)
    }

    setActiva(true)

    // Redirige la orden de reproducción a la síntesis de audio de emergencia.
    sonidoLimpiarRef.current = reproducirSonidoAlarma(2.2, () => {
      sonidoLimpiarRef.current = null
    })

    // Redirige el apagado automático al cumplirse los 8 segundos de actividad.
    autoApagadoRef.current = setTimeout(() => {
      apagar()
    }, 8000)
  }

  // Alterna entre encender o apagar la alarma según el estado actual.
  const alternarAlarma = () => {
    if (activa) {
      apagar()
    } else {
      encender()
    }
  }

  // Cancela temporizadores y corta el audio al desmontar la escena.
  useEffect(() => {
    return () => {
      if (sonidoLimpiarRef.current) sonidoLimpiarRef.current()
      if (autoApagadoRef.current) clearTimeout(autoApagadoRef.current)
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
      {/* Lienzo Three.js: contiene la cámara con perspectiva lejana (z: 4.5), luces y controles de rotación */}
      <Canvas
        camera={{ position: [0, 1.1, 4.5], fov: 45 }}
        style={{ height: 350, width: '100%' }}
      >
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 5, 3]} intensity={1.4} />
        <directionalLight position={[-4, 2, -2]} intensity={0.45} color="#fee2e2" />

        {/* Carga el modelo 3D y redirige el clic sobre la baliza hacia alternarAlarma */}
        <Suspense fallback={<CargandoAlarma />}>
          <ModeloAlarma activa={activa} onToggle={alternarAlarma} />
        </Suspense>

        {/* Permite rotar el modelo en 3D libremente sin interferir con los clics */}
        <OrbitControls
          enableZoom={true}
          minDistance={3.0}
          maxDistance={7.0}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Indicador inferior: muestra el estado actual mediante imagen de icono usual y redirige el clic a alternarAlarma */}
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
        {activa ? (
          <>
            <img
              src="/iconos/sirena.svg"
              alt=""
              width={18}
              height={18}
              style={{ verticalAlign: 'middle' }}
            />
            <span style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>
              Alarma activa · Clic para apagar (auto-apagado en 8s)
            </span>
          </>
        ) : (
          <>
            <img
              src="/iconos/bombillo.svg"
              alt=""
              width={18}
              height={18}
              style={{ verticalAlign: 'middle' }}
            />
            <span style={{ fontSize: 13, color: '#fee2e2', fontWeight: 600 }}>
              Clic en la baliza para encender y sonar
            </span>
          </>
        )}
      </div>
    </div>
  )
}
