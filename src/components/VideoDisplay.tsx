import React, { useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { toast } from 'sonner';
import { videoState, videoActions } from '../store/videoStore';
import { settingsActions } from '../store/settingsStore';

interface VideoDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({ videoRef }) => {
  const snap = useSnapshot(videoState);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up event listeners
    const handlePlay = () => videoActions.play();
    const handlePause = () => videoActions.pause();
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
      settingsActions.updateSetting('player.volume', Math.round(newVolume * 100));
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

    if (snap.isPlaying && video.paused && !video.ended) {
      video.play().catch(error => {
        videoActions.setError(`Failed to play video: ${error.message}`);
      });
    } else if (!snap.isPlaying && !video.paused && !video.ended) {
      video.pause();
    }

    // Update progress bar on Windows
    window.electronAPI.setProgressBar(snap.isPlaying, snap.progress);
  }, [snap.isPlaying, snap.progress, videoRef]);

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

  // Handle file loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !snap.currentFile) return;

    try {
      // Set window title with full filename
      const fileName = snap.currentFile.split(/[/\\]/).pop() || '';
      window.electronAPI.setWindowTitle(fileName);

      const fileUrl = snap.currentFile.startsWith('file://') ? snap.currentFile : `file://${snap.currentFile}`;
      video.src = fileUrl;

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

      const handleCanPlay = () => {
        // Auto-play the video when it's ready
        video.play().catch(error => {
          console.error('Auto-play failed:', error);
        });
      };

      video.addEventListener('error', handleError);
      video.addEventListener('loadstart', handleLoadStart);
      video.addEventListener('canplay', handleCanPlay);

      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadstart', handleLoadStart);
        video.removeEventListener('canplay', handleCanPlay);
      };
    } catch (error) {
      console.error('Error setting video source:', error);
      const errorMessage = `Failed to load video: ${error.message}`;
      videoActions.setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [snap.currentFile, videoRef]);

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
