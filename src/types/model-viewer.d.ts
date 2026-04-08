import type React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string
          'ios-src'?: string
          ar?: boolean
          'ar-modes'?: string
          'ar-scale'?: string
          'ar-placement'?: string
          'xr-environment'?: boolean
          loading?: 'auto' | 'lazy' | 'eager'
          poster?: string
          style?: React.CSSProperties
        },
        HTMLElement
      >
    }
  }
}
