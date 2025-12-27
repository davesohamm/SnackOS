// Core Types for SnackOS
export interface Window {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFullscreen: boolean;
}

export type AppId = 'snake' | 'notes' | 'clock' | 'calendar' | 'files' | 'settings' | 'calculator' | 'terminal' | 'taskmanager' | 'todo' | 'markdown' | 'paint' | 'music' | 'tictactoe';

export interface App {
  id: AppId;
  name: string;
  icon: string;
  iconPath?: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  resizable: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  size?: number;
  dateCreated: Date;
  dateModified: Date;
  icon?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  dateCreated: Date;
  dateModified: Date;
  color?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color?: string;
}

export interface SnakeGameState {
  score: number;
  highScore: number;
  isPlaying: boolean;
  isPaused: boolean;
  gameOver: boolean;
  speed: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
