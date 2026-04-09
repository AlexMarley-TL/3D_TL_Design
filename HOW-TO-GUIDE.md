# How-To Guide — 3D Trophy Gallery & AR Viewer

## Quick Reference

| Task | Command |
|------|---------|
| Add a trophy to the public gallery | See Section 1 |
| Add a new client project | See Section 2 |
| Add a design option to an existing project | See Section 3 |
| Add an iteration to a design option | See Section 4 |
| Generate QR codes | See Section 5 |
| Deploy to Vercel | See Section 6 |
| Test locally | See Section 7 |

---

## Section 1: Add a Trophy to the Public Gallery

The public gallery is the homepage everyone sees (no login needed).

### Step 1: Export from Cinema 4D

1. Open your C4D file
2. Select **only the trophy** in the Object Manager
3. Go to **File > Save Selected Objects as...** — save as a new .c4d file
4. Open that new file
5. Go to **File > Export > glTF (.gltf/.glb)**
6. Use these settings:
   - File Format: **GLB (Binary)**
   - Scale: **1 Meters**
   - Animation: **all unchecked**
   - Textures: **checked**
   - Double Sided: **checked**
   - Cameras: **unchecked**
   - Instances: **unchecked**
   - Normals: **checked**
   - UVs: **checked**
   - Flip Z: **checked**
7. Save as `My-Trophy-Name.glb` (hyphens, no spaces)

### Step 2: Save the thumbnail

Save a render or screenshot as `My-Trophy-Name.jpg` (same name as the .glb but .jpg)

### Step 3: Put files in the right folders

- Copy `My-Trophy-Name.glb` into `public/models/`
- Copy `My-Trophy-Name.jpg` into `public/images/`

### Step 4: Regenerate the gallery

Open the terminal in the project folder and run:

```
npm run generate-showcase
```

This scans the folders and updates the gallery automatically.

### Step 5: Deploy

```
git add .
git commit -m "Add My Trophy Name"
git push
```

Wait 1 minute, then check https://3-d-tl-design.vercel.app

---

## Section 2: Add a New Client Project

Client projects are private — clients access them with a passcode via QR code.

### Step 1: Run the add-project script

```
npm run add-project
```

It will ask you:
- **Project code** — the URL slug (e.g. `nations-2026`). Use lowercase and hyphens.
- **4-digit passcode** — the code clients will enter (e.g. `4829`)
- **Client name** — e.g. `UEFA`
- **Project name** — e.g. `Nations League Trophy 2026`

This creates the project entry in the code with the passcode hashed.

### Step 2: Export trophy iterations from C4D

For each design option and iteration, export a .glb file using the C4D export settings above (Section 1, Step 1).

Name them to match the project code:
- `nations-2026-option-a-v1.glb`
- `nations-2026-option-a-v2.glb`
- `nations-2026-option-b-v1.glb`

Save matching thumbnails as .jpg with the same names.

### Step 3: Put files in folders

- Copy all `.glb` files into `public/models/`
- Copy all `.jpg` thumbnails into `public/images/`

### Step 4: Edit the project data

Open `src/data/projects.ts` in a text editor. Find your new project entry and update the design options and iterations. Here's the structure:

```typescript
{
  code: 'nations-2026',
  passcode: '...hashed...',     // Don't change this
  clientName: 'UEFA',
  projectName: 'Nations League Trophy 2026',
  designOptions: [
    {
      slug: 'option-a',
      name: 'Option A — Contemporary',
      iterations: [
        {
          slug: 'v1',
          label: 'Initial concept',
          modelPath: '/models/nations-2026-option-a-v1.glb',
          thumbnailPath: '/images/nations-2026-option-a-v1.jpg',
          dimensions: { heightMm: 470, widthMm: 200, depthMm: 200 },
          materials: { primary: 'polishedGold' },
          dateAdded: '2026-04-09',
        },
        {
          slug: 'v2',
          label: 'Refined proportions',
          modelPath: '/models/nations-2026-option-a-v2.glb',
          thumbnailPath: '/images/nations-2026-option-a-v2.jpg',
          dimensions: { heightMm: 480, widthMm: 195, depthMm: 195 },
          materials: { primary: 'polishedGold' },
          dateAdded: '2026-04-15',
        },
      ],
    },
    {
      slug: 'option-b',
      name: 'Option B — Classical',
      iterations: [
        {
          slug: 'b-v1',
          label: 'Initial concept',
          modelPath: '/models/nations-2026-option-b-v1.glb',
          thumbnailPath: '/images/nations-2026-option-b-v1.jpg',
          dimensions: { heightMm: 450, widthMm: 220, depthMm: 220 },
          materials: { primary: 'polishedSilver' },
          dateAdded: '2026-04-09',
        },
      ],
    },
  ],
  dateCreated: '2026-04-09',
}
```

**Important:**
- Each iteration `slug` must be unique within the project
- `modelPath` starts with `/models/`
- `thumbnailPath` starts with `/images/`
- `materials.primary` options: `polishedGold`, `polishedSilver`, `chrome`, `brushedSilver`, `brushedGold`, `roseGold`, `platinum`, `antiqueBronze`
- If using C4D materials (not code presets), add `useOriginalMaterials: true` to each iteration — but note this isn't in the Iteration type yet, only PublicTrophy

### Step 5: Generate QR codes

```
npm run generate-qr
```

This creates PNG and SVG QR codes in `public/qr/` for each project. Use these in your PDF decks.

### Step 6: Deploy

```
git add .
git commit -m "Add nations-2026 client project"
git push
```

### Step 7: Share with client

Give them:
- The QR code from `public/qr/nations-2026.png` (or .svg)
- Or the URL: `https://3-d-tl-design.vercel.app/project/nations-2026`
- And the 4-digit passcode you set

---

## Section 3: Add a Design Option to an Existing Project

### Step 1: Open `src/data/projects.ts`

Find the project by its code (e.g. `nations-2026`).

### Step 2: Add a new entry in the `designOptions` array

Copy an existing option block and change:
- `slug` — unique identifier (e.g. `option-c`)
- `name` — display name (e.g. `Option C — Minimalist`)
- `iterations` — at least one iteration with its model and thumbnail

### Step 3: Export the trophy, add files, deploy

Same as Section 2, Steps 2-6.

---

## Section 4: Add an Iteration to a Design Option

### Step 1: Export the new version from C4D

Name it to follow the pattern: `project-code-option-slug-version.glb`

Example: `nations-2026-option-a-v3.glb`

### Step 2: Put files in folders

- `.glb` into `public/models/`
- `.jpg` into `public/images/`

### Step 3: Edit `src/data/projects.ts`

Find the design option and add a new iteration to its `iterations` array:

```typescript
{
  slug: 'v3',
  label: 'Final design',
  modelPath: '/models/nations-2026-option-a-v3.glb',
  thumbnailPath: '/images/nations-2026-option-a-v3.jpg',
  dimensions: { heightMm: 475, widthMm: 200, depthMm: 200 },
  materials: { primary: 'polishedGold' },
  dateAdded: '2026-04-20',
},
```

### Step 4: Deploy

```
git add .
git commit -m "Add v3 iteration to nations-2026 option A"
git push
```

The client sees the new iteration next time they open the link. No passcode re-entry needed.

---

## Section 5: Generate QR Codes

QR codes are for embedding in PDF presentation decks.

```
npm run generate-qr
```

This reads all projects from `src/data/projects.ts` and generates:
- `public/qr/{code}.png` — 512px PNG (for print)
- `public/qr/{code}.svg` — SVG (for any size)

Each QR code links to: `https://3-d-tl-design.vercel.app/project/{code}`

---

## Section 6: Deploy to Vercel

Every time you push to GitHub, Vercel auto-deploys:

```
git add .
git commit -m "Description of changes"
git push
```

Wait about 1 minute. Check https://3-d-tl-design.vercel.app

If the deploy fails, check the Vercel dashboard for error logs.

---

## Section 7: Test Locally

Before deploying, you can test on your machine:

```
npm run dev
```

Opens at http://localhost:5173

To test on your phone (same WiFi):

```
npm run dev -- --host
```

Opens at http://your-ip:5173 (check terminal output for the URL).

Note: AR requires HTTPS, so AR won't work locally — only on the deployed Vercel site.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Trophy is see-through | Fix normals in C4D: Mesh > Normals > Align Normals. Re-export with Double Sided checked. |
| Trophy is mirrored | Re-export with Flip Z checked |
| Trophy has backdrop/lights | Use File > Save Selected Objects as... first |
| Images broken on website | Make sure .jpg files are committed to git: `git add public/images/` |
| Build fails on Vercel | Run `npm run build` locally first to see the error |
| QR code links wrong | Check the URL in generate-qr-codes.ts matches your Vercel domain |
| Passcode not working | Check the hash in projects.ts matches. Run add-project again with a new code. |
| AR not working on Android | Make sure the phone has Google Play Services for AR installed |
| AR dark on iPhone | Normal — Apple Quick Look uses its own lighting |
