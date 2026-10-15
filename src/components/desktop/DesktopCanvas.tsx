import React, { useState, useRef, useEffect } from "react";
import { Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  Globe,
  FileText,
  Image as ImageIcon,
  Music,
  Calculator,
  Settings,
  CloudSun,
  File,
  FileCode,
  ShieldCheck,
  Check,
  X,
  Info,
  ExternalLink,
  Sparkles,
  Terminal,
  Cpu,
} from "lucide-react";
import { useVFSStore } from "../../store/useVFSStore";
import { useWindowStore, WindowProcess } from "../../store/useWindowStore";
import { useOSStore } from "../../store/useOSStore";
import { useAIStore } from "../../store/useAIStore";
import { VFSNode } from "../../types/vfs";
import { WindowFrame } from "../window/WindowFrame";
import { AppRegistry } from "../apps/AppRegistry";
import { ContextMenu, ContextMenuTarget } from "./ContextMenu";

// 8 Primary Core Desktop Applications definition
export interface DesktopShortcut {
  id: string;
  name: string;
  appId: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
}

const PRIMARY_APPS: DesktopShortcut[] = [
  {
    id: "app-ai",
    name: "Nexus AI Engine",
    appId: "ai",
    icon: Sparkles,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-cyan-600/10",
  },
  {
    id: "app-explorer",
    name: "File Explorer",
    appId: "explorer",
    icon: Folder,
    color: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-600/10",
  },
  {
    id: "app-browser",
    name: "Web Browser",
    appId: "browser",
    icon: Globe,
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-600/10",
  },
  {
    id: "app-notes",
    name: "Notes",
    appId: "notes",
    icon: FileText,
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
  {
    id: "app-gallery",
    name: "Photo Gallery",
    appId: "gallery",
    icon: ImageIcon,
    color: "text-pink-400",
    gradient: "from-pink-500/20 to-rose-600/10",
  },
  {
    id: "app-music",
    name: "Music Player",
    appId: "music",
    icon: Music,
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-indigo-600/10",
  },
  {
    id: "app-calculator",
    name: "Calculator",
    appId: "calculator",
    icon: Calculator,
    color: "text-orange-400",
    gradient: "from-orange-500/20 to-amber-600/10",
  },
  {
    id: "app-settings",
    name: "Settings",
    appId: "settings",
    icon: Settings,
    color: "text-slate-300",
    gradient: "from-slate-500/20 to-slate-700/10",
  },
  {
    id: "app-weather",
    name: "Weather App",
    appId: "weather",
    icon: CloudSun,
    color: "text-sky-400",
    gradient: "from-sky-500/20 to-cyan-600/10",
  },
  {
    id: "app-guess-number",
    name: "Guess The Number",
    appId: "guess-number", // Must match the ID from registerApp
    icon: Gamepad2, // Make sure Gamepad2 is imported from lucide-react at the top of DesktopCanvas.tsx
    color: "text-emerald-400",
    gradient: "from-emerald-500/20 to-teal-600/10",
  },
];

export const DesktopCanvas: React.FC = () => {
  const { nodes, getChildren, renameItem, deleteItem, clipboard } =
    useVFSStore();
  const { windows, openApp, snapPreview } = useWindowStore();
  const { activeWallpaper } = useOSStore();

  // State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [contextMenuTarget, setContextMenuTarget] =
    useState<ContextMenuTarget | null>(null);

  // Properties Modal State
  const [propertiesItem, setPropertiesItem] = useState<any | null>(null);

  // Custom App Names override
  const [appCustomNames, setAppCustomNames] = useState<Record<string, string>>(
    {},
  );

  // Rubberband selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Fetch VFS items in /Desktop
  const vfsDesktopNodes = getChildren("desktop");

  // Intercept Global Right-Click Event
  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuTarget({
      type: "desktop",
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Close context menu on left click
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".context-menu")) return;
    setContextMenuTarget(null);
  };

  // Handle Double-Clicking Desktop Shortcut or VFS Node
  const handleAppDoubleClick = (appId: string) => {
    if (appId === "ai") {
      useAIStore.getState().openAI();
      return;
    }
    openApp(appId);
  };

  const handleVFSNodeDoubleClick = (node: VFSNode) => {
    if (node.type === "folder") {
      openApp("explorer", node.name, "Folder", {
        currentPath: node.path,
        parentId: node.id,
      });
    } else {
      const ext = node.metadata?.extension?.toLowerCase() || "";
      if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) {
        openApp("gallery", node.name, "Image", { node });
      } else if (["mp3", "wav", "flac"].includes(ext)) {
        openApp("music", node.name, "Music", { node });
      } else {
        openApp("notes", node.name, "FileText", {
          nodeId: node.id,
          content: node.content || "",
          title: node.name,
        });
      }
    }
  };

  // Rubberband Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (
      (e.target as HTMLElement).closest(".desktop-icon") ||
      (e.target as HTMLElement).closest(".context-menu") ||
      (e.target as HTMLElement).closest(".properties-modal")
    ) {
      return;
    }

    setContextMenuTarget(null);
    setSelectedId(null);
    setIsSelecting(true);
    setSelectionBox({
      x1: e.clientX,
      y1: e.clientY,
      x2: e.clientX,
      y2: e.clientY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isSelecting || !selectionBox) return;
    setSelectionBox((prev) =>
      prev ? { ...prev, x2: e.clientX, y2: e.clientY } : null,
    );
  };

  const handlePointerUp = () => {
    setIsSelecting(false);
    setSelectionBox(null);
  };

  // Inline Rename Submission
  const handleRenameSubmit = (id: string, isVFS: boolean, nodeId?: string) => {
    if (!editingName.trim()) {
      setEditingId(null);
      return;
    }

    if (isVFS && nodeId) {
      renameItem(nodeId, editingName.trim());
    } else {
      setAppCustomNames((prev) => ({ ...prev, [id]: editingName.trim() }));
    }

    setEditingId(null);
  };

  // Handle Window Header Right-Click Context Menu
  const handleTitleBarContextMenu = (
    e: React.MouseEvent,
    win: WindowProcess,
  ) => {
    setContextMenuTarget({
      type: "window",
      x: e.clientX,
      y: e.clientY,
      windowData: {
        id: win.id,
        title: win.title,
        appId: win.appId,
        isMaximized: win.isMaximized,
        isMinimized: win.isMinimized,
      },
    });
  };

  return (
    <div
      ref={desktopRef}
      onContextMenu={handleDesktopContextMenu}
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative w-full h-full overflow-hidden select-none font-sans"
      style={{
        backgroundImage: `url(${activeWallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Subtle Overlay Glow */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-brightness-[0.96]" />

      {/* Rubberband Selection Box */}
      {isSelecting && selectionBox && (
        <div
          className="absolute border border-cyan-400/70 bg-cyan-500/15 rounded-lg pointer-events-none z-10 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          style={{
            left: Math.min(selectionBox.x1, selectionBox.x2),
            top: Math.min(selectionBox.y1, selectionBox.y2),
            width: Math.abs(selectionBox.x2 - selectionBox.x1),
            height: Math.abs(selectionBox.y2 - selectionBox.y1),
          }}
        />
      )}

      {/* Snap Preview Ghost Container */}
      <AnimatePresence>
        {snapPreview?.show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              left: snapPreview.x,
              top: snapPreview.y,
              width: snapPreview.width,
              height: snapPreview.height,
              zIndex: 9999,
            }}
            className="rounded-2xl border-2 border-cyan-400/80 bg-cyan-500/15 backdrop-blur-md shadow-[0_0_40px_rgba(6,182,212,0.35)] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Desktop Application Icons Grid */}
      <div className="relative z-0 p-6 pt-12 grid grid-flow-col auto-cols-27 grid-rows-[repeat(auto-fill,112px)] gap-3 h-[calc(100vh-80px)] overflow-hidden">
        {/* Render 8 Primary Apps */}
        {PRIMARY_APPS.map((app) => {
          const IconComponent = app.icon;
          const isSelected = selectedId === app.id;
          const displayName = appCustomNames[app.id] || app.name;
          const isEditing = editingId === app.id;

          return (
            <motion.div
              key={app.id}
              drag
              dragMomentum={false}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(app.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleAppDoubleClick(app.appId);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedId(app.id);
                setContextMenuTarget({
                  type: "item",
                  x: e.clientX,
                  y: e.clientY,
                  itemData: {
                    id: app.id,
                    name: displayName,
                    type: "app",
                    appId: app.appId,
                  },
                });
              }}
              className={`desktop-icon group flex flex-col items-center justify-center p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50"
                  : "hover:bg-slate-900/50 hover:border hover:border-slate-700/60"
              }`}
            >
              <div
                className={`w-13 h-13 rounded-2xl bg-linear-to-br ${app.gradient} border border-white/10 flex items-center justify-center drop-shadow-xl group-hover:scale-110 transition-transform duration-200 ${app.color}`}
              >
                <IconComponent className="w-7 h-7" />
              </div>

              {isEditing ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameSubmit(app.id, false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRenameSubmit(app.id, false);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="mt-1.5 px-1 py-0.5 w-full text-[11px] font-medium bg-slate-950 border border-cyan-400 rounded text-center text-slate-100 outline-none font-mono"
                />
              ) : (
                <span className="mt-1.5 text-[11px] font-medium text-slate-100 text-center line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-24 px-1 py-0.5 rounded">
                  {displayName}
                </span>
              )}
            </motion.div>
          );
        })}

        {/* Render VFS Nodes located in /Desktop */}
        {vfsDesktopNodes.map((node) => {
          const isSelected = selectedId === node.id;
          const isEditing = editingId === node.id;
          const isCut =
            clipboard?.sourceId === node.id && clipboard?.action === "cut";
          const ext = node.metadata?.extension?.toLowerCase() || "";

          return (
            <motion.div
              key={node.id}
              drag
              dragMomentum={false}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(node.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                handleVFSNodeDoubleClick(node);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedId(node.id);
                setContextMenuTarget({
                  type: "item",
                  x: e.clientX,
                  y: e.clientY,
                  itemData: {
                    id: node.id,
                    name: node.name,
                    type: node.type === "folder" ? "folder" : "file",
                    nodeId: node.id,
                    path: node.path,
                  },
                });
              }}
              className={`desktop-icon group flex flex-col items-center justify-center p-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                isCut
                  ? "opacity-40 grayscale border border-dashed border-cyan-400/60"
                  : ""
              } ${
                isSelected
                  ? "bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.35)] ring-2 ring-cyan-400/50"
                  : "hover:bg-slate-900/50 hover:border hover:border-slate-700/60"
              }`}
            >
              <div className="w-13 h-13 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center drop-shadow-xl group-hover:scale-110 transition-transform duration-200 text-amber-400">
                {node.type === "folder" ? (
                  <Folder className="w-7 h-7 text-amber-400" />
                ) : ["jpg", "png", "svg"].includes(ext) ? (
                  <ImageIcon className="w-7 h-7 text-pink-400" />
                ) : (
                  <FileText className="w-7 h-7 text-cyan-400" />
                )}
              </div>

              {isEditing ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameSubmit(node.id, true, node.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleRenameSubmit(node.id, true, node.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="mt-1.5 px-1 py-0.5 w-full text-[11px] font-medium bg-slate-950 border border-cyan-400 rounded text-center text-slate-100 outline-none font-mono"
                />
              ) : (
                <span className="mt-1.5 text-[11px] font-medium text-slate-100 text-center line-clamp-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] max-w-24 px-1 py-0.5 rounded">
                  {node.name}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Render Active Windows Stack */}
      {windows.map((win) => (
        <WindowFrame
          key={win.id}
          window={win}
          onTitleBarContextMenu={handleTitleBarContextMenu}
        >
          <AppRegistry window={win} />
        </WindowFrame>
      ))}

      {/* Floating Global Context Menu */}
      <ContextMenu
        target={contextMenuTarget}
        onClose={() => setContextMenuTarget(null)}
        onRenameItem={(id) => {
          const targetItem =
            PRIMARY_APPS.find((a) => a.id === id) ||
            vfsDesktopNodes.find((n) => n.id === id);
          if (targetItem) {
            setEditingId(id);
            setEditingName(
              "appId" in targetItem
                ? appCustomNames[id] || targetItem.name
                : targetItem.name,
            );
          }
        }}
        onShowProperties={(itemData) => {
          setPropertiesItem(itemData);
        }}
      />

      {/* Properties Modal Overlay */}
      <AnimatePresence>
        {propertiesItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10001 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="properties-modal w-96 bg-[#0b0f17] border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative text-slate-100 font-sans space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Properties Meta
                  </h3>
                </div>
                <button
                  onClick={() => setPropertiesItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Item Name:
                  </span>
                  <span className="text-slate-100 font-bold">
                    {propertiesItem.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Type / Subsystem:
                  </span>
                  <span className="text-cyan-400 uppercase font-bold">
                    {propertiesItem.type}
                  </span>
                </div>

                {propertiesItem.appId && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      App Process Identifier:
                    </span>
                    <span className="text-amber-400">
                      {propertiesItem.appId}
                    </span>
                  </div>
                )}

                {propertiesItem.path && (
                  <div>
                    <span className="text-slate-500 block text-[10px]">
                      VFS File Path:
                    </span>
                    <span className="text-slate-300 break-all">
                      {propertiesItem.path}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 block text-[10px]">
                    Security Status:
                  </span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" /> Verified
                    Nexus Binary
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={() => setPropertiesItem(null)}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
