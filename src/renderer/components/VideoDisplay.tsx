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
    if (!video || video.ended) return;

    if (snap.isPlaying && video.paused) {
      playVideo();
    } else if (!snap.isPlaying && !video.paused) {
      video.pause();
    }
  }, [snap.isPlaying, videoRef]);

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
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default VideoDisplay;
