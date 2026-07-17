const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const nextStandaloneDir = path.join(rootDir, 'next-standalone');

console.log('1. Clearing output directories...');
fs.rmSync(distDir, { recursive: true, force: true });
fs.rmSync(nextStandaloneDir, { recursive: true, force: true });

console.log('2. Running next build...');
execSync('npx next build', { stdio: 'inherit', cwd: rootDir });

console.log('3. Moving standalone server...');
const dotNextStandalone = path.join(rootDir, '.next', 'standalone');
fs.copySync(dotNextStandalone, nextStandaloneDir);

console.log('4. Copying static files and Turbopack binaries...');
fs.copySync(path.join(rootDir, 'public'), path.join(nextStandaloneDir, 'public'));
fs.copySync(path.join(rootDir, '.next', 'static'), path.join(nextStandaloneDir, '.next', 'static'));

// Fix Turbopack missing binaries
const sourceNextServer = path.join(rootDir, 'node_modules', 'next', 'dist', 'compiled', 'next-server');
const targetNextServer = path.join(nextStandaloneDir, 'node_modules', 'next', 'dist', 'compiled', 'next-server');
if (fs.existsSync(sourceNextServer)) {
  fs.copySync(sourceNextServer, targetNextServer, { overwrite: true });
}

console.log('5. Copying Prisma engines...');
const sourcePrisma = path.join(rootDir, 'node_modules', 'prisma');
const targetPrisma = path.join(nextStandaloneDir, 'node_modules', 'prisma');
const sourceAtPrisma = path.join(rootDir, 'node_modules', '@prisma');
const targetAtPrisma = path.join(nextStandaloneDir, 'node_modules', '@prisma');
const sourceDotPrisma = path.join(rootDir, 'node_modules', '.prisma');
const targetDotPrisma = path.join(nextStandaloneDir, 'node_modules', '.prisma');

if (fs.existsSync(sourcePrisma)) fs.copySync(sourcePrisma, targetPrisma);
if (fs.existsSync(sourceAtPrisma)) fs.copySync(sourceAtPrisma, targetAtPrisma);
if (fs.existsSync(sourceDotPrisma)) fs.copySync(sourceDotPrisma, targetDotPrisma);

console.log('6. Running electron-builder...');
execSync('npx electron-builder --win', { stdio: 'inherit', cwd: rootDir });

console.log('Build completed successfully!');
