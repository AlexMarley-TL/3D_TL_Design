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
      .catch((err) => console.error('model-viewer import failed:', err))
  }, [])

  useEffect(() => {
    if (!modelViewerLoaded) return
    const el = modelViewerRef.current
    if (!el) return

    const checkAR = () => {
      setArAvailable((el as any).canActivateAR ?? false)
    }

    el.addEventListener('load', checkAR)
    el.addEventListener('error', (e: any) => console.error('model-viewer error:', e.detail))
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
        ar-modes="scene-viewer webxr quick-look"
        ar-scale="auto"
        loading="eager"
        camera-orbit="180deg 75deg auto"
        style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}
      />
      {arAvailable && (
        <button className="ar-button" onClick={handleARClick}>
          View in AR
        </button>
      )}
    </>
  )
}
