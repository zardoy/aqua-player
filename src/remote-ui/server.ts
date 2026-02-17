import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import * as fs from 'fs';
import { BrowserWindow } from 'electron';

export interface RemoteUIServerOptions {
  port?: number;
  password?: string;
  enabled?: boolean;
}

export class RemoteUIServer {
  private server: http.Server | null = null;
  private wss: WebSocket.Server | null = null;
  private port: number;
  private password: string;
  private enabled: boolean;
  private mainWindow: BrowserWindow | null = null;
  private clients: Set<WebSocket> = new Set();

  constructor(options: RemoteUIServerOptions = {}) {
    this.port = options.port || this.getRandomPort();
    this.password = options.password || this.generateRandomPassword();
    this.enabled = options.enabled ?? false;
  }

  private getRandomPort(): number {
    // Generate a random port between 3001-3999 to avoid conflicts
    return Math.floor(Math.random() * 999) + 3001;
  }

  private generateRandomPassword(): string {
    // Generate a random 8-character password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  public start(): void {
    if (!this.enabled) {
      console.log('Remote UI is disabled');
      return;
    }

    if (this.server) {
      console.log('Remote UI server already running');
      return;
    }

    this.server = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws: WebSocket) => {
      this.handleWebSocketConnection(ws);
    });

    this.server.listen(this.port, () => {
      console.log(`Remote UI server started on port ${this.port}`);
      console.log(`Remote UI password: ${this.password}`);
      console.log(`Access URL: http://localhost:${this.port}`);
    });

    this.server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${this.port} is in use, trying another port...`);
        this.port = this.getRandomPort();
        this.start();
      } else {
        console.error('Remote UI server error:', error);
      }
    });
  }

  public stop(): void {
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.clients.clear();
    console.log('Remote UI server stopped');
  }

  public updatePassword(newPassword: string): void {
    this.password = newPassword;
    console.log('Remote UI password updated');
  }

  public getPort(): number {
    return this.port;
  }

  public getPassword(): string {
    return this.password;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled && !this.server) {
      this.start();
    } else if (!enabled && this.server) {
      this.stop();
    }
  }

  private handleHttpRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = req.url || '/';

    if (url === '/') {
      // Serve the main HTML file
      const htmlPath = path.join(__dirname, '../../.webpack/remote-ui/index.html');
      if (fs.existsSync(htmlPath)) {
        const html = fs.readFileSync(htmlPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Remote UI not built. Run the build script first.');
      }
    } else if (url === '/remote-ui.js') {
      // Serve the JavaScript bundle
      const jsPath = path.join(__dirname, '../../.webpack/remote-ui/remote-ui.js');
      if (fs.existsSync(jsPath)) {
        const js = fs.readFileSync(jsPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(js);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Remote UI JavaScript not found');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
    }
  }

  private handleWebSocketConnection(ws: WebSocket): void {
    console.log('New WebSocket connection');
    this.clients.add(ws);

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      this.clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.clients.delete(ws);
    });
  }

  private handleWebSocketMessage(ws: WebSocket, message: any): void {
    switch (message.type) {
      case 'auth':
        this.handleAuthentication(ws, message.password);
        break;
      case 'command':
        this.handleCommand(ws, message.command);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handleAuthentication(ws: WebSocket, password: string): void {
    if (password === this.password) {
      ws.send(JSON.stringify({ type: 'auth_success' }));
      console.log('Client authenticated successfully');

      // Send initial player state
      this.sendPlayerState(ws);
    } else {
      ws.send(JSON.stringify({ type: 'auth_failed' }));
      console.log('Client authentication failed');
    }
  }

  private handleCommand(ws: WebSocket, command: string): void {
    if (!this.mainWindow) {
      return;
    }

    console.log('Executing command:', command);

    // Send command to main window via IPC
    this.mainWindow.webContents.send('remote-ui-command', command);
  }

  public broadcastPlayerState(state: any): void {
    const message = JSON.stringify({
      type: 'player_state',
      state: state
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public broadcastFileInfo(filename: string): void {
    const message = JSON.stringify({
      type: 'file_info',
      filename: filename
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private sendPlayerState(ws: WebSocket): void {
    // This would be populated with actual player state
    const state = {
      isPlaying: false,
      currentFile: 'No file loaded',
      currentTime: 0,
      duration: 0
    };

    ws.send(JSON.stringify({
      type: 'player_state',
      state: state
    }));
  }
}
