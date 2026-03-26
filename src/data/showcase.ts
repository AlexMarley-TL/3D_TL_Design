import type { PublicTrophy } from '../types/index.ts'

export const SHOWCASE_TROPHIES: PublicTrophy[] = [
  {
    slug: 'test-trophy',
    name: 'Development Test Model',
    description: 'SheenChair.glb used for rendering validation during development.',
    modelPath: '/models/SheenChair.glb',
    thumbnailPath: '/images/placeholder.jpg',
    dimensions: { heightMm: 300, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedGold' },
  },
]
