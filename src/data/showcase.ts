import type { PublicTrophy } from '../types/index.ts'

export const SHOWCASE_TROPHIES: PublicTrophy[] = [
  {
    slug: 'uefa-womens-euro-silver',
    name: 'UEFA Women\'s European Championship Trophy — Silver',
    description: 'The iconic trophy awarded to the winners of the UEFA Women\'s European Championship. Polished silver finish.',
    modelPath: '/models/UEFA-Womens-Euro-Trophy-Silver-CorrectNormals.glb',
    thumbnailPath: '/images/UEFA-Womens-Euro-Trophy-Silver-CorrectNormals.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
  {
    slug: 'uefa-womens-euro-crystal',
    name: 'UEFA Women\'s European Championship Trophy — Crystal',
    description: 'The iconic trophy with a crystal material finish variant.',
    modelPath: '/models/UEFA-Womens-Euro-Trophy-Crystal-CorrectNormals.glb',
    thumbnailPath: '/images/UEFA-Womens-Euro-Trophy-Crystal-CorrectNormals.jpg',
    dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
    materials: { primary: 'polishedSilver' },
    useOriginalMaterials: true,
  },
]
