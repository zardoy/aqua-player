#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Building remote UI...');

// Ensure output directory exists
const outputDir = path.resolve(__dirname, '../.webpack/remote-ui');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy the HTML file
const htmlSource = path.resolve(__dirname, '../src/remote-ui/index.html');
const htmlDest = path.resolve(outputDir, 'index.html');
fs.copyFileSync(htmlSource, htmlDest);

// Use the existing webpack configuration to build the remote UI
try {
  // Build using the existing webpack setup
  const webpackConfig = path.resolve(__dirname, '../webpack.remote-ui.config.ts');
  
  // Use npx to run webpack with the config
  execSync(`npx webpack --config ${webpackConfig}`, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('Remote UI built successfully!');
  console.log('Output directory:', outputDir);
} catch (error) {
  console.error('Failed to build remote UI:', error.message);
  process.exit(1);
}