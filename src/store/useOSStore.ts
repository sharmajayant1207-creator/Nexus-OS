import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { SystemState, User, OSNotification, Wallpaper } from "../types/os";
import { applyTheme } from "../styles/themeEngine";

export const DEFAULT_WALLPAPERS: Wallpaper[] = [
  {
    id: "nexus-core",
    name: "Nexus Core Wave",
    url: "htts://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2560&auto=format&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    type: "abstract",
  },
  {
    id: "cyber-city",
    name: "Cyberpunk Neon Matrix",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2560&auto=format&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop",
    type: "cyberpunk",
  },
  {
    id: "deep-space",
    name: "Deep Space Nebula",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=2560&auto=format&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=400&auto=format&fit=crop",
    type: "space",
  },
  {
    id: "minimal-geometry",
    name: "Monochrome Geometry",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2560&auto=format&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop",
    type: "minimal",
  },
  {
    id: "quantum-mesh",
    name: "Quantum Horizon",
    url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=2560&auto=format&fit=crop",
    thumbnail:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=400&auto=format&fit=crop",
    type: "abstract",
  },
];

export const DEFAULT_USER: User = {
  id: "usr-001",
  name: "Jayant Sharma",
  username: "Jayant Sharma",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
  pin: "1234",
  role: "System Administrator",
  email: "Jayant@nexus-os.internal",
};

export const INITIAL_NOTIFICATIONS: OSNotification[] = [
  {
    id: "notif-1",
    title: "Nexus System Update v2.5 Ready",
    message:
      "Kernel v6.12 patches installed successfully with performance boosts.",
    timestamp: "10 mins ago",
    app: "System Update",
    iconName: "ShieldCheck",
    read: false,
    priority: "high",
  },
  {
    id: "notif-2",
    title: "Wi-Fi 6E Connected",
    message: 'Connected to "Nexus_Quantum_5G" (850 Mbps).',
    timestamp: "25 mins ago",
    app: "Network",
    iconName: "Wifi",
    read: false,
    priority: "low",
  },
  {
    id: "notif-3",
    title: "Security Alert Passed",
    message: "Biometric and PIN hardware security verification intact.",
    timestamp: "1 hour ago",
    app: "Security Center",
    iconName: "Lock",
    read: true,
    priority: "normal",
  },
];

interface OSState {
  // System State
  systemState: SystemState;
  previousState: SystemState;
  isLocked: boolean;

  // User & Settings
  userName: string;
  currentUser: User;
  activeWallpaper: string;
  wallpapers: Wallpaper[];
  themeMode: "light" | "dark";
  accentColor: string;
  setAccentColor: (color: string) => void;
  setUserName: (newName: string) => void;

  // Audio & Display
  volume: number;
  brightness: number;
  isMuted: boolean;

  // Connectivity
  wifiConnected: boolean;
  bluetoothConnected: boolean;

  // Notifications & Shell
  notifications: OSNotification[];
  isControlCenterOpen: boolean;
  isStartMenuOpen: boolean;

  // Actions
  setSystemState: (state: SystemState) => void;
  setCurrentUser: (user: Partial<User>) => void;
  setWallpaper: (wallpaperUrl: string) => void;
  setThemeMode: (mode: "light" | "dark") => void;
  setTheme: (mode: "light" | "dark") => void;
  toggleTheme: () => void;

  setVolume: (volume: number) => void;
  setBrightness: (brightness: number) => void;
  toggleMute: () => void;

  toggleWifi: () => void;
  toggleBluetooth: () => void;
  toggleControlCenter: (open?: boolean) => void;
  toggleStartMenu: (open?: boolean) => void;

  addNotification: (
    notification: Omit<OSNotification, "id" | "timestamp" | "read">,
  ) => void;
  dismissNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  validatePin: (pin: string) => boolean;
  login: () => void;
  lockSystem: () => void;
  unlockSystem: () => void;

  sleep: () => void;
  wakeFromSleep: () => void;
  reboot: () => void;
  shutdown: () => void;
  powerOn: () => void;
}

export const useOSStore = create<OSState>()(
  persist(
    (set, get) => ({
      systemState: SystemState.BOOTING,
      previousState: SystemState.LOGIN,
      isLocked: true,

      userName: "Jayant Sharma",
      currentUser: DEFAULT_USER,
      activeWallpaper: DEFAULT_WALLPAPERS[0].url,
      wallpapers: DEFAULT_WALLPAPERS,
      themeMode: "dark",
      accentColor: "cyan",
      setAccentColor: (color) => set({ accentColor: color }),
      setUserName: (newName) =>
        set((state) => ({
          userName: newName,
          currentUser: {
            ...state.currentUser,
            name: newName,
            username: newName.toLowerCase().replace(/\s+/g, "."),
            email: `${newName.toLowerCase().replace(/\s+/g, ".")}@nexus-os.internal`,
          },
        })),

      volume: 80,
      brightness: 90,
      isMuted: false,

      wifiConnected: true,
      bluetoothConnected: true,

      notifications: INITIAL_NOTIFICATIONS,
      isControlCenterOpen: false,
      isStartMenuOpen: false,

      setSystemState: (state) =>
        set((prev) => ({
          previousState:
            prev.systemState !== state ? prev.systemState : prev.previousState,
          systemState: state,
        })),

      setCurrentUser: (userUpdates) =>
        set((state) => ({
          currentUser: { ...state.currentUser, ...userUpdates },
        })),

      setWallpaper: (wallpaperUrl) => set({ activeWallpaper: wallpaperUrl }),

      setThemeMode: (mode) => {
        if (typeof document !== "undefined") {
          if (mode === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            document.documentElement.setAttribute("data-theme", "dark");
          } else {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute("data-theme", "light");
          }
          applyTheme(mode, get().accentColor || "cyan");
        }
        set({ themeMode: mode });
      },

      setTheme: (mode) => {
        if (typeof document !== "undefined") {
          if (mode === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            document.documentElement.setAttribute("data-theme", "dark");
          } else {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute("data-theme", "light");
          }
          applyTheme(mode, get().accentColor || "cyan");
        }
        set({ themeMode: mode });
      },

      toggleTheme: () => {
        const currentMode = get().themeMode;
        const newMode = currentMode === "dark" ? "light" : "dark";
        if (typeof document !== "undefined") {
          if (newMode === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
            document.documentElement.setAttribute("data-theme", "dark");
          } else {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute("data-theme", "light");
          }
          applyTheme(newMode, get().accentColor || "cyan");
        }
        set({ themeMode: newMode });
      },

      setVolume: (volume) =>
        set({
          volume: Math.max(0, Math.min(100, volume)),
          isMuted: volume === 0,
        }),

      setBrightness: (brightness) =>
        set({ brightness: Math.max(10, Math.min(100, brightness)) }),

      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      toggleWifi: () =>
        set((state) => ({ wifiConnected: !state.wifiConnected })),

      toggleBluetooth: () =>
        set((state) => ({ bluetoothConnected: !state.bluetoothConnected })),

      toggleControlCenter: (open) =>
        set((state) => ({
          isControlCenterOpen:
            open !== undefined ? open : !state.isControlCenterOpen,
          isStartMenuOpen: false, // close start menu when control center opens
        })),

      toggleStartMenu: (open) =>
        set((state) => ({
          isStartMenuOpen: open !== undefined ? open : !state.isStartMenuOpen,
          isControlCenterOpen: false, // close control center when start menu opens
        })),

      addNotification: (notif) => {
        const newNotif: OSNotification = {
          ...notif,
          id: `notif-${Date.now()}`,
          timestamp: "Just now",
          read: false,
        };
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
        }));
      },

      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      clearAllNotifications: () => set({ notifications: [] }),

      validatePin: (pin) => {
        return get().currentUser.pin === pin;
      },

      login: () =>
        set({
          systemState: SystemState.DESKTOP,
          isLocked: false,
        }),

      lockSystem: () =>
        set((state) => ({
          previousState: state.systemState,
          systemState: SystemState.LOCKED,
          isLocked: true,
        })),

      unlockSystem: () =>
        set({
          systemState: SystemState.DESKTOP,
          isLocked: false,
        }),

      sleep: () =>
        set((state) => ({
          previousState: state.systemState,
          systemState: SystemState.SLEEP,
        })),

      wakeFromSleep: () => {
        const { previousState, isLocked } = get();
        if (
          isLocked ||
          previousState === SystemState.LOGIN ||
          previousState === SystemState.LOCKED
        ) {
          set({ systemState: SystemState.LOGIN });
        } else {
          set({ systemState: SystemState.DESKTOP });
        }
      },

      reboot: () =>
        set({
          systemState: SystemState.REBOOTING,
          isLocked: true,
        }),

      shutdown: () =>
        set({
          systemState: SystemState.SHUTDOWN,
          isLocked: true,
        }),

      powerOn: () =>
        set({
          systemState: SystemState.BOOTING,
          isLocked: true,
        }),
    }),
    {
      name: "nexus-os-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userName: state.userName || state.currentUser?.name || "Jayant Sharma",
        currentUser: state.currentUser,
        activeWallpaper: state.activeWallpaper,
        themeMode: state.themeMode,
        volume: state.volume,
        brightness: state.brightness,
        wifiConnected: state.wifiConnected,
        bluetoothConnected: state.bluetoothConnected,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.themeMode, state.accentColor || "cyan");
        }
      },
    },
  ),
);
