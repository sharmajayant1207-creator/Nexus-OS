import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Folder,
  Terminal,
  FileText,
  Settings,
  Image as ImageIcon,
  Music,
  Globe,
  Cpu,
  AppWindow,
  Lock,
  Code,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WindowProcess, useWindowStore } from '../../store/useWindowStore';
import { ErrorBoundary } from './ErrorBoundary';

interface WindowFrameProps {
  window: WindowProcess;
  children: React.ReactNode;
  onTitleBarContextMenu?: (e: React.MouseEvent, win: WindowProcess) => void;
}

// Map string icon names to Lucide icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Folder,
  Terminal,
  FileText,
  Settings,
  Image: ImageIcon,
  Music,
  Globe,
  Cpu,
  AppWindow,
  Lock,
  Code,
  Layers,
  Sparkles,
};

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children, onTitleBarContextMenu }) => {
  const {
    closeWindow,
    minimizeWindow,
    toggleMaximize,
    focusWindow,
    updateBounds,
    snapWindow,
    setSnapPreview,
  } = useWindowStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({
    mouseX: 0,
    mouseY: 0,
    winX: 0,
    winY: 0,
  });

  const resizeStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    winX: number;
    winY: number;
    winW: number;
    winH: number;
    direction: string;
  }>({ mouseX: 0, mouseY: 0, winX: 0, winY: 0, winW: 0, winH: 0, direction: '' });

  const IconComponent = ICON_MAP[win.icon] || AppWindow;

  // Handle Drag Move
  const handleTitlePointerDown = (e: React.PointerEvent) => {
    if (win.isMaximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(win.id);
    setIsDragging(true);

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.bounds.x,
      winY: win.bounds.y,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleTitlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const newX = dragStartRef.current.winX + deltaX;
    const newY = Math.max(36, dragStartRef.current.winY + deltaY); // Don't go above top status bar

    updateBounds(win.id, { x: newX, y: newY });

    // Snap preview logic
    const screenWidth = window.innerWidth;
    const topBarHeight = 36;
    const dockHeight = 48;
    const usableHeight = window.innerHeight - topBarHeight - dockHeight;

    if (e.clientX < 20) {
      setSnapPreview({
        show: true,
        x: 0,
        y: topBarHeight,
        width: Math.floor(screenWidth / 2),
        height: usableHeight,
      });
    } else if (e.clientX > screenWidth - 20) {
      setSnapPreview({
        show: true,
        x: Math.floor(screenWidth / 2),
        y: topBarHeight,
        width: Math.ceil(screenWidth / 2),
        height: usableHeight,
      });
    } else if (e.clientY < topBarHeight + 10) {
      setSnapPreview({
        show: true,
        x: 0,
        y: topBarHeight,
        width: screenWidth,
        height: usableHeight,
      });
    } else {
      setSnapPreview(null);
    }
  };

  const handleTitlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    setSnapPreview(null);

    const screenWidth = window.innerWidth;
    const topBarHeight = 36;

    if (e.clientX < 20) {
      snapWindow(win.id, 'left');
    } else if (e.clientX > screenWidth - 20) {
      snapWindow(win.id, 'right');
    } else if (e.clientY < topBarHeight + 10) {
      snapWindow(win.id, 'full');
    }
  };

  // Handle Resizing
  const handleResizePointerDown = (e: React.PointerEvent, direction: string) => {
    if (win.isMaximized || e.button !== 0) return;
    e.stopPropagation();
    focusWindow(win.id);
    setIsResizing(true);

    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.bounds.x,
      winY: win.bounds.y,
      winW: win.bounds.width,
      winH: win.bounds.height,
      direction,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (!isResizing) return;

    const { mouseX, mouseY, winX, winY, winW, winH, direction } = resizeStartRef.current;
    const deltaX = e.clientX - mouseX;
    const deltaY = e.clientY - mouseY;

    let newX = winX;
    let newY = winY;
    let newW = winW;
    let newH = winH;

    const minW = Math.max(320, win.minSize?.width || 320);
    const minH = Math.max(240, win.minSize?.height || 240);

    if (direction.includes('e')) {
      newW = Math.max(minW, winW + deltaX);
    }
    if (direction.includes('s')) {
      newH = Math.max(minH, winH + deltaY);
    }
    if (direction.includes('w')) {
      const possibleW = winW - deltaX;
      if (possibleW >= minW) {
        newW = possibleW;
        newX = winX + deltaX;
      }
    }
    if (direction.includes('n')) {
      const possibleH = winH - deltaY;
      if (possibleH >= minH) {
        newH = possibleH;
        newY = Math.max(36, winY + deltaY);
      }
    }

    updateBounds(win.id, { x: newX, y: newY, width: newW, height: newH });
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return;
    setIsResizing(false);
  };

  if (win.isMinimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0, y: 15 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.88, opacity: 0, y: 25 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      style={{
        position: 'absolute',
        left: win.bounds.x,
        top: win.bounds.y,
        width: win.bounds.width,
        height: win.bounds.height,
        zIndex: win.zIndex,
      }}
      onPointerDown={() => focusWindow(win.id)}
      className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
        win.isFocused
          ? 'shadow-[0_22px_60px_-15px_rgba(0,0,0,0.85),0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40 border border-cyan-500/30'
          : 'shadow-2xl border border-slate-800/80 opacity-95'
      } bg-[#0b0f17]/90 backdrop-blur-2xl text-slate-100 select-none`}
    >
      {/* Window Header / Title Bar */}
      <div
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handleTitlePointerMove}
        onPointerUp={handleTitlePointerUp}
        onDoubleClick={() => toggleMaximize(win.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onTitleBarContextMenu) {
            onTitleBarContextMenu(e, win);
          }
        }}
        className={`h-10 px-3 flex items-center justify-between gap-2 border-b border-slate-800/60 cursor-grab active:cursor-grabbing ${
          win.isFocused
            ? 'bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/90'
            : 'bg-slate-950/70'
        }`}
      >
        {/* Left: Icon & Title */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 truncate max-w-[50%]">
          <IconComponent className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate tracking-wide">{win.title}</span>
        </div>

        {/* Center: Process Info */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-800/50 border border-slate-700/30 uppercase tracking-wider">
            PID:{win.id.slice(-4)}
          </span>
        </div>

        {/* Right: Universal Header Action Bar */}
        <div className="flex items-center gap-1">
          {/* Minimize (−) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(win.id);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore (□) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize(win.id);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all cursor-pointer"
            title={win.isMaximized ? 'Restore' : 'Maximize'}
          >
            {win.isMaximized ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Close (✕) with Red Hover Highlight */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(win.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
            title="Close Window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body / Client App Container */}
      <div className="flex-1 relative overflow-hidden bg-slate-950/60 flex flex-col">
        <ErrorBoundary appName={win.title}>{children}</ErrorBoundary>
      </div>

      {/* Resize Edge Handles (Only active when not maximized) */}
      {!win.isMaximized && (
        <>
          {/* Edges */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'n')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 's')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'w')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'e')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize z-20"
          />

          {/* Corners */}
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'nw')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'ne')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'sw')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizePointerDown(e, 'se')}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30"
          />
        </>
      )}
    </motion.div>
  );
};
