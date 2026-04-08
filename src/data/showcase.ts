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
  {
    slug: 'uefa-womens-euro',
    name: 'UEFA Women\'s European Championship Trophy',
    description: 'The iconic trophy awarded to the winners of the UEFA Women\'s European Championship.',
    modelPath: '/models/UEFA-Womens-Euro-Trophy.glb',
    thumbnailPath: '/images/UEFA-Womens-Euro-Trophy.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
]
