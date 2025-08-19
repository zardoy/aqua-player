/**
 * @type {import('electron-builder').Configuration}
 */
const config = {
  appId: "com.vitalyturovsky.aquaplayer",
  productName: "Aqua Player",
  directories: {
    output: "release",
    buildResources: "assets",
    app: "dist" // Point to webpack output instead of Forge's
  },
  publish: [{
    provider: "github",
    owner: "zardoy",
    repo: "aqua-player"
  }],
  files: [
    "**/*"
  ],
  beforeBuild() { },
  extraResources: [
    {
      from: "assets/thumbnail_control",
      to: "thumbnail_control"
    },
    {
      from: "dist/ffprobe",
      to: "ffprobe"
    }
  ],
  asar: true,
  asarUnpack: [
    "dist/ffprobe/**/*"
  ],
  protocols: [
    {
      name: "Aqua Player",
      schemes: ["aqua-player"]
    }
  ],
  // Windows configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "assets/icon.ico"
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    artifactName: "Aqua-Player-Setup-${version}.${ext}",
    deleteAppDataOnUninstall: true,
    runAfterFinish: true,
  },
  // macOS configuration
  mac: {
    target: {
      target: "dmg",
    },
    icon: "assets/icon.icns",
    category: "public.app-category.video",
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    // entitlements: "build/entitlements.mac.plist",
    // entitlementsInherit: "build/entitlements.mac.plist"
  },
  dmg: {
    icon: "assets/icon.icns",
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications"
      }
    ]
  },
  linux: {
    target: ["AppImage"],
    category: "AudioVideo"
  }
};

module.exports = config;
