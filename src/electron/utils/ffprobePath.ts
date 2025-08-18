import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

export function getFFprobePath(): string {
  // In development, use ffprobe-static
  if (process.env.NODE_ENV === 'development') {
    try {
      const ffprobe = require('ffprobe-static');
      return ffprobe.path;
    } catch {
      // Fallback to system ffprobe
      return process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
    }
  }

  // In production, use the bundled binary
  const platform = process.platform;
  const arch = process.arch;

  let binaryName: string;
  if (platform === 'win32') {
    binaryName = 'ffprobe.exe';
  } else {
    binaryName = 'ffprobe';
  }

  // Try to find the binary in the app resources
  const possiblePaths = [
    // From extraResource (app.asar.unpacked)
    path.join(process.resourcesPath, 'ffprobe', binaryName),
    // From app directory
    path.join(app.getAppPath(), 'dist', 'ffprobe', binaryName),
    // Fallback to system
    process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'
  ];

  for (const binaryPath of possiblePaths) {
    if (fs.existsSync(binaryPath)) {
      return binaryPath;
    }
  }

  // Last resort: return the binary name and hope it's in PATH
  return binaryName;
}

export function isFFprobeAvailable(): boolean {
  const ffprobePath = getFFprobePath();
  return fs.existsSync(ffprobePath);
}
