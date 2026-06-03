// scripts/check-licenses.js
import { execSync } from 'child_process';

// ✅ Added CC-BY-3.0 to the list
const allowedLicenses = [
  'MIT', 'ISC', 'Apache-2.0', 'BSD-3-Clause', 'BSD-2-Clause',
  'CC0-1.0', 'Unlicense', 'W3C-20150513', 'MPL-2.0', 'CC-BY-3.0',
  '0BSD', 'BlueOak-1.0.0'
];

const forbiddenLicenses = ['GPL', 'AGPL', 'LGPL', 'Proprietary'];

try {
  // 1. Check for forbidden licenses
  console.log('Checking for forbidden licenses...');
  try {
    execSync(`npx license-checker-rseidelsohn --production --failOn '${forbiddenLicenses.join(';')}'`, { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Forbidden license found!');
    process.exit(1);
  }

  // 2. Check for allowed licenses (get JSON output)
  console.log('Checking for allowed licenses...');
  const jsonOutput = execSync(`npx license-checker-rseidelsohn --production --json`, { encoding: 'utf-8' });
  const packages = JSON.parse(jsonOutput);

  let hasDisallowed = false;
  Object.keys(packages).forEach(pkg => {
    // ✅ SKIP YOUR OWN PROPRIETARY PACKAGE
    if (pkg.includes('phasespace')) {
      console.log(`ℹ️  Skipping proprietary package: ${pkg}`);
      return;
    }

    const license = packages[pkg].licenses || 'Unknown';

    // Handle compound licenses like "(MIT AND CC-BY-3.0)"
    // We check if ALL parts of the license are allowed
    const licenseParts = license.split(' AND ').map(l => l.trim().replace(/[()]/g, ''));
    const allPartsAllowed = licenseParts.every(part => allowedLicenses.includes(part));

    if (!allPartsAllowed) {
      console.error(`❌ Disallowed license: ${pkg} (${license})`);
      hasDisallowed = true;
    }
  });

  if (hasDisallowed) {
    console.error('❌ Some dependencies have disallowed licenses.');
    process.exit(1);
  }

  console.log('✅ All dependencies are safe.');

} catch (error) {
  console.error('❌ Error running license check:', error.message);
  process.exit(1);
}