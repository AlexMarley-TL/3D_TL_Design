import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { METAL_PRESETS } from '../materials/metalPresets.ts'
import type { MetalPreset } from '../types/index.ts'

interface TrophyModelProps {
  path: string
  preset: MetalPreset
  useOriginalMaterials?: boolean
}

export function TrophyModel({ path, preset, useOriginalMaterials = false }: TrophyModelProps) {
  const { scene } = useGLTF(path)

  const material = useMemo(
    () => useOriginalMaterials ? null : new THREE.MeshPhysicalMaterial({ ...METAL_PRESETS[preset] }),
    [preset, useOriginalMaterials]
  )

  useEffect(() => {
    if (useOriginalMaterials || !material) return
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material
      }
    })
  }, [scene, material, useOriginalMaterials])

  useEffect(() => {
    return () => { material?.dispose() }
  }, [material])

  return <primitive object={scene} />
}
