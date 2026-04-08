import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { METAL_PRESETS } from '../materials/metalPresets.ts'
import type { MetalPreset } from '../types/index.ts'

const SKIP_NODES = ['Backdrop', 'Backdrop right', 'BackdropLeft', 'Render', 'studio']

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
      if (SKIP_NODES.includes(child.name)) {
        child.visible = false
        return
      }
      if (!useOriginalMaterials && material && (child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = material
      }
    })
  }, [scene, material, useOriginalMaterials])

  useEffect(() => {
    return () => { material?.dispose() }
  }, [material])

  return <primitive object={scene} />
}
