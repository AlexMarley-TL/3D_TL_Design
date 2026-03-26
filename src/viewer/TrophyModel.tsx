import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { METAL_PRESETS } from '../materials/metalPresets.ts'
import type { MetalPreset } from '../types/index.ts'

interface TrophyModelProps {
  path: string
  preset: MetalPreset
}

export function TrophyModel({ path, preset }: TrophyModelProps) {
  const { scene } = useGLTF(path)

  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({ ...METAL_PRESETS[preset] }),
    [preset]
  )

  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material
      }
    })
  }, [scene, material])

  useEffect(() => {
    return () => { material.dispose() }
  }, [material])

  return <primitive object={scene} />
}
