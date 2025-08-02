import { ipcMain } from 'electron';
import AirPlay from 'airplay-protocol';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { AddressInfo } from 'net';

let browser: any = null;
let currentDevice: any = null;
let httpServer: http.Server | null = null;
let currentVideoPath: string | null = null;

// Create HTTP server to serve video files
const createHttpServer = () => {
  if (httpServer) return;

  httpServer = http.createServer((req, res) => {
    if (!currentVideoPath) {
      res.writeHead(404);
      res.end('No video file set');
      return;
    }

    const stat = fs.statSync(currentVideoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(currentVideoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(currentVideoPath).pipe(res);
    }
  });

  httpServer.listen(0, '127.0.0.1');
  console.log('HTTP server started on port', (httpServer.address() as AddressInfo).port);
};

export const setupAirplayHandlers = () => {
  // Initialize AirPlay browser
  browser = new AirPlay.Browser();
  createHttpServer();

  browser.on('deviceOnline', (device: any) => {
    console.log('AirPlay device found:', device.info.name);
  });

  browser.on('deviceOffline', (device: any) => {
    console.log('AirPlay device lost:', device.info.name);
    if (currentDevice && currentDevice.info.id === device.info.id) {
      currentDevice = null;
    }
  });

  // Handle AirPlay device scanning
  ipcMain.handle('get-airplay-devices', async () => {
    try {
      if (!browser.isRunning) {
        browser.start();
      }
      return browser.getDevices().map((device: any) => device.info.name);
    } catch (error) {
      console.error('Failed to get AirPlay devices:', error);
      throw error;
    }
  });

  // Handle starting AirPlay
  ipcMain.handle('start-airplay', async (_, deviceName: string, videoPath: string) => {
    try {
      const device = browser.getDevices().find((d: any) => d.info.name === deviceName);
      if (!device) {
        throw new Error(`Device ${deviceName} not found`);
      }

      currentDevice = device;
      currentVideoPath = videoPath;

      // Get the local server URL
      const port = (httpServer?.address() as AddressInfo).port;
      const videoUrl = `http://127.0.0.1:${port}/video`;

      // Create a new AirPlay session
      const session = device.createSession();
      await session.start();
      await session.play(videoUrl);

      // Store the session for later use
      currentDevice.session = session;
    } catch (error) {
      console.error('Failed to start AirPlay:', error);
      throw error;
    }
  });

  // Handle stopping AirPlay
  ipcMain.handle('stop-airplay', async () => {
    try {
      if (currentDevice && currentDevice.session) {
        await currentDevice.session.stop();
        currentDevice.session = null;
        currentDevice = null;
        currentVideoPath = null;
      }
    } catch (error) {
      console.error('Failed to stop AirPlay:', error);
      throw error;
    }
  });

  // Clean up when app quits
  process.on('exit', () => {
    if (browser) {
      browser.stop();
    }
    if (httpServer) {
      httpServer.close();
    }
  });
};
