import { useState, useCallback, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { TrophyViewer } from './viewer/TrophyViewer.tsx'
import { SHOWCASE_TROPHIES } from './data/showcase.ts'
import type { MetalPreset } from './types/index.ts'

const PublicGallery = lazy(() => import('./pages/PublicGallery.tsx').then(m => ({ default: m.PublicGallery })))
const TrophyDetail = lazy(() => import('./pages/TrophyDetail.tsx').then(m => ({ default: m.TrophyDetail })))
const ClientPortal = lazy(() => import('./pages/ClientPortal.tsx').then(m => ({ default: m.ClientPortal })))
const IterationDetail = lazy(() => import('./pages/IterationDetail.tsx').then(m => ({ default: m.IterationDetail })))

function App() {
  const defaultTrophy = SHOWCASE_TROPHIES[0]
  const [activeModel, setActiveModel] = useState<string | null>(defaultTrophy?.modelPath ?? null)
  const [activePreset, setActivePreset] = useState<MetalPreset>(defaultTrophy?.materials.primary ?? 'polishedGold')
  const [useOriginalMaterials, setUseOriginalMaterials] = useState(defaultTrophy?.useOriginalMaterials ?? false)

  const handleModelChange = useCallback((path: string | null) => setActiveModel(path), [])
  const handlePresetChange = useCallback((preset: MetalPreset) => setActivePreset(preset), [])
  const handleOriginalMaterialsChange = useCallback((value: boolean) => setUseOriginalMaterials(value), [])

  return (
    <BrowserRouter>
      <div className="app-layout">
        <TrophyViewer modelPath={activeModel} metalPreset={activePreset} useOriginalMaterials={useOriginalMaterials} />

        <div className="dom-overlay">
          <Suspense fallback={<div className="loading-overlay"><div className="loading-spinner" /></div>}>
            <Routes>
              <Route path="/" element={<PublicGallery onModelChange={handleModelChange} />} />
              <Route
                path="/trophy/:slug"
                element={
                  <TrophyDetail
                    onModelChange={handleModelChange}
                    onPresetChange={handlePresetChange}
                    onOriginalMaterialsChange={handleOriginalMaterialsChange}
                  />
                }
              />
              <Route
                path="/project/:code/:slug"
                element={
                  <IterationDetail
                    onModelChange={handleModelChange}
                    onPresetChange={handlePresetChange}
                    onOriginalMaterialsChange={handleOriginalMaterialsChange}
                  />
                }
              />
              <Route path="/project/:code" element={<ClientPortal onModelChange={handleModelChange} />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
