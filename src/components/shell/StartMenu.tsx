import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Folder,
  Terminal,
  FileText,
  Settings,
  Image as ImageIcon,
  Music,
  Globe,
  Cpu,
  Sparkles,
  Lock,
  Moon,
  RotateCcw,
  Power,
  X,
  File,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  FolderOpen,
  Monitor,
} from "lucide-react";
import { useOSStore } from "../../store/useOSStore";
import { useWindowStore } from "../../store/useWindowStore";
import { useVFSStore } from "../../store/useVFSStore";
import { useAIStore } from "../../store/useAIStore";
import { VFSNode } from "../../types/vfs";

interface AppLauncher {
  appId: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  category: string;
  description: string;
}

const PINNED_APPS: AppLauncher[] = [
  {
    appId: "ai",
    name: "Nexus AI Engine",
    icon: Sparkles,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    category: "Intelligence",
    description: "OS Conversational Copilot",
  },
  {
    appId: "explorer",
    name: "Files Explorer",
    icon: Folder,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    category: "System",
    description: "Browse virtual file system",
  },
  {
    appId: "terminal",
    name: "Terminal Console",
    icon: Terminal,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    category: "Utilities",
    description: "Command line terminal",
  },
  {
    appId: "notepad",
    name: "Text Editor",
    icon: FileText,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    category: "Productivity",
    description: "Plain text & markdown editor",
  },
  {
    appId: "browser",
    name: "Quantum Web",
    icon: Globe,
    color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    category: "Network",
    description: "Hyper-speed web browser",
  },
  {
    appId: "sysmon",
    name: "System Monitor",
    icon: Cpu,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    category: "Diagnostics",
    description: "Hardware & process monitor",
  },
  {
    appId: "settings",
    name: "System Settings",
    icon: Settings,
    color: "text-slate-300 bg-slate-500/10 border-slate-500/20",
    category: "System",
    description: "System configurations",
  },
  {
    appId: "imageview",
    name: "Photo Viewer",
    icon: ImageIcon,
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    category: "Media",
    description: "High-res image gallery",
  },
  {
    appId: "musicplayer",
    name: "Music Player",
    icon: Music,
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    category: "Media",
    description: "Audio synthesis player",
  },
];

export const StartMenu: React.FC = () => {
  const {
    isStartMenuOpen,
    toggleStartMenu,
    userName,
    currentUser,
    lockSystem,
    sleep,
    reboot,
    shutdown,
  } = useOSStore();
  const { openApp } = useWindowStore();
  const { nodes } = useVFSStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-close on click outside or Escape key press
  useEffect(() => {
    if (!isStartMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !target.closest("#start-menu-button")
      ) {
        toggleStartMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        toggleStartMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStartMenuOpen, toggleStartMenu]);

  // Search filtering
  const filteredApps = PINNED_APPS.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const allFiles = Object.values(nodes).filter(
    (n) => n.type === "file" && !n.isSystem,
  );
  const filteredFiles = allFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Recommended recent files (sorted by updatedAt)
  const recommendedFiles = [...allFiles]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 4);

  const handleLaunchApp = (
    appId: string,
    customTitle?: string,
    customIcon?: string,
    initialData?: any,
  ) => {
    if (appId === "ai") {
      useAIStore.getState().openAI();
      toggleStartMenu(false);
      return;
    }
    openApp(appId, customTitle, customIcon, initialData);
    toggleStartMenu(false);
  };

  const handleOpenFile = (node: VFSNode) => {
    const ext = node.metadata?.extension?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) {
      handleLaunchApp("imageview", node.name, "Image", { node });
    } else if (["mp3", "wav", "flac"].includes(ext)) {
      handleLaunchApp("musicplayer", node.name, "Music", { node });
    } else {
      handleLaunchApp("notepad", node.name, "FileText", {
        nodeId: node.id,
        content: node.content || "",
        title: node.name,
      });
    }
  };

  const handleOpenFolderShortcut = (path: string, name: string) => {
    const targetNode = Object.values(nodes).find((n) => n.path === path);
    handleLaunchApp("explorer", name, "Folder", {
      currentPath: path,
      parentId: targetNode?.id || "root",
    });
  };

  return (
    <AnimatePresence>
      {isStartMenuOpen && (
        <>
          {/* Transparent Backdrop to capture outside clicks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleStartMenu(false)}
            className="fixed inset-0 z-9989 bg-transparent"
          />

          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", damping: 26, stiffness: 380 }}
            className="fixed bottom-14 left-4 z-9990 w-145 max-w-[calc(100vw-32px)] bg-[#0b0f17]/90 backdrop-blur-2xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(6,182,212,0.2)] rounded-2xl overflow-hidden flex flex-col text-slate-100 select-none font-sans"
          >
            {/* Top Header & Search Bar */}
            <div className="p-4 pb-3 border-b border-slate-800/80 bg-slate-900/40">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-cyan-400/80" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search apps, files, system commands..."
                  autoFocus
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Main Body */}
            <div className="p-4 space-y-5 max-h-115 overflow-y-auto custom-scrollbar">
              {searchQuery ? (
                /* Search Results View */
                <div className="space-y-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase block mb-2 px-1">
                      Matching Applications ({filteredApps.length})
                    </span>
                    {filteredApps.length === 0 ? (
                      <p className="text-xs text-slate-500 italic px-1 py-2">
                        No apps found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredApps.map((app) => {
                          const Icon = app.icon;
                          return (
                            <button
                              key={app.appId}
                              onClick={() => handleLaunchApp(app.appId)}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800/60 transition-all text-left group"
                            >
                              <div
                                className={`p-2 rounded-lg border ${app.color}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                                  {app.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {app.description}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase block mb-2 px-1">
                      Matching Files ({filteredFiles.length})
                    </span>
                    {filteredFiles.length === 0 ? (
                      <p className="text-xs text-slate-500 italic px-1 py-2">
                        No files found.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {filteredFiles.map((file) => (
                          <button
                            key={file.id}
                            onClick={() => handleOpenFile(file)}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 text-left transition-colors border border-transparent hover:border-slate-800"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                              <span className="text-xs text-slate-200 truncate">
                                {file.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {file.path}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Default Pinned & Recommended View */
                <>
                  {/* Pinned Apps Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">
                        Pinned Applications
                      </span>
                      <button
                        onClick={() => handleLaunchApp("explorer")}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>All Apps</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5">
                      {PINNED_APPS.map((app) => {
                        const Icon = app.icon;
                        return (
                          <button
                            key={app.appId}
                            onClick={() => handleLaunchApp(app.appId)}
                            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-cyan-500/30 transition-all duration-200 group text-center cursor-pointer shadow-sm hover:shadow-cyan-500/10"
                          >
                            <div
                              className={`p-2.5 rounded-xl border mb-2 group-hover:scale-110 transition-transform ${app.color}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {app.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recommended Recent Files */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5 px-1">
                      <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />{" "}
                        Recommended & Recent
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {recommendedFiles.map((file) => (
                        <button
                          key={file.id}
                          onClick={() => handleOpenFile(file)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/70 border border-slate-800/50 hover:border-slate-700 transition-all text-left group cursor-pointer"
                        >
                          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                              {file.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {file.path}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom User Bar & Quick Shortcuts */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between">
              {/* User Profile */}
              <div className="flex items-center gap-2.5 px-1">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan-400/60 shadow-md"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-100">
                    {userName || currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Center System Folders Shortcuts */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    handleOpenFolderShortcut("/Documents", "Documents")
                  }
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Open Documents"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    handleOpenFolderShortcut("/Pictures", "Pictures")
                  }
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-pink-400 transition-colors"
                  title="Open Pictures"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    handleOpenFolderShortcut("/Desktop", "Desktop")
                  }
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                  title="Open Desktop Folder"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              {/* Right Power Control Button with Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowPowerMenu(!showPowerMenu)}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                  title="Power Options"
                >
                  <Power className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showPowerMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 bottom-12 w-44 p-1.5 rounded-xl bg-[#0b0f17] border border-slate-800 shadow-2xl z-50 text-xs space-y-0.5"
                    >
                      <button
                        onClick={() => {
                          setShowPowerMenu(false);
                          toggleStartMenu(false);
                          lockSystem();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lock Session</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPowerMenu(false);
                          toggleStartMenu(false);
                          sleep();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 transition-colors"
                      >
                        <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Sleep</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPowerMenu(false);
                          toggleStartMenu(false);
                          reboot();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-800 text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Restart</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPowerMenu(false);
                          toggleStartMenu(false);
                          shutdown();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
                      >
                        <Power className="w-3.5 h-3.5 text-rose-500" />
                        <span>Shut Down</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
