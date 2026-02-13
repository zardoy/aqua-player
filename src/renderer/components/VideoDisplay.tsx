import React, { useEffect, useRef } from 'react';
import { useSnapshot } from 'valtio';
import { toast } from 'sonner';
import { videoState, videoActions } from '../store/videoStore';
import { settingsActions, useSettings } from '../store/settingsStore';
import { electronMethods } from '../ipcRenderer';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoRef }) => {
  const snap = useSnapshot(videoState);
  const settings = useSettings();
  const playPromise = useRef<Promise<void>>(Promise.resolve());

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    globalThis.video = video;
    if (!video) return;

    // Set up event listeners
    const handlePlay = () => {
      videoActions.play();
    }
    const handlePause = () => {
      videoActions.pause();
    }
    const handleTimeUpdate = () => {
      videoActions.setCurrentTime(video.currentTime);
    };
    const handleDurationChange = () => {
      videoActions.setDuration(video.duration);
    };
    const handleVolumeChange = () => {
      const newVolume = video.volume;
      videoActions.setVolume(newVolume);
      // Save volume to settings
      settingsActions.updateSetting('player__volume', Math.round(newVolume * 100));
    };
    const handleEnded = () => {
      videoActions.pause();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoRef]);

  // Handle playback state changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.ended) {
      videoState.isEnded = true;
    }

    // Update progress bar on Windows
    electronMethods.updateProgressBar({ isPlaying: snap.isPlaying, progress: snap.progress });
  }, [snap.progress, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // If video ended but we want to play (after resetting), reset the video time first
    if (video.ended && snap.isPlaying && !snap.isEnded) {
      video.currentTime = 0;
    }

    if (snap.isPlaying && video.paused) {
      playVideo();
    } else if (!snap.isPlaying && !video.paused) {
      video.pause();
    }
  }, [snap.isPlaying, snap.isEnded, videoRef]);

  // Handle volume changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = snap.volume;
    video.muted = snap.isMuted;
  }, [snap.volume, snap.isMuted, videoRef]);

  // Handle playback rate changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = snap.playbackRate;
  }, [snap.playbackRate, videoRef]);

  // Handle seeking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || video.seeking) return;

    const targetTime = snap.progress * snap.duration;
    if (Math.abs(video.currentTime - targetTime) > 0.5) {
      video.currentTime = targetTime;
    }
  }, [snap.progress, snap.duration, videoRef]);

  const playVideo = () => {
    const video = videoRef.current;
    if (!video || !video.paused) return;

    playPromise.current = playPromise.current.then(() => {
      playPromise.current = video.play().catch(error => {
        videoActions.setError(`Failed to play video: ${error.message}`);
      });
    })
  }

  // Handle file loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !snap.currentFile) return;

    try {
      // Set window title with full filename
      const fileName = snap.currentFile.split(/[/\\]/).pop() || '';
      electronMethods.updateWindowTitle(fileName);

      const fileUrl = snap.currentFile.includes('://') ? snap.currentFile : `file://${snap.currentFile}`;
      video.src = fileUrl;

      if (settings.player__autoPlay) {
        playVideo();
      }

      // Add error handling for video loading
      const handleError = (e: Event) => {
        const target = e.target as HTMLVideoElement;
        const errorMessage = `Failed to load video: ${target.error?.message || 'Unknown error'}`;
        videoActions.setError(errorMessage);
        toast.error(errorMessage);
      };

      const handleLoadStart = () => {
        // toast.info('Loading video...');
      };

      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);

      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
      };
    } catch (error) {
      console.error('Error setting video source:', error);
      const errorMessage = `Failed to load video: ${error.message}`;
      videoActions.setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [snap.currentFile, videoRef]);

  // Media Session API: support hardware/media keys (next/prev, play/pause, seek)
  useEffect(() => {
    if (!snap.currentFile) return;
    const fileName = snap.currentFile.split(/[/\\]/).pop() || '';
    const ms = (navigator as any).mediaSession;
    if (!ms) return;

    try {
      // Set metadata so OS/media keys UIs can show file title with app logo as artwork
      const Metadata = (window as any).MediaMetadata;
      if (Metadata) {
        ms.metadata = new Metadata({ 
          title: fileName, 
          artist: 'Aqua Player', 
          album: '',
          artwork: [
            { src: '/assets/icon.png', sizes: '512x512', type: 'image/png' }
          ]
        });
      } else {
        ms.metadata = { title: fileName };
      }

      ms.playbackState = snap.isPlaying ? 'playing' : 'paused';

      // Check if there's a previous file in the playlist
      const currentIndex = snap.playlistFiles.indexOf(snap.currentFile);
      const hasPrevious = currentIndex > 0;
      const hasNext = currentIndex >= 0 && currentIndex < snap.playlistFiles.length - 1;

      // Only set previoustrack handler if there's a previous file
      if (hasPrevious) {
        ms.setActionHandler('previoustrack', () => {
          videoActions.loadPreviousFile();
        });
      } else {
        ms.setActionHandler('previoustrack', null);
      }

      // Only set nexttrack handler if there's a next file
      if (hasNext) {
        ms.setActionHandler('nexttrack', () => {
          videoActions.loadNextFile();
        });
      } else {
        ms.setActionHandler('nexttrack', null);
      }

      ms.setActionHandler('play', () => videoActions.play());
      ms.setActionHandler('pause', () => videoActions.pause());
      ms.setActionHandler('seekbackward', (details: any) => {
        const seekOffset = details && details.seekOffset ? details.seekOffset : 10;
        videoActions.seekBackward(seekOffset);
      });
      ms.setActionHandler('seekforward', (details: any) => {
        const seekOffset = details && details.seekOffset ? details.seekOffset : 10;
        videoActions.seekForward(seekOffset);
      });
    } catch (err) {
      console.warn('Media Session not available or failed to set handlers', err);
    }

    return () => {
      try {
        ms.setActionHandler('previoustrack', null);
        ms.setActionHandler('nexttrack', null);
        ms.setActionHandler('play', null);
        ms.setActionHandler('pause', null);
        ms.setActionHandler('seekbackward', null);
        ms.setActionHandler('seekforward', null);
      } catch { /* ignore */ }
    };
  }, [snap.currentFile, snap.isPlaying, snap.playlistFiles]);

  // Handle Ctrl+wheel zoom and panning
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let panX = 0;
    let panY = 0;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey && settings.controls__zoomEnabled) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -settings.controls__zoomSensitivity : settings.controls__zoomSensitivity;

        // Calculate cursor position relative to video
        const rect = video.getBoundingClientRect();
        const cursorX = (e.clientX - rect.left) / rect.width;
        const cursorY = (e.clientY - rect.top) / rect.height;

        // Calculate new zoom level
        const oldZoom = snap.zoomLevel;
        const newZoom = Math.max(1, Math.min(5, oldZoom + delta));

        // Calculate pan adjustment to keep cursor position fixed
        if (newZoom !== oldZoom) {
          const scale = newZoom / oldZoom;
          const centerX = 0.5;
          const centerY = 0.5;
          panX += (centerX - cursorX) * (scale - 1) * rect.width;
          panY += (centerY - cursorY) * (scale - 1) * rect.height;

          videoActions.setZoomLevel(newZoom);
          video.style.transform = `scale(${newZoom}) translate(${panX}px, ${panY}px)`;
        }
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.ctrlKey && snap.zoomLevel > 1) {
        e.preventDefault();
        isPanning = true;
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        video.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        panX = e.clientX - startX;
        panY = e.clientY - startY;
        video.style.transform = `scale(${snap.zoomLevel}) translate(${panX}px, ${panY}px)`;
      }
    };

    const handleMouseUp = () => {
      if (isPanning) {
        isPanning = false;
        video.style.cursor = '';
      }
    };

    // Add cursor style for potential panning
    const handleMouseEnter = (e: MouseEvent) => {
      if (e.ctrlKey && snap.zoomLevel > 1) {
        video.style.cursor = 'grab';
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && snap.zoomLevel > 1) {
        video.style.cursor = 'grab';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        video.style.cursor = '';
      }
    };

    video.addEventListener('wheel', handleWheel, { passive: false });
    video.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    video.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      video.removeEventListener('wheel', handleWheel);
      video.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      video.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [snap.zoomLevel, settings.controls__zoomEnabled, settings.controls__zoomSensitivity, videoRef]);

  return (
    <video
      playsInline
      loop={snap.isLooping}
      ref={videoRef}
      className="video-player"
      title={snap.currentFile ? (snap.currentFile.split(/[/\\]/).pop() || '') : ''}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default VideoDisplay;
