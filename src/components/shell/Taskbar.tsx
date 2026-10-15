import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Terminal,
  FileText,
  Settings,
  Image as ImageIcon,
  Music,
  Globe,
  Cpu,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  Sliders,
  Bell,
  AppWindow,
  Lock,
} from "lucide-react";
import { useOSStore } from "../../store/useOSStore";
import { useWindowStore, WindowProcess } from "../../store/useWindowStore";
import { useAIStore } from "../../store/useAIStore";
import { CalendarWidget } from "../taskbar/CalendarWidget";

// Map icon strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder,
  Terminal,
  FileText,
  Settings,
  Image: ImageIcon,
  Music,
  Globe,
  Cpu,
  Sparkles,
  AppWindow,
};

interface PinnedShortcut {
  appId: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const PINNED_SHORTCUTS: PinnedShortcut[] = [
  {
    appId: "explorer",
    name: "Files Explorer",
    icon: Folder,
    color: "text-amber-400",
  },
  {
    appId: "terminal",
    name: "Terminal Console",
    icon: Terminal,
    color: "text-cyan-400",
  },
  {
    appId: "notepad",
    name: "Text Editor",
    icon: FileText,
    color: "text-emerald-400",
  },
  { appId: "browser", name: "Quantum Web", icon: Globe, color: "text-sky-400" },
  {
    appId: "sysmon",
    name: "System Monitor",
    icon: Cpu,
    color: "text-purple-400",
  },
];

export const Taskbar: React.FC = () => {
  const {
    isStartMenuOpen,
    toggleStartMenu,
    isControlCenterOpen,
    toggleControlCenter,
    wifiConnected,
    bluetoothConnected,
    volume,
    isMuted,
    notifications,
  } = useOSStore();

  const {
    windows,
    activeWindowId,
    openApp,
    focusWindow,
    minimizeWindow,
    restoreWindow,
  } = useWindowStore();

  const { toggleAI, isOpen: isAIOpen } = useAIStore();

  const [time, setTime] = useState(new Date());
  const [hoveredWinId, setHoveredWinId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleWindowClick = (win: WindowProcess) => {
    if (win.isFocused && !win.isMinimized) {
      minimizeWindow(win.id);
    } else if (win.isMinimized) {
      restoreWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  const handleShortcutClick = (appId: string) => {
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      if (existing.isMinimized) restoreWindow(existing.id);
      else focusWindow(existing.id);
    } else {
      openApp(appId);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-9500 h-14 w-auto max-w-[92vw] px-3.5 py-1.5 rounded-2xl bg-slate-900/75 border border-white/15 backdrop-blur-2xl text-slate-100 flex items-center justify-between gap-3 select-none font-sans shadow-2xl shadow-black/50">
      {/* Left Cluster: Start Button, AI Trigger, Search, Pinned Shortcuts */}
      <div className="flex items-center gap-1.5">
        {/* Nexus Start Button */}
        <motion.button
          id="start-menu-button"
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleStartMenu()}
          className={`p-2 rounded-xl transition-colors duration-200 flex items-center justify-center cursor-pointer ${
            isStartMenuOpen
              ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              : "hover:bg-slate-800/80 text-cyan-400 hover:text-cyan-300"
          }`}
          title="Nexus Start Menu"
        >
          <svg viewBox="0 0 100 100" className="w-5 h-5 fill-current">
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
            />
            <path
              d="M30 70 V30 L70 70 V30"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
        </motion.button>

        {/* Nexus AI Assistant Quick Launch */}
        <motion.button
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAI}
          className={`p-2 rounded-xl transition-colors cursor-pointer group relative ${
            isAIOpen
              ? "bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "hover:bg-slate-800/80 text-purple-400 hover:text-purple-300"
          }`}
          title="Launch Nexus AI Assistant (Ctrl + Space)"
        >
          <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          {isAIOpen && (
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
          )}
        </motion.button>

        {/* Global Search Trigger */}
        <motion.button
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleStartMenu(true)}
          className="p-2 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Global Search"
        >
          <Search className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-5 bg-slate-800/80 mx-1" />

        {/* Pinned Shortcuts */}
        <div className="flex items-center gap-1">
          {PINNED_SHORTCUTS.map((shortcut) => {
            const Icon = shortcut.icon;
            const isOpen = windows.some((w) => w.appId === shortcut.appId);
            return (
              <motion.button
                key={shortcut.appId}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShortcutClick(shortcut.appId)}
                className={`p-2 rounded-xl transition-colors duration-200 relative group cursor-pointer ${
                  isOpen
                    ? "bg-slate-800/80 border border-white/10 shadow-sm"
                    : "hover:bg-slate-800/60"
                }`}
                title={shortcut.name}
              >
                <Icon
                  className={`w-4 h-4 ${shortcut.color} transition-transform`}
                />
                {isOpen && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Center Cluster: Active Running Window Processes */}
      <div className="flex items-center gap-1.5 max-w-[36vw] overflow-x-auto no-scrollbar py-1">
        {windows.map((win) => {
          const Icon = ICON_MAP[win.icon] || AppWindow;
          const isFocused = activeWindowId === win.id && !win.isMinimized;

          return (
            <div key={win.id} className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleWindowClick(win)}
                onMouseEnter={() => setHoveredWinId(win.id)}
                onMouseLeave={() => setHoveredWinId(null)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-colors duration-200 cursor-pointer max-w-37.5 truncate relative ${
                  isFocused
                    ? "bg-cyan-500/25 border-cyan-400/60 text-cyan-200 shadow-[0_0_18px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40 font-semibold"
                    : win.isMinimized
                      ? "bg-slate-900/40 border-slate-800/60 text-slate-500 opacity-60"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="truncate text-[11px] font-medium">
                  {win.title}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    isFocused
                      ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse"
                      : "bg-slate-500"
                  }`}
                />
                {!win.isMinimized && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </motion.button>

              {/* Hover Tooltip Preview */}
              <AnimatePresence>
                {hoveredWinId === win.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    className="absolute bottom-14 left-1/2 -translate-x-1/2 px-2.5 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 text-[10px] text-slate-200 font-medium shadow-2xl backdrop-blur-xl whitespace-nowrap pointer-events-none z-50 flex items-center gap-1.5"
                  >
                    <Icon className="w-3 h-3 text-cyan-400" />
                    <span>{win.title}</span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      ({win.appId})
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Right Cluster: System Tray (Quick Settings, Clock, Notifications) */}
      <div className="flex items-center gap-2">
        {/* Quick Settings & Status Button */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleControlCenter()}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
            isControlCenterOpen
              ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800 text-slate-300"
          }`}
          title="Open Quick Settings & Control Center"
        >
          {wifiConnected ? (
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}

          {bluetoothConnected && (
            <Bluetooth className="w-3.5 h-3.5 text-indigo-400" />
          )}

          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-300" />
          )}

          <Sliders className="w-3.5 h-3.5 text-slate-400" />
        </motion.button>

        {/* Live Clock & Interactive Calendar Drawer */}
        <CalendarWidget />

        {/* Notification Drawer Trigger */}
        <motion.button
          whileHover={{ scale: 1.08, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleControlCenter()}
          className="relative p-2 rounded-xl hover:bg-slate-800/80 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center justify-center shadow-md animate-pulse">
              {unreadNotifCount}
            </span>
          )}
        </motion.button>
      </div>
    </div>
  );
};
