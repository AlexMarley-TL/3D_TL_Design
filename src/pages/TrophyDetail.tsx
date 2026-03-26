import { useEffect } from 'react'
import { useParams } from 'react-router'
import { SHOWCASE_TROPHIES } from '../data/showcase.ts'
import { TrophyInfo } from '../components/TrophyInfo.tsx'
import type { MetalPreset } from '../types/index.ts'

interface TrophyDetailProps {
  onModelChange: (modelPath: string | null) => void
  onPresetChange: (preset: MetalPreset) => void
}

export function TrophyDetail({ onModelChange, onPresetChange }: TrophyDetailProps) {
  const { slug } = useParams<{ slug: string }>()
  const trophy = SHOWCASE_TROPHIES.find((t) => t.slug === slug)

  useEffect(() => {
    if (trophy) {
      onModelChange(trophy.modelPath)
      onPresetChange(trophy.materials.primary)
    }
    return () => { onModelChange(null) }
  }, [trophy, onModelChange, onPresetChange])

  if (!trophy) {
    return <div className="trophy-not-found">Trophy not found</div>
  }

  return <TrophyInfo trophy={trophy} />
}
