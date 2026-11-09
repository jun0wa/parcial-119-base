import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

// Modelo 3D de la baliza / sirena de emergencia (alarm_light.glb)
export default function ModeloAlarma({ activa = false, onToggle = null }) {
  const groupRef = useRef()
  const beaconGroupRef = useRef()
  const pointLightRef = useRef()
  const spotLightRef = useRef()
  const spotTarget = useMemo(() => new THREE.Object3D(), [])

  // Cargar modelo y animaciones
  const { scene, animations } = useGLTF('/alarm_light.glb')
  const { actions } = useAnimations(animations, groupRef)

  // Clonar la escena y preparar materiales independientes
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
          // Cúpula roja de vidrio
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

  // Configurar el objetivo del reflector
  useEffect(() => {
    if (spotLightRef.current) {
      spotLightRef.current.target = spotTarget
    }
  }, [spotTarget])

  // Controlar la animación de giro de los reflectores internos (Cylinder|CylinderAction)
  useEffect(() => {
    const accion = actions?.['Cylinder|CylinderAction']
    if (accion) {
      if (activa) {
        accion.reset().play()
        accion.timeScale = 2.8 // Giro rápido de emergencia
      } else {
        accion.reset().play()
        accion.timeScale = 0.35 // Giro suave en espera
      }
    }
  }, [activa, actions])

  // Fotograma a fotograma: destellos y rotación
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Giro suave continuo para perspectiva 3D
    if (beaconGroupRef.current) {
      const velGiro = activa ? 2.4 : 0.4
      beaconGroupRef.current.rotation.y += delta * velGiro
    }

    // Reflector giratorio
    const angulo = t * (activa ? 8.5 : 1.5)
    spotTarget.position.x = Math.sin(angulo) * 4
    spotTarget.position.z = Math.cos(angulo) * 4

    if (activa) {
      // Destello continuo mientras esté activa
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
      // Reposo (apagado)
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

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        // En R3F onClick solo se dispara si es un clic real, no al arrastrar
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

      {/* Escala natural y centrada para apreciarla completa */}
      <group ref={beaconGroupRef} position={[0, -0.85, 0]} scale={1.0}>
        <primitive object={modeloClonado} />

        {/* Hitbox invisible que cubre toda la baliza para asegurar clics fáciles */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 2.3, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        {/* Luz puntual roja en la cúpula */}
        <pointLight
          ref={pointLightRef}
          position={[0, 0.95, 0]}
          color={activa ? '#ff1e1e' : '#991b1b'}
          intensity={activa ? 14 : 0.5}
          distance={8}
          decay={2}
        />

        {/* Haz de luz de advertencia */}
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
