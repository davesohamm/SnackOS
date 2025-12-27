// Elegant draggable window
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import './WindowComponent.css';

interface WindowProps {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMaximized: boolean;
  children: React.ReactNode;
}

export const WindowComponent: React.FC<WindowProps> = ({
  id,
  title,
  // icon, // Unused for now
  x,
  y,
  width,
  height,
  zIndex,
  isMaximized,
  children,
}) => {
  const { closeWindow, minimizeWindow, maximizeWindow, snapWindow, focusWindow, updateWindowPosition } = useStore();
  const windowRef = useRef<HTMLDivElement>(null);
  const [snapZone, setSnapZone] = useState<'left' | 'right' | null>(null);

  const handleMouseDown = () => {
    focusWindow(id);
  };

  const handleDrag = (_e: any, info: any) => {
    const SNAP_THRESHOLD = 50;
    const mouseX = info.point.x;

    if (mouseX < SNAP_THRESHOLD) {
      setSnapZone('left');
    } else if (mouseX > window.innerWidth - SNAP_THRESHOLD) {
      setSnapZone('right');
    } else {
      setSnapZone(null);
    }
  };

  const handleDragEnd = (_e: any, info: any) => {
    if (snapZone) {
      snapWindow(id, snapZone);
      setSnapZone(null);
    } else {
      updateWindowPosition(id, info.point.x, info.point.y);
    }
  };

  const windowStyle = isMaximized
    ? { x: 0, y: 0, width: '100vw', height: 'calc(100vh - 70px)', top: 32 }
    : { x, y, width, height };

  return (
    <>
      {snapZone && (
        <div className={`snap-preview snap-${snapZone}`} />
      )}
      
      <motion.div
        ref={windowRef}
        className="window-component"
        style={{ zIndex }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, ...windowStyle }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        drag={!isMaximized}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={{ left: 0, top: 32, right: window.innerWidth - 300, bottom: window.innerHeight - 200 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onMouseDown={handleMouseDown}
      >
        <div className="window-titlebar">
          <div className="window-controls left">
            <button className="window-btn close" onClick={() => closeWindow(id)} title="Close">
              <X size={14} />
            </button>
            <button className="window-btn minimize" onClick={() => minimizeWindow(id)} title="Minimize">
              <Minus size={14} />
            </button>
            <button className="window-btn maximize" onClick={() => maximizeWindow(id)} title="Maximize">
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
          <div className="window-title">
            <span>{title}</span>
          </div>
          <div className="window-controls right" />
        </div>
        <div className="window-content">
          {children}
        </div>
      </motion.div>
    </>
  );
};



