#!/usr/bin/env node
/**
 * Add a new client project to the portal.
 *
 * Usage:
 *   node scripts/add-project.cjs
 *
 * Prompts for:
 *   - Project code (URL slug, e.g. "nations-2026")
 *   - 4-digit passcode
 *   - Client name
 *   - Project name
 *
 * Creates the project entry in src/data/projects.ts with SHA-256 hashed passcode.
 * Also creates the project folder structure in public/models/{code}/ for trophy files.
 *
 * After running:
 *   1. Drop .glb files into public/models/ (matching the iteration modelPaths)
 *   2. Edit src/data/projects.ts to add design options and iterations
 *   3. Run: npm run generate-qr (to create QR codes)
 *   4. git add . && git push (to deploy)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const projectsFile = path.join(__dirname, '..', 'src', 'data', 'projects.ts');

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n=== Add New Client Project ===\n');

  const code = await ask(rl, 'Project code (URL slug, e.g. "nations-2026"): ');
  if (!code || code.includes(' ')) {
    console.error('Error: Code must be non-empty with no spaces. Use hyphens.');
    rl.close();
    process.exit(1);
  }

  const passcode = await ask(rl, '4-digit passcode: ');
  if (!/^\d{4}$/.test(passcode)) {
    console.error('Error: Passcode must be exactly 4 digits.');
    rl.close();
    process.exit(1);
  }

  const clientName = await ask(rl, 'Client name (e.g. "UEFA"): ');
  const projectName = await ask(rl, 'Project name (e.g. "Nations League Trophy 2026"): ');

  rl.close();

  // Hash the passcode
  const hash = crypto.createHash('sha256').update(passcode).digest('hex');

  // Read current projects file
  let content = fs.readFileSync(projectsFile, 'utf8');

  // Check if code already exists
  if (content.includes(`code: '${code}'`)) {
    console.error(`\nError: Project with code "${code}" already exists.`);
    process.exit(1);
  }

  const today = new Date().toISOString().split('T')[0];

  // Build the new project entry
  const newProject = `  {
    code: '${code}',
    passcode: '${hash}',
    clientName: '${clientName.replace(/'/g, "\\'")}',
    projectName: '${projectName.replace(/'/g, "\\'")}',
    designOptions: [
      {
        slug: 'option-a',
        name: 'Option A',
        iterations: [
          {
            slug: 'v1',
            label: 'Initial concept',
            modelPath: '/models/${code}-option-a-v1.glb',
            thumbnailPath: '/images/${code}-option-a-v1.jpg',
            dimensions: { heightMm: 400, widthMm: 200, depthMm: 200 },
            materials: { primary: 'polishedSilver' },
            dateAdded: '${today}',
          },
        ],
      },
    ],
    dateCreated: '${today}',
  }`;

  // Insert before the closing bracket of CLIENT_PROJECTS array
  content = content.replace(
    /(\n]\s*\n\nexport function getProjectByCode)/,
    `,\n${newProject}\n$1`
  );

  fs.writeFileSync(projectsFile, content);

  console.log(`
✓ Project added!

  Code:     ${code}
  Passcode: ${passcode} (hashed in file)
  URL:      /project/${code}
  Client:   ${clientName}
  Project:  ${projectName}

Next steps:
  1. Export trophy .glb from C4D → save as public/models/${code}-option-a-v1.glb
  2. Save thumbnail → public/images/${code}-option-a-v1.jpg
  3. Edit src/data/projects.ts to add more design options/iterations
  4. Run: npm run generate-qr
  5. git add . && git push
`);
}

main().catch(console.error);
