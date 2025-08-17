import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { PublisherGithub } from '@electron-forge/publisher-github';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
    extraResource: [
      './assets/thumbnail_control'
    ],
    protocols: [
      {
        name: 'Aqua Player',
        schemes: ['aqua-player']
      }
    ],
    // File associations for macOS
    extendInfo: {
      CFBundleDocumentTypes: [
        {
          CFBundleTypeName: 'Video File',
          CFBundleTypeRole: 'Viewer',
          CFBundleTypeExtensions: ['mp4', 'webm', 'ogg', 'mkv', 'avi', 'mov', 'wmv', 'm4v', 'flv', '3gp'],
          CFBundleTypeIconFile: 'icon.icns',
          LSHandlerRank: 'Default'
        },
        {
          CFBundleTypeName: 'Audio File',
          CFBundleTypeRole: 'Viewer',
          CFBundleTypeExtensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma'],
          CFBundleTypeIconFile: 'icon.icns',
          LSHandlerRank: 'Default'
        }
      ]
    },
    // File associations for Windows
    win32metadata: {
      FileAssociations: [
        {
          ext: 'mp4',
          name: 'MP4 Video File',
          description: 'MP4 Video File',
          mimeType: 'video/mp4',
          role: 'Viewer'
        },
        {
          ext: 'mkv',
          name: 'Matroska Video File',
          description: 'Matroska Video File',
          mimeType: 'video/x-matroska',
          role: 'Viewer'
        },
        {
          ext: 'avi',
          name: 'AVI Video File',
          description: 'AVI Video File',
          mimeType: 'video/x-msvideo',
          role: 'Viewer'
        },
        {
          ext: 'mov',
          name: 'QuickTime Video File',
          description: 'QuickTime Video File',
          mimeType: 'video/quicktime',
          role: 'Viewer'
        },
        {
          ext: 'webm',
          name: 'WebM Video File',
          description: 'WebM Video File',
          mimeType: 'video/webm',
          role: 'Viewer'
        },
        {
          ext: 'mp3',
          name: 'MP3 Audio File',
          description: 'MP3 Audio File',
          mimeType: 'audio/mpeg',
          role: 'Viewer'
        }
      ]
    } as any
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      name: 'aqua-player',
      setupIcon: './assets/icon.ico',
      iconUrl: 'https://github.com/zardoy/aqua-player/raw/main/assets/icon.ico',
      setupExe: 'Aqua-Player-Setup.exe',
    }),
    // new MakerZIP({}, ['darwin']),
    new MakerDMG({
      name: 'aqua-player',
      icon: './assets/icon.icns',
    }),
    // new MakerRpm({}),
    // new MakerDeb({})
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: 'zardoy',
        name: 'aqua-player',
      },
      draft: false,
      prerelease: false,
    })
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
