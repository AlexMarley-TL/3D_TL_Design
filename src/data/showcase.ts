import type { PublicTrophy } from '../types/index.ts'

export const SHOWCASE_TROPHIES: PublicTrophy[] = [
  {
    slug: 'sheen-chair',
    name: 'Development Test Model',
    description: 'Gold chair used for rendering validation during development.',
    modelPath: '/gallery/SheenChair.glb',
    thumbnailPath: '/gallery/SheenChair.jpg',
    dimensions: { heightMm: 300, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedGold' },
  },
  {
    slug: 'uefa-womens-euro-silver',
    name: 'UEFA Women\'s European Championship Trophy — Silver',
    description: 'The iconic trophy awarded to the winners of the UEFA Women\'s European Championship.',
    modelPath: '/gallery/UEFA-Womens-Euro-Silver.glb',
    thumbnailPath: '/gallery/UEFA-Womens-Euro-Silver.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
  {
    slug: 'uefa-womens-euro-crystal',
    name: 'UEFA Women\'s European Championship Trophy — Crystal',
    description: 'The iconic trophy with a crystal material finish variant.',
    modelPath: '/gallery/UEFA-Womens-Euro-Crystal.glb',
    thumbnailPath: '/gallery/UEFA-Womens-Euro-Crystal.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
]
