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
    name: 'UEFA Women\'s Euro Trophy (Original)',
    description: 'Original C4D export — no Flip Z, no Double Sided.',
    modelPath: '/models/UEFA-Womens-Euro-Trophy.glb',
    thumbnailPath: '/images/UEFA-Womens-Euro-Trophy.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
  {
    slug: 'uefa-womens-euro-2',
    name: 'UEFA Women\'s Euro Trophy 2 (Fixed)',
    description: 'Re-exported with Flip Z + Double Sided checked.',
    modelPath: '/models/UEFA-Womens-Euro-Trophy-2.glb',
    thumbnailPath: '/images/UEFA-Womens-Euro-Trophy.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
]
