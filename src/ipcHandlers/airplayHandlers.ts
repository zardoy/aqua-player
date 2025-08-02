import { ipcMain } from 'electron';
import airplay from 'airplay';

let browser: any = null;
let currentDevice: any = null;

export const setupAirplayHandlers = () => {
  // Initialize AirPlay browser
  browser = airplay.createBrowser();

  browser.on('deviceOnline', (device: any) => {
    console.log('AirPlay device found:', device.name);
  });

  browser.on('deviceOffline', (device: any) => {
    console.log('AirPlay device lost:', device.name);
    if (currentDevice && currentDevice.id === device.id) {
      currentDevice = null;
    }
  });

  // Handle AirPlay device scanning
  ipcMain.handle('get-airplay-devices', async () => {
    try {
      if (!browser.isRunning) {
        browser.start();
      }
      return browser.getDevices().map((device: any) => device.name);
    } catch (error) {
      console.error('Failed to get AirPlay devices:', error);
      throw error;
    }
  });

  // Handle starting AirPlay
  ipcMain.handle('start-airplay', async (_, deviceName: string) => {
    try {
      const device = browser.getDevices().find((d: any) => d.name === deviceName);
      if (!device) {
        throw new Error(`Device ${deviceName} not found`);
      }

      currentDevice = device;
      // Note: You'll need to get the actual video URL here
      // This is just a placeholder
      const videoUrl = 'http://localhost:3000/video';
      await device.play(videoUrl, 0);
    } catch (error) {
      console.error('Failed to start AirPlay:', error);
      throw error;
    }
  });

  // Handle stopping AirPlay
  ipcMain.handle('stop-airplay', async () => {
    try {
      if (currentDevice) {
        await currentDevice.stop();
        currentDevice = null;
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
  });
};
