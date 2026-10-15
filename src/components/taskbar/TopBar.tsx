import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  Zap,
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useOSStore } from "../../store/useOSStore";
import { useWindowStore } from "../../store/useWindowStore";
import { useThemeStore } from "../../store/useThemeStore";
import { useAudioStore } from "../../store/useAudioStore";
import { useBattery } from "../../hooks/useBattery";

// Weather helper for Open-Meteo WMO weather codes
function getWeatherIconAndLabel(code: number | null) {
  if (code === null) return { Icon: CloudSun, label: "Fair" };
  if (code === 0) return { Icon: Sun, label: "Sunny" };
  if (code >= 1 && code <= 3) return { Icon: CloudSun, label: "Partly Cloudy" };
  if (code >= 45 && code <= 48) return { Icon: Cloud, label: "Foggy" };
  if (code >= 51 && code <= 67) return { Icon: CloudRain, label: "Rainy" };
  if (code >= 80) return { Icon: CloudLightning, label: "Stormy" };
  return { Icon: CloudSun, label: "Clear" };
}

interface MockEvent {
  id: string;
  title: string;
  time: string;
  type: "system" | "meeting" | "reminder";
}

const MOCK_EVENTS: Record<string, MockEvent[]> = {
  today: [
    {
      id: "1",
      title: "Nexus OS Kernel Sync",
      time: "10:00 AM",
      type: "meeting",
    },
    {
      id: "2",
      title: "VFS IndexedDB Backup",
      time: "02:30 PM",
      type: "system",
    },
    {
      id: "3",
      title: "PIN Enclave Renewal",
      time: "05:00 PM",
      type: "reminder",
    },
  ],
  upcoming: [
    {
      id: "4",
      title: "Security Enclave Audit",
      time: "11:00 AM",
      type: "system",
    },
    {
      id: "5",
      title: "System Performance Review",
      time: "04:00 PM",
      type: "meeting",
    },
  ],
};

export const TopBar: React.FC = () => {
  const { userName, wifiConnected } = useOSStore();
  const { windows, activeWindowId, openApp, focusWindow, restoreWindow } =
    useWindowStore();
  const { themeMode, toggleThemeMode } = useThemeStore();
  const { isPlaying, currentTrack } = useAudioStore();

  // Clock State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(
    new Date(),
  );
  const calendarRef = useRef<HTMLDivElement>(null);

  // Hardware Battery Hook
  const { batteryLevel, isCharging } = useBattery();

  // Live Local Weather State
  const [weatherTemp, setWeatherTemp] = useState<number | null>(28);
  const [weatherCode, setWeatherCode] = useState<number | null>(1);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // Live clock interval
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Local Weather Fetching via Open-Meteo
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        setIsWeatherLoading(true);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.current_weather) {
            setWeatherTemp(Math.round(data.current_weather.temperature));
            setWeatherCode(data.current_weather.weathercode);
          }
        }
      } catch (err) {
        // Safe fallback
      } finally {
        setIsWeatherLoading(false);
      }
    };

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default fallback coordinates (e.g., Delhi/NYC)
          fetchWeather(28.6139, 77.209);
        },
        { timeout: 8000 },
      );
    } else {
      fetchWeather(28.6139, 77.209);
    }
  }, []);

  // Calendar click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isCalendarOpen]);

  // Formatted date and time
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Active window context
  const activeWindow = windows.find(
    (w) => (w.id === activeWindowId || w.isFocused) && !w.isMinimized,
  );
  const activeAppTitle = activeWindow ? activeWindow.title : "Desktop";

  // Navigation handlers
  const handleActiveAppClick = () => {
    if (activeWindow) {
      focusWindow(activeWindow.id);
    }
  };

  const handleMusicClick = () => {
    const musicWin = windows.find(
      (w) => w.appId === "music" || w.appId === "musicplayer",
    );
    if (musicWin) {
      focusWindow(musicWin.id);
      if (musicWin.isMinimized) restoreWindow(musicWin.id);
    } else {
      openApp("music");
    }
  };

  const handleWeatherClick = () => {
    const weatherWin = windows.find((w) => w.appId === "weather");
    if (weatherWin) {
      focusWindow(weatherWin.id);
      if (weatherWin.isMinimized) restoreWindow(weatherWin.id);
    } else {
      openApp("weather");
    }
  };

  const handleSettingsClick = () => {
    const settingsWin = windows.find((w) => w.appId === "settings");
    if (settingsWin) {
      focusWindow(settingsWin.id);
      if (settingsWin.isMinimized) restoreWindow(settingsWin.id);
    } else {
      openApp("settings");
    }
  };

  // Weather Icon render
  const weatherInfo = getWeatherIconAndLabel(weatherCode);
  const WeatherIconComp = weatherInfo.Icon;

  // Battery Icon render
  const renderBatteryIcon = () => {
    const level = batteryLevel ?? 100;
    if (isCharging) {
      return <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (level <= 20) {
      return <BatteryLow className="w-3.5 h-3.5 text-rose-400 animate-pulse" />;
    }
    if (level <= 60) {
      return <BatteryMedium className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Battery className="w-3.5 h-3.5 text-emerald-400" />;
  };

  // Calendar calculations
  const calYear = calendarViewDate.getFullYear();
  const calMonth = calendarViewDate.getMonth();
  const monthName = calendarViewDate.toLocaleString("default", {
    month: "long",
  });
  const firstDayOfMonth = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        date: new Date(calYear, calMonth - 1, daysInPrevMonth - i),
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(calYear, calMonth, d),
      });
    }
    const remaining =
      35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(calYear, calMonth + 1, d),
      });
    }
    return days;
  }, [calYear, calMonth, firstDayOfMonth, daysInMonth, daysInPrevMonth]);

  const today = new Date();
  const isTodayDate = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelectedDate = (d: Date) =>
    d.getDate() === selectedCalendarDate.getDate() &&
    d.getMonth() === selectedCalendarDate.getMonth() &&
    d.getFullYear() === selectedCalendarDate.getFullYear();

  const currentEvents = isTodayDate(selectedCalendarDate)
    ? MOCK_EVENTS.today
    : MOCK_EVENTS.upcoming;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-7 px-3 flex items-center justify-between text-[11px] font-medium select-none backdrop-blur-md bg-slate-900/40 dark:bg-slate-900/60 border-b border-white/10 text-slate-200">
      {/* LEFT SECTION: BRAND, ACTIVE APP TITLE & ANIMATED AUDIO VISUALIZER */}
      <div className="flex items-center gap-2">
        {/* Minimal Brand Identity */}
        <div className="flex items-center gap-1.5 font-bold tracking-wider text-cyan-400">
          <svg
            viewBox="0 0 100 100"
            className="w-3.5 h-3.5 fill-cyan-400 shrink-0"
          >
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
          <span className="text-white font-extrabold text-[11px]">
            Nexus OS
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-3 w-[1px] bg-white/20 mx-1" />

        {/* Dynamic Active App Title with Cross-fade */}
        <button
          onClick={handleActiveAppClick}
          className="text-slate-300 hover:text-white font-medium truncate max-w-[130px] transition-colors cursor-pointer text-left"
          title={`Active Window: ${activeAppTitle}`}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeAppTitle}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              {activeAppTitle}
            </motion.span>
          </AnimatePresence>
        </button>

        {/* 🎵 Animated Audio Visualizer ("Music Jumping" Pill) */}
        {isPlaying && (
          <div className="flex items-center">
            <div className="h-3 w-[1px] bg-white/20 mx-1.5" />
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleMusicClick}
              className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 backdrop-blur-md cursor-pointer hover:bg-cyan-500/25 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              title="Click to open Music Player"
            >
              {/* Equalizer jumping bars */}
              <div className="flex items-end gap-[2px] h-3 w-3 shrink-0">
                {[0.4, 0.8, 0.3, 0.9].map((delay, idx) => (
                  <motion.span
                    key={idx}
                    className="w-[2px] bg-cyan-400 rounded-full"
                    animate={{
                      height: ["20%", "100%", "30%", "85%", "25%"],
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                      delay: delay * 0.15,
                    }}
                  />
                ))}
              </div>

              <span className="text-[10px] font-semibold tracking-tight truncate max-w-[130px]">
                {currentTrack
                  ? `${currentTrack.title} • ${currentTrack.artist}`
                  : "Playing Music"}
              </span>
            </motion.button>
          </div>
        )}
      </div>

      {/* CENTER SECTION: CLEAN DATE & TIME + LIVE LOCAL WEATHER */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 font-mono text-[11px]">
        {/* Interactive Clock Button -> Toggles Calendar Popover */}
        <div ref={calendarRef} className="relative">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-white/20 transition-all cursor-pointer text-slate-200"
            title="Click to toggle Calendar & Schedule"
          >
            <span className="font-semibold text-white">{formattedTime}</span>
            <span className="text-slate-500 text-[10px]">•</span>
            <span className="text-slate-300 text-[10px]">{formattedDate}</span>
          </motion.button>

          {/* Popover Calendar Drawer */}
          <AnimatePresence>
            {isCalendarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute top-8 left-1/2 -translate-x-1/2 w-80 p-4 rounded-2xl bg-[#0b0f17]/95 border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-[10000] text-slate-100 font-sans"
              >
                {/* Header: Month / Year & Nav */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-bold tracking-wide">
                      {monthName} {calYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarViewDate(new Date(calYear, calMonth - 1, 1));
                      }}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarViewDate(new Date());
                        setSelectedCalendarDate(new Date());
                      }}
                      className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalendarViewDate(new Date(calYear, calMonth + 1, 1));
                      }}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <span key={d}>{d}</span>
                    ),
                  )}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono mb-3">
                  {calendarDays.map((item, idx) => {
                    const todayClass = isTodayDate(item.date);
                    const selClass = isSelectedDate(item.date);
                    return (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCalendarDate(item.date);
                        }}
                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          !item.isCurrentMonth
                            ? "text-slate-600 opacity-40"
                            : selClass
                              ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)] scale-105"
                              : todayClass
                                ? "bg-purple-500/30 border border-purple-400 text-purple-300 font-bold"
                                : "hover:bg-slate-800 text-slate-200"
                        }`}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>

                {/* Events list */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-slate-300">
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Clock className="w-3 h-3" />
                      <span>
                        {selectedCalendarDate.toLocaleDateString([], {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {currentEvents.length} Events
                    </span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto no-scrollbar">
                    {currentEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                      >
                        <span className="truncate text-slate-200">
                          {evt.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                          {evt.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Local Weather Badge -> Click opens Weather App */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleWeatherClick}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/40 hover:bg-slate-800/80 border border-white/5 hover:border-white/20 text-slate-200 transition-all cursor-pointer"
          title={`Click to open Weather App (${weatherInfo.label})`}
        >
          <WeatherIconComp className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-100">
            {weatherTemp !== null ? `${weatherTemp}°C` : "28°C"}
          </span>
        </motion.button>
      </div>

      {/* RIGHT SECTION: HARDWARE BATTERY, THEME TOGGLE & INTERACTIVE USER BADGE */}
      <div className="flex items-center gap-2.5">
        {/* Minimal System Status Tray */}
        <div className="flex items-center gap-2 text-slate-300">
          {/* Wi-Fi Status Indicator */}
          <span
            title={wifiConnected ? "Wi-Fi Connected" : "Wi-Fi Disconnected"}
          >
            {wifiConnected ? (
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-slate-500" />
            )}
          </span>

          {/* Real Device Hardware Battery Tracker */}
          <div
            className="flex items-center gap-1 text-[10px] font-mono text-slate-300"
            title={`Hardware Battery Level: ${batteryLevel ?? 100}%${
              isCharging ? " (Charging)" : ""
            }`}
          >
            {renderBatteryIcon()}
            <span>{batteryLevel !== null ? `${batteryLevel}%` : "100%"}</span>
            {isCharging && (
              <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            )}
          </div>

          {/* Quick Theme Switcher Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleThemeMode}
            className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={`Switch to ${themeMode === "dark" ? "Light" : "Dark"} Mode`}
          >
            {themeMode === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
            )}
          </motion.button>
        </div>

        {/* User Profile Pill -> Click opens Settings App */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSettingsClick}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 hover:border-slate-500/50 text-slate-200 transition-all cursor-pointer"
          title="Click to open Settings & Account Profile"
        >
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-[9px] flex items-center justify-center border border-cyan-400/40 shrink-0">
            {userName ? userName.charAt(0).toUpperCase() : "M"}
          </div>
          <span className="text-[10px] font-semibold tracking-wide text-slate-100 truncate max-w-[80px]">
            {userName || "Jayant Sharma "}
          </span>
        </motion.button>
      </div>
    </header>
  );
};
