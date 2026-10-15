import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderPlus,
  FilePlus,
  RotateCw,
  Image as ImageIcon,
  Info,
  Play,
  Edit2,
  Trash2,
  FileSearch,
  Minus,
  Maximize2,
  Minimize2,
  Layers,
  X,
  ExternalLink,
  Copy,
  Scissors,
  ClipboardPaste,
} from "lucide-react";
import { useVFSStore } from "../../store/useVFSStore";
import { useWindowStore } from "../../store/useWindowStore";
import { useOSStore } from "../../store/useOSStore";

export type ContextMenuType = "desktop" | "item" | "window";

export interface ContextMenuTarget {
  type: ContextMenuType;
  x: number;
  y: number;
  itemData?: {
    id: string;
    name: string;
    type: "app" | "folder" | "file";
    appId?: string;
    nodeId?: string;
    icon?: any;
    path?: string;
  };
  windowData?: {
    id: string;
    title: string;
    appId: string;
    isMaximized: boolean;
    isMinimized: boolean;
  };
}

interface ContextMenuProps {
  target: ContextMenuTarget | null;
  onClose: () => void;
  onRenameItem?: (id: string) => void;
  onShowProperties?: (
    itemData: NonNullable<ContextMenuTarget["itemData"]>,
  ) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  target,
  onClose,
  onRenameItem,
  onShowProperties,
}) => {
  const {
    createFolder,
    createFile,
    deleteItem,
    copyItem,
    cutItem,
    pasteItem,
    clipboard,
  } = useVFSStore();
  const { openApp, minimizeWindow, toggleMaximize, focusWindow, closeWindow } =
    useWindowStore();
  const { addNotification } = useOSStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!target) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [target, onClose]);

  if (!target) return null;

  // Viewport Boundary Enforcement
  const menuWidth = 210;
  const menuHeight =
    target.type === "desktop" ? 240 : target.type === "item" ? 200 : 180;
  const adjustedX = Math.min(
    target.x,
    (typeof window !== "undefined" ? window.innerWidth : 1200) - menuWidth - 12,
  );
  const adjustedY = Math.min(
    target.y,
    (typeof window !== "undefined" ? window.innerHeight : 800) -
      menuHeight -
      12,
  );

  // Actions for Desktop View Context Menu
  const handleNewFolder = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const folder = createFolder("desktop", "New Folder");
    addNotification({
      title: "Folder Created",
      message: `Created "${folder.name}" on Desktop`,
      app: "Nexus OS VFS",
      iconName: "FolderPlus",
      priority: "low",
    });
    onClose();
  };

  const handleNewTextDocument = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    const file = createFile(
      "desktop",
      "New Document.txt",
      "# Nexus OS Text Document\n\nCreated on Desktop.",
      "txt",
    );
    addNotification({
      title: "File Created",
      message: `Created "${file.name}" on Desktop`,
      app: "Nexus OS VFS",
      iconName: "FilePlus",
      priority: "low",
    });
    onClose();
  };

  const handleRefreshDesktop = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    addNotification({
      title: "Desktop Refreshed",
      message: "Re-indexed desktop workspace and icons",
      app: "Desktop Manager",
      iconName: "RotateCw",
      priority: "low",
    });
    onClose();
  };

  const handleChangeWallpaper = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    openApp("settings", "System Settings", "Settings", { tab: "wallpaper" });
    onClose();
  };

  const handleSystemInfo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    openApp("settings", "System Settings", "Settings", { tab: "about" });
    onClose();
  };

  const handleDesktopPaste = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (clipboard.sourceId) {
      const pasted = pasteItem("desktop");
      addNotification({
        title: "Item Pasted",
        message: pasted
          ? `Pasted "${pasted.name}" to Desktop`
          : "Item pasted to Desktop",
        app: "Nexus OS VFS",
        iconName: "ClipboardPaste",
        priority: "low",
      });
    }
    onClose();
  };

  // Actions for Item Context Menu
  const handleItemOpen = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData) {
      const { type, appId, nodeId, name, path } = target.itemData;
      if (type === "app" && appId) {
        openApp(appId);
      } else if (type === "folder") {
        openApp("explorer", name, "Folder", {
          currentPath: path || `/Desktop/${name}`,
          parentId: nodeId,
        });
      } else if (nodeId) {
        openApp("notes", name, "FileText", { nodeId, title: name });
      }
    }
    onClose();
  };

  const handleItemCopy = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData) {
      const idToCopy = target.itemData.nodeId || target.itemData.id;
      copyItem(idToCopy);
      addNotification({
        title: "Copied to Clipboard",
        message: `"${target.itemData.name}" copied to clipboard`,
        app: "Nexus OS VFS",
        iconName: "Copy",
        priority: "low",
      });
    }
    onClose();
  };

  const handleItemCut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData) {
      const idToCut = target.itemData.nodeId || target.itemData.id;
      cutItem(idToCut);
      addNotification({
        title: "Cut to Clipboard",
        message: `"${target.itemData.name}" cut to clipboard`,
        app: "Nexus OS VFS",
        iconName: "Scissors",
        priority: "low",
      });
    }
    onClose();
  };

  const handleItemRename = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData && onRenameItem) {
      onRenameItem(target.itemData.id);
    }
    onClose();
  };

  const handleItemDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData) {
      if (target.itemData.nodeId) {
        deleteItem(target.itemData.nodeId);
        addNotification({
          title: "Item Moved to Trash",
          message: `Deleted "${target.itemData.name}" from Desktop`,
          app: "VFS Trash",
          iconName: "Trash2",
          priority: "low",
        });
      }
    }
    onClose();
  };

  const handleItemProperties = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.itemData && onShowProperties) {
      onShowProperties(target.itemData);
    }
    onClose();
  };

  // Actions for Window Title Bar Context Menu
  const handleWindowMinimize = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.windowData) {
      minimizeWindow(target.windowData.id);
    }
    onClose();
  };

  const handleWindowMaximizeRestore = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.windowData) {
      toggleMaximize(target.windowData.id);
    }
    onClose();
  };

  const handleWindowBringToFront = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.windowData) {
      focusWindow(target.windowData.id);
    }
    onClose();
  };

  const handleWindowClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (target.windowData) {
      closeWindow(target.windowData.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        onPointerDown={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        style={{ left: adjustedX, top: adjustedY }}
        className="fixed z-10000 w-52 py-1.5 rounded-2xl bg-[#0b0f17]/90 backdrop-blur-2xl border border-slate-700/60 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_15px_rgba(6,182,212,0.15)] text-slate-100 text-xs font-medium select-none overflow-hidden"
      >
        {/* MODE A: DESKTOP CONTEXT MENU */}
        {target.type === "desktop" && (
          <div className="space-y-0.5">
            <button
              onClick={handleNewFolder}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-amber-400 shrink-0" />
              <span>New Folder</span>
            </button>
            <button
              onClick={handleNewTextDocument}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <FilePlus className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>New Text Document</span>
            </button>

            <button
              disabled={!clipboard.sourceId}
              onClick={handleDesktopPaste}
              className={`w-full px-3 py-2 flex items-center gap-2.5 transition-colors text-left ${
                clipboard.sourceId
                  ? "hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-100 cursor-pointer"
                  : "text-slate-600 cursor-not-allowed opacity-50"
              }`}
            >
              <ClipboardPaste
                className={`w-4 h-4 shrink-0 ${clipboard.sourceId ? "text-cyan-400" : "text-slate-600"}`}
              />
              <span>Paste</span>
            </button>

            <div className="my-1 border-t border-slate-800/80" />

            <button
              onClick={handleRefreshDesktop}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <RotateCw className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Refresh Desktop</span>
            </button>

            <div className="my-1 border-t border-slate-800/80" />

            <button
              onClick={handleChangeWallpaper}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Change Wallpaper</span>
            </button>

            <button
              onClick={handleSystemInfo}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
              <span>System Info</span>
            </button>
          </div>
        )}

        {/* MODE B: APP ICON / FILE CONTEXT MENU */}
        {target.type === "item" && target.itemData && (
          <div className="space-y-0.5">
            <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] text-cyan-400 font-mono truncate">
              {target.itemData.name}
            </div>

            <button
              onClick={handleItemOpen}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Open</span>
            </button>

            <button
              onClick={handleItemCopy}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Copy className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Copy</span>
            </button>

            <button
              onClick={handleItemCut}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Cut</span>
            </button>

            <button
              onClick={handleItemRename}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Edit2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Rename</span>
            </button>

            <button
              onClick={handleItemDelete}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-rose-500/20 hover:text-rose-300 transition-colors text-left cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Delete</span>
            </button>

            <div className="my-1 border-t border-slate-800/80" />

            <button
              onClick={handleItemProperties}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Properties</span>
            </button>
          </div>
        )}

        {/* MODE C: WINDOW TITLE BAR CONTEXT MENU */}
        {target.type === "window" && target.windowData && (
          <div className="space-y-0.5">
            <div className="px-3 py-1.5 border-b border-slate-800/80 text-[10px] text-cyan-400 font-mono truncate">
              {target.windowData.title}
            </div>

            <button
              onClick={handleWindowMinimize}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Minus className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Minimize</span>
            </button>

            <button
              onClick={handleWindowMaximizeRestore}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              {target.windowData.isMaximized ? (
                <Minimize2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Maximize2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>
                {target.windowData.isMaximized
                  ? "Restore Window"
                  : "Maximize Window"}
              </span>
            </button>

            <button
              onClick={handleWindowBringToFront}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors text-left cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Bring to Front</span>
            </button>

            <div className="my-1 border-t border-slate-800/80" />

            <button
              onClick={handleWindowClose}
              className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-rose-500/20 hover:text-rose-300 transition-colors text-left cursor-pointer"
            >
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Close Process</span>
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
