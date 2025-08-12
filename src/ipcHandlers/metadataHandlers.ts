import { app, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Simple metadata shape; extend as needed
type Metadata = {
  watchedVideos: Record<string, { watchedAt: string; lastPosition?: number; duration?: number }>;
};

const defaultMetadata: Metadata = {
  watchedVideos: {},
};

export function setupMetadataHandlers() {
  const metadataPath = path.join(app.getPath('userData'), 'metadata.json');

  const readMetadata = (): Metadata => {
    try {
      if (!fs.existsSync(metadataPath)) {
        fs.writeFileSync(metadataPath, JSON.stringify(defaultMetadata, null, 2));
        return { ...defaultMetadata };
      }
      const parsed = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as Partial<Metadata>;
      return { ...defaultMetadata, ...parsed, watchedVideos: { ...defaultMetadata.watchedVideos, ...(parsed.watchedVideos || {}) } };
    } catch (e) {
      return { ...defaultMetadata };
    }
  };

  const writeMetadata = (data: Metadata) => {
    fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
  };

  ipcMain.handle('sync-metadata', async (_event, delta?: Partial<Metadata>) => {
    const current = readMetadata();
    let next = current;
    if (delta) {
      next = {
        ...current,
        ...delta,
        watchedVideos: { ...current.watchedVideos, ...(delta.watchedVideos || {}) },
      };
      writeMetadata(next);
    }
    return next;
  });
}
