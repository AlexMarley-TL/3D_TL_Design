# Cinema 4D Export Guide for 3D Trophy Gallery

## Quick Steps

1. **Select only the trophy** in the Object Manager
2. **File > Save Selected Objects as...** — save as a new `.c4d` file
3. Open that new file
4. **File > Export > glTF (.gltf/.glb)**
5. Use the settings below
6. Save the `.glb` into `public/models/`
7. Save a render/thumbnail `.jpg` into `public/images/` (same filename)
8. Run `npm run generate-showcase`

## Export Settings

| Setting | Value |
|---------|-------|
| **File Format** | GLB (Binary) |
| **Scale** | 1 Meters |
| **Current Frame** | Checked |
| **Animation > Transform** | Unchecked |
| **Animation > Morph** | Unchecked |
| **Animation > Skin** | Unchecked |
| **Materials > Textures** | Checked |
| **Materials > Double Sided** | **Checked** |
| **Optional > Cameras** | Unchecked |
| **Optional > Instances** | Unchecked |
| **Optional > Normals** | Checked |
| **Optional > UVs** | Checked |
| **Optional > Flip Z** | **Checked** |

## Critical Settings

### Double Sided (MUST be checked)
Without this, thin shell geometry appears transparent from one side. This is the #1 issue with C4D exports for web/AR.

### Flip Z (MUST be checked)
Cinema 4D uses a left-handed coordinate system. glTF/Three.js/Apple Quick Look use right-handed. Flip Z converts between them. Without it, the trophy appears mirrored.

### Save Selected Objects First
The glTF exporter has no "export selected only" option. It always exports the entire scene. Use **Save Selected Objects as...** to isolate the trophy from backdrop, cameras, and lights.

## Normals

Make sure all normals face outward in C4D before exporting:
- **Mesh > Normals > Align Normals** — auto-fix
- **Mesh > Normals > Reverse Normals** — flip individual problem faces

If you can see through parts of the model in the web viewer or AR, the normals on those faces are pointing inward.

## File Naming

Use hyphens, no spaces. The filename becomes the URL slug:
- `My-Trophy-Name.glb` → `/trophy/my-trophy-name`
- Matching thumbnail: `My-Trophy-Name.jpg` in `public/images/`

## After Export

```bash
npm run generate-showcase    # Regenerates gallery data from files
npm run build               # Test the build
git add . && git push       # Deploy to Vercel
```

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| See-through faces | Normals facing inward | Align Normals in C4D, re-export |
| Trophy mirrored | Flip Z unchecked | Re-export with Flip Z checked |
| Backdrop visible | Exported whole scene | Save Selected Objects first |
| Dark/flat in AR | Apple Quick Look limitation | Normal — Quick Look uses its own lighting |
| File too large | High-poly mesh | Reduce subdivision, target < 5 MB |
