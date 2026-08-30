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

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Convert hex string to rgba for softer drawing
    const hexToRgba = (hex: string, alpha: number) => {
      if (!hex) return `rgba(255, 255, 255, ${alpha})`;
      // handle css variables if passed accidentally
      if (hex.startsWith('var')) return 'rgba(255, 255, 255, 0.1)';
      
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

    const lineColor = hexToRgba(theme.primaryColor || '#e2e8f0', 0.15);
    const bgColor = theme.bgPrimary || '#1a0508';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const cellSize = 30; // Size of each maze cell
    const cols = Math.floor(width / cellSize) + 1;
    const rows = Math.floor(height / cellSize) + 1;

    class Cell {
      i: number;
      j: number;
      visited: boolean;

      constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
        this.visited = false;
      }

      checkNeighbors() {
        let neighbors: Cell[] = [];
        let top = grid[index(this.i, this.j - 1)];
        let right = grid[index(this.i + 1, this.j)];
        let bottom = grid[index(this.i, this.j + 1)];
        let left = grid[index(this.i - 1, this.j)];

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
          let r = Math.floor(Math.random() * neighbors.length);
          return neighbors[r];
        } else {
          return undefined;
        }
      }
    }

    function index(i: number, j: number) {
      if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) return -1;
      return i + j * cols;
    }

    const grid: Cell[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        grid.push(new Cell(i, j));
      }
    }

    // Start in the middle of the screen for a cool expansion effect
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    let current = grid[index(startX, startY)];
    if (!current) current = grid[0];
    
    current.visited = true;
    const stack: Cell[] = [];
    
    let buildSpeed = 3; // Draw 3 lines per frame

    function draw() {
      for(let n=0; n<buildSpeed; n++) {
        const next = current.checkNeighbors();
        if (next) {
          next.visited = true;
          stack.push(current);
          
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 1.5;
          ctx.lineCap = 'round';
          ctx.moveTo(current.i * cellSize + cellSize/2, current.j * cellSize + cellSize/2);
          ctx.lineTo(next.i * cellSize + cellSize/2, next.j * cellSize + cellSize/2);
          ctx.stroke();

          current = next;
        } else if (stack.length > 0) {
          current = stack.pop()!;
        } else {
          return; // Maze finished building
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      // Just clear animation on resize, it will restart on next theme trigger or page reload
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <div className="animated-bg-container" style={{ backgroundColor: theme.bgPrimary }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          opacity: 0.7
        }} 
      />
      {/* Soft gradient overlay to blend the maze into the background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at center, transparent 0%, ${theme.bgPrimary} 110%)`,
        pointerEvents: 'none'
      }}></div>
    </div>
  );
};

export default AnimatedBackground;
