import { Canvas } from '@react-three/fiber'
import { Suspense, lazy } from 'react'
import { LoadingOverlay } from '../components/LoadingSpinner.tsx'
import type { MetalPreset } from '../types/index.ts'

const TrophyScene = lazy(() => import('./TrophyScene.tsx').then(m => ({ default: m.TrophyScene })))

interface TrophyViewerProps {
  modelPath: string | null
  metalPreset: MetalPreset
  useOriginalMaterials?: boolean
}

export function TrophyViewer({ modelPath, metalPreset, useOriginalMaterials }: TrophyViewerProps) {
  return (
    <div className="trophy-viewer">
      <Canvas
        flat
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ position: [0, 1, 4], fov: 45 }}
      >
        <Suspense fallback={null}>
          {modelPath && (
            <TrophyScene modelPath={modelPath} metalPreset={metalPreset} useOriginalMaterials={useOriginalMaterials} />
          )}
        </Suspense>
      </Canvas>
      <LoadingOverlay />
    </div>
  )
}
