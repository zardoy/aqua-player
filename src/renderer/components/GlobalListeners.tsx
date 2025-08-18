import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { videoActions } from '../store/videoStore';
import { electronMethods } from '../ipcRenderer';

interface GlobalListenersProps {
  containerRef: React.RefObject<HTMLDivElement>;
  lastDragEndRef: React.MutableRefObject<number>;
}

const GlobalListeners: React.FC<GlobalListenersProps> = ({ containerRef, lastDragEndRef }) => {
  // Handle window dragging
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isDragging = false;
    let dragged = false;
    let startBounds: any = null;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Don't start dragging if clicking on controls or interactive elements
      const target = e.target as HTMLElement;
      if (target === container &&
          !target.closest('.video-controls') &&
          !target.closest('button') &&
          !target.closest('input')) {
        isDragging = true;
        startMouseX = e.screenX;
        startMouseY = e.screenY;
        electronMethods.startWindowDrag({
          mouseX: e.screenX,
          mouseY: e.screenY
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startBounds) return;

      if (e.screenX === startMouseX && e.screenY === startMouseY) return;

      dragged = true;
      electronMethods.moveWindow({
        mouseX: e.screenX,
        mouseY: e.screenY,
        startBounds,
        startMouseX,
        startMouseY
      })
    };

    const handleMouseUp = () => {
      if (dragged) {
        lastDragEndRef.current = Date.now();
      }
      dragged = false;
      isDragging = false;
      startBounds = null;
    };

    // Listen for the drag enabled event from main process
    const handleDragEnabled = (event: any, data: any) => {
      startBounds = data.startBounds;
    };

    window.ipcRenderer.on('window-drag-enabled', handleDragEnabled);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.ipcRenderer.off('window-drag-enabled', handleDragEnabled);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [containerRef, lastDragEndRef]);

  // Handle drag and drop
  useEffect(() => {
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];

        try {
          const filePath = window.electronUtils.getFilePath(file);
          if (filePath) {
            videoActions.loadFilePath(filePath);
          }
        } catch (error) {
          console.error('Error getting file path:', error);
          toast.error('Failed to load file via drag & drop');
        }
      }
    };

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);

    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, []);

  // Listen for OS-level open-file events
  useEffect(() => {
    const handler = (_event: any, filePath: string) => {
      if (filePath) {
        videoActions.loadFilePath(filePath);
      }
    };
    window.ipcRenderer.on('open-file', handler);
    return () => {
      window.ipcRenderer.off('open-file', handler);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default GlobalListeners;
