import React from "react";
import {
  Folder,
  Globe,
  FileText,
  Image,
  Music,
  Calculator,
  Settings,
  CloudSun,
  Terminal,
  Code,
  Mail,
  Store,
  Cpu,
  Layers,
} from "lucide-react";

import { FileExplorerApp } from "../apps/FileExplorer/FileExplorerApp";
import { WebBrowserApp } from "../apps/WebBrowser/WebBrowserApp";
import { NotesApp } from "../apps/Notes/NotesApp";
import { PhotoGalleryApp } from "../apps/Gallery/PhotoGalleryApp";
import { MusicPlayerApp } from "../apps/Music/MusicPlayerApp";
import { CalculatorApp } from "../apps/Calculator/CalculatorApp";
import { SettingsApp } from "../apps/Settings/SettingsApp";
import { WeatherApp } from "../apps/Weather/WeatherApp";
import { SystemMonitorApp } from "../apps/SystemMonitor/SystemMonitorApp";
import { TerminalApp } from "../apps/Terminal/TerminalApp";
import { GuessGameApp } from "../apps/GuessGameApp/GuessGameApp";
import { Gamepad2 } from "lucide-react";
export type AppCategory =
  | "System"
  | "Utilities"
  | "Media"
  | "Productivity"
  | "Development";

export interface AppManifest {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  category: AppCategory;
  component: React.ComponentType<{ initialData?: any; windowId?: string }>;
  defaultBounds?: { width: number; height: number; x?: number; y?: number };
  isSingleton?: boolean;
  supportsFileType?: string[]; // e.g. ['txt', 'md', 'png']
  description?: string;
  keywords?: string[];
}

// Global internal registry store map
const registry = new Map<string, AppManifest>();

/**
 * Register a new app manifest into the system registry (Plug-and-Play)
 */

export function registerApp(manifest: AppManifest): void {
  registry.set(manifest.id, manifest);
}

/**
 * Unregister an app by ID
 */
export function unregisterApp(appId: string): void {
  registry.delete(appId);
}

/**
 * Retrieve an app manifest by ID
 */
export function getApp(appId: string): AppManifest | undefined {
  return registry.get(appId);
}

/**
 * Retrieve all registered app manifests
 */
export function getAllApps(): AppManifest[] {
  return Array.from(registry.values());
}

/**
 * Get registered app for a given file extension
 */
export function getAppForFileExtension(ext: string): AppManifest | undefined {
  const cleanExt = ext.toLowerCase().replace(/^\./, "");
  return getAllApps().find((app) =>
    app.supportsFileType?.some((f) => f.toLowerCase() === cleanExt),
  );
}

/**
 * Retrieve map of file extensions to registered app IDs
 */
export function getFileAssociations(): Record<string, string> {
  const assoc: Record<string, string> = {};
  getAllApps().forEach((app) => {
    app.supportsFileType?.forEach((ext) => {
      assoc[ext.toLowerCase()] = app.id;
    });
  });
  return assoc;
}

// Helper Generic Placeholder for future expansion slots
const GenericAppPlaceholder: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  initialData?: any;
}> = ({ title, icon: Icon, description, initialData }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950/90 text-slate-200">
    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-cyan-400 shadow-xl">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-bold text-slate-100">{title}</h3>
    <p className="text-xs text-slate-400 mt-1 max-w-md text-center">
      {description || "Modular application registered in Nexus OS runtime."}
    </p>
    {initialData && (
      <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 max-w-sm w-full font-mono text-[11px] text-slate-300">
        <span className="text-cyan-400 font-semibold block mb-1">
          Passed Input Data:
        </span>
        <pre className="whitespace-pre-wrap break-all">
          {JSON.stringify(initialData, null, 2)}
        </pre>
      </div>
    )}
  </div>
);

// Register Default System Core Applications
registerApp({
  id: "explorer",
  title: "File Explorer",
  icon: Folder,
  category: "System",
  component: FileExplorerApp,
  defaultBounds: { width: 850, height: 560 },
  supportsFileType: ["folder"],
  description: "Manage virtual filesystem files and directories.",
  keywords: ["file", "folder", "vfs", "directory", "storage"],
});

registerApp({
  id: "browser",
  title: "Web Browser",
  icon: Globe,
  category: "Productivity",
  component: WebBrowserApp,
  defaultBounds: { width: 920, height: 600 },
  supportsFileType: ["html", "url"],
  description: "Sandboxed web browser with tabs and bookmarks.",
  keywords: ["internet", "web", "browser", "http", "site"],
});

registerApp({
  id: "notes",
  title: "Notes & Notepad",
  icon: FileText,
  category: "Productivity",
  component: NotesApp,
  defaultBounds: { width: 680, height: 480 },
  supportsFileType: ["txt", "md", "json", "log", "csv"],
  description: "Rich text notepad with VFS persistence.",
  keywords: ["note", "text", "markdown", "write", "edit"],
});

registerApp({
  id: "gallery",
  title: "Photo Gallery",
  icon: Image,
  category: "Media",
  component: PhotoGalleryApp,
  defaultBounds: { width: 800, height: 540 },
  supportsFileType: ["png", "jpg", "jpeg", "gif", "svg", "webp"],
  description: "Image viewer and slideshow gallery.",
  keywords: ["photo", "image", "picture", "gallery", "view"],
});

registerApp({
  id: "music",
  title: "Music Player",
  icon: Music,
  category: "Media",
  component: MusicPlayerApp,
  defaultBounds: { width: 380, height: 520 },
  supportsFileType: ["mp3", "wav", "ogg", "m4a", "flac", "aac"],
  description: "High-res audio engine and queue manager.",
  keywords: ["audio", "music", "song", "mp3", "player"],
});

registerApp({
  id: "calculator",
  title: "Calculator",
  icon: Calculator,
  category: "Utilities",
  component: CalculatorApp,
  defaultBounds: { width: 340, height: 480 },
  isSingleton: true,
  description: "Standard & scientific math calculator.",
  keywords: ["math", "calc", "scientific", "numbers"],
});

registerApp({
  id: "settings",
  title: "Settings",
  icon: Settings,
  category: "System",
  component: SettingsApp,
  defaultBounds: { width: 750, height: 520 },
  isSingleton: true,
  description: "Configure wallpaper, theme, security, and VFS storage.",
  keywords: ["theme", "wallpaper", "security", "storage", "config"],
});

registerApp({
  id: "weather",
  title: "Weather Radar",
  icon: CloudSun,
  category: "Utilities",
  component: WeatherApp,
  defaultBounds: { width: 600, height: 520 },
  description: "Live global weather forecasts and 5-day radar.",
  keywords: ["weather", "forecast", "temperature", "climate", "sun"],
});
registerApp({
  id: "guess-number",
  title: "Guess The Number",
  icon: Gamepad2,
  category: "Utilities",
  component: GuessGameApp,
  defaultBounds: { width: 420, height: 520 },
  description: "Classic number guessing game.",
  keywords: ["game", "guess", "number", "puzzle"],
});
// Future Extension Slots Registered dynamically
registerApp({
  id: "terminal",
  title: "Terminal Console",
  icon: Terminal,
  category: "Development",
  component: TerminalApp,
  defaultBounds: { width: 700, height: 450 },
  supportsFileType: ["sh", "bash"],
  description: "System terminal console with bash shell emulation.",
  keywords: ["cli", "terminal", "shell", "cmd"],
});

registerApp({
  id: "codeeditor",
  title: "Code Editor",
  icon: Code,
  category: "Development",
  component: (props) => (
    <GenericAppPlaceholder
      title="Nexus Code Studio"
      icon={Code}
      description="Syntax highlighted code editor with multi-file tabs."
      {...props}
    />
  ),
  defaultBounds: { width: 850, height: 580 },
  supportsFileType: ["js", "ts", "tsx", "jsx", "css", "html"],
  description: "IDE code editor.",
  keywords: ["code", "developer", "script", "ide"],
});

registerApp({
  id: "email",
  title: "Nexus Mail",
  icon: Mail,
  category: "Productivity",
  component: (props) => (
    <GenericAppPlaceholder
      title="Nexus Mail Client"
      icon={Mail}
      description="Secure inbox & message dispatcher."
      {...props}
    />
  ),
  defaultBounds: { width: 800, height: 520 },
  description: "System messaging client.",
  keywords: ["email", "mail", "inbox", "messages"],
});

registerApp({
  id: "appstore",
  title: "App Store",
  icon: Store,
  category: "System",
  component: (props) => (
    <GenericAppPlaceholder
      title="Nexus App Marketplace"
      icon={Store}
      description="Browse and install community application packages."
      {...props}
    />
  ),
  defaultBounds: { width: 800, height: 560 },
  isSingleton: true,
  description: "System software marketplace.",
  keywords: ["store", "install", "market", "packages"],
});

registerApp({
  id: "sysmon",
  title: "System Monitor",
  icon: Cpu,
  category: "System",
  component: SystemMonitorApp,
  defaultBounds: { width: 680, height: 460 },
  isSingleton: true,
  description: "Real-time performance inspector.",
  keywords: ["cpu", "ram", "performance", "tasks", "processes"],
});

registerApp({
  id: "workspace",
  title: "Workspace Manager",
  icon: Layers,
  category: "System",
  component: (props) => (
    <GenericAppPlaceholder
      title="Virtual Workspaces"
      icon={Layers}
      description="Multi-desktop space and virtual display layout controller."
      {...props}
    />
  ),
  defaultBounds: { width: 640, height: 420 },
  isSingleton: true,
  description: "Virtual desktop workspace layout switcher.",
  keywords: ["workspace", "virtual", "desktops", "layouts"],
});
