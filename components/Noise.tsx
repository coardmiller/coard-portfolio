import React, { useEffect, useRef } from 'react';

const Noise: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create a noise pattern on a separate off-screen canvas
    // We make it fairly large to avoid obvious tiling patterns
    const patternSize = 256;
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = patternSize;
    patternCanvas.height = patternSize;
    const patternCtx = patternCanvas.getContext('2d');
    
    if (patternCtx) {
      const imgData = patternCtx.createImageData(patternSize, patternSize);
      const buffer = new Uint32Array(imgData.data.buffer);
      
      // Generate random noise
      for (let i = 0; i < buffer.length; i++) {
        // Random grayscale value with full opacity
        // The visual opacity is controlled by the CSS of the main canvas
        const val = Math.random() * 255;
        // Little-endian: AABBGGRR
        buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
      }
      patternCtx.putImageData(imgData, 0, 0);
    }

    // Create the pattern object from the off-screen canvas
    const pattern = ctx.createPattern(patternCanvas, 'repeat');
    
    let animationId: number;

    const loop = () => {
      if (!pattern) return;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Generate random offsets to "move" the noise
      const xOffset = Math.random() * patternSize;
      const yOffset = Math.random() * patternSize;

      // Use the translation hack to shift the pattern origin
      ctx.save();
      ctx.translate(xOffset, yOffset);
      ctx.fillStyle = pattern;
      // We fill a rect larger than the screen shifted by the negative offset 
      // to ensure coverage.
      ctx.fillRect(-xOffset, -yOffset, canvas.width + patternSize, canvas.height + patternSize);
      ctx.restore();

      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999] opacity-[0.05] dark:opacity-[0.05] mix-blend-overlay"
      style={{ filter: 'contrast(140%) brightness(100%)' }}
    />
  );
};

export default Noise;