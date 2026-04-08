import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { getProjectByCode } from '../data/projects.ts'
import { ARButton } from '../components/ARButton.tsx'
import type { MetalPreset } from '../types/index.ts'

interface IterationDetailProps {
  onModelChange: (modelPath: string | null) => void
  onPresetChange: (preset: MetalPreset) => void
  onOriginalMaterialsChange: (value: boolean) => void
}

function formatPresetName(preset: string): string {
  return preset.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

export function IterationDetail({ onModelChange, onPresetChange, onOriginalMaterialsChange }: IterationDetailProps) {
  const { code, slug } = useParams<{ code: string; slug: string }>()
  const navigate = useNavigate()
  const project = getProjectByCode(code ?? '')

  const iteration = project?.designOptions
    .flatMap(opt => opt.iterations)
    .find(iter => iter.slug === slug)

  useEffect(() => {
    if (code && localStorage.getItem(`portal_auth_${code}`) !== 'true') {
      navigate(`/project/${code}`, { replace: true })
    }
  }, [code, navigate])

  useEffect(() => {
    if (iteration) {
      onModelChange(iteration.modelPath)
      onPresetChange(iteration.materials.primary)
      onOriginalMaterialsChange(false)
    }
    return () => { onModelChange(null) }
  }, [iteration, onModelChange, onPresetChange, onOriginalMaterialsChange])

  if (!project || !iteration) {
    return <div className="trophy-not-found">Iteration not found</div>
  }

  return (
    <>
      <Link to={`/project/${code}`} className="back-link">&larr; Back to Project</Link>
      <div className="trophy-info">
        <h1 className="trophy-info-name">{iteration.slug} — {iteration.label}</h1>
        <div className="trophy-info-details">
          <span className="trophy-info-dimensions">
            {iteration.dimensions.heightMm} x {iteration.dimensions.widthMm} x {iteration.dimensions.depthMm} mm
          </span>
          <span className="trophy-info-material">
            {formatPresetName(iteration.materials.primary)}
          </span>
        </div>
      </div>
      <ARButton modelPath={iteration.modelPath} usdzPath={iteration.usdzPath} />
    </>
  )
}
