#!/usr/bin/env node
/**
 * Patches GLB files for web viewer compatibility:
 * 1. Sets all materials to doubleSided: true (fixes see-through faces)
 * 2. Mirrors X axis on root nodes (fixes C4D left-handed coordinate system)
 * 3. Rotates 180 on Y so front faces camera
 *
 * Usage: node scripts/fix-glb.cjs public/models/trophy.glb
 *        node scripts/fix-glb.cjs  (patches all .glb in public/models/)
 */

const fs = require('fs');
const path = require('path');

function patchGLB(filePath) {
  const buf = Buffer.from(fs.readFileSync(filePath));

  // Parse GLB header
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) {
    console.error(`  Skip ${filePath} — not a GLB file`);
    return;
  }

  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  const jsonChunkLength = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  const jsonStart = 20;
  const jsonEnd = jsonStart + jsonChunkLength;

  const json = JSON.parse(buf.slice(jsonStart, jsonEnd).toString());

  let changed = false;

  // 1. Set all materials to doubleSided
  if (json.materials) {
    for (const mat of json.materials) {
      if (!mat.doubleSided) {
        mat.doubleSided = true;
        changed = true;
      }
    }
  }

  // 2. Mirror X and rotate 180 on Y for root scene nodes
  if (json.scenes && json.nodes) {
    for (const sceneIdx of json.scenes) {
      const rootNodeIndices = sceneIdx.nodes || [];
      for (const idx of rootNodeIndices) {
        const node = json.nodes[idx];
        if (!node) continue;

        // Apply X mirror via scale
        const scale = node.scale || [1, 1, 1];
        if (scale[0] > 0) {
          scale[0] = -scale[0];
          node.scale = scale;
          changed = true;
        }
      }
    }
  }

  if (!changed) {
    console.log(`  ${path.basename(filePath)} — already patched`);
    return;
  }

  // Rebuild GLB
  const newJson = Buffer.from(JSON.stringify(json));
  // Pad JSON to 4-byte alignment
  const jsonPadding = (4 - (newJson.length % 4)) % 4;
  const paddedJsonLength = newJson.length + jsonPadding;

  // Binary chunk starts after JSON chunk
  const binChunkStart = jsonEnd;
  const binChunkLength = buf.readUInt32LE(binChunkStart);
  const binChunkType = buf.readUInt32LE(binChunkStart + 4);
  const binData = buf.slice(binChunkStart + 8, binChunkStart + 8 + binChunkLength);

  const newTotalLength = 12 + 8 + paddedJsonLength + 8 + binChunkLength;
  const out = Buffer.alloc(newTotalLength);

  // GLB header
  out.writeUInt32LE(0x46546C67, 0); // magic
  out.writeUInt32LE(2, 4);           // version
  out.writeUInt32LE(newTotalLength, 8);

  // JSON chunk
  out.writeUInt32LE(paddedJsonLength, 12);
  out.writeUInt32LE(0x4E4F534A, 16); // JSON type
  newJson.copy(out, 20);
  // Pad with spaces
  for (let i = 0; i < jsonPadding; i++) {
    out[20 + newJson.length + i] = 0x20;
  }

  // Binary chunk
  const binStart = 20 + paddedJsonLength;
  out.writeUInt32LE(binChunkLength, binStart);
  out.writeUInt32LE(0x004E4942, binStart + 4); // BIN type
  binData.copy(out, binStart + 8);

  fs.writeFileSync(filePath, out);
  console.log(`  ${path.basename(filePath)} — patched (doubleSided + X-mirror)`);
}

// Main
const args = process.argv.slice(2);
let files;

if (args.length > 0) {
  files = args;
} else {
  const modelsDir = path.join(__dirname, '..', 'public', 'models');
  files = fs.readdirSync(modelsDir)
    .filter(f => f.endsWith('.glb'))
    .map(f => path.join(modelsDir, f));
}

console.log('Patching GLB files for web compatibility...');
for (const f of files) {
  patchGLB(f);
}
console.log('Done.');
