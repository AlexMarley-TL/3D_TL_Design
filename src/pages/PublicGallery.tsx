import { useEffect } from 'react'
import { SHOWCASE_TROPHIES } from '../data/showcase.ts'
import { TrophyCard } from '../components/TrophyCard.tsx'

interface PublicGalleryProps {
  onModelChange: (path: string | null) => void
}

export function PublicGallery({ onModelChange }: PublicGalleryProps) {
  useEffect(() => {
    onModelChange(null)
  }, [onModelChange])

  return (
    <div className="gallery-page">
      <header className="gallery-header">
        <h1 className="gallery-title">Thomas Lyte</h1>
        <p className="gallery-subtitle">Luxury Trophies &amp; Silverware</p>
      </header>
      <div className="gallery-grid">
        {SHOWCASE_TROPHIES.map((trophy) => (
          <TrophyCard key={trophy.slug} trophy={trophy} />
        ))}
      </div>
    </div>
  )
}
