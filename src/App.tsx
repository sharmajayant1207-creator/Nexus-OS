import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useOSStore } from './store/useOSStore';
import { useThemeStore } from './store/useThemeStore';
import { applyTheme } from './styles/themeEngine';
import { SystemState } from './types/os';
import { BootScreen } from './components/system/BootScreen';
import { LoginScreen } from './components/system/LoginScreen';
import { DesktopScreen } from './components/system/DesktopScreen';
import { PowerOverlay } from './components/system/PowerOverlay';
import { BrightnessFilter } from './components/system/BrightnessFilter';
import { useVFSSync } from './hooks/useVFSSync';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';

export default function App() {
  const systemState = useOSStore((state) => state.systemState);
  const { themeMode, accentColor, customAccentHex } = useThemeStore();

  // Apply Theme Engine CSS variables and dark mode classes
  useEffect(() => {
    applyTheme(themeMode, customAccentHex || accentColor);
  }, [themeMode, accentColor, customAccentHex]);

  // Initialize VFS IndexedDB background persistence sync
  useVFSSync();

  // Initialize Global OS Keyboard Shortcuts (Alt+Tab, Super/Win Key, Escape)
  useGlobalShortcuts();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none font-sans">
      {/* Global Brightness Dim Filter */}
      <BrightnessFilter />

      {/* Main OS Screen State Router */}
      <AnimatePresence mode="wait">
        {systemState === SystemState.BOOTING && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <BootScreen />
          </motion.div>
        )}

        {(systemState === SystemState.LOGIN || systemState === SystemState.LOCKED) && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <LoginScreen />
          </motion.div>
        )}

        {systemState === SystemState.DESKTOP && (
          <motion.div
            key="desktop"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <DesktopScreen />
          </motion.div>
        )}

        {(systemState === SystemState.SLEEP ||
          systemState === SystemState.REBOOTING ||
          systemState === SystemState.SHUTDOWN) && (
          <motion.div
            key="power"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <PowerOverlay />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
