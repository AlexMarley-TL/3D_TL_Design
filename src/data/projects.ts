import type { ClientProject } from '../types/index.ts'

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    code: 'henley-regatta',
    passcode: '158a323a7ba44870f23d96f1516dd70aa48e9a72db4ebb026b0a89e212a208ab',
    clientName: 'Henley Royal Regatta',
    projectName: 'Henley Plinth Design D',
    designOptions: [
      {
        slug: 'design-d-round3',
        name: 'Design D — Round 3',
        iterations: [
          {
            slug: 'with-hammer',
            label: 'With hammer plinth',
            modelPath: '/clients/henley-regatta/Design-D-Round3.glb',
            thumbnailPath: '/clients/henley-regatta/Design-D-Round3.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-09',
          },
          {
            slug: 'without-hammer',
            label: 'Without hammer plinth',
            modelPath: '/clients/henley-regatta/Design-D-Round3-WO-Hammer.glb',
            thumbnailPath: '/clients/henley-regatta/Design-D-Round3-WO-Hammer.jpg',
            dimensions: { heightMm: 400, widthMm: 300, depthMm: 300 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '2026-04-09',
          },
        ],
      },
    ],
    dateCreated: '2026-04-09',
  },
]

export function getProjectByCode(code: string): ClientProject | undefined {
  return CLIENT_PROJECTS.find(p => p.code === code)
}
