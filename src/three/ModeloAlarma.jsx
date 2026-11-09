import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

// Renderiza el modelo 3D de la baliza, gestiona sus materiales y redirige los eventos de clic a la activación de la alarma.
export default function ModeloAlarma({ activa = false, onToggle = null }) {
  const groupRef = useRef()
  const beaconGroupRef = useRef()
  const pointLightRef = useRef()
  const spotLightRef = useRef()
  const spotTarget = useMemo(() => new THREE.Object3D(), [])

  // Carga las geometrías y animaciones del modelo; redirige la acción de rotación de reflectores a useAnimations.
  const { scene, animations } = useGLTF('/alarm_light.glb')
  const { actions } = useAnimations(animations, groupRef)

  // Clona el modelo para aislar sus propiedades y redirige estilos específicos a la cúpula roja y los bombillos.
  const { modeloClonado, materiales } = useMemo(() => {
    const clon = scene.clone(true)
    const mats = {
      glass: null,
      lightR: null,
      lightL: null,
      base: null,
    }

    clon.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()

        if (child.material.name === 'Material.001') {
          // Configura la cúpula roja con transparencia y refracción.
          child.material.transparent = true
          child.material.opacity = 0.82
          child.material.roughness = 0.12
          child.material.metalness = 0.1
          child.material.depthWrite = false
          mats.glass = child.material
        } else if (child.material.name === 'LightR') {
          mats.lightR = child.material
        } else if (child.material.name === 'LightL') {
          mats.lightL = child.material
        } else if (child.material.name === 'Base') {
          mats.base = child.material
        }
      }
    })

    return { modeloClonado: clon, materiales: mats }
  }, [scene])

  // Vincula el foco direccional con el objetivo en movimiento y redirige la trayectoria del haz de luz.
  useEffect(() => {
    if (spotLightRef.current) {
      spotLightRef.current.target = spotTarget
    }
  }, [spotTarget])

  // Controla la velocidad de rotación de los reflectores: redirige a giro rápido si está activa o suave en reposo.
  useEffect(() => {
    const accion = actions?.['Cylinder|CylinderAction']
    if (accion) {
      if (activa) {
        accion.reset().play()
        accion.timeScale = 2.8
      } else {
        accion.reset().play()
        accion.timeScale = 0.35
      }
    }
  }, [activa, actions])

  // Bucle de renderizado: modula el destello de la luz roja, el haz exterior y redirige la rotación en cada cuadro.
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Gira suavemente toda la baliza para exhibirla en 3D.
    if (beaconGroupRef.current) {
      const velGiro = activa ? 2.4 : 0.4
      beaconGroupRef.current.rotation.y += delta * velGiro
    }

    // Calcula el ángulo de giro y redirige la posición del reflector exterior.
    const angulo = t * (activa ? 8.5 : 1.5)
    spotTarget.position.x = Math.sin(angulo) * 4
    spotTarget.position.z = Math.cos(angulo) * 4

    if (activa) {
      // Estado encendido: redirige intensidades altas de emisión y destellos a la cúpula y luces puntuales.
      const pulso = Math.sin(t * 16) * 0.5 + 0.5
      const intensidadVidrio = 2.0 + pulso * 2.2

      if (materiales.glass) {
        materiales.glass.emissive.set('#ff1111')
        materiales.glass.emissiveIntensity = intensidadVidrio
      }
      if (materiales.lightR) {
        materiales.lightR.emissive.set('#ffffff')
        materiales.lightR.emissiveIntensity = 4.0 + pulso * 2.0
      }
      if (materiales.lightL) {
        materiales.lightL.emissive.set('#ffffff')
        materiales.lightL.emissiveIntensity = 4.0 + (1 - pulso) * 2.0
      }
      if (pointLightRef.current) {
        pointLightRef.current.intensity = 14 + pulso * 10
      }
      if (spotLightRef.current) {
        spotLightRef.current.intensity = 22 + pulso * 12
      }
    } else {
      // Estado apagado: redirige las luces y emisiones a valores mínimos de reposo.
      if (materiales.glass) {
        materiales.glass.emissive.set('#3a0202')
        materiales.glass.emissiveIntensity = 0.25
      }
      if (materiales.lightR) {
        materiales.lightR.emissive.set('#000000')
        materiales.lightR.emissiveIntensity = 0
      }
      if (materiales.lightL) {
        materiales.lightL.emissive.set('#000000')
        materiales.lightL.emissiveIntensity = 0
      }
      if (pointLightRef.current) {
        pointLightRef.current.intensity = 0.5
      }
      if (spotLightRef.current) {
        spotLightRef.current.intensity = 0
      }
    }
  })

  // Estructura visual: detecta clics sobre la baliza y redirige el evento hacia onToggle() para encender/apagar.
  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation()
        if (onToggle) onToggle()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default'
      }}
    >
      <primitive object={spotTarget} />

      <group ref={beaconGroupRef} position={[0, -0.85, 0]} scale={1.0}>
        <primitive object={modeloClonado} />

        {/* Zona de impacto invisible para asegurar que cualquier toque en la baliza active el evento */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 2.3, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Luz puntual interior que ilumina la cúpula roja */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0.95, 0]}
          color={activa ? '#ff1e1e' : '#991b1b'}
          intensity={activa ? 14 : 0.5}
          distance={8}
          decay={2}
        />

        {/* Luz direccional que proyecta el haz de aviso hacia el exterior */}
        <spotLight
          ref={spotLightRef}
          position={[0, 0.95, 0]}
          color="#ff4422"
          intensity={activa ? 22 : 0}
          angle={0.6}
          penumbra={0.7}
          distance={12}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/alarm_light.glb')
