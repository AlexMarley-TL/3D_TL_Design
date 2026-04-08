import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, basename } from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const gltfPipeline = require('gltf-pipeline')
const processGlb = gltfPipeline.processGlb

const MODELS_DIR = join(process.cwd(), 'public', 'models')
const BACKUP_DIR = join(MODELS_DIR, 'backup')

function findGlbFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (entry === 'backup') continue
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      files.push(...findGlbFiles(fullPath))
    } else if (entry.endsWith('.glb')) {
      files.push(fullPath)
    }
  }
  return files
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function main() {
  if (!existsSync(MODELS_DIR)) {
    console.error(`Models directory not found: ${MODELS_DIR}`)
    process.exit(1)
  }

  if (!existsSync(BACKUP_DIR)) {
    mkdirSync(BACKUP_DIR, { recursive: true })
  }

  const glbFiles = findGlbFiles(MODELS_DIR)

  if (glbFiles.length === 0) {
    console.log('No .glb files found in public/models/')
    return
  }

  console.log(`Found ${glbFiles.length} .glb file(s) to compress\n`)

  let totalOriginal = 0
  let totalCompressed = 0

  for (const filePath of glbFiles) {
    const fileName = basename(filePath)
    const backupPath = join(BACKUP_DIR, fileName)

    const originalBuffer = readFileSync(filePath)
    const originalSize = originalBuffer.length
    totalOriginal += originalSize

    if (!existsSync(backupPath)) {
      writeFileSync(backupPath, originalBuffer)
      console.log(`  Backed up: ${fileName}`)
    } else {
      console.log(`  Backup exists: ${fileName} (skipping backup)`)
    }

    console.log(`  Compressing: ${fileName} (${formatSize(originalSize)})...`)

    const result = await processGlb(originalBuffer, {
      dracoOptions: { compressionLevel: 7 },
    })

    const compressedSize = result.glb.length
    totalCompressed += compressedSize
    const savings = ((1 - compressedSize / originalSize) * 100).toFixed(1)

    writeFileSync(filePath, result.glb)
    console.log(`  Compressed: ${formatSize(originalSize)} -> ${formatSize(compressedSize)} (${savings}% smaller)\n`)
  }

  const totalSavings = ((1 - totalCompressed / totalOriginal) * 100).toFixed(1)
  console.log('--- Summary ---')
  console.log(`  Files processed: ${glbFiles.length}`)
  console.log(`  Total original:   ${formatSize(totalOriginal)}`)
  console.log(`  Total compressed: ${formatSize(totalCompressed)}`)
  console.log(`  Total savings:    ${totalSavings}%`)
}

main().catch((err) => {
  console.error('Compression failed:', err)
  process.exit(1)
})
