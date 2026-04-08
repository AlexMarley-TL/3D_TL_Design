import { useRef, useState, useEffect } from 'react'

interface ARButtonProps {
  modelPath: string
  usdzPath?: string
}

export function ARButton({ modelPath, usdzPath }: ARButtonProps) {
  const modelViewerRef = useRef<HTMLElement>(null)
  const [arAvailable, setArAvailable] = useState(false)
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false)

  useEffect(() => {
    import('@google/model-viewer')
      .then(() => setModelViewerLoaded(true))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!modelViewerLoaded) return
    const el = modelViewerRef.current
    if (!el) return

    const checkAR = () => {
      setArAvailable((el as any).canActivateAR ?? false)
    }

    el.addEventListener('load', checkAR)
    checkAR()
    return () => el.removeEventListener('load', checkAR)
  }, [modelPath, modelViewerLoaded])

  const handleARClick = () => {
    const el = modelViewerRef.current as any
    if (el?.activateAR) {
      el.activateAR()
    }
  }

  return (
    <>
      <model-viewer
        ref={modelViewerRef}
        src={modelPath}
        ios-src={usdzPath}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="auto"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      />
      {arAvailable && (
        <button className="ar-button" onClick={handleARClick}>
          View in AR
        </button>
      )}
    </>
  )
}
