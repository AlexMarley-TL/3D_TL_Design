import type { ClientProject } from '../types/index.ts'

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    code: 'henley-regatta',
    passcode: '158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab',
    clientName: 'Henley Royal Regatta',
    projectName: 'Henley Plinth Design D',
    designOptions: [
      {
        slug: 'round-3',
        name: 'Design D — Round 3',
        iterations: [
          {
            slug: 'with-hammer',
            label: 'With hammer plinth',
            modelPath: '/clients/henley-regatta/round-3/Design-D.glb',
            thumbnailPath: '/clients/henley-regatta/round-3/Design-D.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-09',
          },
          {
            slug: 'without-hammer',
            label: 'Without hammer plinth',
            modelPath: '/clients/henley-regatta/round-3/Design-D-WO-Hammer.glb',
            thumbnailPath: '/clients/henley-regatta/round-3/Design-D-WO-Hammer.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-09',
          },
        ],
      },
      {
        slug: 'round-4',
        name: 'Design D — Round 4',
        iterations: [
          {
            slug: 'with-hammer',
            label: 'With hammer plinth',
            modelPath: '/clients/henley-regatta/round-4/Design-D.glb',
            thumbnailPath: '/clients/henley-regatta/round-4/Design-D.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
          {
            slug: 'without-hammer',
            label: 'Without hammer plinth',
            modelPath: '/clients/henley-regatta/round-4/Design-D-WO-Hammer.glb',
            thumbnailPath: '/clients/henley-regatta/round-4/Design-D-WO-Hammer.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
        ],
      },
    ],
    dateCreated: '2026-04-09',
  },
  {
    code: 'uefa-europa',
    passcode: 'b53a7292b38e011dbe6efc79c22d028ddd364da2e6b9aa182915572742330ea9',
    clientName: 'UEFA',
    projectName: 'Europa League & Europa Conference League Trophies',
    designOptions: [
      {
        slug: 'europa-league',
        name: 'Europa League Trophy',
        iterations: [
          {
            slug: 'd1',
            label: 'Design 1',
            modelPath: '/clients/uefa-europa/Europa-League-D1/UEFA-Europa-League-D1.glb',
            thumbnailPath: '/clients/uefa-europa/Europa-League-D1/UEFA-Europa-League-D1.jpg',
            dimensions: { heightMm: 650, widthMm: 240, depthMm: 240 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
          {
            slug: 'd2',
            label: 'Design 2',
            modelPath: '/clients/uefa-europa/Europa-League-D2/UEFA-Europa-League-D2.glb',
            thumbnailPath: '/clients/uefa-europa/Europa-League-D2/UEFA-Europa-League-D2.jpg',
            dimensions: { heightMm: 650, widthMm: 240, depthMm: 240 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
        ],
      },
      {
        slug: 'europa-conference-league',
        name: 'Europa Conference League Trophy',
        iterations: [
          {
            slug: 'd1',
            label: 'Design 1',
            modelPath: '/clients/uefa-europa/Europa-Conference-League-D1/UEFA-Europa-Conference-League-D1.glb',
            thumbnailPath: '/clients/uefa-europa/Europa-Conference-League-D1/UEFA-Europa-Conference-League-D1.jpg',
            dimensions: { heightMm: 550, widthMm: 220, depthMm: 220 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
          {
            slug: 'd2',
            label: 'Design 2',
            modelPath: '/clients/uefa-europa/Europa-Conference-League-D2/UEFA-Europa-Conference-League-D2.glb',
            thumbnailPath: '/clients/uefa-europa/Europa-Conference-League-D2/UEFA-Europa-Conference-League-D2.jpg',
            dimensions: { heightMm: 550, widthMm: 220, depthMm: 220 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-10',
          },
        ],
      },
    ],
    dateCreated: '2026-04-10',
  },
]

export function getProjectByCode(code: string): ClientProject | undefined {
  return CLIENT_PROJECTS.find(p => p.code === code)
}
