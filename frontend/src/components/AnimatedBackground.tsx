import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const bgColor = theme?.bgPrimary || '#1a0508';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Convert hex string to rgba for softer drawing
    const hexToRgba = (hex: string, alpha: number) => {
      if (!hex || hex.startsWith('var')) return `rgba(255, 255, 255, ${alpha})`;
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Very soft, peaceful lines
    const lineColor = hexToRgba(theme?.primaryColor || '#e2e8f0', 0.08);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';

    const size = 35; // Size of each isometric cube
    const h = size * Math.sqrt(3) / 2; // Height of an equilateral triangle

    const drawCube = (x: number, y: number) => {
      // Top face
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y - h);
      ctx.lineTo(x + 2 * size, y);
      ctx.lineTo(x + size, y + h);
      ctx.closePath();
      ctx.stroke();

      // Left face
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + size, y + h);
      ctx.lineTo(x + size, y + h + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.stroke();

      // Right face
      ctx.beginPath();
      ctx.moveTo(x + 2 * size, y);
      ctx.lineTo(x + size, y + h);
      ctx.lineTo(x + size, y + h + size);
      ctx.lineTo(x + 2 * size, y + size);
      ctx.closePath();
      ctx.stroke();
    };

    // Generate a static 3D Isometric Maze / Building UI
    // We draw cubes randomly to create a staggered, architectural "maze" feel.
    // It is completely unmotioned (drawn only once).
    for (let row = -5; row < height / h + 5; row++) {
      for (let col = -5; col < width / (3 * size) + 5; col++) {
        let x = col * 3 * size;
        let y = row * h;
        
        // Offset odd rows for isometric alignment
        if (row % 2 !== 0) {
          x += 1.5 * size;
        }

        // Draw a cube 65% of the time to create a "maze-like building" structure
        if (Math.random() > 0.35) {
          drawCube(x, y);
        }
      }
    }

    const handleResize = () => {
      // Redraw the static background if the user resizes the window
      let newWidth = window.innerWidth;
      let newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, newWidth, newHeight);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      
      // Use a deterministic seed or just random again
      for (let row = -5; row < newHeight / h + 5; row++) {
        for (let col = -5; col < newWidth / (3 * size) + 5; col++) {
          let x = col * 3 * size;
          let y = row * h;
          if (row % 2 !== 0) {
            x += 1.5 * size;
          }
          if (Math.random() > 0.35) {
            drawCube(x, y);
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <div className="animated-bg-container" style={{ backgroundColor: theme?.bgPrimary || 'var(--bg-primary)' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%'
        }} 
      />
      {/* Soft gradient overlay to blend the 3D maze perfectly into the background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, transparent 0%, ${theme?.bgPrimary || 'var(--bg-primary)'} 100%)`,
        pointerEvents: 'none'
      }}></div>
    </div>
  );
};

export default AnimatedBackground;
