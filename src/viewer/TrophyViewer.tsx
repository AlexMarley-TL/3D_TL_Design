import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { TrophyScene } from './TrophyScene.tsx'
import { LoadingOverlay } from '../components/LoadingSpinner.tsx'
import type { MetalPreset } from '../types/index.ts'

interface TrophyViewerProps {
  modelPath: string | null
  metalPreset: MetalPreset
}

export function TrophyViewer({ modelPath, metalPreset }: TrophyViewerProps) {
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
            <TrophyScene modelPath={modelPath} metalPreset={metalPreset} />
          )}
        </Suspense>
      </Canvas>
      <LoadingOverlay />
    </div>
  )
}
