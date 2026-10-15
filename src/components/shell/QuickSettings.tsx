import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  BatteryCharging,
  Cpu,
  HardDrive,
  Activity,
  Sliders,
  X,
  Bell,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useOSStore } from "../../store/useOSStore";

export const QuickSettings: React.FC = () => {
  const {
    isControlCenterOpen,
    toggleControlCenter,
    volume,
    setVolume,
    brightness,
    setBrightness,
    isMuted,
    toggleMute,
    wifiConnected,
    toggleWifi,
    bluetoothConnected,
    toggleBluetooth,
    themeMode,
    toggleTheme,
    notifications,
    dismissNotification,
    clearAllNotifications,
  } = useOSStore();

  // Simulated telemetry data for CPU sparkline graph
  const [cpuLoad, setCpuLoad] = useState(18);
  const [cpuHistory, setCpuHistory] = useState<number[]>([
    15, 22, 18, 25, 30, 20, 18, 24, 19, 21,
  ]);
  const [ramUsage, setRamUsage] = useState(32); // 32% of 16GB = 5.1GB

  useEffect(() => {
    const interval = setInterval(() => {
      const nextCpu = Math.floor(12 + Math.random() * 28);
      setCpuLoad(nextCpu);
      setCpuHistory((prev) => [...prev.slice(1), nextCpu]);
      setRamUsage((prev) => Math.floor(30 + Math.random() * 6));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isControlCenterOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 20, scale: 0.96 }}
        transition={{ type: "spring", damping: 26, stiffness: 380 }}
        className="fixed bottom-14 right-4 z-9990 w-96 max-w-[calc(100vw-32px)] bg-[#0b0f17]/90 backdrop-blur-2xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_1px_1px_rgba(6,182,212,0.2)] rounded-2xl overflow-hidden flex flex-col text-slate-100 select-none font-sans"
      >
        {/* Top Title Bar */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase">
            <Sliders className="w-4 h-4" />
            <span>Quick Controls & Telemetry</span>
          </div>
          <button
            onClick={() => toggleControlCenter(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5 max-h-130 overflow-y-auto custom-scrollbar">
          {/* Quick Action Toggles Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Wi-Fi Toggle */}
            <button
              onClick={toggleWifi}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                wifiConnected
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${wifiConnected ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-400"}`}
              >
                {wifiConnected ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-100">
                  Wi-Fi 6E
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {wifiConnected ? "Nexus_5G" : "Disconnected"}
                </span>
              </div>
            </button>

            {/* Bluetooth Toggle */}
            <button
              onClick={toggleBluetooth}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                bluetoothConnected
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${bluetoothConnected ? "bg-indigo-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}
              >
                <Bluetooth className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-100">
                  Bluetooth
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {bluetoothConnected ? "Audio Mesh" : "Off"}
                </span>
              </div>
            </button>

            {/* Silent Mode / Mute Toggle */}
            <button
              onClick={toggleMute}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                isMuted
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${isMuted ? "bg-rose-500 text-white font-bold" : "bg-slate-800 text-slate-400"}`}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-100">
                  Audio Mute
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isMuted ? "Muted" : `${volume}%`}
                </span>
              </div>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                themeMode === "dark"
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-300"
              }`}
            >
              <div
                className={`p-2 rounded-lg ${themeMode === "dark" ? "bg-purple-500 text-white font-bold" : "bg-amber-400 text-slate-950 font-bold"}`}
              >
                {themeMode === "dark" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-100">
                  Theme
                </span>
                <span className="text-[10px] text-slate-400 capitalize font-mono">
                  {themeMode} Mode
                </span>
              </div>
            </button>
          </div>

          {/* Sliders Section */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            {/* Display Brightness Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" /> Brightness
                </span>
                <span className="font-mono text-cyan-400 text-[11px] font-bold">
                  {brightness}%
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Master Volume Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-cyan-400" /> Master Volume
                </span>
                <span className="font-mono text-cyan-400 text-[11px] font-bold">
                  {isMuted ? "Muted" : `${volume}%`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>

          {/* Live System Metrics Section */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />{" "}
                Telemetry Gauge
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5" /> 98%
              </span>
            </div>

            {/* CPU Sparkline Graph */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Quantum CPU
                </span>
                <span className="text-cyan-400 font-bold">{cpuLoad}%</span>
              </div>
              {/* SVG Sparkline */}
              <div className="h-9 w-full bg-slate-950/80 rounded-lg p-1 border border-slate-800 flex items-end justify-between gap-1 overflow-hidden">
                {cpuHistory.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-linear-to-t from-cyan-600 to-cyan-400 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(10, val)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* RAM Meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-indigo-400" /> Unified
                  Memory
                </span>
                <span className="text-indigo-300 font-bold">
                  {ramUsage}% (5.1 GB)
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${ramUsage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Notifications Center List */}
          <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" /> Notifications (
                {unreadCount})
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-[10px] text-slate-400 hover:text-rose-400 font-mono transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">
                No active notifications
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-2 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">
                          {notif.title}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
