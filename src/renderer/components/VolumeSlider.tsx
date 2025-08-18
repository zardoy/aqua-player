import React, { useRef, useEffect, useState } from 'react';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onChange, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newValue = x / rect.width;
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newValue = x / rect.width;
    onChange(newValue);
    setIsDragging(true);
  };

  return (
    <div
      ref={containerRef}
      className={`volume-slider-container ${className}`}
      onMouseDown={handleMouseDown}
      style={{
        position: 'relative',
        width: '60px',
        height: '20px', // Larger hit area
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="volume-slider-track"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '4px', // Visual height
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
        }}
      >
        <div
          className="volume-slider-fill"
          style={{
            position: 'absolute',
            left: 0,
            width: `${value * 100}%`,
            height: '100%',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '2px',
          }}
        />
        <div
          className="volume-slider-thumb"
          style={{
            position: 'absolute',
            left: `${value * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '10px',
            height: '10px',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '50%',
          }}
        />
      </div>
    </div>
  );
};

export default VolumeSlider;
