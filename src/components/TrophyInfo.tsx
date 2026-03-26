import type { PublicTrophy } from '../types/index.ts'

interface TrophyInfoProps {
  trophy: PublicTrophy
}

function formatPresetName(preset: string): string {
  return preset.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

export function TrophyInfo({ trophy }: TrophyInfoProps) {
  const { name, dimensions, materials } = trophy

  return (
    <div className="trophy-info">
      <h1 className="trophy-info-name">{name}</h1>
      <div className="trophy-info-details">
        <span className="trophy-info-dimensions">
          {dimensions.heightMm} x {dimensions.widthMm} x {dimensions.depthMm} mm
        </span>
        <span className="trophy-info-material">
          {formatPresetName(materials.primary)}
        </span>
      </div>
    </div>
  )
}
