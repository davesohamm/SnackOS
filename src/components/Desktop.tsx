// Main Desktop Environment
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { WindowComponent } from './WindowComponent';
import { MenuBar } from './MenuBar';
import { Dock } from './Dock';
import { Snake } from '../apps/Snake';
import { Notes } from '../apps/Notes';
import { Clock } from '../apps/Clock';
import { Calendar } from '../apps/Calendar';
import { Files } from '../apps/Files';
import { Settings } from '../apps/Settings';
import { Calculator } from '../apps/Calculator';
import { Terminal } from '../apps/Terminal';
import { TaskManager } from '../apps/TaskManager';
import { TicTacToe } from '../apps/TicTacToe';
import { Markdown } from '../apps/Markdown';
import { Todo } from '../apps/Todo';
import { Paint } from '../apps/Paint';
import { Music } from '../apps/Music';
import { VoiceAssistant } from './VoiceAssistant';
import { Maximize2, Monitor } from 'lucide-react';
import './Desktop.css';

const APP_COMPONENTS = {
  snake: Snake,
  notes: Notes,
  clock: Clock,
  calendar: Calendar,
  files: Files,
  settings: Settings,
  calculator: Calculator,
  terminal: Terminal,
  taskmanager: TaskManager,
  tictactoe: TicTacToe,
  markdown: Markdown,
  todo: Todo,
  paint: Paint,
  music: Music,
};

export const Desktop: React.FC = () => {
  const { windows } = useStore();
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');

  // Preload all assets
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('snackos-welcome-seen');
    if (hasSeenWelcome || document.fullscreenElement) {
      setShowWelcome(false);
      setIsFullscreen(!!document.fullscreenElement);
      setIsLoading(false);
      return;
    }

    preloadAssets();
  }, []);

  const preloadAssets = async () => {
    const WALLPAPERS = [
      '/assets/wallpapers/calm-forest-landscape-under-clouds-hu.jpg',
      '/assets/wallpapers/apple-chinese-new-year-mac-mt.jpg',
      '/assets/wallpapers/ghost-ol.jpg',
      '/assets/wallpapers/chamonix-mountains-5k-ih.jpg',
      '/assets/wallpapers/pilot-pikachu-journey-ar.jpg',
      '/assets/wallpapers/pikachu-seeing-fireworks-9r.jpg',
      '/assets/wallpapers/pikachu-beyond-the-horizon-42.jpg',
    ];

    const OTHER_ASSETS = [
      '/assets/png-icons/icons8-github-50.png',
    ];

    const allAssets = [...WALLPAPERS, ...OTHER_ASSETS];
    let loadedCount = 0;

    setLoadingStatus('Loading wallpapers...');

    const loadImage = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          const progress = Math.round((loadedCount / allAssets.length) * 100);
          setLoadingProgress(progress);
          
          if (loadedCount <= WALLPAPERS.length) {
            setLoadingStatus(`Loading wallpapers... (${loadedCount}/${WALLPAPERS.length})`);
          } else {
            setLoadingStatus('Loading assets...');
          }
          
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load: ${src}`);
          loadedCount++;
          const progress = Math.round((loadedCount / allAssets.length) * 100);
          setLoadingProgress(progress);
          resolve(); // Continue even if one asset fails
        };
        img.src = src;
      });
    };

    try {
      // Load all assets in parallel
      await Promise.all(allAssets.map(asset => loadImage(asset)));
      
      setLoadingStatus('Ready!');
      setLoadingProgress(100);
      
      // Small delay to show "Ready!" message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Asset loading error:', error);
      setIsLoading(false); // Allow user to proceed even if loading fails
    }
  };

  // Check if already in fullscreen or if user has dismissed welcome before
  useEffect(() => {
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle keyboard shortcuts (F11 handled by browser, ESC to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowWelcome(false);
      localStorage.setItem('snackos-welcome-seen', 'true');
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      // If fullscreen fails, just dismiss the welcome screen
      setShowWelcome(false);
      localStorage.setItem('snackos-welcome-seen', 'true');
    }
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  };

  const skipWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('snackos-welcome-seen', 'true');
  };

  return (
    <div className="desktop">
      {showWelcome && (
        <motion.div
          className="fullscreen-welcome"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="welcome-content">
            <motion.div
              className={`welcome-logo ${isLoading ? 'loading' : ''}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Monitor size={80} strokeWidth={1.5} />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Welcome to SnackOS
            </motion.h1>
            
            <motion.p
              className="welcome-subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              A minimal, elegant operating system built with React
            </motion.p>

            {isLoading && (
              <motion.div
                className="loading-container"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="loading-status">
                  <span>{loadingStatus}</span>
                  <span className="loading-percentage">{loadingProgress}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${loadingProgress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <p className="loading-hint">Preloading wallpapers and assets for smooth experience...</p>
              </motion.div>
            )}

            {!isLoading && (
              <motion.div
                className="welcome-buttons"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button className="welcome-btn primary" onClick={enterFullscreen}>
                  <Maximize2 size={20} />
                  <span>Enter Fullscreen Mode</span>
                </button>
                <button className="welcome-btn secondary" onClick={skipWelcome}>
                  Continue Anyway
                </button>
              </motion.div>
            )}

            {!isLoading && (
              <motion.div
                className="welcome-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p>Press <kbd>F11</kbd> anytime to toggle fullscreen</p>
                <p className="welcome-hint-small">For the best experience, we recommend fullscreen mode</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      <MenuBar />
      
      <div className="desktop-wallpaper" />

      <AnimatePresence>
        {windows
          .filter(w => !w.isMinimized)
          .map(window => {
            const AppComponent = APP_COMPONENTS[window.appId];
            return (
              <WindowComponent
                key={window.id}
                id={window.id}
                title={window.title}
                icon={window.icon}
                x={window.x}
                y={window.y}
                width={window.width}
                height={window.height}
                zIndex={window.zIndex}
                isMaximized={window.isMaximized}
              >
                {AppComponent && <AppComponent />}
              </WindowComponent>
            );
          })}
      </AnimatePresence>

      <Dock />
      <VoiceAssistant />
    </div>
  );
};
