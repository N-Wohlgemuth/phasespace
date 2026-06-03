// scripts/generate-licenses.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

console.log('🔍 Starting license generation...');
console.log('Current dir:', process.cwd());
console.log('Build dir exists:', fs.existsSync('build'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const checker = require('license-checker-rseidelsohn');

const buildDir = path.join(__dirname, '..', 'build');
const outputPath = path.join(buildDir, 'LICENSES');
const rootOutputPath = path.join(__dirname, '..', 'THIRD-PARTY-NOTICES.md');
console.log(rootOutputPath)
// Ensure directories exist
if (!fs.existsSync(buildDir)) {
  console.warn('⚠️  Build directory missing. Creating it...');
  fs.mkdirSync(buildDir, { recursive: true });
}

checker.init({
  start: path.join(__dirname, '..'),
  production: true,
  customPath: 'MIT',
}, (err, packages) => {
  if (err) {
    console.error('❌ Error generating licenses:', err);
    process.exit(1);
  }

  // --- Generate build/LICENSES (Plain Text) ---
  let txtOutput = '';
  Object.keys(packages).forEach(pkg => {
    if (pkg.includes('phasespace')) return; // Skip own package

    const info = packages[pkg];
    const name = pkg.split('@')[0];
    const version = pkg.split('@').pop();
    const license = info.licenses || 'Unknown';
    const copyright = info.copyright || info.author || 'No copyright info';

    txtOutput += `Package: ${name}@${version}\nLicense: ${license}\nCopyright: ${copyright}\n---\n`;
  });

  fs.writeFileSync(outputPath, txtOutput);
  console.log(`✅ Generated ${outputPath}`);

  // --- Generate THIRD-PARTY-NOTICES.md (Markdown) ---
  let mdOutput = `# Third-Party Notices\n\n`;
  mdOutput += `This project (\`phasespace\`) is licensed under **Proprietary** terms.\n`;
  mdOutput += `The following open-source components are included and are subject to their respective licenses.\n\n`;
  mdOutput += `## Copyright Notice\n\n`;
  mdOutput += `Copyright © 2026 [Your Name/Company]. All rights reserved.\n\n`;
  mdOutput += `---\n\n`;
  mdOutput += `## Dependencies\n\n`;

  Object.keys(packages).forEach(pkg => {
    if (pkg.includes('phasepace')) return;

    const info = packages[pkg];
    const name = pkg.split('@')[0];
    const version = pkg.split('@').pop();
    const license = info.licenses || 'Unknown';
    const copyright = info.copyright || info.author || 'No copyright info';

    mdOutput += `### ${name}\n`;
    mdOutput += `- **Version**: ${version}\n`;
    mdOutput += `- **License**: ${license}\n`;
    mdOutput += `- **Copyright**: ${copyright}\n\n`;
  });

  mdOutput += `---\n\n`;
  mdOutput += `The full text of the licenses can be found in the \`node_modules\` directory.\n`;
  mdOutput += `For the full text of the **Proprietary License** governing this project, please refer to the \`LICENSE\` file in the root directory.\n`;

  fs.writeFileSync(rootOutputPath, mdOutput);
  console.log(`✅ Generated ${rootOutputPath}`);
});