import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOSStore } from '../../store/useOSStore';
import { useBattery } from '../../hooks/useBattery';
import {
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Power,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Zap,
  Bell,
  X,
  RefreshCw,
  Moon,
  RotateCcw,
  AlertCircle,
  KeyRound,
  UserCheck
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const {
    userName,
    currentUser,
    activeWallpaper,
    validatePin,
    login,
    notifications,
    dismissNotification,
    wifiConnected,
    toggleWifi,
    isMuted,
    toggleMute,
    sleep,
    reboot,
    shutdown,
  } = useOSStore();

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [showNotifTray, setShowNotifTray] = useState(false);

  // Live battery tracking
  const { batteryLevel, isCharging } = useBattery();

  // Live time tracking
  const [time, setTime] = useState(new Date());

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    // Focus PIN input automatically on mount
    inputRef.current?.focus();
  }, []);

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!pin) {
      setErrorMsg('Please enter your 4-digit PIN');
      triggerShake();
      return;
    }

    if (validatePin(pin)) {
      setErrorMsg('');
      login();
    } else {
      setErrorMsg('Incorrect PIN. Default PIN is 1234');
      triggerShake();
      setPin('');
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Quick Keypad handler
  const handleKeypadPress = (num: string) => {
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 4) {
        // Auto validate if 4 digits
        if (validatePin(nextPin)) {
          login();
        }
      }
    }
  };

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none font-sans flex flex-col justify-between p-6 md:p-10 text-white">
      {/* Background Wallpaper with Blur & Subtle Zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
        style={{
          backgroundImage: `url(${activeWallpaper})`,
        }}
      />

      {/* Dark Overlay with Ambient Glow */}
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-md" />

      {/* Top Status Bar */}
      <div className="relative z-20 w-full flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium tracking-wider text-slate-200/90 bg-slate-900/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nexus Security Guard • Protected Session</span>
        </div>

        {/* Status Indicators & Notification Toggle */}
        <div className="flex items-center gap-2">
          {/* Wi-Fi Button */}
          <button
            onClick={toggleWifi}
            title={wifiConnected ? 'Wi-Fi Connected' : 'Wi-Fi Offline'}
            className="p-2 rounded-full bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition-all cursor-pointer text-slate-200"
          >
            {wifiConnected ? (
              <Wifi className="w-4 h-4 text-cyan-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Volume Button */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Muted' : 'Sound On'}
            className="p-2 rounded-full bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition-all cursor-pointer text-slate-200"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Battery */}
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-md text-xs font-mono text-emerald-400"
            title={`Battery: ${batteryLevel ?? 100}%${isCharging ? ' (Charging)' : ''}`}
          >
            {isCharging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (batteryLevel ?? 100) <= 20 ? (
              <BatteryLow className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (batteryLevel ?? 100) <= 60 ? (
              <BatteryMedium className="w-4 h-4 text-amber-400" />
            ) : (
              <Battery className="w-4 h-4 text-emerald-400" />
            )}
            <span>{batteryLevel !== null ? `${batteryLevel}%` : '100%'}</span>
            {isCharging && <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />}
          </div>

          {/* Notification Badge Toggle */}
          <button
            onClick={() => setShowNotifTray(!showNotifTray)}
            className="relative p-2 rounded-full bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition-all cursor-pointer text-slate-200"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Power Controls Button */}
          <button
            onClick={() => setShowPowerMenu(!showPowerMenu)}
            className="p-2 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 text-rose-300 transition-all cursor-pointer"
            title="Power Menu"
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Lock/Login Center Panel */}
      <div className="relative z-20 flex flex-col items-center justify-center max-w-md w-full mx-auto my-auto">
        {/* Real-time Clock Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="text-6xl md:text-7xl font-light tracking-tight font-mono drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {formattedTime}
          </div>
          <div className="text-sm md:text-base text-cyan-200/80 font-medium tracking-wide mt-1">
            {formattedDate}
          </div>
        </motion.div>

        {/* User Login Glassmorphism Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full bg-slate-900/60 border border-white/15 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center"
        >
          {/* Avatar Container */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 shadow-xl">
              <img
                src={currentUser.avatar}
                alt={userName || currentUser.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 border-2 border-slate-900 text-slate-950" title="System Active">
              <UserCheck className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          {/* User Information */}
          <h2 className="text-xl font-bold tracking-wide text-white mb-0.5">
            {userName || currentUser.name}
          </h2>
          <p className="text-xs text-slate-300/80 font-mono mb-6">
            {currentUser.role}
          </p>

          {/* PIN Input Form with Shake Animation */}
          <motion.form
            onSubmit={handleLoginSubmit}
            animate={isShaking ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col items-center"
          >
            <div className="relative w-full mb-3">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter PIN (Default: 1234)"
                className="w-full bg-slate-950/50 border border-white/15 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 rounded-2xl px-4 py-3.5 pr-20 text-center text-lg font-mono tracking-widest text-white placeholder:text-slate-400 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal transition-all outline-none shadow-inner"
              />

              {/* Eye Toggle & Submit Arrow */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Message Feedback */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs text-rose-400 font-medium mb-3 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl w-full justify-center"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Quick Numpad / PIN Dots */}
            <div className="flex items-center gap-2 my-2">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                    pin.length > idx
                      ? 'bg-cyan-400 border-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-110'
                      : 'border-white/30 bg-white/5'
                  }`}
                />
              ))}
            </div>

            {/* Quick PIN Keypad buttons for easy interaction */}
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-sm font-semibold font-mono text-slate-200 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-300 transition-all cursor-pointer"
              >
                CLR
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-sm font-semibold font-mono text-slate-200 transition-all cursor-pointer active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => setPin((p) => p.slice(0, -1))}
                className="py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-medium text-amber-300 transition-all cursor-pointer"
              >
                DEL
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>

      {/* Lockscreen Notification Badges Tray Modal */}
      <AnimatePresence>
        {showNotifTray && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-16 right-6 z-30 w-80 bg-slate-900/90 border border-white/20 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                <Bell className="w-4 h-4 text-amber-400" /> Lock Screen Notifications
              </div>
              <button
                onClick={() => setShowNotifTray(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                No active notifications
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-xs transition-all"
                  >
                    <div className="flex justify-between items-start mb-1 pr-4">
                      <span className="font-semibold text-cyan-300">{notif.title}</span>
                      <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-slate-300">{notif.message}</p>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Power Menu Modal */}
      <AnimatePresence>
        {showPowerMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-16 right-6 z-30 w-56 bg-slate-900/95 border border-white/20 rounded-2xl p-2 backdrop-blur-2xl shadow-2xl"
          >
            <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 border-b border-white/10 mb-1">
              Nexus Power Options
            </div>
            <button
              onClick={() => {
                setShowPowerMenu(false);
                sleep();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-cyan-300 transition-all cursor-pointer"
            >
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>Sleep Mode</span>
            </button>
            <button
              onClick={() => {
                setShowPowerMenu(false);
                reboot();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-amber-300 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Restart System</span>
            </button>
            <button
              onClick={() => {
                setShowPowerMenu(false);
                shutdown();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <Power className="w-4 h-4 text-rose-400" />
              <span>Shut Down</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Footer hint */}
      <div className="relative z-20 w-full text-center text-xs text-slate-400/80 font-mono">
        Default Security PIN: <span className="text-cyan-400 font-bold">1234</span>
      </div>
    </div>
  );
};
