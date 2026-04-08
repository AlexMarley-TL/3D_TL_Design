export type MetalPreset =
  | 'polishedGold' | 'polishedSilver' | 'chrome'
  | 'brushedSilver' | 'brushedGold' | 'roseGold'
  | 'platinum' | 'antiqueBronze'

export interface PublicTrophy {
  slug: string
  name: string
  description: string
  modelPath: string
  usdzPath?: string
  thumbnailPath: string
  dimensions: { heightMm: number; widthMm: number; depthMm: number }
  materials: { primary: MetalPreset; secondary?: MetalPreset }
  useOriginalMaterials?: boolean
}

export interface ClientProject {
  code: string
  passcode: string
  clientName: string
  projectName: string
  designOptions: DesignOption[]
  dateCreated: string
}

export interface DesignOption {
  slug: string
  name: string
  iterations: Iteration[]
}

export interface Iteration {
  slug: string
  label: string
  modelPath: string
  usdzPath?: string
  thumbnailPath: string
  dimensions: { heightMm: number; widthMm: number; depthMm: number }
  materials: { primary: MetalPreset; secondary?: MetalPreset }
  dateAdded: string
}
