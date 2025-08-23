# Remote UI

The Remote UI allows you to control Aqua Player from a web browser or mobile device over your local network.

## Features

- **Web-based interface** accessible from any device on your network
- **Real-time control** of player functions (play, pause, stop, next, previous, fullscreen)
- **Live status updates** showing current file, playback state, and time
- **Secure authentication** with password protection
- **Automatic port selection** to avoid conflicts with other services

## Setup

1. **Enable Remote UI** in the main app settings
2. **Set a password** for secure access
3. **Access the interface** at the displayed URL (e.g., `http://localhost:3001`)

## Usage

1. Open the Remote UI URL in your web browser
2. Enter the password when prompted
3. Use the control buttons to control playback
4. View real-time player status and file information

## Security

- The Remote UI is only accessible from your local network
- Password authentication is required for all connections
- WebSocket communication is encrypted when possible
- No external internet access is required

## Technical Details

- **Port**: Automatically selected (3001-3999 range)
- **Protocol**: HTTP + WebSocket
- **Authentication**: Password-based
- **Build**: Webpack + React + TypeScript
- **Dependencies**: ws (WebSocket), React, TypeScript

## Building

```bash
pnpm run build:remote-ui
```

The built files are output to `.webpack/remote-ui/`.