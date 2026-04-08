import QRCode from 'qrcode'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

import { CLIENT_PROJECTS } from '../src/data/projects.ts'

const BASE_URL = 'https://3-d-tl-design.vercel.app'
const OUTPUT_DIR = join(process.cwd(), 'public', 'qr')

const QR_OPTIONS = {
  width: 512,
  margin: 2,
  color: {
    dark: '#0d0d0f',
    light: '#ffffff',
  },
  errorCorrectionLevel: 'H' as const,
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true })

  for (const project of CLIENT_PROJECTS) {
    const url = `${BASE_URL}/project/${project.code}`

    await QRCode.toFile(
      join(OUTPUT_DIR, `${project.code}.png`),
      url,
      QR_OPTIONS,
    )

    const svg = await QRCode.toString(url, {
      ...QR_OPTIONS,
      type: 'svg',
    })
    writeFileSync(join(OUTPUT_DIR, `${project.code}.svg`), svg)

    console.log(`Generated QR for ${project.clientName} - ${project.projectName}: ${url}`)
  }

  console.log(`\nDone: ${CLIENT_PROJECTS.length} QR codes generated in ${OUTPUT_DIR}`)
}

main().catch(console.error)
