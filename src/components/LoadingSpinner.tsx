import { useProgress } from '@react-three/drei'

export function LoadingOverlay() {
  const { active, progress } = useProgress()

  if (!active) return null

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <p className="loading-text">{Math.round(progress)}%</p>
    </div>
  )
}
