import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const AnimatedBackground: React.FC = () => {
  const mazeCanvasRef = useRef<HTMLCanvasElement>(null);
  const ballCanvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const mazeCanvas = mazeCanvasRef.current;
    const ballCanvas = ballCanvasRef.current;
    if (!mazeCanvas || !ballCanvas) return;

    const mazeCtx = mazeCanvas.getContext('2d');
    const ballCtx = ballCanvas.getContext('2d');
    if (!mazeCtx || !ballCtx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    mazeCanvas.width = width;
    mazeCanvas.height = height;
    ballCanvas.width = width;
    ballCanvas.height = height;

    let animationFrameId: number;

    const bgColor = theme?.bgPrimary || '#1a0508';
    mazeCtx.fillStyle = bgColor;
    mazeCtx.fillRect(0, 0, width, height);

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

    const baseColor = theme?.mazeColor || theme?.primaryColor || '#e2e8f0';
    const lineColor = hexToRgba(baseColor, 0.15);
    const ballColor = hexToRgba(baseColor, 1);

    mazeCtx.strokeStyle = lineColor;
    mazeCtx.lineWidth = 1;
    mazeCtx.lineCap = 'round';

    const cellSize = 20;
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);

    class Cell {
      i: number;
      j: number;
      visited: boolean;
      connected: Cell[]; 
      walls: boolean[]; // top, right, bottom, left

      constructor(i: number, j: number) {
        this.i = i;
        this.j = j;
        this.visited = false;
        this.connected = [];
        this.walls = [true, true, true, true];
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

    function removeWalls(a: Cell, b: Cell) {
      let x = a.i - b.i;
      if (x === 1) { a.walls[3] = false; b.walls[1] = false; }
      else if (x === -1) { a.walls[1] = false; b.walls[3] = false; }
      let y = a.j - b.j;
      if (y === 1) { a.walls[0] = false; b.walls[2] = false; }
      else if (y === -1) { a.walls[2] = false; b.walls[0] = false; }
    }

    let grid: Cell[] = [];
    
    const generateMaze = () => {
      grid = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          grid.push(new Cell(i, j));
        }
      }

      let current = grid[0];
      current.visited = true;
      const stack: Cell[] = [];
      
      // 1. Build the perfect maze (DFS)
      while (true) {
        const next = current.checkNeighbors();
        if (next) {
          next.visited = true;
          
          removeWalls(current, next);
          current.connected.push(next);
          next.connected.push(current);
          
          stack.push(current);
          current = next;
        } else if (stack.length > 0) {
          current = stack.pop()!;
        } else {
          break; 
        }
      }

      // 2. Convert to a "Braid Maze" by removing all dead ends
      // This ensures the ball NEVER has to reverse!
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        if (cell.connected.length === 1) {
          let top = grid[index(cell.i, cell.j - 1)];
          let right = grid[index(cell.i + 1, cell.j)];
          let bottom = grid[index(cell.i, cell.j + 1)];
          let left = grid[index(cell.i - 1, cell.j)];
          
          let disconnected = [];
          if (top && !cell.connected.includes(top)) disconnected.push(top);
          if (right && !cell.connected.includes(right)) disconnected.push(right);
          if (bottom && !cell.connected.includes(bottom)) disconnected.push(bottom);
          if (left && !cell.connected.includes(left)) disconnected.push(left);
          
          if (disconnected.length > 0) {
            let neighbor = disconnected[Math.floor(Math.random() * disconnected.length)];
            removeWalls(cell, neighbor);
            cell.connected.push(neighbor);
            neighbor.connected.push(cell);
          }
        }
      }

      // 3. Draw the walls!
      mazeCtx.beginPath();
      for (let i = 0; i < grid.length; i++) {
        const cell = grid[i];
        const x = cell.i * cellSize;
        const y = cell.j * cellSize;

        if (cell.walls[0]) { mazeCtx.moveTo(x, y); mazeCtx.lineTo(x + cellSize, y); } // Top
        if (cell.walls[1]) { mazeCtx.moveTo(x + cellSize, y); mazeCtx.lineTo(x + cellSize, y + cellSize); } // Right
        if (cell.walls[2]) { mazeCtx.moveTo(x, y + cellSize); mazeCtx.lineTo(x + cellSize, y + cellSize); } // Bottom
        if (cell.walls[3]) { mazeCtx.moveTo(x, y); mazeCtx.lineTo(x, y + cellSize); } // Left
      }
      mazeCtx.stroke();
    };

    generateMaze();

    // --- BALL ANIMATION ---
    let currentBallCell = grid[Math.floor(Math.random() * grid.length)];
    let nextBallCell = currentBallCell.connected[Math.floor(Math.random() * currentBallCell.connected.length)];
    let prevBallCell: Cell | null = null;
    let progress = 0;
    const speed = 0.05; // Speed of the ball

    const drawBall = () => {
      ballCtx.clearRect(0, 0, width, height);

      // The point travels exactly IN BETWEEN the lines (at the center of the cells)
      const startX = currentBallCell.i * cellSize + cellSize/2;
      const startY = currentBallCell.j * cellSize + cellSize/2;
      const endX = nextBallCell.i * cellSize + cellSize/2;
      const endY = nextBallCell.j * cellSize + cellSize/2;

      const currentX = startX + (endX - startX) * progress;
      const currentY = startY + (endY - startY) * progress;

      // Draw tiny point ball
      ballCtx.beginPath();
      ballCtx.arc(currentX, currentY, 1.5, 0, Math.PI * 2);
      ballCtx.fillStyle = ballColor;
      ballCtx.fill();

      // Move progress
      progress += speed;

      // When we reach the next cell, pick a new destination
      if (progress >= 1) {
        progress = 0;
        prevBallCell = currentBallCell;
        currentBallCell = nextBallCell;
        
        // Pick next destination and NEVER take reverse
        let possibleNext = currentBallCell.connected.filter(c => c !== prevBallCell);
        
        if (possibleNext.length === 0) {
          // Should never happen in a perfect Braid Maze, but fallback just in case
          nextBallCell = prevBallCell;
        } else {
          nextBallCell = possibleNext[Math.floor(Math.random() * possibleNext.length)];
        }
      }

      animationFrameId = requestAnimationFrame(drawBall);
    };

    // Start ball animation
    drawBall();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      mazeCanvas.width = width;
      mazeCanvas.height = height;
      ballCanvas.width = width;
      ballCanvas.height = height;
      
      mazeCtx.fillStyle = bgColor;
      mazeCtx.fillRect(0, 0, width, height);
      mazeCtx.strokeStyle = lineColor;
      mazeCtx.lineWidth = 1;
      mazeCtx.lineCap = 'round';
      
      generateMaze();
      
      currentBallCell = grid[Math.floor(Math.random() * grid.length)];
      nextBallCell = currentBallCell.connected[Math.floor(Math.random() * currentBallCell.connected.length)];
      prevBallCell = null;
      progress = 0;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <div className="animated-bg-container" style={{ backgroundColor: theme?.bgPrimary || 'var(--bg-primary)' }}>
      {/* Static Maze Canvas */}
      <canvas 
        ref={mazeCanvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          opacity: 0.8
        }} 
      />
      
      {/* Animated Ball Canvas */}
      <canvas 
        ref={ballCanvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%'
        }} 
      />
      
      {/* Soft gradient overlay to blend the 2D maze perfectly into the background */}
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
