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
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (!useOriginalMaterials && material) {
          mesh.material = material
        }
        const mat = mesh.material as THREE.Material
        if (mat) mat.side = THREE.DoubleSide
      }
    })
  }, [scene, material, useOriginalMaterials])

  useEffect(() => {
    return () => { material?.dispose() }
  }, [material])

  return <primitive object={scene} rotation={[0, Math.PI, 0]} />
}
