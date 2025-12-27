// macOS-style Dock
import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { 
  Clock, 
  Settings as SettingsIcon, 
  Calculator as CalculatorIcon, 
  Terminal as TerminalIcon, 
  Activity, 
  FileText, 
  CheckSquare, 
  Palette, 
  Music as MusicIcon,
  FolderOpen,
  Calendar,
  StickyNote,
  Gamepad2,
  Grid3x3
} from 'lucide-react';
import './Dock.css';

const APPS = [
  { id: 'calculator' as const, name: 'Calculator', iconType: 'calculator' as const, width: 400, height: 600 },
  { id: 'terminal' as const, name: 'Terminal', iconType: 'terminal' as const, width: 800, height: 600 },
  { id: 'taskmanager' as const, name: 'Task Manager', iconType: 'taskmanager' as const, width: 900, height: 700 },
  { id: 'markdown' as const, name: 'Markdown', iconType: 'markdown' as const, width: 1000, height: 700 },
  { id: 'todo' as const, name: 'To-Do', iconType: 'todo' as const, width: 700, height: 700 },
  { id: 'paint' as const, name: 'Paint', iconType: 'paint' as const, width: window.innerWidth, height: window.innerHeight },
  { id: 'music' as const, name: 'Music', iconType: 'music' as const, width: 700, height: 600 },
  { id: 'tictactoe' as const, name: 'Tic Tac Toe', iconType: 'tictactoe' as const, width: 650, height: 750 },
  { id: 'snake' as const, name: 'Snake', iconType: 'snake' as const, width: 1200, height: 900 },
  { id: 'notes' as const, name: 'Notes', iconType: 'notes' as const, width: 900, height: 600 },
  { id: 'clock' as const, name: 'Clock', iconType: 'clock' as const, width: 900, height: 650 },
  { id: 'calendar' as const, name: 'Calendar', iconType: 'calendar' as const, width: 1000, height: 700 },
  { id: 'files' as const, name: 'Files', iconType: 'files' as const, width: 900, height: 600 },
  { id: 'settings' as const, name: 'Settings', iconType: 'settings' as const, width: 800, height: 700 },
];

export const Dock: React.FC = () => {
  const { openWindow: openWindowAction, windows, focusWindow } = useStore();

  const handleAppClick = (app: typeof APPS[0]) => {
    // Check if app has a minimized window
    const minimizedWindow = windows.find(w => w.appId === app.id && w.isMinimized);
    if (minimizedWindow) {
      // Restore the minimized window
      focusWindow(minimizedWindow.id);
      return;
    }

    // Check if app is already open (not minimized)
    const openWindow = windows.find(w => w.appId === app.id && !w.isMinimized);
    if (openWindow) {
      // Focus the window
      focusWindow(openWindow.id);
      return;
    }

    // Open new window
    openWindowAction(app.id, app.name, app.name, app.width, app.height);
    
    // Auto-maximize Paint and Snake
    if (app.id === 'paint' || app.id === 'snake') {
      // Use setTimeout to ensure the window is created first
      setTimeout(() => {
        const newWindow = windows.find(w => w.appId === app.id && !w.isMaximized);
        if (newWindow) {
          // Import useStore at component level to access maximizeWindow
          const { maximizeWindow } = useStore.getState();
          maximizeWindow(newWindow.id);
        }
      }, 50);
    }
  };

  const isAppRunning = (appId: string) => {
    return windows.some(w => w.appId === appId);
  };

  return (
    <div className="dock-container">
      <motion.div
        className="dock"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {APPS.map((app, index) => {
          const isRunning = isAppRunning(app.id);

          return (
            <motion.button
              key={app.id}
              className={`dock-item ${isRunning ? 'running' : ''}`}
              onClick={() => handleAppClick(app)}
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.2, y: -10 }}
              whileTap={{ scale: 0.95 }}
              title={app.name}
            >
              {app.iconType === 'clock' ? (
                <Clock size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'settings' ? (
                <SettingsIcon size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'calculator' ? (
                <CalculatorIcon size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'terminal' ? (
                <TerminalIcon size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'taskmanager' ? (
                <Activity size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'tictactoe' ? (
                <Grid3x3 size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'markdown' ? (
                <FileText size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'todo' ? (
                <CheckSquare size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'paint' ? (
                <Palette size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'music' ? (
                <MusicIcon size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'files' ? (
                <FolderOpen size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'calendar' ? (
                <Calendar size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'notes' ? (
                <StickyNote size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : app.iconType === 'snake' ? (
                <Gamepad2 size={32} strokeWidth={1.5} className="dock-icon-lucide" />
              ) : null}
              {isRunning && <div className="running-indicator" />}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
