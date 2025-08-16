#!/usr/bin/env node

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Import the remote UI webpack config
const { remoteUIConfig } = require('../webpack.remote-ui.config.ts');

// Ensure output directory exists
const outputDir = path.resolve(__dirname, '../.webpack/remote-ui');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Copy the HTML file
const htmlSource = path.resolve(__dirname, '../src/remote-ui/index.html');
const htmlDest = path.resolve(outputDir, 'index.html');
fs.copyFileSync(htmlSource, htmlDest);

console.log('Building remote UI...');

webpack(remoteUIConfig, (err, stats) => {
  if (err || stats.hasErrors()) {
    console.error('Build failed:', err || stats.toString());
    process.exit(1);
  }
  
  console.log('Remote UI built successfully!');
  console.log('Output directory:', outputDir);
});