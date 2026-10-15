import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../../store/useOSStore';
import {
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothOff,
  Image as ImageIcon,
  Lock,
  Power,
  RotateCcw,
  Sliders,
  Check,
  User,
  X,
  Bell,
  Trash2,
  Info
} from 'lucide-react';

export const ControlCenter: React.FC = () => {
  const {
    isControlCenterOpen,
    toggleControlCenter,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    brightness,
    setBrightness,
    wifiConnected,
    toggleWifi,
    bluetoothConnected,
    toggleBluetooth,
    themeMode,
    toggleTheme,
    activeWallpaper,
    setWallpaper,
    wallpapers,
    currentUser,
    lockSystem,
    sleep,
    reboot,
    shutdown,
    notifications,
    clearAllNotifications,
    dismissNotification,
  } = useOSStore();

  const [activeTab, setActiveTab] = useState<'controls' | 'wallpapers' | 'notifications'>('controls');
  const [showAbout, setShowAbout] = useState(false);

  if (!isControlCenterOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed top-12 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/90 border border-white/15 rounded-3xl p-5 text-white shadow-2xl backdrop-blur-2xl select-none font-sans"
      >
        {/* Header Tabs & Close Button */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'controls'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Controls
            </button>
            <button
              onClick={() => setActiveTab('wallpapers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'wallpapers'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wallpaper
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Notifs ({notifications.length})
            </button>
          </div>

          <button
            onClick={() => toggleControlCenter(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab 1: System Quick Controls */}
        {activeTab === 'controls' && (
          <div className="space-y-4">
            {/* Toggles Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Wi-Fi */}
              <button
                onClick={toggleWifi}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  wifiConnected
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {wifiConnected ? (
                  <Wifi className="w-5 h-5 text-cyan-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-rose-400" />
                )}
                <div className="text-left">
                  <div className="text-xs font-bold">Wi-Fi</div>
                  <div className="text-[10px] text-slate-300">
                    {wifiConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </button>

              {/* Bluetooth */}
              <button
                onClick={toggleBluetooth}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  bluetoothConnected
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {bluetoothConnected ? (
                  <Bluetooth className="w-5 h-5 text-indigo-400" />
                ) : (
                  <BluetoothOff className="w-5 h-5 text-slate-500" />
                )}
                <div className="text-left">
                  <div className="text-xs font-bold">Bluetooth</div>
                  <div className="text-[10px] text-slate-300">
                    {bluetoothConnected ? 'On' : 'Off'}
                  </div>
                </div>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer"
              >
                {themeMode === 'dark' ? (
                  <Moon className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
                <div className="text-left">
                  <div className="text-xs font-bold">Theme</div>
                  <div className="text-[10px] text-slate-300 capitalize">
                    {themeMode} Mode
                  </div>
                </div>
              </button>

              {/* About OS */}
              <button
                onClick={() => setShowAbout(true)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-all cursor-pointer"
              >
                <Info className="w-5 h-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-xs font-bold">System Info</div>
                  <div className="text-[10px] text-slate-300">v2.5 Quantum</div>
                </div>
              </button>
            </div>

            {/* Brightness Slider */}
            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-400" /> Display Brightness
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {brightness}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* Volume Slider */}
            <div className="bg-slate-950/40 border border-white/10 rounded-2xl p-3.5 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-300">
                <button
                  onClick={toggleMute}
                  className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>Master Volume</span>
                </button>
                <span className="font-mono font-bold text-cyan-300">
                  {isMuted ? 'Muted' : `${volume}%`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
            </div>

            {/* User Quick Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-cyan-400/50"
                />
                <div>
                  <div className="text-xs font-bold text-white">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-cyan-300/80 font-mono">
                    {currentUser.role}
                  </div>
                </div>
              </div>

              {/* Power Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={lockSystem}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Lock Screen"
                >
                  <Lock className="w-4 h-4" />
                </button>
                <button
                  onClick={sleep}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
                  title="Sleep"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  onClick={reboot}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 transition-all cursor-pointer"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={shutdown}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
                  title="Shut Down"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Wallpaper Picker */}
        {activeTab === 'wallpapers' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Select Active Wallpaper
            </div>
            <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {wallpapers.map((wp) => {
                const isSelected = activeWallpaper === wp.url;
                return (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.url)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer group text-left ${
                      isSelected
                        ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <img
                      src={wp.thumbnail}
                      alt={wp.name}
                      className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="p-1.5 bg-slate-950/80 backdrop-blur-md text-[10px] font-medium text-slate-200 truncate">
                      {wp.name}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-cyan-400 text-slate-950">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Notifications Center */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" /> System Notifications
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-mono">
                No active notifications
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="relative bg-slate-950/50 hover:bg-slate-950/80 border border-white/10 rounded-xl p-3 text-xs transition-all"
                  >
                    <div className="flex justify-between items-start mb-1 pr-4">
                      <span className="font-semibold text-cyan-300">
                        {notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {notif.message}
                    </p>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* System Info Dialog Overlay */}
        <AnimatePresence>
          {showAbout && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 bg-slate-950/95 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-3xl border border-cyan-500/30"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                    <Info className="w-5 h-5" /> About Nexus OS
                  </h3>
                  <button
                    onClick={() => setShowAbout(false)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">OS Build:</span>
                    <span>v2.5.0-Quantum</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Kernel:</span>
                    <span>Linux 6.12.0-rt-nexus</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Architecture:</span>
                    <span>x86_64 WebAssembly</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Graphics compositor:</span>
                    <span>Wayland GPU Engine</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-slate-400">Enclave Security:</span>
                    <span>Active (AES-256)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowAbout(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
              >
                Close System Info
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
