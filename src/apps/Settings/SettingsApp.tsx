import React, { useState, useMemo } from "react";
import {
  Settings,
  Image as ImageIcon,
  Shield,
  Info,
  Check,
  Lock,
  Sparkles,
  HardDrive,
  RefreshCw,
  Sun,
  Moon,
  Palette,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { useOSStore } from "../../store/useOSStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useVFSStore, SYSTEM_FOLDERS } from "../../store/useVFSStore";

interface SettingsAppProps {
  initialData?: any;
}

const ACCENT_OPTIONS = [
  {
    id: "cyan",
    name: "Quantum Cyan",
    bgClass: "bg-cyan-500",
    borderClass: "border-cyan-400",
    textClass: "text-cyan-400",
  },
  {
    id: "indigo",
    name: "Neon Indigo",
    bgClass: "bg-indigo-500",
    borderClass: "border-indigo-400",
    textClass: "text-indigo-400",
  },
  {
    id: "purple",
    name: "Cyber Purple",
    bgClass: "bg-purple-500",
    borderClass: "border-purple-400",
    textClass: "text-purple-400",
  },
  {
    id: "emerald",
    name: "Bio Emerald",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-400",
    textClass: "text-emerald-400",
  },
  {
    id: "amber",
    name: "Solar Amber",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-400",
    textClass: "text-amber-400",
  },
  {
    id: "rose",
    name: "Plasma Rose",
    bgClass: "bg-rose-500",
    borderClass: "border-rose-400",
    textClass: "text-rose-400",
  },
];

export const SettingsApp: React.FC<SettingsAppProps> = ({ initialData }) => {
  const {
    activeWallpaper,
    wallpapers,
    setWallpaper,
    currentUser,
    setCurrentUser,
    userName,
    setUserName,
    addNotification,
    reboot,
  } = useOSStore();

  const [profileNameInput, setProfileNameInput] = useState(
    userName || currentUser.name || "Jayant Sharma ",
  );

  const {
    themeMode,
    setThemeMode,
    accentColor,
    setAccentColor,
    customAccentHex,
    setCustomAccentHex,
  } = useThemeStore();

  const [customHexInput, setCustomHexInput] = useState(
    customAccentHex || "#06b6d4",
  );

  const { nodes, getChildren } = useVFSStore();

  const [activeTab, setActiveTab] = useState<
    "appearance" | "storage" | "security" | "about"
  >(initialData?.tab || "appearance");

  const [pinInput, setPinInput] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  // VFS Storage Calculations
  const storageMetrics = useMemo(() => {
    let totalBytes = 0;
    let fileCount = 0;
    const folderBreakdown: Record<string, { count: number; bytes: number }> = {
      Documents: { count: 0, bytes: 0 },
      Pictures: { count: 0, bytes: 0 },
      Music: { count: 0, bytes: 0 },
      Downloads: { count: 0, bytes: 0 },
      Other: { count: 0, bytes: 0 },
    };

    Object.values(nodes).forEach((node) => {
      if (node.type === "file") {
        fileCount++;
        const size = node.size || node.content?.length || 256;
        totalBytes += size;

        if (node.parentId === SYSTEM_FOLDERS.DOCUMENTS) {
          folderBreakdown.Documents.count++;
          folderBreakdown.Documents.bytes += size;
        } else if (node.parentId === SYSTEM_FOLDERS.PICTURES) {
          folderBreakdown.Pictures.count++;
          folderBreakdown.Pictures.bytes += size;
        } else if (node.parentId === SYSTEM_FOLDERS.MUSIC) {
          folderBreakdown.Music.count++;
          folderBreakdown.Music.bytes += size;
        } else if (node.parentId === SYSTEM_FOLDERS.DOWNLOADS) {
          folderBreakdown.Downloads.count++;
          folderBreakdown.Downloads.bytes += size;
        } else {
          folderBreakdown.Other.count++;
          folderBreakdown.Other.bytes += size;
        }
      }
    });

    const capacityBytes = 50 * 1024 * 1024; // Simulated 50MB VFS storage quota
    const usedPercentage = Math.min(
      100,
      Math.round((totalBytes / capacityBytes) * 100),
    );

    return {
      totalBytes,
      capacityBytes,
      fileCount,
      usedPercentage,
      folderBreakdown,
    };
  }, [nodes]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSaveProfileName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = profileNameInput.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    addNotification({
      title: "Profile Updated",
      message: `Username updated to ${trimmed}`,
      app: "System Settings",
      iconName: "UserCheck",
      priority: "low",
    });
  };

  const handlePinUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinMsg("PIN must be at least 4 digits");
      return;
    }
    setCurrentUser({ pin: pinInput });
    setPinMsg("Security PIN updated successfully!");
    setPinInput("");
    addNotification({
      title: "Security Enclave",
      message: "System Security PIN updated",
      app: "Settings Subsystem",
      iconName: "Lock",
      priority: "high",
    });
  };

  const handleSystemReset = () => {
    localStorage.clear();
    setShowResetModal(false);
    addNotification({
      title: "System Purge Initiated",
      message: "Nexus OS is restarting with factory default state...",
      app: "Kernel Service",
      iconName: "RefreshCw",
      priority: "high",
    });
    setTimeout(() => {
      reboot();
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0b0f17] text-slate-100 font-sans select-none overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-56 bg-slate-950/90 border-r border-slate-800 p-3 flex flex-row md:flex-col gap-1.5 shrink-0">
        <div className="hidden md:flex items-center gap-2 p-2 border-b border-slate-800 mb-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Control Panel</span>
        </div>

        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "appearance"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Appearance & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab("storage")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "storage"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>VFS Storage</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "security"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & User</span>
        </button>

        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
            activeTab === "about"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About Nexus OS</span>
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
        {/* Tab 1: Appearance & Theme */}
        {activeTab === "appearance" && (
          <div className="space-y-6 max-w-3xl">
            {/* Dark / Light Mode Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                  {themeMode === "dark" ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <span>System Theme Mode</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Currently running in{" "}
                  <span className="font-mono text-cyan-400 uppercase font-bold">
                    {themeMode}
                  </span>{" "}
                  mode
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setThemeMode("dark")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    themeMode === "dark"
                      ? "bg-indigo-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" /> Dark
                </button>
                <button
                  onClick={() => setThemeMode("light")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    themeMode === "light"
                      ? "bg-amber-400 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" /> Light
                </button>
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Accent Color Palette
                </h3>
                <p className="text-xs text-slate-400">
                  Choose primary highlight color or provide a custom HEX color
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {ACCENT_OPTIONS.map((opt) => {
                  const isSelected = accentColor === opt.id && !customAccentHex;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAccentColor(opt.id)}
                      className={`p-3 rounded-2xl bg-slate-950 border flex flex-col items-center gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? `${opt.borderClass} ring-2 ring-cyan-500/30 scale-105`
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${opt.bgClass} shadow-md flex items-center justify-center text-slate-950`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-300">
                        {opt.name.split(" ")[1]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom HEX Color Picker */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full border border-slate-700 shadow shrink-0"
                    style={{ backgroundColor: customHexInput }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Custom HEX Accent
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Enter a valid 6-digit hex code
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={7}
                    value={customHexInput}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    placeholder="#06b6d4"
                    className="w-24 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 outline-none focus:border-cyan-400 text-center"
                  />
                  <button
                    onClick={() => {
                      if (/^#[0-9A-F]{6}$/i.test(customHexInput)) {
                        setCustomAccentHex(customHexInput);
                      }
                    }}
                    className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Wallpaper Gallery */}
            <div className="space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
                  Desktop Wallpaper Gallery
                </h3>
                <p className="text-xs text-slate-400">
                  Select a high-resolution background image
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wallpapers.map((wp) => {
                  const isActive = wp.url === activeWallpaper;
                  return (
                    <div
                      key={wp.id}
                      onClick={() => {
                        setWallpaper(wp.url);
                        addNotification({
                          title: "Wallpaper Updated",
                          message: `Desktop theme set to ${wp.name}`,
                          app: "Display Manager",
                          iconName: "Image",
                          priority: "low",
                        });
                      }}
                      className={`group relative aspect-video rounded-2xl overflow-hidden border cursor-pointer transition-all ${
                        isActive
                          ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-2xl scale-[1.02]"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <img
                        src={wp.url}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 p-2.5 flex flex-col justify-between">
                        {isActive && (
                          <div className="self-end px-2 py-0.5 rounded-full bg-cyan-500 text-slate-950 font-bold text-[9px] flex items-center gap-1 shadow-lg">
                            <Check className="w-3 h-3" /> Active
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-100 drop-shadow">
                          {wp.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: VFS Storage Breakdown */}
        {activeTab === "storage" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Virtual Filesystem (VFS) Storage
              </h3>
              <p className="text-xs text-slate-400">
                IndexedDB local database volume breakdown
              </p>
            </div>

            {/* Overall Usage Card */}
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Total VFS Usage:</span>
                <span className="text-cyan-400 font-bold">
                  {formatSize(storageMetrics.totalBytes)} /{" "}
                  {formatSize(storageMetrics.capacityBytes)} (
                  {storageMetrics.usedPercentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-cyan-500 via-indigo-500 to-purple-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(5, storageMetrics.usedPercentage)}%`,
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Indexed Files
                  </span>
                  <span className="text-slate-100 font-bold">
                    {storageMetrics.fileCount} Objects
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Database Layer
                  </span>
                  <span className="text-cyan-400 font-bold">IndexedDB v2</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    Status
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Synchronized
                  </span>
                </div>
              </div>
            </div>

            {/* Folder Breakdown List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">
                Volume Directory Breakdown
              </h4>
              <div className="space-y-2">
                {(
                  Object.entries(storageMetrics.folderBreakdown) as [
                    string,
                    { count: number; bytes: number },
                  ][]
                ).map(([folderName, data]) => (
                  <div
                    key={folderName}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="font-semibold text-slate-200">
                          {folderName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {data.count} Files
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-cyan-300 font-bold">
                      {formatSize(data.bytes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & User */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-md">
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                User Profile & Security Enclave
              </h3>
              <p className="text-xs text-slate-400">
                Manage account details and security credentials
              </p>
            </div>

            {/* User Profile Customization */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={userName || currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400 shadow-lg"
                />
                <div>
                  <div className="text-sm font-bold text-slate-100">
                    {userName || currentUser.name}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSaveProfileName}
                className="space-y-3 pt-3 border-t border-slate-800/80"
              >
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Display Profile Name:
                  </label>
                  <input
                    type="text"
                    value={profileNameInput}
                    onChange={(e) => setProfileNameInput(e.target.value)}
                    placeholder="Enter profile name"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors shadow-lg"
                >
                  Save Profile Name
                </button>
              </form>
            </div>

            {/* PIN Security Section */}
            <form
              onSubmit={handlePinUpdate}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl"
            >
              <h4 className="text-xs font-bold text-slate-300 font-mono">
                Security PIN Enclave
              </h4>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  Update System Security PIN:
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4+ digit PIN"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 outline-none transition-colors"
                />
              </div>

              {pinMsg && (
                <div className="text-xs text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 p-2 rounded-xl text-center font-mono">
                  {pinMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs cursor-pointer transition-colors shadow-lg"
              >
                Save Security Credentials
              </button>
            </form>

            {/* Factory System Reset Action */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold text-rose-400 font-mono uppercase">
                Danger Zone
              </h4>
              <p className="text-xs text-slate-400">
                Purge system state, local storage, and reboot kernel.
              </p>
              <button
                onClick={() => setShowResetModal(true)}
                className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Reset Nexus OS to Factory
                Defaults
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: About Nexus OS */}
        {activeTab === "about" && (
          <div className="space-y-4 max-w-lg font-mono text-xs">
            <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm font-sans">
                    Nexus Web OS
                  </h3>
                  <p className="text-[10px] text-cyan-400">
                    Version 3.5.0 LTS (Enterprise Kernel)
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kernel Environment:</span>
                  <span>Nexus v6.12-x86_64</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Virtual Filesystem:</span>
                  <span>IndexedDB VFS Layer v2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Window Manager:</span>
                  <span>Framer Motion 8-Way Dock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Render Pipeline:</span>
                  <span>React 18 + Tailwind CSS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User Session:</span>
                  <span>
                    {currentUser.name} ({currentUser.role})
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* System Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-99999">
          <div className="bg-[#0b0f17] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Factory Reset Confirmation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                This action will completely clear local storage, reset all
                customizations, and reboot the system.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSystemReset}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
