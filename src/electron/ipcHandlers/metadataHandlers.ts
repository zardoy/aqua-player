import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export function setupMetadataHandlers() {
  const metadataPath = path.join(app.getPath('userData'), 'metadata.json');

  const handlers = {
    async syncMetadata(delta: any) {
      try {
        let metadata = {};

        // Load existing metadata
        if (fs.existsSync(metadataPath)) {
          const data = fs.readFileSync(metadataPath, 'utf8');
          metadata = JSON.parse(data);
        }

        // Merge with delta
        metadata = { ...metadata, ...delta };

        // Save back to disk
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');

        return true;
      } catch (error) {
        console.error('Failed to sync metadata:', error);
        return false;
      }
    }
  };

  return handlers;
}
