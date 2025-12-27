// Minimal State Management with Zustand
import { create } from 'zustand';
import { Window, Note, CalendarEvent, FileNode } from '../core/types';
import { persist } from 'zustand/middleware';

interface CalculatorCommand {
  expression: string;
  timestamp: number;
}

interface TodoTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  createdAt: Date;
  category: string;
}

interface CalendarCommand {
  type: 'navigate' | 'addEvent';
  month?: number;
  year?: number;
  eventTitle?: string;
  eventDate?: Date;
  timestamp: number;
}

interface PaintCommand {
  type: 'shape' | 'drawing' | 'clear';
  shape?: 'circle' | 'square' | 'triangle' | 'line' | 'star' | 'heart';
  drawing?: 'cat' | 'dog' | 'house' | 'tree' | 'sun' | 'smiley' | 'number' | 'letter';
  text?: string; // For numbers, letters, or custom text
  timestamp: number;
}

const WALLPAPERS = [
  { id: 'forest', name: 'Calm Forest', path: '/assets/wallpapers/calm-forest-landscape-under-clouds-hu.jpg' },
  { id: 'apple', name: 'Apple CNY', path: '/assets/wallpapers/apple-chinese-new-year-mac-mt.jpg' },
  { id: 'ghost', name: 'Ghost', path: '/assets/wallpapers/ghost-ol.jpg' },
  { id: 'chamonix', name: 'Chamonix Mountains', path: '/assets/wallpapers/chamonix-mountains-5k-ih.jpg' },
  { id: 'pilot-pikachu', name: 'Pilot Pikachu', path: '/assets/wallpapers/pilot-pikachu-journey-ar.jpg' },
  { id: 'pikachu-fireworks', name: 'Pikachu Fireworks', path: '/assets/wallpapers/pikachu-seeing-fireworks-9r.jpg' },
  { id: 'pikachu-horizon', name: 'Pikachu Horizon', path: '/assets/wallpapers/pikachu-beyond-the-horizon-42.jpg' },
];

interface OSState {
  // Windows
  windows: Window[];
  nextZIndex: number;
  focusedWindowId: string | null;

  // Apps Data
  notes: Note[];
  events: CalendarEvent[];
  fileSystem: FileNode;
  calculatorCommand: CalculatorCommand | null;
  calendarCommand: CalendarCommand | null;
  paintCommand: PaintCommand | null;

  // Actions
  openWindow: (appId: string, title: string, icon: string, width: number, height: number) => void;
  closeWindow: (windowId: string) => void;
  closeAllWindows: () => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  snapWindow: (windowId: string, position: 'left' | 'right') => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, x: number, y: number) => void;
  updateWindowSize: (windowId: string, width: number, height: number) => void;

  // Calculator
  setCalculatorCommand: (expression: string) => void;
  clearCalculatorCommand: () => void;

  // Calendar
  setCalendarCommand: (command: Omit<CalendarCommand, 'timestamp'>) => void;
  clearCalendarCommand: () => void;

  // Paint
  setPaintCommand: (command: Omit<PaintCommand, 'timestamp'>) => void;
  clearPaintCommand: () => void;

  // Wallpaper
  cycleWallpaper: () => void;

  // Todo
  addTodoTask: (task: Omit<TodoTask, 'id' | 'createdAt' | 'completed'>) => void;

  // Notes
  addNote: (note: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  // Calendar
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  // Files
  addFile: (parentId: string, file: FileNode) => void;
  updateFile: (id: string, updates: Partial<FileNode>) => void;
  deleteFile: (id: string) => void;
}

const initialFileSystem: FileNode = {
  id: 'root',
  name: 'SnackOS',
  type: 'folder',
  dateCreated: new Date(),
  dateModified: new Date(),
  children: [
    {
      id: 'documents',
      name: 'Documents',
      type: 'folder',
      dateCreated: new Date(),
      dateModified: new Date(),
      children: [
        {
          id: 'welcome',
          name: 'Welcome.txt',
          type: 'file',
          content: 'Welcome to SnackOS!\n\nA minimal, elegant operating system built with React.\n\nExplore the apps and enjoy!',
          size: 90,
          dateCreated: new Date(),
          dateModified: new Date(),
        },
      ],
    },
    {
      id: 'downloads',
      name: 'Downloads',
      type: 'folder',
      dateCreated: new Date(),
      dateModified: new Date(),
      children: [],
    },
    {
      id: 'pictures',
      name: 'Pictures',
      type: 'folder',
      dateCreated: new Date(),
      dateModified: new Date(),
      children: [],
    },
  ],
};

export const useStore = create<OSState>()(
  persist(
    (set, get) => ({
      windows: [],
      nextZIndex: 100,
      focusedWindowId: null,

      notes: [
        {
          id: '1',
          title: 'Welcome to Notes',
          content: 'Start writing your thoughts here...',
          dateCreated: new Date(),
          dateModified: new Date(),
        },
      ],

      events: [],

      fileSystem: initialFileSystem,
      
      calculatorCommand: null,
      
      calendarCommand: null,

      paintCommand: null,

      openWindow: (appId, title, icon, width, height) => {
        const state = get();
        const existingWindow = state.windows.find(w => w.appId === appId && !w.isMinimized);
        
        if (existingWindow) {
          get().focusWindow(existingWindow.id);
          return;
        }

        const MENU_BAR_HEIGHT = 32;
        const DOCK_HEIGHT = 80;
        const TITLE_BAR_HEIGHT = 32;
        const MIN_TOP_MARGIN = MENU_BAR_HEIGHT + 10; // Menu bar + small margin

        const centerX = (window.innerWidth - width) / 2;
        let centerY = (window.innerHeight - height - DOCK_HEIGHT) / 2;
        
        // Ensure window doesn't go above the menu bar (always keep title bar visible)
        centerY = Math.max(centerY, MIN_TOP_MARGIN);

        const newWindow: Window = {
          id: `${appId}-${Date.now()}`,
          appId: appId as any,
          title,
          icon,
          x: Math.max(0, centerX + Math.random() * 40 - 20),
          y: Math.max(MIN_TOP_MARGIN, centerY + Math.random() * 40 - 20),
          width,
          height,
          zIndex: state.nextZIndex,
          isMinimized: false,
          isMaximized: false,
          isFullscreen: false,
        };

        set({
          windows: [...state.windows, newWindow],
          nextZIndex: state.nextZIndex + 1,
          focusedWindowId: newWindow.id,
        });
      },

      closeWindow: (windowId) => {
        set({
          windows: get().windows.filter(w => w.id !== windowId),
          focusedWindowId: get().focusedWindowId === windowId ? null : get().focusedWindowId,
        });
      },

      closeAllWindows: () => {
        set({
          windows: [],
          focusedWindowId: null,
        });
      },

      minimizeWindow: (windowId) => {
        set({
          windows: get().windows.map(w =>
            w.id === windowId ? { ...w, isMinimized: true } : w
          ),
        });
      },

      maximizeWindow: (windowId) => {
        set({
          windows: get().windows.map(w =>
            w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
          ),
        });
      },

      snapWindow: (windowId, position) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight - 70; // Subtract dock height

        set({
          windows: get().windows.map(w =>
            w.id === windowId ? {
              ...w,
              x: position === 'left' ? 0 : screenWidth / 2,
              y: 32, // Menu bar height
              width: screenWidth / 2,
              height: screenHeight - 32,
              isMaximized: false,
            } : w
          ),
        });
      },

      focusWindow: (windowId) => {
        const state = get();
        set({
          windows: state.windows.map(w =>
            w.id === windowId
              ? { ...w, zIndex: state.nextZIndex, isMinimized: false }
              : w
          ),
          nextZIndex: state.nextZIndex + 1,
          focusedWindowId: windowId,
        });
      },

      updateWindowPosition: (windowId, x, y) => {
        set({
          windows: get().windows.map(w =>
            w.id === windowId ? { ...w, x, y } : w
          ),
        });
      },

      updateWindowSize: (windowId, width, height) => {
        set({
          windows: get().windows.map(w =>
            w.id === windowId ? { ...w, width, height } : w
          ),
        });
      },

      // Calculator Commands
      setCalculatorCommand: (expression) => {
        set({ calculatorCommand: { expression, timestamp: Date.now() } });
      },

      clearCalculatorCommand: () => {
        set({ calculatorCommand: null });
      },

      // Calendar Commands
      setCalendarCommand: (command) => {
        set({ calendarCommand: { ...command, timestamp: Date.now() } });
      },

      clearCalendarCommand: () => {
        set({ calendarCommand: null });
      },

      // Paint Commands
      setPaintCommand: (command) => {
        set({ paintCommand: { ...command, timestamp: Date.now() } });
      },

      clearPaintCommand: () => {
        set({ paintCommand: null });
      },

      // Wallpaper
      cycleWallpaper: () => {
        const current = localStorage.getItem('snackos-wallpaper') || WALLPAPERS[0].path;
        const currentIndex = WALLPAPERS.findIndex(w => w.path === current);
        const nextIndex = (currentIndex + 1) % WALLPAPERS.length;
        const nextWallpaper = WALLPAPERS[nextIndex];
        
        localStorage.setItem('snackos-wallpaper', nextWallpaper.path);
        const wallpaperElement = document.querySelector('.desktop-wallpaper') as HTMLElement;
        if (wallpaperElement) {
          wallpaperElement.style.backgroundImage = `url(${nextWallpaper.path})`;
        }
      },

      // Todo
      addTodoTask: (taskData) => {
        const task: TodoTask = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
          completed: false,
        };

        // Get current tasks from localStorage
        const saved = localStorage.getItem('snackos-todos');
        const tasks: TodoTask[] = saved ? JSON.parse(saved, (key, value) => {
          if (key === 'deadline' || key === 'createdAt') {
            return value ? new Date(value) : undefined;
          }
          return value;
        }) : [];

        // Add new task
        const updatedTasks = [task, ...tasks];
        localStorage.setItem('snackos-todos', JSON.stringify(updatedTasks));

        // Trigger storage event to update Todo app
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'snackos-todos',
          newValue: JSON.stringify(updatedTasks),
        }));
      },

      // Notes
      addNote: (note) => {
        set({ notes: [...get().notes, note] });
      },

      updateNote: (id, updates) => {
        set({
          notes: get().notes.map(note =>
            note.id === id ? { ...note, ...updates, dateModified: new Date() } : note
          ),
        });
      },

      deleteNote: (id) => {
        set({ notes: get().notes.filter(note => note.id !== id) });
      },

      // Calendar
      addEvent: (event) => {
        set({ events: [...get().events, event] });
      },

      updateEvent: (id, updates) => {
        set({
          events: get().events.map(event =>
            event.id === id ? { ...event, ...updates } : event
          ),
        });
      },

      deleteEvent: (id) => {
        set({ events: get().events.filter(event => event.id !== id) });
      },

      // Files
      addFile: (parentId, file) => {
        // Implementation for adding files
        const addFileRecursive = (node: FileNode): FileNode => {
          if (node.id === parentId && node.type === 'folder') {
            return {
              ...node,
              children: [...(node.children || []), file],
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(addFileRecursive),
            };
          }
          return node;
        };

        set({ fileSystem: addFileRecursive(get().fileSystem) });
      },

      updateFile: (id, updates) => {
        const updateFileRecursive = (node: FileNode): FileNode => {
          if (node.id === id) {
            return { ...node, ...updates, dateModified: new Date() };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(updateFileRecursive),
            };
          }
          return node;
        };

        set({ fileSystem: updateFileRecursive(get().fileSystem) });
      },

      deleteFile: (id) => {
        const deleteFileRecursive = (node: FileNode): FileNode => {
          if (node.children) {
            return {
              ...node,
              children: node.children.filter(child => child.id !== id).map(deleteFileRecursive),
            };
          }
          return node;
        };

        set({ fileSystem: deleteFileRecursive(get().fileSystem) });
      },
    }),
    {
      name: 'snackos-storage',
      partialize: (state) => ({
        notes: state.notes,
        events: state.events,
        fileSystem: state.fileSystem,
      }),
    }
  )
);



