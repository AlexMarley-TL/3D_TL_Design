import type { ClientProject } from '../types/index.ts'

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    code: 'nations-2026',
    passcode: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
    clientName: 'UEFA',
    projectName: 'Nations League Trophy 2026',
    designOptions: [
      {
        slug: 'option-a-contemporary',
        name: 'Option A — Contemporary',
        iterations: [
          {
            slug: 'v1',
            label: 'Initial concept',
            modelPath: '/models/SheenChair.glb',
            thumbnailPath: '/images/placeholder.jpg',
            dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
            materials: { primary: 'polishedGold' },
            dateAdded: '2026-03-15',
          },
          {
            slug: 'v2',
            label: 'Refined proportions',
            modelPath: '/models/SheenChair.glb',
            thumbnailPath: '/images/placeholder.jpg',
            dimensions: { heightMm: 480, widthMm: 195, depthMm: 195 },
            materials: { primary: 'polishedGold' },
            dateAdded: '2026-03-22',
          },
        ],
      },
      {
        slug: 'option-b-classical',
        name: 'Option B — Classical',
        iterations: [
          {
            slug: 'v1',
            label: 'Initial concept',
            modelPath: '/models/SheenChair.glb',
            thumbnailPath: '/images/placeholder.jpg',
            dimensions: { heightMm: 450, widthMm: 220, depthMm: 220 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-03-15',
          },
        ],
      },
    ],
    dateCreated: '2026-03-15',
  },
  {
    code: 'premier-league-2027',
    passcode: '1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014',
    clientName: 'Premier League',
    projectName: 'Premier League Champions Trophy',
    designOptions: [
      {
        slug: 'option-a-modern',
        name: 'Option A — Modern',
        iterations: [
          {
            slug: 'v1',
            label: 'Initial concept',
            modelPath: '/models/SheenChair.glb',
            thumbnailPath: '/images/placeholder.jpg',
            dimensions: { heightMm: 520, widthMm: 240, depthMm: 240 },
            materials: { primary: 'polishedGold', secondary: 'polishedSilver' },
            dateAdded: '2026-04-01',
          },
          {
            slug: 'v2',
            label: 'Wider base',
            modelPath: '/models/SheenChair.glb',
            thumbnailPath: '/images/placeholder.jpg',
            dimensions: { heightMm: 510, widthMm: 260, depthMm: 260 },
            materials: { primary: 'polishedGold', secondary: 'polishedSilver' },
            dateAdded: '2026-04-05',
          },
        ],
      },
    ],
    dateCreated: '2026-04-01',
  },
]

export function getProjectByCode(code: string): ClientProject | undefined {
  return CLIENT_PROJECTS.find(p => p.code === code)
}
