import { useEffect } from 'react'
import { useParams } from 'react-router'
import { SHOWCASE_TROPHIES } from '../data/showcase.ts'
import { TrophyInfo } from '../components/TrophyInfo.tsx'
import type { MetalPreset } from '../types/index.ts'

interface TrophyDetailProps {
  onModelChange: (modelPath: string | null) => void
  onPresetChange: (preset: MetalPreset) => void
  onOriginalMaterialsChange: (value: boolean) => void
}

export function TrophyDetail({ onModelChange, onPresetChange, onOriginalMaterialsChange }: TrophyDetailProps) {
  const { slug } = useParams<{ slug: string }>()
  const trophy = SHOWCASE_TROPHIES.find((t) => t.slug === slug)

  useEffect(() => {
    if (trophy) {
      onModelChange(trophy.modelPath)
      onPresetChange(trophy.materials.primary)
      onOriginalMaterialsChange(trophy.useOriginalMaterials ?? false)
    }
    return () => { onModelChange(null) }
  }, [trophy, onModelChange, onPresetChange, onOriginalMaterialsChange])

  if (!trophy) {
    return <div className="trophy-not-found">Trophy not found</div>
  }

  return <TrophyInfo trophy={trophy} />
}
