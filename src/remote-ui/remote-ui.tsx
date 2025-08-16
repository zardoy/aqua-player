import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

interface PlayerState {
  isPlaying: boolean;
  currentFile: string;
  currentTime: number;
  duration: number;
}

interface RemoteUIProps {}

const RemoteUI: React.FC<RemoteUIProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    currentFile: 'No file loaded',
    currentTime: 0,
    duration: 0
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const port = localStorage.getItem('remote-ui-port') || '3001';
    const ws = new WebSocket(`ws://localhost:${port}`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      
      // Send authentication
      ws.send(JSON.stringify({
        type: 'auth',
        password: password
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'auth_success':
            setIsAuthenticated(true);
            break;
          case 'auth_failed':
            setIsAuthenticated(false);
            alert('Authentication failed. Please check your password.');
            break;
          case 'player_state':
            setPlayerState(data.state);
            break;
          case 'file_info':
            setPlayerState(prev => ({
              ...prev,
              currentFile: data.filename || 'Unknown file'
            }));
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setIsAuthenticated(false);
      
      // Attempt to reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isAuthenticated) {
          connectWebSocket();
        }
      }, 5000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  const authenticate = () => {
    if (!password.trim()) {
      alert('Please enter a password');
      return;
    }
    
    // Store password in localStorage for reconnection
    localStorage.setItem('remote-ui-password', password);
    connectWebSocket();
  };

  const sendCommand = (command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isAuthenticated) {
      wsRef.current.send(JSON.stringify({
        type: 'command',
        command: command
      }));
    }
  };

  useEffect(() => {
    // Check if we have a stored password
    const storedPassword = localStorage.getItem('remote-ui-password');
    if (storedPassword) {
      setPassword(storedPassword);
    }

    // Check if we have a stored port
    if (!localStorage.getItem('remote-ui-port')) {
      localStorage.setItem('remote-ui-port', '3001');
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileName = (filePath: string): string => {
    if (filePath === 'No file loaded') return filePath;
    return filePath.split('/').pop()?.split('\\').pop() || filePath;
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Aqua Player Remote UI</h1>
        <div>
          Status: <span id="connectionStatus">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}></span>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="password-section">
          <h3>Authentication Required</h3>
          <p>Enter the remote access password to connect:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            onKeyPress={(e) => e.key === 'Enter' && authenticate()}
          />
          <button onClick={authenticate}>Connect</button>
        </div>
      )}

      {isAuthenticated && (
        <>
          <div className="status">
            <h3>Player Status</h3>
            <div>
              <p><strong>State:</strong> {playerState.isPlaying ? 'Playing' : 'Paused'}</p>
              <p><strong>Time:</strong> {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}</p>
            </div>
          </div>

          <div className="file-info">
            <h3>Current File</h3>
            <div>{getFileName(playerState.currentFile)}</div>
          </div>

          <div className="controls">
            <button onClick={() => sendCommand('play')} disabled={!isConnected}>
              {playerState.isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => sendCommand('stop')} disabled={!isConnected}>
              Stop
            </button>
            <button onClick={() => sendCommand('next')} disabled={!isConnected}>
              Next
            </button>
            <button onClick={() => sendCommand('prev')} disabled={!isConnected}>
              Previous
            </button>
            <button onClick={() => sendCommand('fullscreen')} disabled={!isConnected}>
              Fullscreen
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Initialize React app
const root = ReactDOM.createRoot(document.getElementById('root') || document.body);
root.render(<RemoteUI />);

export default RemoteUI;