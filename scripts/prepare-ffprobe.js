#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, '..', 'dist', 'ffprobe'))) {
  process.exit(0);
}

const platform = process.platform;
const arch = process.arch;

console.log(`Preparing ffprobe for platform: ${platform}-${arch}`);

// Define which binary we need
let targetDir;
let targetBin;

if (platform === 'win32') {
  targetDir = arch === 'x64' ? 'win32/x64' : 'win32/ia32';
  targetBin = 'ffprobe.exe';
} else if (platform === 'darwin') {
  targetDir = arch === 'arm64' ? 'darwin/arm64' : 'darwin/x64';
  targetBin = 'ffprobe';
} else if (platform === 'linux') {
  targetDir = arch === 'arm64' ? 'linux/arm64' : arch === 'arm' ? 'linux/armv7' : 'linux/x64';
  targetBin = 'ffprobe';
} else {
  console.error(`Unsupported platform: ${platform}-${arch}`);
  process.exit(1);
}

const ffprobeStaticPath = path.join(__dirname, '..', 'node_modules', 'ffprobe-static');
const binPath = path.join(ffprobeStaticPath, 'bin', targetDir, targetBin);

if (!fs.existsSync(binPath)) {
  console.error(`Target binary not found: ${binPath}`);
  process.exit(1);
}

// Create a clean version with only the needed binary
const cleanPath = path.join(__dirname, '..', 'dist', 'ffprobe');
const cleanBinPath = path.join(cleanPath, targetBin);

// Ensure clean directory exists
if (!fs.existsSync(cleanPath)) {
  fs.mkdirSync(cleanPath, { recursive: true });
}

// Copy only the needed binary
fs.copyFileSync(binPath, cleanBinPath);

// Make executable on Unix systems
if (platform !== 'win32') {
  fs.chmodSync(cleanBinPath, '755');
}

console.log(`Prepared ffprobe binary: ${cleanBinPath}`);
