import { BrowserWindow, dialog, shell, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AUDIO_EXTENSIONS, VIDEO_EXTENSIONS } from '../../shared/constants';
import { getFFprobePath } from '../utils/ffprobePath';

export function setupFileHandlers(mainWindow: BrowserWindow) {
  const handlers = {
    async openFileDialog() {
      if (!mainWindow) return;

      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
          { name: 'Videos', extensions: VIDEO_EXTENSIONS },
          { name: 'Audio', extensions: AUDIO_EXTENSIONS },
          { name: 'Media Files', extensions: [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS] }
        ]
      });

      return result;
    },

    async openFileInExplorer(filePath: string) {
      shell.showItemInFolder(filePath);
    },

    async getFolderContents(folderPath: string) {
      try {
        const files = await fs.promises.readdir(folderPath);
        return files
          .map(file => path.join(folderPath, file))
          .filter(file => {
            try {
              return fs.statSync(file).isFile();
            } catch {
              return false;
            }
          });
      } catch (error) {
        console.error('Failed to read folder contents:', error);
        return [];
      }
    },

    async getVideoMetadata(filePath: string) {
      try {
        const { exec } = require('child_process');
        const util = require('util');
        const execAsync = util.promisify(exec);

        const { stdout } = await execAsync(`"${getFFprobePath()}" -v quiet -print_format json -show_format -show_streams "${filePath}"`);
        const info = JSON.parse(stdout);

        // Extract video stream info
        const videoStream = info.streams.find((s: any) => s.codec_type === 'video');
        const audioStream = info.streams.find((s: any) => s.codec_type === 'audio');

        if (videoStream) {
          const fps = videoStream.r_frame_rate ? eval(videoStream.r_frame_rate) : null;

          return {
            fps,
            duration: parseFloat(info.format.duration),
            width: videoStream.width,
            height: videoStream.height,
            codec: videoStream.codec_name,
            bitrate: parseInt(info.format.bit_rate),
            hasAudio: !!audioStream,
            audioCodec: audioStream?.codec_name,
            fileSize: parseInt(info.format.size)
          };
        }

        return null;
      } catch (error) {
        console.error('Failed to get video metadata:', error);
        return null;
      }
    }
  };

  return handlers;
}
