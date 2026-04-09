#!/usr/bin/env node
/**
 * Fixes GLB files for cross-platform compatibility (Three.js + model-viewer + Apple Quick Look).
 *
 * Problem: Cinema 4D uses a left-handed coordinate system. A naive fix (negative X scale on root node)
 * works in Three.js but breaks Apple Quick Look because USDZ conversion doesn't compensate for
 * flipped face winding from negative scale.
 *
 * Solution: Bake the X-mirror into actual vertex data:
 * 1. Negate all X vertex positions
 * 2. Negate all X vertex normals
 * 3. Swap triangle winding (b,c) to restore correct face orientation
 * 4. Set all materials to doubleSided: true
 * 5. Ensure root node scales are all positive
 *
 * Usage: node scripts/fix-glb-vertices.mjs [path/to/file.glb]
 *        node scripts/fix-glb-vertices.mjs  (patches all .glb in public/models/)
 */

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { readFileSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fixGLB(filePath) {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.read(filePath);
  const root = doc.getRoot();
  let changed = false;

  // 1. Fix root node scales — make all positive, track which need vertex mirror
  const scenes = root.listScenes();
  const nodesToMirror = new Set();

  for (const scene of scenes) {
    for (const node of scene.listChildren()) {
      const scale = node.getScale();
      if (scale[0] < 0) {
        // Mark this node's meshes for vertex-level mirroring
        nodesToMirror.add(node);
        // Fix the scale to positive
        node.setScale([Math.abs(scale[0]), scale[1], scale[2]]);
        changed = true;
        console.log(`  Fixed negative X scale on node "${node.getName()}": [${scale}] -> [${Math.abs(scale[0])}, ${scale[1]}, ${scale[2]}]`);
      }
    }
  }

  // 2. Collect all meshes under mirrored nodes
  const meshesToMirror = new Set();
  function collectMeshes(node) {
    const mesh = node.getMesh();
    if (mesh) meshesToMirror.add(mesh);
    for (const child of node.listChildren()) {
      collectMeshes(child);
    }
  }
  for (const node of nodesToMirror) {
    collectMeshes(node);
  }

  // 3. Bake X-mirror into vertex data
  for (const mesh of meshesToMirror) {
    for (const prim of mesh.listPrimitives()) {
      // Mirror positions
      const posAccessor = prim.getAttribute('POSITION');
      if (posAccessor) {
        const positions = posAccessor.getArray();
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] = -positions[i]; // negate X
        }
        posAccessor.setArray(positions);
        changed = true;
      }

      // Mirror normals
      const normAccessor = prim.getAttribute('NORMAL');
      if (normAccessor) {
        const normals = normAccessor.getArray();
        for (let i = 0; i < normals.length; i += 3) {
          normals[i] = -normals[i]; // negate X
        }
        normAccessor.setArray(normals);
      }

      // Mirror tangents (if present)
      const tanAccessor = prim.getAttribute('TANGENT');
      if (tanAccessor) {
        const tangents = tanAccessor.getArray();
        for (let i = 0; i < tangents.length; i += 4) {
          tangents[i] = -tangents[i]; // negate X
        }
        tanAccessor.setArray(tangents);
      }

      // Flip triangle winding: swap indices 1 and 2 of each triangle
      const indicesAccessor = prim.getIndices();
      if (indicesAccessor) {
        const indices = indicesAccessor.getArray();
        for (let i = 0; i < indices.length; i += 3) {
          const tmp = indices[i + 1];
          indices[i + 1] = indices[i + 2];
          indices[i + 2] = tmp;
        }
        indicesAccessor.setArray(indices);
      }
    }
    console.log(`  Mirrored vertex data for mesh "${mesh.getName()}"`);
  }

  // 4. Set all materials to doubleSided
  for (const mat of root.listMaterials()) {
    if (!mat.getDoubleSided()) {
      mat.setDoubleSided(true);
      changed = true;
    }
  }

  if (!changed) {
    console.log(`  ${basename(filePath)} — already correct`);
    return;
  }

  // Write back
  await io.write(filePath, doc);
  console.log(`  ${basename(filePath)} — patched (vertex-level mirror + doubleSided)`);
}

// Main
const args = process.argv.slice(2);
let files;

if (args.length > 0) {
  files = args;
} else {
  const modelsDir = join(__dirname, '..', 'public', 'models');
  files = readdirSync(modelsDir)
    .filter(f => f.endsWith('.glb'))
    .map(f => join(modelsDir, f));
}

console.log('Fixing GLB files (vertex-level mirror for cross-platform compatibility)...');
for (const f of files) {
  console.log(`\nProcessing: ${basename(f)}`);
  await fixGLB(f);
}
console.log('\nDone. Files are now compatible with Three.js, model-viewer, and Apple Quick Look.');
