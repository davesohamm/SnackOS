// Advanced Paint / Drawing Application with Voice Commands
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Paintbrush, Eraser, Download, Trash2, Square, Circle, Pipette, 
  Undo, Redo, Triangle, Star, Heart, Minus, Type, Image as ImageIcon,
  Smile, Home, Sun, CloudRain
} from 'lucide-react';
import { useStore } from '../store/useStore';
import './Paint.css';

type Tool = 'brush' | 'eraser' | 'fill' | 'eyedropper' | 'line' | 'text';

interface HistoryState {
  imageData: ImageData;
}

interface Point {
  x: number;
  y: number;
}

export const Paint: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#007aff');
  const [brushSize, setBrushSize] = useState(5);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const { paintCommand, clearPaintCommand } = useStore();

  const COLORS = [
    '#000000', '#ffffff', '#ff3b30', '#ff9500', '#ffcc00',
    '#34c759', '#007aff', '#5856d6', '#af52de', '#ff2d55',
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !overlayCtx) return;

    // Initialize with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state
    saveToHistory();
  }, []);

  // Handle voice commands
  useEffect(() => {
    if (!paintCommand) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    console.log('Paint command received:', paintCommand);

    if (paintCommand.type === 'clear') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    } else if (paintCommand.type === 'shape' && paintCommand.shape) {
      drawVoiceShape(paintCommand.shape);
    } else if (paintCommand.type === 'drawing' && paintCommand.drawing) {
      drawVoiceDrawing(paintCommand.drawing, paintCommand.text);
    }

    clearPaintCommand();
  }, [paintCommand, clearPaintCommand]);

  // Voice-controlled shape drawing
  const drawVoiceShape = (shape: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = 150;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'square':
        ctx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
        break;

      case 'triangle':
        drawTriangle(ctx, centerX, centerY - size / 2, size * 2);
        break;

      case 'star':
        drawStar(ctx, centerX, centerY, 5, size, size / 2);
        break;

      case 'heart':
        drawHeart(ctx, centerX, centerY, size);
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY);
        ctx.lineTo(centerX + size, centerY);
        ctx.stroke();
        break;
    }

    saveToHistory();
  };

  // Voice-controlled complex drawings
  const drawVoiceDrawing = (drawing: string, text?: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    switch (drawing) {
      case 'cat':
        drawCat(ctx, centerX, centerY);
        break;

      case 'smiley':
        drawSmiley(ctx, centerX, centerY, 100);
        break;

      case 'house':
        drawHouse(ctx, centerX, centerY);
        break;

      case 'tree':
        drawTree(ctx, centerX, centerY);
        break;

      case 'sun':
        drawSun(ctx, centerX, centerY);
        break;

      case 'number':
      case 'letter':
        if (text) {
          drawText(ctx, text, centerX, centerY);
        }
        break;
    }

    saveToHistory();
  };

  // Drawing helper functions
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - size / 2, y + size * 0.866);
    ctx.lineTo(x + size / 2, y + size * 0.866);
    ctx.closePath();
    ctx.stroke();
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.stroke();
  };

  const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    
    ctx.moveTo(x, y + topCurveHeight);
    // Left curve
    ctx.bezierCurveTo(
      x, y, 
      x - size / 2, y, 
      x - size / 2, y + topCurveHeight
    );
    ctx.bezierCurveTo(
      x - size / 2, y + (size + topCurveHeight) / 2, 
      x, y + (size + topCurveHeight) / 1.5, 
      x, y + size
    );
    // Right curve
    ctx.bezierCurveTo(
      x, y + (size + topCurveHeight) / 1.5, 
      x + size / 2, y + (size + topCurveHeight) / 2, 
      x + size / 2, y + topCurveHeight
    );
    ctx.bezierCurveTo(
      x + size / 2, y, 
      x, y, 
      x, y + topCurveHeight
    );
    
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  };

  const drawCat = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const originalLineWidth = ctx.lineWidth;
    const originalStrokeStyle = ctx.strokeStyle;
    const originalFillStyle = ctx.fillStyle;

    // Head (circle)
    ctx.beginPath();
    ctx.arc(x, y, 80, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ears (triangles)
    ctx.beginPath();
    ctx.moveTo(x - 50, y - 50);
    ctx.lineTo(x - 70, y - 100);
    ctx.lineTo(x - 30, y - 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 50, y - 50);
    ctx.lineTo(x + 70, y - 100);
    ctx.lineTo(x + 30, y - 70);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 25, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 25, y - 10, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 25, y - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 25, y - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x - 8, y + 20);
    ctx.lineTo(x + 8, y + 20);
    ctx.closePath();
    ctx.fillStyle = '#ff69b4';
    ctx.fill();
    ctx.stroke();

    // Whiskers
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#000000';
    // Left whiskers
    ctx.beginPath();
    ctx.moveTo(x - 80, y);
    ctx.lineTo(x - 30, y + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x - 80, y + 15);
    ctx.lineTo(x - 30, y + 15);
    ctx.stroke();

    // Right whiskers
    ctx.beginPath();
    ctx.moveTo(x + 80, y);
    ctx.lineTo(x + 30, y + 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 80, y + 15);
    ctx.lineTo(x + 30, y + 15);
    ctx.stroke();

    // Restore original styles
    ctx.lineWidth = originalLineWidth;
    ctx.strokeStyle = originalStrokeStyle;
    ctx.fillStyle = originalFillStyle;
  };

  const drawSmiley = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // Face
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 30, y - 20, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 30, y - 20, 10, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(x, y + 10, 50, 0, Math.PI, false);
    ctx.lineWidth = 5;
    ctx.stroke();
  };

  const drawHouse = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // House body
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(x - 80, y, 160, 120);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 80, y, 160, 120);

    // Roof
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.moveTo(x - 100, y);
    ctx.lineTo(x, y - 80);
    ctx.lineTo(x + 100, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Door
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 25, y + 60, 50, 60);
    ctx.strokeRect(x - 25, y + 60, 50, 60);

    // Windows
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x - 60, y + 30, 30, 30);
    ctx.strokeRect(x - 60, y + 30, 30, 30);

    ctx.fillRect(x + 30, y + 30, 30, 30);
    ctx.strokeRect(x + 30, y + 30, 30, 30);

    // Door knob
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x + 10, y + 90, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Trunk
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x - 20, y + 50, 40, 100);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 20, y + 50, 40, 100);

    // Leaves (three circles)
    ctx.fillStyle = '#228b22';
    
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - 40, y + 30, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 40, y + 30, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  };

  const drawSun = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Sun body
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(x, y, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff9500';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Rays
    ctx.lineWidth = 5;
    const rayLength = 40;
    const numRays = 12;

    for (let i = 0; i < numRays; i++) {
      const angle = (Math.PI * 2 * i) / numRays;
      const startX = x + Math.cos(angle) * 65;
      const startY = y + Math.sin(angle) * 65;
      const endX = x + Math.cos(angle) * (65 + rayLength);
      const endY = y + Math.sin(angle) * (65 + rayLength);

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
    ctx.font = 'bold 120px Arial';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeText(text, x, y);
  };

  // History management
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ imageData });
      
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      setHistoryIndex(historyIndex - 1);
      ctx.putImageData(history[historyIndex - 1].imageData, 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      setHistoryIndex(historyIndex + 1);
      ctx.putImageData(history[historyIndex + 1].imageData, 0, 0);
    }
  };

  // Mouse position with proper scaling
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pos = getMousePos(e);

    if (tool === 'eyedropper') {
      const imageData = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1);
      const [r, g, b] = imageData.data;
      setColor(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
      return;
    }

    setIsDrawing(true);
    setStartPoint(pos);
    setLastPoint(pos);

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'brush') {
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'fill') {
      floodFill(Math.floor(pos.x), Math.floor(pos.y), color);
      saveToHistory();
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !overlayCtx) return;

    const pos = getMousePos(e);

    if (tool === 'brush' || tool === 'eraser') {
      // Interpolate points for smooth drawing
      if (lastPoint) {
        const dx = pos.x - lastPoint.x;
        const dy = pos.y - lastPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(Math.ceil(distance / 2), 1);

        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const interpX = lastPoint.x + dx * t;
          const interpY = lastPoint.y + dy * t;
          
          ctx.lineTo(interpX, interpY);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(interpX, interpY, brushSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(interpX, interpY);
        }
      }
      
      setLastPoint(pos);
    } else if (tool === 'line' && startPoint) {
      // Preview line on overlay
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      overlayCtx.strokeStyle = color;
      overlayCtx.lineWidth = brushSize;
      overlayCtx.lineCap = 'round';
      overlayCtx.beginPath();
      overlayCtx.moveTo(startPoint.x, startPoint.y);
      overlayCtx.lineTo(pos.x, pos.y);
      overlayCtx.stroke();
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (!canvas || !overlayCanvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const overlayCtx = overlayCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx || !overlayCtx) return;

    if (tool === 'line' && startPoint && lastPoint) {
      // Draw final line on main canvas
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
    }

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (tool !== 'fill') {
      saveToHistory();
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setLastPoint(null);
  };

  // Flood fill algorithm
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, startX, startY);
    const fillRGB = hexToRgb(fillColor);

    if (!fillRGB) return;
    if (colorsMatch(targetColor, fillRGB)) return;

    const stack: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const key = `${x},${y}`;

      if (visited.has(key)) continue;
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      const currentColor = getPixelColor(imageData, x, y);
      if (!colorsMatch(currentColor, targetColor)) continue;

      visited.add(key);
      setPixelColor(imageData, x, y, fillRGB);

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const getPixelColor = (imageData: ImageData, x: number, y: number): number[] => {
    const index = (y * imageData.width + x) * 4;
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3],
    ];
  };

  const setPixelColor = (imageData: ImageData, x: number, y: number, color: number[]) => {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color[0];
    imageData.data[index + 1] = color[1];
    imageData.data[index + 2] = color[2];
    imageData.data[index + 3] = 255;
  };

  const hexToRgb = (hex: string): number[] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
    ] : null;
  };

  const colorsMatch = (a: number[], b: number[]): boolean => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  };

  // Utility functions
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `snackos-paint-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="paint-app">
      {/* Toolbar */}
      <div className="paint-toolbar">
        <div className="tool-group">
          <button
            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
            onClick={() => setTool('brush')}
            title="Brush (B)"
          >
            <Paintbrush size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
            onClick={() => setTool('eraser')}
            title="Eraser (E)"
          >
            <Eraser size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'fill' ? 'active' : ''}`}
            onClick={() => setTool('fill')}
            title="Fill (F)"
          >
            <Square size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
            onClick={() => setTool('line')}
            title="Line (L)"
          >
            <Minus size={18} />
          </button>
          <button
            className={`tool-btn ${tool === 'eyedropper' ? 'active' : ''}`}
            onClick={() => setTool('eyedropper')}
            title="Color Picker (I)"
          >
            <Pipette size={18} />
          </button>
        </div>

        <div className="tool-group">
          <button 
            className="tool-btn" 
            onClick={undo} 
            disabled={historyIndex <= 0} 
            title="Undo (Ctrl+Z)"
          >
            <Undo size={18} />
          </button>
          <button 
            className="tool-btn" 
            onClick={redo} 
            disabled={historyIndex >= history.length - 1} 
            title="Redo (Ctrl+Y)"
          >
            <Redo size={18} />
          </button>
        </div>

        <div className="tool-group">
          <div className="brush-size">
            <label>Size: {brushSize}px</label>
            <input
              type="range"
              min="1"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="tool-group">
          <button className="tool-btn" onClick={clearCanvas} title="Clear Canvas">
            <Trash2 size={18} />
          </button>
          <button className="tool-btn download" onClick={downloadImage} title="Download">
            <Download size={18} />
          </button>
        </div>

        <div className="voice-hint">
          🎤 Say: "Draw a circle", "Draw a cat", "Draw number 5"
        </div>
      </div>

      {/* Color Palette */}
      <div className="color-palette">
        <div className="current-color" style={{ background: color }}>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            title="Custom Color"
          />
        </div>
        {COLORS.map(c => (
          <button
            key={c}
            className={`color-btn ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            title={c}
          />
        ))}
      </div>

      {/* Canvas Container */}
      <div className="paint-canvas-container">
        <div className="canvas-wrapper">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="paint-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <canvas
            ref={overlayCanvasRef}
            width={1920}
            height={1080}
            className="paint-canvas-overlay"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
