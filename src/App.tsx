import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { TrophyViewer } from './viewer/TrophyViewer.tsx'
import { SHOWCASE_TROPHIES } from './data/showcase.ts'
import type { MetalPreset } from './types/index.ts'

function App() {
  const defaultTrophy = SHOWCASE_TROPHIES[0]
  const [activeModel] = useState<string | null>(defaultTrophy?.modelPath ?? null)
  const [activePreset] = useState<MetalPreset>(defaultTrophy?.materials.primary ?? 'polishedGold')

  return (
    <BrowserRouter>
      <div className="app-layout">
        <TrophyViewer modelPath={activeModel} metalPreset={activePreset} />

        <div className="dom-overlay">
          <Routes>
            <Route path="/" element={<div className="phase1-label">Thomas Lyte 3D Gallery</div>} />
            <Route path="/trophy/:slug" element={<div>Trophy Detail (Phase 3)</div>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
