import React, { useEffect, useRef } from 'react';

interface AudioVisualizerCanvasProps {
  isPlaying: boolean;
  waveformData?: number[];
  progress?: number; // 0 to 1
  onSeek?: (ratio: number) => void;
  height?: number;
  barColor?: string;
  activeBarColor?: string;
  interactive?: boolean;
  isLiveRecording?: boolean;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  isPlaying,
  waveformData,
  progress = 0,
  onSeek,
  height = 56,
  barColor = 'rgba(45, 212, 191, 0.28)',
  activeBarColor = '#2dd4bf',
  interactive = true,
  isLiveRecording = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Default bars if waveform is empty
  const defaultBars = useRef<number[]>(
    Array.from({ length: 64 }, (_, i) => 0.2 + 0.6 * Math.abs(Math.sin((i / 64) * Math.PI * 3.5)))
  ).current;

  const bars = waveformData && waveformData.length > 0 ? waveformData : defaultBars;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, rect.width, height);
      phaseRef.current += 0.08;

      const totalBars = bars.length;
      const barWidth = Math.max(2, (rect.width / totalBars) - 2);
      const centerY = height / 2;

      for (let i = 0; i < totalBars; i++) {
        let val = bars[i];
        
        // Dynamic motion if playing or live recording
        if (isLiveRecording) {
          const wave = Math.sin(phaseRef.current + i * 0.3) * 0.4 + 0.6;
          val = Math.max(0.15, val * wave);
        } else if (isPlaying) {
          const wave = Math.sin(phaseRef.current + i * 0.2) * 0.15;
          val = Math.min(1, Math.max(0.1, val + wave));
        }

        const barHeight = Math.max(4, val * (height - 8));
        const x = i * (barWidth + 2);
        const y = centerY - barHeight / 2;

        const isPast = (i / totalBars) <= progress;

        // Gradient color for active playback
        if (isPast && !isLiveRecording) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#5eead4');
          grad.addColorStop(1, activeBarColor);
          ctx.fillStyle = grad;
        } else if (isLiveRecording) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#f43f5e');
          grad.addColorStop(1, '#e11d48');
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = barColor;
        }

        ctx.beginPath();
        const radius = barWidth / 2;
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      // Draw scrubber line if interactive
      if (interactive && !isLiveRecording && progress > 0) {
        const scrubX = progress * rect.width;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(scrubX, 2);
        ctx.lineTo(scrubX, height - 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(scrubX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isPlaying || isLiveRecording) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, waveformData, progress, isLiveRecording, height, barColor, activeBarColor, interactive]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || isLiveRecording || !onSeek) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio);
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        className={`w-full block ${interactive && !isLiveRecording ? 'cursor-pointer' : ''}`}
        style={{ height: `${height}px` }}
      />
    </div>
  );
};
