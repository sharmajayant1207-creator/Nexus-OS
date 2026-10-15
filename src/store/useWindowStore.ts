import { create } from 'zustand';

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowProcess {
  id: string;
  appId: string;
  title: string;
  icon: string; // Lucide icon name or image URL
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  bounds: WindowBounds;
  preMaximizeBounds?: WindowBounds;
  minSize: { width: number; height: number };
  initialData?: any;
}

export type SnapType = 'left' | 'right' | 'full' | 'none';

interface WindowStoreState {
  windows: WindowProcess[];
  activeWindowId: string | null;
  highestZIndex: number;
  snapPreview: {
    show: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;

  // Actions
  openApp: (appId: string, title?: string, icon?: string, initialData?: any) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  updateBounds: (id: string, bounds: Partial<WindowBounds>) => void;
  snapWindow: (id: string, snapType: SnapType) => void;
  setSnapPreview: (preview: { show: boolean; x: number; y: number; width: number; height: number } | null) => void;
  closeAllAppInstances: (appId: string) => void;
  closeAllWindowProcesses: () => void;
}

const DEFAULT_APP_CONFIGS: Record<string, { title: string; icon: string; defaultSize: { width: number; height: number } }> = {
  explorer: { title: 'File Explorer', icon: 'Folder', defaultSize: { width: 850, height: 550 } },
  browser: { title: 'Web Browser', icon: 'Globe', defaultSize: { width: 920, height: 620 } },
  notes: { title: 'Notes', icon: 'FileText', defaultSize: { width: 750, height: 520 } },
  notepad: { title: 'Notes', icon: 'FileText', defaultSize: { width: 750, height: 520 } },
  gallery: { title: 'Photo Gallery', icon: 'Image', defaultSize: { width: 850, height: 600 } },
  imageview: { title: 'Photo Gallery', icon: 'Image', defaultSize: { width: 850, height: 600 } },
  music: { title: 'Music Player', icon: 'Music', defaultSize: { width: 680, height: 460 } },
  musicplayer: { title: 'Music Player', icon: 'Music', defaultSize: { width: 680, height: 460 } },
  calculator: { title: 'Calculator', icon: 'Calculator', defaultSize: { width: 360, height: 520 } },
  settings: { title: 'Settings', icon: 'Settings', defaultSize: { width: 820, height: 580 } },
  weather: { title: 'Weather App', icon: 'CloudSun', defaultSize: { width: 780, height: 520 } },
  terminal: { title: 'Terminal Console', icon: 'Terminal', defaultSize: { width: 750, height: 480 } },
  sysmon: { title: 'System Monitor', icon: 'Cpu', defaultSize: { width: 720, height: 500 } },
};

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: [],
  activeWindowId: null,
  highestZIndex: 100,
  snapPreview: null,

  openApp: (appId, customTitle, customIcon, initialData) => {
    const { windows, highestZIndex } = get();
    const config = DEFAULT_APP_CONFIGS[appId] || {
      title: customTitle || appId.toUpperCase(),
      icon: customIcon || 'AppWindow',
      defaultSize: { width: 700, height: 500 },
    };

    // If already open and singular, focus existing window
    const existingWindow = windows.find((w) => w.appId === appId && !initialData);
    if (existingWindow) {
      get().focusWindow(existingWindow.id);
      if (existingWindow.isMinimized) {
        get().restoreWindow(existingWindow.id);
      }
      return existingWindow.id;
    }

    const windowId = `win-${appId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newZIndex = highestZIndex + 1;

    // Stagger opening position
    const offset = (windows.length % 6) * 30;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    const width = Math.min(config.defaultSize.width, screenWidth - 100);
    const height = Math.min(config.defaultSize.height, screenHeight - 120);

    const initialX = Math.max(40, Math.floor((screenWidth - width) / 2) + offset);
    const initialY = Math.max(50, Math.floor((screenHeight - height) / 2) + offset);

    const newWindow: WindowProcess = {
      id: windowId,
      appId,
      title: customTitle || config.title,
      icon: customIcon || config.icon,
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: newZIndex,
      bounds: {
        x: initialX,
        y: initialY,
        width,
        height,
      },
      minSize: { width: 400, height: 280 },
      initialData,
    };

    set((state) => ({
      windows: state.windows.map((w) => ({ ...w, isFocused: false })).concat(newWindow),
      activeWindowId: windowId,
      highestZIndex: newZIndex,
    }));

    return windowId;
  },

  closeWindow: (id) => {
    set((state) => {
      const nextWindows = state.windows.filter((w) => w.id !== id);
      let nextActiveId = state.activeWindowId;

      if (state.activeWindowId === id) {
        // Focus top-most window
        const remainingVisible = nextWindows
          .filter((w) => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex);
        nextActiveId = remainingVisible.length > 0 ? remainingVisible[0].id : null;

        if (nextActiveId) {
          nextWindows.forEach((w) => {
            if (w.id === nextActiveId) w.isFocused = true;
          });
        }
      }

      return {
        windows: nextWindows,
        activeWindowId: nextActiveId,
      };
    });
  },

  minimizeWindow: (id) => {
    set((state) => {
      const nextWindows = state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
      );

      const remainingVisible = nextWindows
        .filter((w) => !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex);

      const nextActiveId = remainingVisible.length > 0 ? remainingVisible[0].id : null;
      if (nextActiveId) {
        nextWindows.forEach((w) => {
          if (w.id === nextActiveId) w.isFocused = true;
        });
      }

      return {
        windows: nextWindows,
        activeWindowId: nextActiveId,
      };
    });
  },

  restoreWindow: (id) => {
    get().focusWindow(id);
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: false } : w
      ),
    }));
  },

  toggleMaximize: (id) => {
    const { windows } = get();
    const win = windows.find((w) => w.id === id);
    if (!win) return;

    if (win.isMaximized) {
      // Restore pre-maximized bounds
      const restoreBounds = win.preMaximizeBounds || {
        x: 100,
        y: 80,
        width: 800,
        height: 550,
      };
      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === id
            ? { ...w, isMaximized: false, bounds: restoreBounds }
            : w
        ),
      }));
    } else {
      // Maximize to viewport
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      set((state) => ({
        windows: state.windows.map((w) =>
          w.id === id
            ? {
                ...w,
                isMaximized: true,
                preMaximizeBounds: { ...w.bounds },
                bounds: {
                  x: 0,
                  y: 36, // Below top status bar
                  width: screenWidth,
                  height: screenHeight - 84, // Above dock
                },
              }
            : w
        ),
      }));
    }
  },

  focusWindow: (id) => {
    const { windows, highestZIndex, activeWindowId } = get();
    if (activeWindowId === id) return;

    const targetWin = windows.find((w) => w.id === id);
    if (!targetWin) return;

    const newZIndex = highestZIndex + 1;

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, zIndex: newZIndex, isFocused: true, isMinimized: false }
          : { ...w, isFocused: false }
      ),
      activeWindowId: id,
      highestZIndex: newZIndex,
    }));
  },

  updateBounds: (id, newBounds) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, bounds: { ...w.bounds, ...newBounds } }
          : w
      ),
    }));
  },

  snapWindow: (id, snapType) => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const topBarHeight = 36;
    const dockHeight = 48;
    const usableHeight = screenHeight - topBarHeight - dockHeight;

    const win = get().windows.find((w) => w.id === id);
    if (!win) return;

    let targetBounds: WindowBounds;

    if (snapType === 'left') {
      targetBounds = {
        x: 0,
        y: topBarHeight,
        width: Math.floor(screenWidth / 2),
        height: usableHeight,
      };
    } else if (snapType === 'right') {
      targetBounds = {
        x: Math.floor(screenWidth / 2),
        y: topBarHeight,
        width: Math.ceil(screenWidth / 2),
        height: usableHeight,
      };
    } else if (snapType === 'full') {
      targetBounds = {
        x: 0,
        y: topBarHeight,
        width: screenWidth,
        height: usableHeight,
      };
    } else {
      return;
    }

    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? {
              ...w,
              isMaximized: snapType === 'full',
              preMaximizeBounds: w.preMaximizeBounds || { ...w.bounds },
              bounds: targetBounds,
            }
          : w
      ),
    }));
  },

  setSnapPreview: (preview) => set({ snapPreview: preview }),

  closeAllAppInstances: (appId) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.appId !== appId),
    }));
  },

  closeAllWindowProcesses: () => {
    set({ windows: [], activeWindowId: null });
  },
}));
